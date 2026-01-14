// vitest-environment node

/**
 * API Route Tests for /api/donations/[id]
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from '@/app/api/donations/[id]/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: {
        donation: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    },
}))

describe('API /api/donations/[id]', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const req = createMockRequest('GET', '/api/donations/1')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns donation when found', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donation.findUnique.mockResolvedValue({ id: 'don1', amount: 25 })

        const req = createMockRequest('GET', '/api/donations/don1')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.donation).toMatchObject({ id: 'don1' })
    })

    it('updates donation with PUT', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donation.update.mockResolvedValue({ id: 'don1', amount: 50 })

        const req = createMockRequest('PUT', '/api/donations/don1', { amount: 50 })
        const res = await PUT(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.donation.amount).toBe(50)
    })

    it('deletes donation with DELETE', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donation.delete.mockResolvedValue({ id: 'don1' })

        const req = createMockRequest('DELETE', '/api/donations/don1')
        const res = await DELETE(req)

        expect(res.status).toBe(200)
    })
})
