/**
 * Integration placeholder: campaign tracking
 */
// vitest-environment node

import { describe, it, expect, beforeEach } from 'vitest'
import { getTestPrisma } from '../helpers/database'
import { createTestCampaign } from '../helpers/test-data'

describe('Integration: campaign tracking', () => {
    let prisma

    beforeEach(() => {
        prisma = getTestPrisma()
    })

    it('creates and queries campaign data', async () => {
        const c = await prisma.campaign.create({ data: createTestCampaign({ name: 'Track Me' }) })
        const found = await prisma.campaign.findUnique({ where: { id: c.id } })

        expect(found).toBeDefined()
        expect(found.name).toBe('Track Me')
    })
})
