import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { AppSettings, SearchEngine } from '@/types/settings'

const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  { key: 'baidu', title: '百度', href: 'https://www.baidu.com/s?wd=' },
  { key: 'bing', title: '必应', href: 'https://www.bing.com/search?q=' },
  { key: 'google', title: 'Google', href: 'https://www.google.com/search?q=' },
  { key: 'metaso', title: '秘塔AI', href: 'https://metaso.cn/?q=' },
]

const DEFAULT_SETTINGS: AppSettings = {
  lang: 'zh-CN',
  searchEngines: DEFAULT_SEARCH_ENGINES,
  activeEngine: 'baidu',
  search: {
    show: true,
    history: false,
    height: 46,
    radius: 23,
    bgColor: 0.5,
  },
  theme: {
    mode: 'light',
    system: true,
    color: '#1890ff',
  },
  wallpaper: {
    mask: 0,
    blur: 0,
    type: 'default',
    src: 'https://files.codelife.cc/itab/defaultWallpaper/defaultWallpaper.webp',
    thumb: '',
  },
  time: {
    show: true,
    size: 70,
    color: '#ffffff',
    fontWeight: 400,
    font: 'system-ui',
    hour24: true,
    sec: false,
    month: true,
    week: true,
    lunar: true,
  },
  icon: {
    style: 'default',
    nameShow: true,
    nameSize: 12,
    nameColor: '#ffffff',
    iconRadius: 18,
    iconSize: 60,
    gapX: 30,
    gapY: 30,
    gapSync: true,
    opacity: 1,
    maxWidth: 1350,
    maxWidthUnit: 'px',
  },
  sidebar: {
    placement: 'left',
    autoHide: false,
    width: 50,
    opacity: 0.4,
  },
  layout: {
    view: 'widget',
    yiyan: true,
  },
  open: {
    searchBlank: true,
    iconBlank: true,
  },
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(structuredClone(DEFAULT_SETTINGS))
  // 同步版本号（乐观锁）和脏标记
  const syncVersion = ref(0)
  const dirty = ref(false)

  // 首次加载后允许跟踪变更
  let trackChanges = false

  function updateCSSVars() {
    const s = settings.value
    const root = document.documentElement.style
    root.setProperty('--icon-size', `${s.icon.iconSize}px`)
    root.setProperty('--icon-gap', `${s.icon.gapX}px`)
    root.setProperty('--icon-gap-y', `${s.icon.gapY}px`)
    root.setProperty('--icon-radius', `${s.icon.iconRadius}px`)
    root.setProperty('--icon-opacity', String(s.icon.opacity))
    root.setProperty('--icon-name-size', `${s.icon.nameSize}px`)
    root.setProperty('--icon-name-color', s.icon.nameColor)
    root.setProperty('--sidebar-width', `${s.sidebar.width}px`)
    root.setProperty('--sidebar-opacity', String(s.sidebar.opacity))
    root.setProperty('--search-height', `${s.search.height}px`)
    root.setProperty('--search-radius', `${s.search.radius}px`)
    root.setProperty('--search-bg-color', String(s.search.bgColor))
    root.setProperty('--time-size', `${s.time.size}px`)
    root.setProperty('--time-color', s.time.color)
    root.setProperty('--time-font-weight', String(s.time.fontWeight))
    root.setProperty('--time-font', s.time.font)
    root.setProperty('--wall-blur', `${s.wallpaper.blur}px`)
    root.setProperty('--wall-mask', String(s.wallpaper.mask))

    // 深浅色模式：system 优先，否则用手动设置
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = s.theme.system ? prefersDark : s.theme.mode === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  }

  function resetSettings() {
    settings.value = structuredClone(DEFAULT_SETTINGS)
    dirty.value = false
  }

  // 应用从服务端拉取的设置（不触发脏标记）
  function applyRemoteSettings(data: Record<string, unknown>, version: number) {
    trackChanges = false
    Object.assign(settings.value, data as Partial<AppSettings>)
    syncVersion.value = version
    dirty.value = false
    setTimeout(() => { trackChanges = true }, 0)
  }

  function clearDirty() {
    dirty.value = false
  }

  // CSS 变量同步 + 脏标记
  watch(settings, (_, oldVal) => {
    updateCSSVars()
    if (trackChanges && oldVal !== undefined) {
      dirty.value = true
    }
  }, { deep: true, immediate: true })

  // 跟随系统时，系统主题变化也立即刷新
  const darkMq = window.matchMedia('(prefers-color-scheme: dark)')
  darkMq.addEventListener('change', () => {
    if (settings.value.theme.system) updateCSSVars()
  })

  // 初始化后才开始跟踪
  setTimeout(() => { trackChanges = true }, 100)

  return { settings, syncVersion, dirty, updateCSSVars, resetSettings, applyRemoteSettings, clearDirty }
}, {
  persist: {
    key: 'aitabs-settings',
    pick: ['settings', 'syncVersion'],
  },
})
