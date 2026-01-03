// Setup for integration tests with real database
// Uses Playwright utilities for database lifecycle management

import { beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, cleanDatabase } from './helpers/database'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Safety check: Ensure we're using a test database. If not present or
// the DB is unreachable, mark integration DB as unavailable and skip setup.
if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn('DATABASE_URL does not include "test". Integration tests will be skipped.')
  globalThis.__INTEGRATION_DB_UNAVAILABLE = true
} else {
  console.log('🗄️  Integration tests will use database:', process.env.DATABASE_URL?.split('@')[1])
}

beforeAll(async () => {
  if (globalThis.__INTEGRATION_DB_UNAVAILABLE) {
    console.warn('Skipping integration DB setup because DATABASE_URL is not configured for tests or DB is unreachable')
    return
  }

  console.log('🔧 Setting up test database...')
  try {
    await setupTestDatabase()
    console.log('✅ Test database ready')
  } catch (err) {
    console.warn('Integration DB setup failed, integration tests will be skipped:', err.message)
    globalThis.__INTEGRATION_DB_UNAVAILABLE = true
  }
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
