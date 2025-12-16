import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../generated/client.js'

// Parse connection string and create pool with SSL configuration
const connectionString = process.env.DATABASE_URL

// Create pg Pool with SSL enabled for Neon and other cloud providers
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon and most cloud providers
  }
})

// Create adapter with the pool
const adapter = new PrismaPg(pool)

// Singleton pattern for Next.js to prevent multiple instances during hot-reload
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma