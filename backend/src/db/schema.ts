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

// ---- 同步数据表：todo items ----
export const syncTodoItems = sqliteTable('sync_todo_items', {
  id: text('id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'number' }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.id] }),
])

// ---- 同步数据表：todo lists ----
export const syncTodoLists = sqliteTable('sync_todo_lists', {
  id: text('id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  data: text('data').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'number' }),
}, (t) => [
  primaryKey({ columns: [t.userId, t.id] }),
])

// ---- 网站信息缓存（按 host 去重）----
export const siteCache = sqliteTable('site_cache', {
  host: text('host').primaryKey(),
  name: text('name').notNull().default(''),
  iconFile: text('icon_file'),          // 本地文件名，如 example.com.png；null 表示无图标
  bgColor: text('bg_color').notNull().default(''),
  createdAt: integer('created_at', { mode: 'number' }).notNull().$defaultFn(() => Date.now()),
  // 上次从上游实际拉取的时间（0 = 旧数据迁移前的默认值，视为需要刷新）
  updatedAt: integer('updated_at', { mode: 'number' }).notNull().default(0),
})
