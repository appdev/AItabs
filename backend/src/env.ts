import { z } from 'zod'

const envSchema = z.object({
  DB_PATH: z.string().default('./data/aitabs.db'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:5174'),
  PORT: z.coerce.number().int().positive().default(3000),
})

function loadEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    for (const issue of result.error.issues) {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }
  return result.data
}

export const env = loadEnv()
