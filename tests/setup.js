// Test setup file for Vitest

import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/donorconnect_test'
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only'
process.env.NODE_ENV = 'test'

beforeAll(() => {
  console.log('Starting test suite')
})

afterEach(() => {
  // Clean up after each test if needed
})

afterAll(() => {
  console.log('Test suite completed')
})
