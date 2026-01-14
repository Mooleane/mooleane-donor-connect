/**
 * Placeholder test for GET/PUT/DELETE /api/donors/[id]
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from '@/app/api/donors/[id]/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: {
        donor: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}))

describe('API /api/donors/[id]', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const req = createMockRequest('GET', '/api/donors/1')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns donor when found', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donor.findUnique.mockResolvedValue({ id: 'd1', firstName: 'A' })

        const req = createMockRequest('GET', '/api/donors/d1')
        const res = await GET(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.donor).toMatchObject({ id: 'd1' })
    })

    it('updates donor with PUT', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donor.update.mockResolvedValue({ id: 'd1', firstName: 'Updated' })

        const req = createMockRequest('PUT', '/api/donors/d1', { firstName: 'Updated' })
        const res = await PUT(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.donor.firstName).toBe('Updated')
    })

    it('deletes donor with DELETE', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.donor.delete.mockResolvedValue({ id: 'd1' })

        const req = createMockRequest('DELETE', '/api/donors/d1')
        const res = await DELETE(req)

        expect(res.status).toBe(200)
    })
})
