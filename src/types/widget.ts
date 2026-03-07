export type WidgetSize = '1x1' | '1x2' | '2x1' | '2x2' | '2x4'

export type WidgetType =
  | 'weather'
  | 'calendar'
  | 'hotSearch'
  | 'countdown'
  | 'memo'
  | 'movie'
  | 'anniversary'
  | 'todo'

export interface Widget {
  id: string
  type: WidgetType
  size: WidgetSize
  order: number
  groupId: string
  config: Record<string, any>
  // 同步元数据
  updatedAt?: number
  deletedAt?: number | null
  dirty?: boolean
}

export interface WidgetMeta {
  type: WidgetType
  name: string
  description: string
  defaultSize: WidgetSize
  icon: string
  category: string
}
