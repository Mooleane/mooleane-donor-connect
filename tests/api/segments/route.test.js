/**
 * Placeholder test for /api/segments route
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/segments/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { segment: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() } },
}))

describe('API /api/segments', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/segments'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('lists segments when authenticated', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.segment.findMany.mockResolvedValue([{ id: 's1', name: 'Segment' }])
        prisma.segment.count.mockResolvedValue(1)

        const res = await GET(createMockRequest('GET', '/api/segments'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.segments).toHaveLength(1)
    })
})
