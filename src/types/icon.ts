export type IconSize = '1x1' | '1x2' | '2x1' | '2x2' | '2x4'

export interface SiteIcon {
  id: string
  name: string
  url: string
  icon: string
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
