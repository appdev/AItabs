import Dexie, { type EntityTable } from 'dexie'
import type { SiteIcon } from '@/types/icon'
import type { Widget } from '@/types/widget'

const db = new Dexie('AItabsDB') as Dexie & {
  icons: EntityTable<SiteIcon, 'id'>
  widgets: EntityTable<Widget, 'id'>
}

db.version(1).stores({
  icons: 'id, groupId, order',
  widgets: 'id, groupId, order',
})

export { db }
