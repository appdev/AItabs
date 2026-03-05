export type WidgetSize = '2x2' | '2x4'

export type WidgetType =
  | 'weather'
  | 'calendar'
  | 'hotSearch'
  | 'countdown'
  | 'memo'
  | 'movie'
  | 'anniversary'

export interface Widget {
  id: string
  type: WidgetType
  size: WidgetSize
  order: number
  groupId: string
  config: Record<string, any>
}

export interface WidgetMeta {
  type: WidgetType
  name: string
  description: string
  defaultSize: WidgetSize
  icon: string
  category: string
}
