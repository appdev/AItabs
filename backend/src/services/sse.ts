// SSE 连接池：管理所有用户的长连接
// 单进程内存维护，重启后连接自动重建（客户端会重连）

type WriteFn = (event: string, data: string) => Promise<void>

interface SseClient {
  deviceId: string
  write: WriteFn
}

// userId → 该用户的所有活跃 SSE 连接
const pool = new Map<string, Set<SseClient>>()

const MAX_CONNECTIONS_PER_USER = 5

// 注册新连接，连接数超限时返回 null
export function addClient(userId: string, deviceId: string, write: WriteFn): SseClient | null {
  if (!pool.has(userId)) {
    pool.set(userId, new Set())
  }
  const userClients = pool.get(userId)!

  if (userClients.size >= MAX_CONNECTIONS_PER_USER) {
    return null
  }

  const client: SseClient = { deviceId, write }
  userClients.add(client)
  return client
}

// 移除连接（在客户端断开时调用）
export function removeClient(userId: string, client: SseClient): void {
  const userClients = pool.get(userId)
  if (!userClients) return

  userClients.delete(client)
  if (userClients.size === 0) {
    pool.delete(userId)
  }
}

// 向该用户的其他设备广播 sync 事件（排除触发推送的设备自身）
export function broadcast(userId: string, excludeDeviceId?: string): void {
  const userClients = pool.get(userId)
  if (!userClients || userClients.size === 0) return

  const data = JSON.stringify({ source: 'other_device', timestamp: Date.now() })

  for (const client of userClients) {
    if (client.deviceId === excludeDeviceId) continue
    // 写入失败说明连接已断开，等待 onAbort 清理，不主动处理
    client.write('sync', data).catch(() => {})
  }
}

// 查询某用户当前的连接数
export function getClientCount(userId: string): number {
  return pool.get(userId)?.size ?? 0
}
