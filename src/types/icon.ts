export type IconSize = '1x1' | '1x2' | '2x1' | '2x2' | '2x4'

export interface SiteIcon {
  id: string
  name: string
  url: string
  icon: string          // 图片 URL（空则退到文字显示）
  iconText?: string     // 自定义文字图标（优先级：iconText > icon 首字 > name 首字）
  bgColor: string
  size: IconSize
  type: 'site' | 'folder' | 'builtin'
  order: number
  groupId: string
  children?: SiteIcon[]
  openInNewTab?: boolean
}

export interface SiteInfoResponse {
  code: number
  data: {
    type: number
    _id: string
    name: string
    url: string
    src: string
    imgSrc: string
    backgroundColor: string
  } | null
  msg: string
}
