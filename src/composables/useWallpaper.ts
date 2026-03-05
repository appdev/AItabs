import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { db } from '@/services/db'

const BING_CACHE_KEY = 'aitabs-bing-wallpaper'

// 取消过期切换任务（用户快速连续切换时只保留最后一次）
let applyVersion = 0

// 模块级单例，保证全局只有一份壁纸状态
const activeSrc = ref('')
const wallpaperOpacity = ref(1)

// 从 Bing 接口获取当日壁纸 URL，优先读取当天缓存
async function fetchBingUrl(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const raw = localStorage.getItem(BING_CACHE_KEY)
    if (raw) {
      const cached: { url: string; date: string } = JSON.parse(raw)
      if (cached.date === today && cached.url) return cached.url
    }
  } catch { /* 缓存损坏，忽略 */ }

  try {
    const res = await fetch('/bing-wallpaper/HPImageArchive.aspx?format=js&idx=0&n=1')
    const data = await res.json()
    const rawUrl: string = data.images?.[0]?.url ?? ''
    if (rawUrl) {
      const url = 'https://cn.bing.com' + rawUrl.split('&')[0]
      localStorage.setItem(BING_CACHE_KEY, JSON.stringify({ url, date: today }))
      return url
    }
  } catch { /* 网络异常，静默处理 */ }

  return ''
}

// 用 Image 对象预加载，加载完成或失败都继续
function preload(src: string): Promise<void> {
  return new Promise(resolve => {
    if (!src) { resolve(); return }
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

// 预加载完成后淡出 → 换图 → 淡入
async function switchTo(src: string, version: number) {
  if (!src) return
  await preload(src)
  if (version !== applyVersion) return // 已被新任务取代

  if (activeSrc.value) {
    wallpaperOpacity.value = 0
    await new Promise(r => setTimeout(r, 500))
    if (version !== applyVersion) return
  }

  activeSrc.value = src
  wallpaperOpacity.value = 1
}

// 导出为具名函数，允许外部（如 SettingsDialog）在 type/src 未变化时主动触发
export async function applyWallpaper() {
  const version = ++applyVersion
  const settingsStore = useSettingsStore()
  const w = settingsStore.settings.wallpaper
  let src = ''
  if (w.type === 'bing') {
    src = await fetchBingUrl()
  } else if (w.type === 'local') {
    const record = await db.wallpapers.get('local')
    src = record?.data ?? ''
  } else {
    src = w.src
  }
  await switchTo(src, version)
}

export function useWallpaper() {
  const settingsStore = useSettingsStore()
  const wallpaper = computed(() => settingsStore.settings.wallpaper)

  watch(
    [() => wallpaper.value.type, () => wallpaper.value.src],
    applyWallpaper,
    { immediate: true },
  )

  return { activeSrc, wallpaperOpacity }
}
