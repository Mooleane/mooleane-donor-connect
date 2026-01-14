/**
 * Integration placeholder: donation metrics
 */
// vitest-environment node

import { describe, it, expect, beforeEach } from 'vitest'
import { getTestPrisma } from '../helpers/database'
import { createTestDonor, createTestDonation } from '../helpers/test-data'

describe('Integration: donation metrics', () => {
    let prisma

    beforeEach(() => {
        prisma = getTestPrisma()
    })

    it('updates donor metrics after donation', async () => {
        const donor = await prisma.donor.create({ data: createTestDonor({ email: 'metrics@example.com' }) })
        await prisma.donation.create({ data: createTestDonation(donor.id, { amount: 75 }) })

        const { updateDonorMetrics } = await import('@/lib/api/donors')
        await updateDonorMetrics(donor.id)

        const updated = await prisma.donor.findUnique({ where: { id: donor.id } })
        expect(updated.totalGifts).toBeGreaterThanOrEqual(1)
        expect(updated.totalAmount).toBeGreaterThanOrEqual(75)
    })
})
