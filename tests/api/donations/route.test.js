/**
 * Placeholder test for /api/donations route
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/donations/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: {
        donation: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() },
    },
}))

describe('API /api/donations', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const req = createMockRequest('GET', '/api/donations')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns donations list when authenticated', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donation.findMany.mockResolvedValue([{ id: 'don1', amount: 50 }])
        prisma.donation.count.mockResolvedValue(1)

        const req = createMockRequest('GET', '/api/donations')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.donations).toHaveLength(1)
    })

    it('creates donation with POST', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donation.create.mockResolvedValue({ id: 'don-new', amount: 100 })

        const req = createMockRequest('POST', '/api/donations', { amount: 100, donorId: 'd1' })
        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(201)
        expect(data.donation.id).toBe('don-new')
    })
})
