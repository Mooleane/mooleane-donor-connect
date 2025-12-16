// vitest-environment node

/**
 * API Route Tests: POST /api/auth/login
 * Tests user authentication and session creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/login/route'
import { createMockRequest } from '../../helpers/api-request'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  login: vi.fn(),
}))

vi.mock('@/lib/session', () => ({
  createSession: vi.fn(),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if email is missing', async () => {
    const request = createMockRequest('POST', '/api/auth/login', {
      password: 'password123',
      // email missing
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('email')
  })

  it('should return 400 if password is missing', async () => {
    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      // password missing
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('password')
  })

  it('should return 401 for invalid credentials', async () => {
    const { login } = await import('@/lib/auth')

    // Mock login to return null (invalid credentials)
    login.mockResolvedValue(null)

    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'wrong@example.com',
      password: 'wrongpassword',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid credentials')
    expect(login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword')
  })

  it('should create session and return user data for valid credentials', async () => {
    const { login } = await import('@/lib/auth')
    const { createSession } = await import('@/lib/session')

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'STAFF',
      organizationId: 'org-123',
    }

    const mockSessionToken = 'session-token-abc123'

    login.mockResolvedValue(mockUser)
    createSession.mockResolvedValue(mockSessionToken)

    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual(mockUser)
    expect(data.user.password).toBeUndefined() // Password should not be returned

    // Verify session was created
    expect(createSession).toHaveBeenCalledWith('user-123')

    // Verify session cookie was set
    const setCookieHeader = response.headers.get('set-cookie')
    expect(setCookieHeader).toBeDefined()
    expect(setCookieHeader).toContain('session=')
    expect(setCookieHeader).toContain(mockSessionToken)
    expect(setCookieHeader).toContain('HttpOnly')
    expect(setCookieHeader).toContain('Secure')
    expect(setCookieHeader).toContain('SameSite=Lax')
  })

  it('should return 400 for invalid email format', async () => {
    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'not-an-email',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('email')
  })

  it('should handle login errors gracefully', async () => {
    const { login } = await import('@/lib/auth')

    // Mock login to throw an error
    login.mockRejectedValue(new Error('Database connection failed'))

    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should handle session creation errors', async () => {
    const { login } = await import('@/lib/auth')
    const { createSession } = await import('@/lib/session')

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'STAFF',
      organizationId: 'org-123',
    }

    login.mockResolvedValue(mockUser)
    createSession.mockRejectedValue(new Error('Session creation failed'))

    const request = createMockRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })

  it('should trim whitespace from email', async () => {
    const { login } = await import('@/lib/auth')

    login.mockResolvedValue(null)

    const request = createMockRequest('POST', '/api/auth/login', {
      email: '  test@example.com  ',
      password: 'password123',
    })
    await POST(request)

    // Verify login was called with trimmed email
    expect(login).toHaveBeenCalledWith('test@example.com', 'password123')
  })
})
