#!/usr/bin/env bun
// AItabs 用户数据导出脚本
// 用法：bun scripts/export-user.ts <username> [输出文件]
// 示例：bun scripts/export-user.ts alice ./alice-data.json

import { Database } from 'bun:sqlite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error('用法：bun scripts/export-user.ts <username> [输出文件]')
  process.exit(1)
}

const username = args[0]!
const outputFile = args[1] ?? `${username}-export-${Date.now()}.json`
const dbPath = process.env.DB_PATH ?? resolve(PROJECT_ROOT, 'backend/data/aitabs.db')

if (!await Bun.file(dbPath).exists()) {
  console.error(`错误：数据库文件不存在：${dbPath}`)
  process.exit(1)
}

const db = new Database(dbPath, { readonly: true })

// 查找用户
const user = db.prepare<{ id: string; username: string; created_at: number }, [string]>(
  'SELECT id, username, created_at FROM users WHERE username = ?'
).get(username)

if (!user) {
  console.error(`错误：用户 "${username}" 不存在`)
  db.close()
  process.exit(1)
}

console.log(`找到用户：${user.username} (${user.id})`)

// 查询各类数据
const icons = db.prepare<{ id: string; data: string; updated_at: number; deleted_at: number | null }, [string]>(
  'SELECT id, data, updated_at, deleted_at FROM sync_icons WHERE user_id = ?'
).all(user.id)

const widgets = db.prepare<{ id: string; data: string; updated_at: number; deleted_at: number | null }, [string]>(
  'SELECT id, data, updated_at, deleted_at FROM sync_widgets WHERE user_id = ?'
).all(user.id)

const groups = db.prepare<{ id: string; data: string; updated_at: number; deleted_at: number | null }, [string]>(
  'SELECT id, data, updated_at, deleted_at FROM sync_groups WHERE user_id = ?'
).all(user.id)

const settings = db.prepare<{ data: string; version: number; updated_at: number }, [string]>(
  'SELECT data, version, updated_at FROM sync_settings WHERE user_id = ?'
).get(user.id)

// 组装导出数据
const exportData = {
  exportedAt: new Date().toISOString(),
  user: { id: user.id, username: user.username, createdAt: user.created_at },
  icons: icons.map(r => ({ id: r.id, data: JSON.parse(r.data), updatedAt: r.updated_at, deletedAt: r.deleted_at })),
  widgets: widgets.map(r => ({ id: r.id, data: JSON.parse(r.data), updatedAt: r.updated_at, deletedAt: r.deleted_at })),
  groups: groups.map(r => ({ id: r.id, data: JSON.parse(r.data), updatedAt: r.updated_at, deletedAt: r.deleted_at })),
  settings: settings
    ? { data: JSON.parse(settings.data), version: settings.version, updatedAt: settings.updated_at }
    : null,
}

await Bun.write(outputFile, JSON.stringify(exportData, null, 2))

console.log(`导出成功：${outputFile}`)
console.log(`  图标：${exportData.icons.length} 条`)
console.log(`  组件：${exportData.widgets.length} 条`)
console.log(`  分组：${exportData.groups.length} 条`)
console.log(`  设置：${exportData.settings ? '已导出' : '无'}`)

db.close()
