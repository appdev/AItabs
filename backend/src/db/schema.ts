import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

// ---- 用户表 ----
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(() => Date.now()),
})

// ---- 同步数据表：icons ----
export const syncIcons = sqliteTable('sync_icons', {
  id: text('id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'number' }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.id] }),
])

// ---- 同步数据表：widgets ----
export const syncWidgets = sqliteTable('sync_widgets', {
  id: text('id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'number' }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.id] }),
])

// ---- 同步数据表：groups ----
export const syncGroups = sqliteTable('sync_groups', {
  id: text('id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'number' }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.id] }),
])

// ---- 同步数据表：settings（每用户一行） ----
export const syncSettings = sqliteTable('sync_settings', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  version: integer('version').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})
