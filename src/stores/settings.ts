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

  function updateCSSVars() {
    const s = settings.value
    const root = document.documentElement.style
    root.setProperty('--icon-size', `${s.icon.iconSize}px`)
    root.setProperty('--icon-gap', `${s.icon.gapX}px`)
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
  }

  function resetSettings() {
    settings.value = structuredClone(DEFAULT_SETTINGS)
  }

  watch(settings, updateCSSVars, { deep: true, immediate: true })

  return { settings, updateCSSVars, resetSettings }
}, {
  persist: {
    key: 'aitabs-settings',
  },
})
