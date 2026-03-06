import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { z } from 'zod'
import { jwtAuth, extractUser } from '@/auth/middleware.ts'
import { buildPull, mergePush } from '@/services/sync.ts'
import * as sseService from '@/services/sse.ts'
import { env } from '@/env.ts'
import type { AppVariables } from '@/types/context.ts'

export const syncRoutes = new Hono<{ Variables: AppVariables }>()

// pull / push 走标准 JWT 中间件
syncRoutes.use('/pull', jwtAuth, extractUser)
syncRoutes.use('/push', jwtAuth, extractUser)

// SSE 专用：兼容 EventSource（不支持自定义 header），允许从 query param 读 token
const sseAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  // 优先读 Authorization header，其次读 ?token= 查询参数
  const headerToken = c.req.header('Authorization')?.replace('Bearer ', '')
  const tokenParam = headerToken ?? c.req.query('token')

  if (!tokenParam) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(tokenParam, env.JWT_SECRET, 'HS256')
    c.set('userId', payload['sub'] as string)
    c.set('username', payload['username'] as string)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})

syncRoutes.use('/sse', sseAuth)

// ---- GET /pull?since={timestamp} ----
syncRoutes.get('/pull', async (c) => {
  const userId = c.get('userId')
  const sinceRaw = c.req.query('since')
  const since = sinceRaw ? Number(sinceRaw) : 0

  if (Number.isNaN(since) || since < 0) {
    return c.json({ error: 'since 参数必须为非负整数' }, 400)
  }

  const result = await buildPull(userId, since)
  return c.json(result)
})

// ---- Zod schema for POST /push ----
const SyncItemSchema = z.object({
  id: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  updatedAt: z.number().int().positive(),
  deletedAt: z.number().int().positive().nullable().optional(),
})

const PushBodySchema = z.object({
  icons: z.array(SyncItemSchema).optional(),
  widgets: z.array(SyncItemSchema).optional(),
  groups: z.array(SyncItemSchema).optional(),
  settings: z.object({
    data: z.record(z.string(), z.unknown()),
    version: z.number().int().min(0),
  }).optional(),
})

// ---- POST /push ----
syncRoutes.post('/push', async (c) => {
  const userId = c.get('userId')
  // 读取设备标识，用于广播时排除自身
  const deviceId = c.req.header('X-Device-Id')

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: '请求体格式错误' }, 400)
  }

  const parsed = PushBodySchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: '参数格式错误', details: parsed.error.flatten().fieldErrors }, 400)
  }

  try {
    const result = await mergePush(userId, parsed.data)

    // 数据写入成功后，通知该用户的其他在线设备拉取最新数据
    sseService.broadcast(userId, deviceId)

    return c.json(result)
  } catch (err) {
    if (err instanceof RangeError) {
      return c.json({ error: err.message }, 400)
    }
    throw err
  }
})

// ---- GET /sse ----
// SSE 长连接：有数据推送时通知客户端主动 pull
syncRoutes.get('/sse', async (c) => {
  const userId = c.get('userId')
  const deviceId = c.req.header('X-Device-Id') ?? c.req.query('deviceId') ?? 'unknown'

  // 超出连接上限时提前拒绝，避免进入 SSE 流
  if (sseService.getClientCount(userId) >= 5) {
    return c.json({ error: 'SSE 连接数已达上限（5 个）' }, 429)
  }

  return streamSSE(c, async (stream) => {
    let heartbeat: ReturnType<typeof setInterval> | null = null
    let client: ReturnType<typeof sseService.addClient> = null

    try {
      // 立即发送初始事件，确保响应缓冲区被刷新（防止代理误判为死连接）
      await stream.writeSSE({ event: 'connected', data: JSON.stringify({ deviceId }) })

      client = sseService.addClient(userId, deviceId, async (event, data) => {
        try {
          await stream.writeSSE({ event, data })
        } catch {
          // 流已关闭，忽略写入错误
        }
      })

      if (!client) {
        try { await stream.writeSSE({ event: 'error', data: '连接数已达上限' }) } catch { /* ignore */ }
        return
      }

      heartbeat = setInterval(async () => {
        try {
          await stream.writeSSE({ event: 'ping', data: '' })
        } catch {
          if (heartbeat) clearInterval(heartbeat)
          heartbeat = null
        }
      }, 25_000)

      await new Promise<void>((resolve) => {
        stream.onAbort(() => resolve())
      })
    } catch {
      // streamSSE 内部错误（Bun 兼容性），静默处理
    } finally {
      if (heartbeat) clearInterval(heartbeat)
      if (client) sseService.removeClient(userId, client)
    }
  })
})
