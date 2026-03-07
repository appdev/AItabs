export interface Memo {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  pinned?: boolean
}

export interface MemoConfig {
  sortBy?: 'editTime' | 'createTime' | 'title'
  autoSaveInterval?: number
  fontSize?: number
}

export interface MemoData {
  memos: Memo[]
  selectedMemoId?: string
  updatedAt: number
}
