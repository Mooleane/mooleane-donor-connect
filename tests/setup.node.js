// Setup for Node environment tests
// Used for API routes and library functions with mocked dependencies

import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/donorconnect_test'
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only-must-be-at-least-32-characters'
process.env.NODE_ENV = 'test'

beforeAll(() => {
  console.log('🧪 Starting Node environment tests (API routes + lib functions)')
})

afterEach(() => {
  // Clear all mocks between tests to ensure isolation
  if (global.vi) {
    vi.clearAllMocks()
  }
})

afterAll(() => {
  console.log('✅ Node environment tests completed')
})
