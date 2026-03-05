import Dexie, { type EntityTable } from 'dexie'
import type { SiteIcon } from '@/types/icon'
import type { Widget } from '@/types/widget'

export interface WallpaperRecord {
  id: string   // 本地壁纸固定使用 'local'
  data: string // base64 图片数据
}

const db = new Dexie('AItabsDB') as Dexie & {
  icons: EntityTable<SiteIcon, 'id'>
  widgets: EntityTable<Widget, 'id'>
  wallpapers: EntityTable<WallpaperRecord, 'id'>
}

db.version(1).stores({
  icons: 'id, groupId, order',
  widgets: 'id, groupId, order',
})

db.version(2).stores({
  icons: 'id, groupId, order',
  widgets: 'id, groupId, order',
  wallpapers: 'id',
})

export { db }
