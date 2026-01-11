// Donations API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createDonationSchema, donationListQuerySchema } from '@/lib/validation/donation-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = donationListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.flatten() }, { status: 400 })
    }

    const start = parsedQuery.data.start
    const end = parsedQuery.data.end
    const isPaginated = Object.prototype.hasOwnProperty.call(query, 'limit') || Object.prototype.hasOwnProperty.call(query, 'page')

    const where = { donor: { organizationId: session.user.organizationId } }
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end)
      }
    }

    // If paginated, return object; if not, return array for reports page compatibility
    if (isPaginated) {
      const limit = parsedQuery.data.limit
      const page = parsedQuery.data.page
      const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1)
      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          orderBy: { date: 'desc' },
          include: { donor: true, campaign: true },
          skip,
          take: limit,
        }),
        prisma.donation.count({ where }),
      ])
      return NextResponse.json({ donations, pagination: { page, limit, total } })
    } else {
      // For reports page: return plain array
      const donations = await prisma.donation.findMany({
        where,
        orderBy: { date: 'desc' },
        include: { donor: true, campaign: true },
      })
      return NextResponse.json(donations)
    }
  } catch (error) {
    console.error('GET /api/donations error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsedBody = createDonationSchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 })
    }

    const { donorId, amount, date, campaignId, type, method, notes } = parsedBody.data

    // Verify donor belongs to organization
    const donor = await prisma.donor.findUnique({ where: { id: donorId } })
    if (!donor || donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    // Create donation and update donor metrics in a transaction
    const donationDate = date
    const result = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: {
          donorId,
          campaignId: campaignId && String(campaignId).trim() !== '' ? campaignId : null,
          amount,
          date: donationDate,
          type,
          method: method ? String(method).trim() : null,
          notes: notes ? String(notes) : null,
        },
        include: { donor: true, campaign: true },
      })

      // Update donor metrics
      const updated = await tx.donor.update({
        where: { id: donorId },
        data: {
          totalGifts: { increment: 1 },
          totalAmount: { increment: amount },
          lastGiftDate: donationDate,
          firstGiftDate: donor.firstGiftDate ? donor.firstGiftDate : donationDate,
        },
      })

      return { donation, donor: updated }
    })

    return NextResponse.json({ donation: result.donation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/donations error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
