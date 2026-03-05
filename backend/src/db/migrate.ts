import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { env } from '@/env.ts'

const sqlite = new Database(env.DB_PATH)
const db = drizzle(sqlite)

console.log('⏳ Running migrations...')
migrate(db, { migrationsFolder: './drizzle' })
console.log('✅ Migrations completed')

sqlite.close()
