// Donations API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1)

    const where = { donor: { organizationId: session.user.organizationId } }

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

    const body = await request.json()
    const { donorId, amount, date, campaignId, type, method, notes } = body

    if (!donorId || !amount || !date) {
      return NextResponse.json({ error: 'donorId, amount and date are required' }, { status: 400 })
    }

    // Verify donor belongs to organization
    const donor = await prisma.donor.findUnique({ where: { id: donorId } })
    if (!donor || donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    // Create donation and update donor metrics in a transaction
    const donationDate = new Date(date)
    const result = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: {
          donorId,
          campaignId,
          amount: Number(amount),
          date: donationDate,
          type,
          method,
          notes,
        },
        include: { donor: true, campaign: true },
      })

      // Update donor metrics
      const updated = await tx.donor.update({
        where: { id: donorId },
        data: {
          totalGifts: { increment: 1 },
          totalAmount: { increment: Number(amount) },
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
