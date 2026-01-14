/**
 * Placeholder test for /api/workflows/[id]
 */
// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from '@/app/api/workflows/[id]/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }))
vi.mock('@/lib/db', () => ({
    prisma: { workflow: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}))

describe('API /api/workflows/[id]', () => {
    beforeEach(() => vi.clearAllMocks())

    it('returns 401 when unauthenticated', async () => {
        const { getSession } = await import('@/lib/session')
        getSession.mockResolvedValue(null)

        const res = await GET(createMockRequest('GET', '/api/workflows/1'))
        const data = await res.json()

        expect(res.status).toBe(401)
        expect(data.error).toBeDefined()
    })

    it('returns workflow when found', async () => {
        const { getSession } = await import('@/lib/session')
        const { prisma } = await import('@/lib/db')

        getSession.mockResolvedValue(createMockSession())
        prisma.workflow.findUnique.mockResolvedValue({ id: 'w1', name: 'Flow' })

        const res = await GET(createMockRequest('GET', '/api/workflows/w1'))
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.workflow).toMatchObject({ id: 'w1' })
    })
})
