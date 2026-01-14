/**
 * Placeholder test for POST /api/auth/register
 * Implement using tests/helpers/api-request.js and mocks.
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/register/route'
import { createMockRequest } from '../../helpers/api-request'

vi.mock('@/lib/auth', () => ({
    register: vi.fn(),
}))

vi.mock('@/lib/session', () => ({
    createSession: vi.fn(),
}))

describe('POST /api/auth/register', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 400 when required fields are missing', async () => {
        const request = createMockRequest('POST', '/api/auth/register', { email: '' })
        const res = await POST(request)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toBeDefined()
    })

    it('creates a user and returns session cookie on success', async () => {
        const { register } = await import('@/lib/auth')
        const { createSession } = await import('@/lib/session')

        const user = { id: 'u1', email: 'new@example.com' }
        register.mockResolvedValue(user)
        createSession.mockResolvedValue('session-token-xyz')

        const request = createMockRequest('POST', '/api/auth/register', {
            email: 'new@example.com',
            password: 'password123',
            firstName: 'New',
            lastName: 'User',
        })

        const res = await POST(request)
        const data = await res.json()

        expect(res.status).toBe(201)
        expect(data.user).toMatchObject({ id: 'u1', email: 'new@example.com' })

        const setCookie = res.headers.get('set-cookie')
        expect(setCookie).toBeDefined()
        expect(setCookie).toContain('session=')
    })
})
