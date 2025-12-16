// vitest-environment node

/**
 * API Route Tests: GET /api/donors, POST /api/donors
 * Tests donor listing with pagination/filtering and donor creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/donors/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'
import { createTestDonor } from '../../helpers/test-data'

// Mock dependencies
vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    donor: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('GET /api/donors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('GET', '/api/donors')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return paginated donors for authenticated user', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'STAFF', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const mockDonors = [
      createTestDonor({ id: '1', firstName: 'John', organizationId: 'org-123' }),
      createTestDonor({ id: '2', firstName: 'Jane', organizationId: 'org-123' }),
    ]

    prisma.donor.findMany.mockResolvedValue(mockDonors)
    prisma.donor.count.mockResolvedValue(2)

    const request = createMockRequest('GET', '/api/donors?page=1&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.donors).toHaveLength(2)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(2)

    // Verify organization filtering
    expect(prisma.donor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: 'org-123',
        }),
      })
    )
  })

  it('should filter donors by search term', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donor.findMany.mockResolvedValue([])
    prisma.donor.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/donors?search=john')
    await GET(request)

    // Verify search filter applied
    expect(prisma.donor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ firstName: expect.objectContaining({ contains: 'john' }) }),
            expect.objectContaining({ lastName: expect.objectContaining({ contains: 'john' }) }),
            expect.objectContaining({ email: expect.objectContaining({ contains: 'john' }) }),
          ]),
        }),
      })
    )
  })

  it('should filter donors by status', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donor.findMany.mockResolvedValue([])
    prisma.donor.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/donors?status=ACTIVE')
    await GET(request)

    expect(prisma.donor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
        }),
      })
    )
  })

  it('should filter donors by retention risk', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donor.findMany.mockResolvedValue([])
    prisma.donor.count.mockResolvedValue(0)

    const request = createMockRequest('GET', '/api/donors?retentionRisk=HIGH')
    await GET(request)

    expect(prisma.donor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          retentionRisk: 'HIGH',
        }),
      })
    )
  })

  it('should apply pagination correctly', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession())
    prisma.donor.findMany.mockResolvedValue([])
    prisma.donor.count.mockResolvedValue(50)

    const request = createMockRequest('GET', '/api/donors?page=3&limit=10')
    await GET(request)

    expect(prisma.donor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (page 3 - 1) * 10
        take: 10,
      })
    )
  })
})

describe('POST /api/donors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    const { getSession } = await import('@/lib/session')
    getSession.mockResolvedValue(null)

    const request = createMockRequest('POST', '/api/donors', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 403 if user lacks permissions', async () => {
    const { getSession } = await import('@/lib/session')

    const mockSession = createMockSession({ role: 'READONLY' })
    getSession.mockResolvedValue(mockSession)

    const request = createMockRequest('POST', '/api/donors', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('permission')
  })

  it('should create donor with valid data', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    const mockSession = createMockSession({ role: 'STAFF', organizationId: 'org-123' })
    getSession.mockResolvedValue(mockSession)

    const newDonor = createTestDonor({
      id: 'donor-new',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      organizationId: 'org-123',
    })
    prisma.donor.create.mockResolvedValue(newDonor)

    const request = createMockRequest('POST', '/api/donors', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.donor.id).toBe('donor-new')
    expect(data.donor.firstName).toBe('John')

    // Verify organization ID is set from session
    expect(prisma.donor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        organizationId: 'org-123',
      }),
    })
  })

  it('should return 400 for invalid data (missing required fields)', async () => {
    const { getSession } = await import('@/lib/session')

    getSession.mockResolvedValue(createMockSession({ role: 'STAFF' }))

    const request = createMockRequest('POST', '/api/donors', {
      firstName: '', // Empty firstName
      lastName: 'Doe',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for invalid email format', async () => {
    const { getSession } = await import('@/lib/session')

    getSession.mockResolvedValue(createMockSession({ role: 'STAFF' }))

    const request = createMockRequest('POST', '/api/donors', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email', // Invalid email
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('email')
  })

  it('should set default values for optional fields', async () => {
    const { getSession } = await import('@/lib/session')
    const { prisma } = await import('@/lib/db')

    getSession.mockResolvedValue(createMockSession({ role: 'ADMIN' }))

    const newDonor = createTestDonor({
      status: 'ACTIVE',
      retentionRisk: 'UNKNOWN',
    })
    prisma.donor.create.mockResolvedValue(newDonor)

    const request = createMockRequest('POST', '/api/donors', {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    })
    await POST(request)

    // Verify default status and retention risk
    expect(prisma.donor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: expect.stringMatching(/ACTIVE|LAPSED|INACTIVE/),
        retentionRisk: expect.stringMatching(/UNKNOWN|LOW|MEDIUM|HIGH|CRITICAL/),
      }),
    })
  })
})
