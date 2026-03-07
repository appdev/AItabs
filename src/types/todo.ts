export interface TodoItem {
  id: string
  title: string
  completed: boolean
  listId: string
  dueDate?: string
  priority?: 'low' | 'medium' | 'high'
  order: number
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  dirty?: boolean
}

export interface TodoList {
  id: string
  name: string
  color?: string
  icon?: string
  order: number
  createdAt: number
  updatedAt: number
  deletedAt?: number | null
  dirty?: boolean
}

export type SmartListType = 'today' | 'all' | 'week' | 'important'
