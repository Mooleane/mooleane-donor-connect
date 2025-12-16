// Prisma mock factory for unit tests
// Provides comprehensive Prisma client mocks with all models

import { vi } from 'vitest'

/**
 * Create comprehensive Prisma mock with all models
 * @returns {object} Mock Prisma client with all CRUD methods
 */
export function createPrismaMock() {
  return {
    organization: createModelMock(),
    user: createModelMock(),
    session: createModelMock(),
    donor: createModelMock(),
    campaign: createModelMock(),
    donation: createModelMock(),
    interaction: createModelMock(),
    task: createModelMock(),
    segment: createModelMock(),
    segmentMember: createModelMock(),
    workflow: createModelMock(),
    workflowExecution: createModelMock(),
    activityLog: createModelMock(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn((callback) => {
      // Simple transaction mock - executes callback immediately
      return callback(this)
    }),
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  }
}

/**
 * Create mock for a single Prisma model with all CRUD operations
 * @returns {object} Model mock with CRUD methods
 */
function createModelMock() {
  return {
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findFirst: vi.fn(),
    findFirstOrThrow: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  }
}

/**
 * Setup common mock responses for donor tests
 * Convenience helper to reduce boilerplate
 * @param {object} prismaMock - Prisma mock instance
 * @returns {object} Mock donor data
 */
export function setupDonorMocks(prismaMock) {
  const mockDonor = {
    id: 'donor-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-1234',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    organizationId: 'org-123',
    status: 'ACTIVE',
    retentionRisk: 'LOW',
    totalGifts: 5,
    totalAmount: 500,
    firstGiftDate: new Date('2024-01-01'),
    lastGiftDate: new Date('2024-12-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  prismaMock.donor.findUnique.mockResolvedValue(mockDonor)
  prismaMock.donor.findMany.mockResolvedValue([mockDonor])
  prismaMock.donor.create.mockResolvedValue(mockDonor)
  prismaMock.donor.update.mockResolvedValue(mockDonor)
  prismaMock.donor.count.mockResolvedValue(1)

  return mockDonor
}

/**
 * Setup common mock responses for donation tests
 * @param {object} prismaMock - Prisma mock instance
 * @param {string} donorId - Donor ID for the donation
 * @returns {object} Mock donation data
 */
export function setupDonationMocks(prismaMock, donorId = 'donor-123') {
  const mockDonation = {
    id: 'donation-123',
    donorId,
    campaignId: 'campaign-123',
    amount: 100,
    date: new Date(),
    type: 'ONE_TIME',
    method: 'Credit Card',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  prismaMock.donation.findUnique.mockResolvedValue(mockDonation)
  prismaMock.donation.findMany.mockResolvedValue([mockDonation])
  prismaMock.donation.create.mockResolvedValue(mockDonation)
  prismaMock.donation.update.mockResolvedValue(mockDonation)
  prismaMock.donation.count.mockResolvedValue(1)

  return mockDonation
}

/**
 * Setup common mock responses for campaign tests
 * @param {object} prismaMock - Prisma mock instance
 * @returns {object} Mock campaign data
 */
export function setupCampaignMocks(prismaMock) {
  const mockCampaign = {
    id: 'campaign-123',
    name: 'Annual Fund 2024',
    description: 'Support our mission',
    goal: 100000,
    organizationId: 'org-123',
    status: 'ACTIVE',
    type: 'Annual Fund',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  prismaMock.campaign.findUnique.mockResolvedValue(mockCampaign)
  prismaMock.campaign.findMany.mockResolvedValue([mockCampaign])
  prismaMock.campaign.create.mockResolvedValue(mockCampaign)
  prismaMock.campaign.update.mockResolvedValue(mockCampaign)
  prismaMock.campaign.count.mockResolvedValue(1)

  return mockCampaign
}

/**
 * Setup common mock responses for user/session tests
 * @param {object} prismaMock - Prisma mock instance
 * @returns {object} Mock user and session data
 */
export function setupAuthMocks(prismaMock) {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: '$2a$10$mockHashedPassword', // Bcrypt hash format
    firstName: 'Test',
    lastName: 'User',
    role: 'STAFF',
    organizationId: 'org-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockSession = {
    id: 'session-123',
    token: 'mock-session-token',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    user: mockUser,
  }

  prismaMock.user.findUnique.mockResolvedValue(mockUser)
  prismaMock.user.findFirst.mockResolvedValue(mockUser)
  prismaMock.user.create.mockResolvedValue(mockUser)

  prismaMock.session.findUnique.mockResolvedValue(mockSession)
  prismaMock.session.create.mockResolvedValue(mockSession)

  return { mockUser, mockSession }
}

/**
 * Reset all mocks in Prisma mock instance
 * Useful in beforeEach to ensure test isolation
 * @param {object} prismaMock - Prisma mock instance
 */
export function resetPrismaMock(prismaMock) {
  Object.keys(prismaMock).forEach((key) => {
    if (typeof prismaMock[key] === 'object' && prismaMock[key] !== null) {
      Object.values(prismaMock[key]).forEach((method) => {
        if (typeof method === 'function' && method.mockClear) {
          method.mockClear()
        }
      })
    } else if (typeof prismaMock[key] === 'function' && prismaMock[key].mockClear) {
      prismaMock[key].mockClear()
    }
  })
}
