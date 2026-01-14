/**
 * Placeholder test for POST /api/auth/logout
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/logout/route'
import { createMockRequest } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({
    deleteSession: vi.fn(),
}))

describe('POST /api/auth/logout', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when not authenticated', async () => {
        const { deleteSession } = await import('@/lib/session')
        deleteSession.mockResolvedValue(false)

        const request = createMockRequest('POST', '/api/auth/logout')
        const res = await POST(request)
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('clears session cookie on success', async () => {
        const { deleteSession } = await import('@/lib/session')
        deleteSession.mockResolvedValue(true)

        const request = createMockRequest('POST', '/api/auth/logout')
        const res = await POST(request)

        expect(res.status).toBe(200)
        const setCookie = res.headers.get('set-cookie')
        expect(setCookie).toBeDefined()
        expect(setCookie).toContain('session=')
        // Cookie should be expired/cleared
        expect(setCookie).toMatch(/Expires=|Max-Age=0/)
    })
})
