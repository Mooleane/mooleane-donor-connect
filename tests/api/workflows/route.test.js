/**
 * Placeholder test for /api/workflows route
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/workflows/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { workflow: { findMany: vi.fn(), create: vi.fn(), count: vi.fn() } },
}))

describe('API /api/workflows', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/workflows'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('lists workflows when authenticated', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.workflow.findMany.mockResolvedValue([{ id: 'w1', name: 'Flow' }])
        prisma.workflow.count.mockResolvedValue(1)

        const res = await GET(createMockRequest('GET', '/api/workflows'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.workflows).toHaveLength(1)
    })
})
