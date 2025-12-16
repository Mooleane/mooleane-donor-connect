// vitest-environment node

/**
 * Integration Tests: Donor CRUD Operations
 * Tests donor operations with real database
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getTestPrisma } from '../helpers/database'
import { createTestDonor, createTestDonation } from '../helpers/test-data'

describe('Donor CRUD Integration Tests', () => {
  let prisma

  beforeEach(() => {
    prisma = getTestPrisma()
  })

  describe('Create Donor', () => {
    it('should create donor with required fields', async () => {
      const donorData = createTestDonor({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      })

      const donor = await prisma.donor.create({
        data: donorData,
      })

      expect(donor.id).toBeDefined()
      expect(donor.firstName).toBe('John')
      expect(donor.lastName).toBe('Doe')
      expect(donor.email).toBe('john.doe@example.com')
      expect(donor.totalGifts).toBe(0)
      expect(donor.totalAmount).toBe(0)
      expect(donor.status).toBe('ACTIVE')
      expect(donor.retentionRisk).toBe('LOW')
    })

    it('should create donor with optional fields', async () => {
      const donorData = createTestDonor({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-1234',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
      })

      const donor = await prisma.donor.create({
        data: donorData,
      })

      expect(donor.phone).toBe('555-1234')
      expect(donor.address).toBe('123 Main St')
      expect(donor.city).toBe('San Francisco')
      expect(donor.state).toBe('CA')
      expect(donor.zipCode).toBe('94102')
    })
  })

  describe('Update Donor Metrics', () => {
    it('should update donor metrics after donation', async () => {
      // Create donor
      const donorData = createTestDonor({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      })
      const donor = await prisma.donor.create({ data: donorData })

      // Create donation
      const donationData = createTestDonation(donor.id, {
        amount: 100,
        date: new Date(),
      })
      await prisma.donation.create({ data: donationData })

      // Update metrics using business logic
      const { updateDonorMetrics } = await import('@/lib/api/donors')
      await updateDonorMetrics(donor.id)

      // Verify metrics updated
      const updatedDonor = await prisma.donor.findUnique({
        where: { id: donor.id },
      })

      expect(updatedDonor.totalGifts).toBe(1)
      expect(updatedDonor.totalAmount).toBe(100)
      expect(updatedDonor.firstGiftDate).toBeDefined()
      expect(updatedDonor.lastGiftDate).toBeDefined()
    })

    it('should calculate correct metrics for multiple donations', async () => {
      const donor = await prisma.donor.create({
        data: createTestDonor({
          firstName: 'Multi',
          lastName: 'Donor',
          email: 'multi@example.com',
        }),
      })

      // Create multiple donations
      await prisma.donation.createMany({
        data: [
          createTestDonation(donor.id, { amount: 100 }),
          createTestDonation(donor.id, { amount: 200 }),
          createTestDonation(donor.id, { amount: 150 }),
        ],
      })

      const { updateDonorMetrics } = await import('@/lib/api/donors')
      await updateDonorMetrics(donor.id)

      const updatedDonor = await prisma.donor.findUnique({
        where: { id: donor.id },
      })

      expect(updatedDonor.totalGifts).toBe(3)
      expect(updatedDonor.totalAmount).toBe(450)
    })

    it('should mark donor as CRITICAL after 365+ days inactivity', async () => {
      const donor = await prisma.donor.create({
        data: createTestDonor({
          firstName: 'Lapsed',
          lastName: 'Donor',
          email: 'lapsed@example.com',
        }),
      })

      // Create old donation (400 days ago)
      const oldDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      await prisma.donation.create({
        data: createTestDonation(donor.id, {
          amount: 100,
          date: oldDate,
        }),
      })

      const { updateDonorMetrics } = await import('@/lib/api/donors')
      await updateDonorMetrics(donor.id)

      const updatedDonor = await prisma.donor.findUnique({
        where: { id: donor.id },
      })

      expect(updatedDonor.retentionRisk).toBe('CRITICAL')
    })
  })

  describe('Database Constraints', () => {
    it('should enforce unique email constraint within organization', async () => {
      await prisma.donor.create({
        data: createTestDonor({
          email: 'duplicate@example.com',
          organizationId: 'test-org-1',
        }),
      })

      // Attempt to create duplicate email in same organization
      await expect(
        prisma.donor.create({
          data: createTestDonor({
            email: 'duplicate@example.com',
            organizationId: 'test-org-1',
          }),
        })
      ).rejects.toThrow()
    })

    it('should cascade delete donations when donor deleted', async () => {
      const donor = await prisma.donor.create({
        data: createTestDonor({
          firstName: 'Delete',
          lastName: 'Me',
          email: 'delete@example.com',
        }),
      })

      const donation = await prisma.donation.create({
        data: createTestDonation(donor.id, { amount: 50 }),
      })

      // Delete donor
      await prisma.donor.delete({
        where: { id: donor.id },
      })

      // Verify donation also deleted (cascade)
      const deletedDonation = await prisma.donation.findUnique({
        where: { id: donation.id },
      })
      expect(deletedDonation).toBeNull()
    })
  })

  describe('Query Donors', () => {
    it('should query donors with complex filters', async () => {
      // Create multiple donors with different statuses and risks
      await prisma.donor.createMany({
        data: [
          createTestDonor({
            firstName: 'High',
            lastName: 'Risk',
            email: 'high@example.com',
            retentionRisk: 'HIGH',
            status: 'ACTIVE',
          }),
          createTestDonor({
            firstName: 'Low',
            lastName: 'Risk',
            email: 'low@example.com',
            retentionRisk: 'LOW',
            status: 'ACTIVE',
          }),
          createTestDonor({
            firstName: 'Lapsed',
            lastName: 'Donor',
            email: 'lapsed@example.com',
            retentionRisk: 'CRITICAL',
            status: 'LAPSED',
          }),
        ],
      })

      // Query high risk active donors
      const highRiskDonors = await prisma.donor.findMany({
        where: {
          organizationId: 'test-org-1',
          retentionRisk: { in: ['HIGH', 'CRITICAL'] },
          status: { not: 'DO_NOT_CONTACT' },
        },
        orderBy: { retentionRisk: 'desc' },
      })

      expect(highRiskDonors.length).toBeGreaterThanOrEqual(2)
      expect(highRiskDonors[0].retentionRisk).toMatch(/HIGH|CRITICAL/)
    })

    it('should search donors by name and email', async () => {
      await prisma.donor.create({
        data: createTestDonor({
          firstName: 'Searchable',
          lastName: 'Person',
          email: 'searchable@example.com',
        }),
      })

      const results = await prisma.donor.findMany({
        where: {
          OR: [
            { firstName: { contains: 'Search', mode: 'insensitive' } },
            { lastName: { contains: 'Search', mode: 'insensitive' } },
            { email: { contains: 'search', mode: 'insensitive' } },
          ],
        },
      })

      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0].firstName).toBe('Searchable')
    })

    it('should paginate donors correctly', async () => {
      // Create 25 donors
      const donors = Array.from({ length: 25 }, (_, i) =>
        createTestDonor({
          firstName: `Donor${i}`,
          email: `donor${i}@page.com`,
        })
      )
      await prisma.donor.createMany({ data: donors })

      // Get second page (skip 10, take 10)
      const page2 = await prisma.donor.findMany({
        where: { organizationId: 'test-org-1' },
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })

      expect(page2).toHaveLength(10)

      // Verify total count
      const total = await prisma.donor.count({
        where: { organizationId: 'test-org-1' },
      })
      expect(total).toBeGreaterThanOrEqual(25)
    })
  })
})
