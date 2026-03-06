import { ref, watch, nextTick } from 'vue'
import { ofetch, FetchError } from 'ofetch'
import { nanoid } from 'nanoid'
import { useAuth, isLoggedIn } from '@/composables/useAuth'
import { useIconsStore } from '@/stores/icons'
import { useWidgetsStore } from '@/stores/widgets'
import { useGroupsStore } from '@/stores/groups'
import { useSettingsStore } from '@/stores/settings'

const DEVICE_ID_KEY = 'aitabs-device-id'
const LAST_SYNC_KEY = 'aitabs-last-sync'

// ---- 状态 ----
export const syncing = ref(false)
export const lastSyncTime = ref(Number(localStorage.getItem(LAST_SYNC_KEY) ?? '0'))

// ---- SSE 内部状态 ----
let sseSource: EventSource | null = null
let sseRetryTimer: ReturnType<typeof setTimeout> | null = null
let sseRetryDelay = 3_000

// ---- 防抖 timer ----
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// pull 期间抑制 autoSync 的 push 调度
let suppressAutoSync = false

// ---- 工具函数 ----

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = nanoid()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

function authHeaders(): Record<string, string> {
  const { token } = useAuth()
  return {
    Authorization: `Bearer ${token.value}`,
    'X-Device-Id': getDeviceId(),
  }
}

// ---- push：将本地脏数据推送到服务端 ----

export async function push(): Promise<void> {
  const { logout } = useAuth()
  const iconsStore = useIconsStore()
  const widgetsStore = useWidgetsStore()
  const groupsStore = useGroupsStore()
  const settingsStore = useSettingsStore()

  const dirtyIcons = iconsStore.getDirtyIcons()
  const dirtyWidgets = widgetsStore.getDirtyWidgets()
  const dirtyGroups = groupsStore.getDirtyGroups()

  const hasChanges =
    dirtyIcons.length > 0 ||
    dirtyWidgets.length > 0 ||
    dirtyGroups.length > 0 ||
    settingsStore.dirty

  if (!hasChanges) return

  const body: Record<string, unknown> = {}

  if (dirtyIcons.length > 0) {
    body.icons = dirtyIcons.map(icon => ({
      id: icon.id,
      data: { ...icon, dirty: undefined },
      updatedAt: icon.updatedAt ?? Date.now(),
      deletedAt: icon.deletedAt ?? null,
    }))
  }

  if (dirtyWidgets.length > 0) {
    body.widgets = dirtyWidgets.map(w => ({
      id: w.id,
      data: { ...w, dirty: undefined },
      updatedAt: w.updatedAt ?? Date.now(),
      deletedAt: w.deletedAt ?? null,
    }))
  }

  if (dirtyGroups.length > 0) {
    body.groups = dirtyGroups.map(g => ({
      id: g.id,
      data: { ...g, dirty: undefined },
      updatedAt: g.updatedAt ?? Date.now(),
      deletedAt: g.deletedAt ?? null,
    }))
  }

  if (settingsStore.dirty) {
    body.settings = {
      data: settingsStore.settings,
      version: settingsStore.syncVersion,
    }
  }

  try {
    type ConflictItem = { id: string; serverData: Record<string, unknown>; serverUpdatedAt: number }
    type PushResult = {
      ok: boolean
      settingsVersion?: number
      conflicts: {
        icons?: ConflictItem[]
        widgets?: ConflictItem[]
        groups?: ConflictItem[]
        settings?: { serverData: Record<string, unknown>; serverVersion: number }
      }
    }

    const result = await ofetch<PushResult>('/api/sync/push', {
      method: 'POST',
      headers: authHeaders(),
      body,
    })

    // push 成功：更新 settings 版本号（防止下次 push 版本不匹配导致回退）
    if (result.settingsVersion !== undefined) {
      settingsStore.syncVersion = result.settingsVersion
    }

    // 处理冲突：用服务端数据覆盖本地版本
    const c = result.conflicts
    c.icons?.forEach(ci => iconsStore.applyRemoteItem({ id: ci.id, data: ci.serverData, updatedAt: ci.serverUpdatedAt }))
    c.widgets?.forEach(cw => widgetsStore.applyRemoteItem({ id: cw.id, data: cw.serverData, updatedAt: cw.serverUpdatedAt }))
    c.groups?.forEach(cg => groupsStore.applyRemoteItem({ id: cg.id, data: cg.serverData, updatedAt: cg.serverUpdatedAt }))
    if (c.settings) {
      settingsStore.applyRemoteSettings(c.settings.serverData, c.settings.serverVersion)
    }

    // 清除脏标记，移除软删除条目（抑制 watcher 触发多余 push）
    suppressAutoSync = true
    try {
      iconsStore.clearDirty()
      widgetsStore.clearDirty()
      groupsStore.clearDirty()
      settingsStore.clearDirty()
      await nextTick()
    } finally {
      suppressAutoSync = false
    }
  } catch (err) {
    if (err instanceof FetchError && err.response?.status === 401) {
      logout()
    }
    throw err
  }
}

// ---- pull：从服务端拉取增量数据 ----

export async function pull(): Promise<void> {
  const { logout } = useAuth()
  const iconsStore = useIconsStore()
  const widgetsStore = useWidgetsStore()
  const groupsStore = useGroupsStore()
  const settingsStore = useSettingsStore()

  try {
    type PullItem = { id: string; data: Record<string, unknown>; updatedAt: number; deletedAt?: number | null }
    type PullResponse = {
      icons: PullItem[]
      widgets: PullItem[]
      groups: PullItem[]
      settings: { data: Record<string, unknown>; version: number; updatedAt: number } | null
      serverTime: number
    }

    const res = await ofetch<PullResponse>(`/api/sync/pull?since=${lastSyncTime.value}`, {
      headers: authHeaders(),
    })

    // 抑制 watcher 触发多余 push
    suppressAutoSync = true
    try {
      iconsStore.applyRemoteChanges(res.icons)
      widgetsStore.applyRemoteChanges(res.widgets)
      groupsStore.applyRemoteChanges(res.groups)

      if (res.settings) {
        settingsStore.applyRemoteSettings(res.settings.data, res.settings.version)
      }

      lastSyncTime.value = res.serverTime
      localStorage.setItem(LAST_SYNC_KEY, String(res.serverTime))

      await nextTick()
    } finally {
      suppressAutoSync = false
    }
  } catch (err) {
    if (err instanceof FetchError && err.response?.status === 401) {
      logout()
    }
    throw err
  }
}

// ---- fullSync：先推后拉 ----

export async function fullSync(): Promise<void> {
  if (syncing.value) return
  syncing.value = true
  try {
    await push()
    await pull()
  } finally {
    syncing.value = false
  }
}

// ---- SSE：监听其他设备推送，自动触发 pull ----

export function connectSSE(): void {
  const { token } = useAuth()
  if (!isLoggedIn.value || sseSource) return

  const url = `/api/sync/sse?token=${encodeURIComponent(token.value)}&deviceId=${encodeURIComponent(getDeviceId())}`
  const src = new EventSource(url)
  sseSource = src

  src.addEventListener('sync', () => {
    pull().catch(() => {})
  })

  src.addEventListener('open', () => {
    sseRetryDelay = 3_000
  })

  src.addEventListener('error', () => {
    src.close()
    sseSource = null
    // 指数退避重连，上限 30 秒
    sseRetryTimer = setTimeout(() => {
      sseRetryDelay = Math.min(sseRetryDelay * 2, 30_000)
      connectSSE()
    }, sseRetryDelay)
  })
}

export function disconnectSSE(): void {
  if (sseRetryTimer) {
    clearTimeout(sseRetryTimer)
    sseRetryTimer = null
  }
  if (sseSource) {
    sseSource.close()
    sseSource = null
  }
  sseRetryDelay = 3_000
}

// ---- 自动同步初始化 ----
// 在 App.vue 调用一次，监听数据变更后防抖 2 秒自动 push

export function initAutoSync(): void {
  const iconsStore = useIconsStore()
  const widgetsStore = useWidgetsStore()
  const groupsStore = useGroupsStore()
  const settingsStore = useSettingsStore()

  function scheduleSync() {
    if (!isLoggedIn.value || suppressAutoSync) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        await push()
      } catch {
        // 网络异常，下次触发时重试
      }
    }, 2_000)
  }

  watch(() => iconsStore.icons, scheduleSync, { deep: true })
  watch(() => widgetsStore.widgets, scheduleSync, { deep: true })
  watch(() => groupsStore.groups, scheduleSync, { deep: true })
  watch(() => settingsStore.settings, scheduleSync, { deep: true })

  // 从后台切回前台时自动拉取最新数据
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isLoggedIn.value) {
      pull().catch(() => {})
    }
  })
}
