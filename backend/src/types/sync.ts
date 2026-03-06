// ---- Push 请求 ----

export interface SyncItem {
  id: string
  data: Record<string, unknown>
  updatedAt: number
  deletedAt?: number | null
}

export interface SyncSettingsRequest {
  data: Record<string, unknown>
  version: number
}

export interface PushRequest {
  icons?: SyncItem[]
  widgets?: SyncItem[]
  groups?: SyncItem[]
  settings?: SyncSettingsRequest
}

// ---- Push 响应 ----

export interface ConflictItem {
  id: string
  serverData: Record<string, unknown>
  serverUpdatedAt: number
}

export interface PushResponse {
  ok: true
  settingsVersion?: number
  conflicts: {
    icons?: ConflictItem[]
    widgets?: ConflictItem[]
    groups?: ConflictItem[]
    settings?: {
      serverData: Record<string, unknown>
      serverVersion: number
    }
  }
}

// ---- Pull 响应 ----

export interface PullItem {
  id: string
  data: Record<string, unknown>
  updatedAt: number
  deletedAt?: number | null
}

export interface PullResponse {
  icons: PullItem[]
  widgets: PullItem[]
  groups: PullItem[]
  settings: {
    data: Record<string, unknown>
    version: number
    updatedAt: number
  } | null
  serverTime: number
}
