// Database helper utilities for integration tests
// Manages test database lifecycle: setup, cleanup, teardown

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

let prisma
let databaseUrl

/**
 * Setup test database - creates unique DB, runs migrations, seeds base data
 * Called once before all integration tests
 */
export async function setupTestDatabase() {
  // Create unique test database name to avoid conflicts
  const dbName = `donorconnect_test_${randomUUID().slice(0, 8)}`
  const baseUrl = process.env.DATABASE_URL?.split('/').slice(0, -1).join('/') ||
                  'postgresql://postgres:postgres@localhost:5432'
  databaseUrl = `${baseUrl}/${dbName}`

  try {
    // Create test database
    console.log(`  📦 Creating database: ${dbName}`)
    execSync(`psql -c "CREATE DATABASE ${dbName};" ${baseUrl}`, {
      stdio: 'pipe',
    })
  } catch (error) {
    // Database might already exist, continue
    console.log(`  ⚠️  Database creation skipped (may already exist)`)
  }

  // Update environment
  process.env.DATABASE_URL = databaseUrl

  try {
    // Run migrations
    console.log('  🔄 Running migrations...')
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'pipe',
    })
  } catch (error) {
    console.error('  ❌ Migration failed:', error.message)
    throw error
  }

  // Initialize Prisma client
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  await prisma.$connect()

  // Seed base test data (organization, users)
  await seedTestData()

  return prisma
}

/**
 * Teardown test database - disconnects and drops the database
 * Called once after all integration tests
 */
export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }

  if (databaseUrl) {
    const dbName = databaseUrl.split('/').pop().split('?')[0]
    try {
      console.log(`  🗑️  Dropping database: ${dbName}`)
      const baseUrl = databaseUrl.split('/').slice(0, -1).join('/')
      execSync(`psql -c "DROP DATABASE IF EXISTS ${dbName};" ${baseUrl}`, {
        stdio: 'pipe',
      })
    } catch (error) {
      console.error('  ⚠️  Database cleanup warning:', error.message)
    }
  }
}

/**
 * Clean database - removes all data while preserving schema
 * Called before each integration test for isolation
 */
export async function cleanDatabase() {
  if (!prisma) return

  // Delete in correct order (respects foreign key constraints)
  await prisma.activityLog.deleteMany()
  await prisma.workflowExecution.deleteMany()
  await prisma.workflow.deleteMany()
  await prisma.segmentMember.deleteMany()
  await prisma.segment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.donor.deleteMany()
  await prisma.session.deleteMany()
  // Don't delete users and organizations - re-seed them
  await prisma.user.deleteMany({ where: { id: { not: 'test-user-1' } } })
  await prisma.organization.deleteMany({ where: { id: { not: 'test-org-1' } } })

  // Re-seed base data
  await seedTestData()
}

/**
 * Seed base test data - creates default organization and user for tests
 * Internal helper function
 */
async function seedTestData() {
  // Create test organization
  await prisma.organization.upsert({
    where: { id: 'test-org-1' },
    update: {},
    create: {
      id: 'test-org-1',
      name: 'Test Organization',
    },
  })

  // Create test user with hashed password
  const bcrypt = await import('bcryptjs')
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.upsert({
    where: { id: 'test-user-1' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: 'test-org-1',
    },
  })
}

/**
 * Get test Prisma instance
 * @returns {PrismaClient} Prisma client connected to test database
 */
export function getTestPrisma() {
  if (!prisma) {
    throw new Error('Database not initialized. Call setupTestDatabase() first.')
  }
  return prisma
}
