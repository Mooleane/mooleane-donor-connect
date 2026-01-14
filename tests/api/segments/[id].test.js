/**
 * Placeholder test for /api/segments/[id]
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from '@/app/api/segments/[id]/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { segment: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}))

describe('API /api/segments/[id]', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/segments/1'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns segment when found', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.segment.findUnique.mockResolvedValue({ id: 's1', name: 'Seg' })

        const res = await GET(createMockRequest('GET', '/api/segments/s1'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.segment).toMatchObject({ id: 's1' })
    })
})
