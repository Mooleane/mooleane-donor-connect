/**
 * Placeholder test for GET /api/auth/session
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/auth/session/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({
    getSession: vi.fn(),
}))

describe('GET /api/auth/session', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when no session', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const req = createMockRequest('GET', '/api/auth/session')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
    })

    it('returns session user data when authenticated', async () => {
        const { getSession } = await import('@/lib/session')
        const mockSession = createMockSession()
        getSession.mockResolvedValue(mockSession)

        const req = createMockRequest('GET', '/api/auth/session')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.user).toBeDefined()
        expect(data.user.id).toBe(mockSession.user.id)
    })
})
