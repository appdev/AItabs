import type { JwtVariables } from 'hono/jwt'

// Hono Context 变量类型（jwtPayload 来自 hono/jwt 中间件）
export type AppVariables = JwtVariables & {
  userId: string
  username: string
}
