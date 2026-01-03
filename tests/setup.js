// Test setup file for Vitest

import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/donorconnect_test'
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only'
process.env.NODE_ENV = 'test'

import net from 'net'

beforeAll(() => {
  console.log('Starting test suite')
})

// If the local PostgreSQL server isn't running, skip integration tests by
// setting an environment flag that vitest config can use to exclude them.
;(async () => {
  function checkPort(host, port, timeout = 1000) {
    return new Promise((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(timeout)
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      socket.on('error', () => resolve(false))
      socket.connect(port, host)
    })
  }

  try {
    const portOpen = await checkPort('localhost', 5432)
    if (!portOpen) {
      console.warn('Postgres not reachable at localhost:5432 — integration tests will be skipped')
      process.env.SKIP_INTEGRATION = '1'
    }
  } catch (err) {
    console.warn('Error checking Postgres port — skipping integration tests')
    process.env.SKIP_INTEGRATION = '1'
  }
})()


afterEach(() => {
  // Clean up after each test if needed
})

afterAll(() => {
  console.log('Test suite completed')
})

// Integration test setup (creates test DB, runs migrations). Importing here ensures
// the database setup hooks are registered when running the full test suite.
// Use dynamic import so the environment variables set above are applied before
// the integration setup runs.
;(async () => {
  try {
    await import('./setup.integration')
  } catch (err) {
    // If the integration setup fails in non-integration contexts, log and continue
    console.warn('Integration setup import failed (non-integration run?):', err.message)
  }
})()

