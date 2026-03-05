import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { env } from '@/env.ts'
import * as schema from './schema.ts'

const sqlite = new Database(env.DB_PATH)
sqlite.exec('PRAGMA journal_mode=WAL')
sqlite.exec('PRAGMA foreign_keys=ON')

export const db = drizzle(sqlite, { schema })
