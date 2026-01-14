/**
 * Placeholder test for /api/campaigns/[id]
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from '@/app/api/campaigns/[id]/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { campaign: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}))

describe('API /api/campaigns/[id]', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/campaigns/1'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns campaign when found', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.campaign.findUnique.mockResolvedValue({ id: 'c1', name: 'Camp' })

        const res = await GET(createMockRequest('GET', '/api/campaigns/c1'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.campaign).toMatchObject({ id: 'c1' })
    })
})
