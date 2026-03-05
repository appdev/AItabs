import { jwt } from 'hono/jwt'
import { createMiddleware } from 'hono/factory'
import { env } from '@/env.ts'
import type { AppVariables } from '@/types/context.ts'

// JWT 验证中间件（验证 token，将 payload 写入 jwtPayload）
export const jwtAuth = jwt({ secret: env.JWT_SECRET, alg: 'HS256' })

// 提取用户信息中间件（从 jwtPayload 中取出 userId / username，写入 Context）
// 必须在 jwtAuth 之后使用
export const extractUser = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const payload = c.get('jwtPayload')
  c.set('userId', payload['sub'] as string)
  c.set('username', payload['username'] as string)
  await next()
})
