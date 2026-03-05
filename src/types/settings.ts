export interface SearchEngine {
  key: string
  title: string
  href: string
}

export interface ThemeSettings {
  mode: 'light' | 'dark'
  system: boolean
  color: string
}

export interface WallpaperSettings {
  mask: number
  blur: number
  type: 'default' | 'url' | 'local' | 'bing'
  src: string
  thumb: string
}

export interface SearchSettings {
  show: boolean
  history: boolean
  height: number
  radius: number
  bgColor: number
}

export interface TimeSettings {
  show: boolean
  size: number
  color: string
  fontWeight: number
  font: string
  hour24: boolean
  sec: boolean
  month: boolean
  week: boolean
  lunar: boolean
}

export interface IconSettings {
  style: 'default' | 'circle'
  nameShow: boolean
  nameSize: number
  nameColor: string
  iconRadius: number
  iconSize: number
  gapX: number
  gapY: number
  gapSync: boolean
  opacity: number
  maxWidth: number
  maxWidthUnit: 'px' | '%'
}

export interface SidebarSettings {
  placement: 'left' | 'right'
  autoHide: boolean
  width: number
  opacity: number
}

export interface LayoutSettings {
  view: 'widget' | 'simple'
  yiyan: boolean
}

export interface OpenSettings {
  searchBlank: boolean
  iconBlank: boolean
}

export interface AppSettings {
  lang: string
  searchEngines: SearchEngine[]
  activeEngine: string
  search: SearchSettings
  theme: ThemeSettings
  wallpaper: WallpaperSettings
  time: TimeSettings
  icon: IconSettings
  sidebar: SidebarSettings
  layout: LayoutSettings
  open: OpenSettings
}

export interface NavGroup {
  id: string
  name: string
  icon: string
  order: number
  // 同步元数据
  updatedAt?: number
  deletedAt?: number | null
  dirty?: boolean
}
