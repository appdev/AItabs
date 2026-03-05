import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { db } from '@/db/client.ts'
import { users } from '@/db/schema.ts'
import { env } from '@/env.ts'
import { jwtAuth } from '@/auth/middleware.ts'
import type { AppVariables } from '@/types/context.ts'

// JWT 有效期 30 天（秒）
const JWT_EXP_SECONDS = 60 * 60 * 24 * 30

const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名最少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只允许字母、数字、下划线'),
  password: z.string()
    .min(6, '密码最少 6 个字符')
    .max(50, '密码最多 50 个字符'),
})

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const authRoutes = new Hono<{ Variables: AppVariables }>()

// 注册
authRoutes.post('/register', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: '请求体格式错误' }, 400)
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? '参数格式错误' }, 400)
  }
  const { username, password } = parsed.data

  // 检查用户名是否已存在
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username))
  if (existing.length > 0) {
    return c.json({ error: '用户名已存在' }, 409)
  }

  // 哈希密码并创建用户
  const passwordHash = await Bun.password.hash(password, 'bcrypt')
  const userId = nanoid()
  await db.insert(users).values({
    id: userId,
    username,
    passwordHash,
    createdAt: Date.now(),
  })

  // 签发 JWT
  const token = await sign(
    { sub: userId, username, exp: Math.floor(Date.now() / 1000) + JWT_EXP_SECONDS },
    env.JWT_SECRET,
    'HS256',
  )

  return c.json({ token, userId, username }, 201)
})

// 登录
authRoutes.post('/login', async (c) => {
  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: '请求体格式错误' }, 400)
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: '参数格式错误' }, 400)
  }
  const { username, password } = parsed.data

  // 查找用户
  const result = await db.select().from(users).where(eq(users.username, username))
  const user = result[0]
  if (!user) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  // 验证密码
  const valid = await Bun.password.verify(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  // 签发 JWT
  const token = await sign(
    { sub: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + JWT_EXP_SECONDS },
    env.JWT_SECRET,
    'HS256',
  )

  return c.json({ token, userId: user.id, username: user.username })
})

// 获取当前用户信息（前端用于检测 token 是否仍有效）
authRoutes.get('/me', jwtAuth, async (c) => {
  const payload = c.get('jwtPayload')
  return c.json({
    userId: payload['sub'] as string,
    username: payload['username'] as string,
  })
})
