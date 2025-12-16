// Setup for integration tests with real database
// Uses Playwright utilities for database lifecycle management

import { beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, cleanDatabase } from './helpers/database'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Safety check: Ensure we're using a test database
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error(
    '❌ DATABASE_URL must contain "test" for integration tests. ' +
    'Example: postgresql://user:pass@localhost:5432/donorconnect_test'
  )
}

console.log('🗄️  Integration tests will use database:', process.env.DATABASE_URL?.split('@')[1])

beforeAll(async () => {
  console.log('🔧 Setting up test database...')
  await setupTestDatabase()
  console.log('✅ Test database ready')
}, 60000) // 60s timeout for DB setup

beforeEach(async () => {
  // Clean database between tests to ensure isolation
  await cleanDatabase()
})

afterAll(async () => {
  console.log('🧹 Tearing down test database...')
  await teardownTestDatabase()
  console.log('✅ Integration tests completed')
}, 30000)
