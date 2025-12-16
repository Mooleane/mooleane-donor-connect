// API request helper utilities for testing Next.js route handlers
// Provides mock Request/Response objects and session helpers

import { NextRequest } from 'next/server'

/**
 * Create mock Next.js Request for testing route handlers
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE, etc.)
 * @param {string} url - Request URL (can be relative or absolute)
 * @param {object} body - Request body (for POST, PATCH, PUT)
 * @param {object} headers - Additional headers
 * @returns {NextRequest} Mock Next.js request object
 */
export function createMockRequest(method, url, body = null, headers = {}) {
  const requestUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && ['POST', 'PATCH', 'PUT'].includes(method)) {
    options.body = JSON.stringify(body)
  }

  return new NextRequest(requestUrl, options)
}

/**
 * Create mock session object for testing
 * @param {object} overrides - Override default session properties
 * @returns {object} Mock session object with user data
 */
export function createMockSession(overrides = {}) {
  return {
    id: overrides.id || 'session-123',
    token: overrides.token || 'mock-session-token-abc123',
    userId: overrides.userId || 'user-123',
    expiresAt: overrides.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: overrides.createdAt || new Date(),
    user: {
      id: overrides.userId || 'user-123',
      email: overrides.email || 'test@example.com',
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      role: overrides.role || 'STAFF',
      organizationId: overrides.organizationId || 'org-123',
      ...overrides.user,
    },
    ...overrides,
  }
}

/**
 * Extract JSON from Response object
 * @param {Response} response - Next.js Response object
 * @returns {Promise<object>} Parsed JSON data
 */
export async function getResponseJson(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

/**
 * Create mock authenticated request with session
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {object} session - Mock session (or use default)
 * @returns {NextRequest} Authenticated mock request
 */
export function createAuthenticatedRequest(method, url, body = null, session = null) {
  const mockSession = session || createMockSession()

  // Add session token to cookies
  const headers = {
    Cookie: `session=${mockSession.token}`,
  }

  return createMockRequest(method, url, body, headers)
}

/**
 * Create mock request with specific role
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {object} body - Request body
 * @param {string} role - User role (ADMIN, STAFF, MARKETING, READONLY)
 * @returns {NextRequest} Mock request with specified role
 */
export function createMockRequestWithRole(method, url, body = null, role = 'STAFF') {
  const session = createMockSession({ role })
  return createAuthenticatedRequest(method, url, body, session)
}

/**
 * Assert response status and return JSON
 * Helper to reduce boilerplate in tests
 * @param {Response} response - Next.js Response
 * @param {number} expectedStatus - Expected HTTP status code
 * @returns {Promise<object>} Response JSON data
 */
export async function assertResponseStatus(response, expectedStatus) {
  const data = await getResponseJson(response)

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}. ` +
      `Response: ${JSON.stringify(data)}`
    )
  }

  return data
}
