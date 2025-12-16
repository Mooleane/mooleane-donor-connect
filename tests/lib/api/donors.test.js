// vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateDonorMetrics } from '@/lib/api/donors'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    donation: {
      findMany: vi.fn(),
    },
    donor: {
      update: vi.fn(),
    },
  },
}))

describe('Donor API utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateDonorMetrics', () => {
    it('should calculate metrics for donor with one gift', async () => {
      const { prisma } = await import('@/lib/db')

      const mockDonations = [
        {
          amount: 100,
          receivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          totalGifts: 1,
          totalAmount: 100,
          retentionRisk: expect.any(String),
        }),
      })
    })

    it('should mark donor as CRITICAL after 365+ days inactivity', async () => {
      const { prisma } = await import('@/lib/db')

      const mockDonations = [
        {
          amount: 100,
          receivedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400 days ago
        },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          retentionRisk: 'CRITICAL',
        }),
      })
    })

    it('should calculate total amount correctly for multiple donations', async () => {
      const { prisma } = await import('@/lib/db')

      const mockDonations = [
        { amount: 100, receivedAt: new Date() },
        { amount: 200, receivedAt: new Date() },
        { amount: 150, receivedAt: new Date() },
      ]

      prisma.donation.findMany.mockResolvedValue(mockDonations)
      prisma.donor.update.mockResolvedValue({})

      await updateDonorMetrics('donor-123')

      expect(prisma.donor.update).toHaveBeenCalledWith({
        where: { id: 'donor-123' },
        data: expect.objectContaining({
          totalGifts: 3,
          totalAmount: 450,
        }),
      })
    })
  })
})
