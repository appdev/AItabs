import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { env } from '@/env.ts'
import { authRoutes } from '@/routes/auth.ts'
import { syncRoutes } from '@/routes/sync.ts'
import { siteRoutes } from '@/routes/site.ts'

const app = new Hono()

app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.path} →`, err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

app.use('*', logger())
app.use('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'X-Device-Id'],
}))

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }))

// /api/auth/* 无需认证（register / login / me）
app.route('/api/auth', authRoutes)

// /api/sync/* 需要 JWT 认证（由 syncRoutes 内部中间件保护）
app.route('/api/sync', syncRoutes)

// /api/site/* 无需认证（网站信息查询 + 本地图标服务）
app.route('/api/site', siteRoutes)

console.log(`🚀 AItabs backend running on http://localhost:${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
