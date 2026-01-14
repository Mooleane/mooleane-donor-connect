/**
 * Placeholder test for /api/campaigns route
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/campaigns/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { campaign: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() } },
}))

describe('API /api/campaigns', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/campaigns'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('lists campaigns when authenticated', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.campaign.findMany.mockResolvedValue([{ id: 'c1', name: 'Camp' }])
        prisma.campaign.count.mockResolvedValue(1)

        const res = await GET(createMockRequest('GET', '/api/campaigns'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.campaigns).toHaveLength(1)
    })

    it('creates campaign with POST', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.campaign.create.mockResolvedValue({ id: 'c-new', name: 'New' })

        const res = await POST(createMockRequest('POST', '/api/campaigns', { name: 'New' }))
        const data = await res.json()

        expect(res.status).toBe(201)
        expect(data.campaign.id).toBe('c-new')
    })
})
