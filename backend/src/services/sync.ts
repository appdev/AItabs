import { and, eq, gt } from 'drizzle-orm'
import { db } from '@/db/client.ts'
import { syncIcons, syncWidgets, syncGroups, syncSettings } from '@/db/schema.ts'
import type {
  PushRequest, PushResponse, PullResponse,
  ConflictItem, SyncItem,
} from '@/types/sync.ts'

// 单次 push 每种类型最大条数
const MAX_ITEMS_PER_TYPE = 500

// 允许客户端时间戳超前服务端的最大容忍值（5 秒）
const MAX_CLOCK_SKEW_MS = 5_000

// 客户端时间戳防篡改：超前过多就用服务端时间替代
function sanitizeTs(clientTs: number, now: number): number {
  return clientTs > now + MAX_CLOCK_SKEW_MS ? now : clientTs
}

// 数据库行 → PullItem
function toItem(row: { id: string; data: string; updatedAt: number; deletedAt: number | null }) {
  return {
    id: row.id,
    data: JSON.parse(row.data) as Record<string, unknown>,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  }
}

// ---- buildPull ----
// 返回 since 之后更新的所有记录（含软删除），客户端据此做增量合并

export async function buildPull(userId: string, since: number): Promise<PullResponse> {
  const iconRows = await db.select().from(syncIcons)
    .where(and(eq(syncIcons.userId, userId), gt(syncIcons.updatedAt, since)))

  const widgetRows = await db.select().from(syncWidgets)
    .where(and(eq(syncWidgets.userId, userId), gt(syncWidgets.updatedAt, since)))

  const groupRows = await db.select().from(syncGroups)
    .where(and(eq(syncGroups.userId, userId), gt(syncGroups.updatedAt, since)))

  const settingRows = await db.select().from(syncSettings)
    .where(and(eq(syncSettings.userId, userId), gt(syncSettings.updatedAt, since)))
  const settings = settingRows[0]

  return {
    icons: iconRows.map(toItem),
    widgets: widgetRows.map(toItem),
    groups: groupRows.map(toItem),
    settings: settings
      ? {
          data: JSON.parse(settings.data) as Record<string, unknown>,
          version: settings.version,
          updatedAt: settings.updatedAt,
        }
      : null,
    serverTime: Date.now(),
  }
}

// ---- mergePush ----
// Last-Write-Wins upsert：客户端 updatedAt 更新才覆盖，否则记为冲突返回给客户端

export async function mergePush(userId: string, body: PushRequest): Promise<PushResponse> {
  // 空推送快速返回
  const hasContent =
    (body.icons?.length ?? 0) > 0 ||
    (body.widgets?.length ?? 0) > 0 ||
    (body.groups?.length ?? 0) > 0 ||
    body.settings !== undefined
  if (!hasContent) {
    return { ok: true, conflicts: {} }
  }

  // 批量限制校验（在事务外提前检查）
  if ((body.icons?.length ?? 0) > MAX_ITEMS_PER_TYPE) {
    throw new RangeError(`icons 超过单次最大推送数量 ${MAX_ITEMS_PER_TYPE}`)
  }
  if ((body.widgets?.length ?? 0) > MAX_ITEMS_PER_TYPE) {
    throw new RangeError(`widgets 超过单次最大推送数量 ${MAX_ITEMS_PER_TYPE}`)
  }
  if ((body.groups?.length ?? 0) > MAX_ITEMS_PER_TYPE) {
    throw new RangeError(`groups 超过单次最大推送数量 ${MAX_ITEMS_PER_TYPE}`)
  }

  const now = Date.now()

  const conflicts = await db.transaction(async (tx) => {
    const iconConflicts: ConflictItem[] = []
    const widgetConflicts: ConflictItem[] = []
    const groupConflicts: ConflictItem[] = []
    let settingsConflict: { serverData: Record<string, unknown>; serverVersion: number } | undefined

    // --- icons ---
    for (const item of body.icons ?? []) {
      await upsertItem(tx, syncIcons, userId, item, now, iconConflicts)
    }

    // --- widgets ---
    for (const item of body.widgets ?? []) {
      await upsertItem(tx, syncWidgets, userId, item, now, widgetConflicts)
    }

    // --- groups ---
    for (const item of body.groups ?? []) {
      await upsertItem(tx, syncGroups, userId, item, now, groupConflicts)
    }

    // --- settings（乐观锁） ---
    if (body.settings) {
      const rows = await tx.select().from(syncSettings).where(eq(syncSettings.userId, userId))
      const existing = rows[0]

      if (!existing) {
        // 首次同步：直接插入，版本从 1 开始
        await tx.insert(syncSettings).values({
          userId,
          data: JSON.stringify(body.settings.data),
          version: 1,
          updatedAt: now,
        })
      } else if (body.settings.version === existing.version) {
        // 版本匹配：更新并递增版本
        await tx.update(syncSettings)
          .set({
            data: JSON.stringify(body.settings.data),
            version: existing.version + 1,
            updatedAt: now,
          })
          .where(eq(syncSettings.userId, userId))
      } else {
        // 版本不匹配：返回冲突，让客户端决策
        settingsConflict = {
          serverData: JSON.parse(existing.data) as Record<string, unknown>,
          serverVersion: existing.version,
        }
      }
    }

    return { iconConflicts, widgetConflicts, groupConflicts, settingsConflict }
  })

  return {
    ok: true,
    conflicts: {
      ...(conflicts.iconConflicts.length > 0 && { icons: conflicts.iconConflicts }),
      ...(conflicts.widgetConflicts.length > 0 && { widgets: conflicts.widgetConflicts }),
      ...(conflicts.groupConflicts.length > 0 && { groups: conflicts.groupConflicts }),
      ...(conflicts.settingsConflict && { settings: conflicts.settingsConflict }),
    },
  }
}

// ---- 私有：单条数据的 LWW upsert ----
// deletedAt 不为 null 时表示软删除，保留行但标记删除时间
async function upsertItem(
  tx: typeof db,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  userId: string,
  item: SyncItem,
  now: number,
  conflicts: ConflictItem[],
) {
  const ts = sanitizeTs(item.updatedAt, now)
  const dataStr = JSON.stringify(item.data)
  const deletedAt = item.deletedAt ?? null

  const rows = await tx.select().from(table)
    .where(and(eq(table.userId, userId), eq(table.id, item.id)))
  const existing = rows[0]

  if (!existing) {
    await tx.insert(table).values({ userId, id: item.id, data: dataStr, updatedAt: ts, deletedAt })
  } else if (ts > existing.updatedAt) {
    await tx.update(table)
      .set({ data: dataStr, updatedAt: ts, deletedAt })
      .where(and(eq(table.userId, userId), eq(table.id, item.id)))
  } else {
    // 服务端更新，记为冲突
    conflicts.push({
      id: existing.id,
      serverData: JSON.parse(existing.data) as Record<string, unknown>,
      serverUpdatedAt: existing.updatedAt,
    })
  }
}
