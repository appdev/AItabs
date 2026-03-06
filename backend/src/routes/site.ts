import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { db } from '@/db/client.ts'
import { siteCache } from '@/db/schema.ts'
import { env } from '@/env.ts'

export const siteRoutes = new Hono()

// 图标存放目录：与数据库文件同级的 icons/ 子目录
const ICONS_DIR = join(dirname(env.DB_PATH), 'icons')
let iconsDirReady = false
async function ensureIconsDir() {
  if (iconsDirReady) return
  await mkdir(ICONS_DIR, { recursive: true })
  iconsDirReady = true
}

// 缓存有效期 30 天；旧行 updatedAt=0 视为立即过期
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Content-Type → 扩展名
function extFromContentType(ct: string): string {
  if (ct.includes('svg')) return 'svg'
  if (ct.includes('webp')) return 'webp'
  if (ct.includes('gif')) return 'gif'
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg'
  if (ct.includes('icon') || ct.includes('x-icon')) return 'ico'
  return 'png'
}

// 从任意输入中提取 hostname（允许不带协议头）
function extractHost(rawUrl: string): string {
  const s = rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`
  return new URL(s).hostname
}

// 下载图标到本地，返回文件名；失败返回 null
async function downloadIcon(iconUrl: string, host: string): Promise<string | null> {
  try {
    const res = await fetch(iconUrl, {
      headers: { Referer: 'https://itab.link/', 'User-Agent': BROWSER_UA },
    })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') ?? 'image/png'
    const filename = `${host}.${extFromContentType(ct)}`
    await ensureIconsDir()
    await Bun.write(join(ICONS_DIR, filename), res)
    return filename
  } catch {
    return null
  }
}

interface UpstreamResult {
  name: string
  iconFile: string | null
  bgColor: string
}

// 从上游拉取网站信息 + 下载图标
async function fetchFromUpstream(host: string): Promise<UpstreamResult> {
  const res = await fetch(
    `https://api.codelife.cc/website/info?lang=cn&url=${encodeURIComponent(host)}`,
    { headers: { Referer: 'https://itab.link/', Origin: 'https://itab.link', 'User-Agent': BROWSER_UA } },
  )
  const json = await res.json() as {
    code: number
    data?: { name?: string; imgSrc?: string; src?: string; backgroundColor?: string }
  }
  if (json.code === 200 && json.data) {
    const rawIcon = json.data.imgSrc || json.data.src || ''
    return {
      name: json.data.name ?? '',
      bgColor: json.data.backgroundColor ?? '',
      iconFile: rawIcon ? await downloadIcon(rawIcon, host) : null,
    }
  }
  return { name: '', bgColor: '', iconFile: null }
}

// 写入或更新缓存（UPSERT）
async function upsertCache(host: string, r: UpstreamResult) {
  const now = Date.now()
  await db.insert(siteCache)
    .values({ host, name: r.name, iconFile: r.iconFile, bgColor: r.bgColor, updatedAt: now })
    .onConflictDoUpdate({
      target: siteCache.host,
      set: { name: r.name, iconFile: r.iconFile, bgColor: r.bgColor, updatedAt: now },
    })
}

// 后台静默刷新（不阻塞响应）
function backgroundRefresh(host: string) {
  fetchFromUpstream(host)
    .then(r => upsertCache(host, r))
    .catch(e => console.error(`[site/info] 后台刷新失败 host=${host}`, e))
}

// 构造响应 data 对象
function toData(name: string, iconFile: string | null, bgColor: string) {
  const iconUrl = iconFile ? `/api/site/icon/${iconFile}` : ''
  return { name, src: iconUrl, imgSrc: iconUrl, backgroundColor: bgColor }
}

// ---- GET /api/site/info?url=<url>&refresh=1 ----
siteRoutes.get('/info', async (c) => {
  const rawUrl = c.req.query('url')
  if (!rawUrl) return c.json({ code: 400, data: null, msg: 'url 不能为空' }, 400)

  let host: string
  try {
    host = extractHost(rawUrl)
  } catch {
    return c.json({ code: 400, data: null, msg: '无效的 URL' }, 400)
  }

  const forceRefresh = c.req.query('refresh') === '1'

  // 强制刷新：绕过缓存直接请求上游
  if (forceRefresh) {
    try {
      const r = await fetchFromUpstream(host)
      await upsertCache(host, r)
      return c.json({ code: 200, data: toData(r.name, r.iconFile, r.bgColor), msg: 'ok' })
    } catch (e) {
      console.error(`[site/info] 强制刷新失败 host=${host}`, e)
      // 上游失败时兜底返回旧缓存
      const rows = await db.select().from(siteCache).where(eq(siteCache.host, host))
      if (rows[0]) {
        const row = rows[0]
        return c.json({ code: 200, data: toData(row.name, row.iconFile, row.bgColor), msg: 'ok (cached)' })
      }
      return c.json({ code: 200, data: toData('', null, ''), msg: 'ok (empty)' })
    }
  }

  // 查缓存
  const rows = await db.select().from(siteCache).where(eq(siteCache.host, host))
  const cached = rows[0]

  if (cached) {
    const age = Date.now() - cached.updatedAt
    // 过期（含 updatedAt=0 的旧行）：立即返回旧数据，后台异步更新
    if (age > CACHE_TTL_MS) {
      backgroundRefresh(host)
    }
    return c.json({ code: 200, data: toData(cached.name, cached.iconFile, cached.bgColor), msg: 'ok' })
  }

  // 无缓存：同步请求上游，等待结果再返回
  try {
    const r = await fetchFromUpstream(host)
    await db.insert(siteCache)
      .values({ host, name: r.name, iconFile: r.iconFile, bgColor: r.bgColor, updatedAt: Date.now() })
      .onConflictDoNothing()
    return c.json({ code: 200, data: toData(r.name, r.iconFile, r.bgColor), msg: 'ok' })
  } catch (e) {
    console.error(`[site/info] 上游请求失败 host=${host}`, e)
    return c.json({ code: 200, data: toData('', null, ''), msg: 'ok (empty)' })
  }
})

// ---- GET /api/site/icon/:file ----
siteRoutes.get('/icon/:file', async (c) => {
  const filename = c.req.param('file')
  if (!filename || filename.includes('/') || filename.includes('..') || filename.includes('\0')) {
    return c.notFound()
  }
  const file = Bun.file(join(ICONS_DIR, filename))
  if (!await file.exists()) return c.notFound()
  return new Response(file.stream(), {
    headers: {
      'Content-Type': file.type || 'image/png',
      'Cache-Control': 'public, max-age=2592000',
    },
  })
})
