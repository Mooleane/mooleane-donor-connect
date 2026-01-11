import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const orgId = session.user.organizationId

    // Totals
    const [totalDonationsCount, totalRaised] = await Promise.all([
      prisma.donation.count({ where: { donor: { organizationId: orgId } } }),
      prisma.donation.aggregate({
        where: { donor: { organizationId: orgId } },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),
    ])

    // Month range (start = first day of month, end = now)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [monthDonationsCount, monthTotalRaised] = await Promise.all([
      prisma.donation.count({ where: { donor: { organizationId: orgId }, date: { gte: startOfMonth, lt: endOfMonth } } }),
      prisma.donation.aggregate({
        where: { donor: { organizationId: orgId }, date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true }
      }).then(r => r._sum.amount || 0),
    ])

    // Recent donations (latest 5)
    const recentDonations = await prisma.donation.findMany({
      where: { donor: { organizationId: orgId } },
      orderBy: { date: 'desc' },
      take: 5,
      include: { donor: true, campaign: true }
    })

    return NextResponse.json({
      totals: { totalDonationsCount, totalRaised },
      month: { monthDonationsCount: monthDonationsCount, monthTotalRaised: monthTotalRaised },
      recentDonations,
    })
  } catch (error) {
    console.error('GET /api/dashboard/summary', error)
    return jsonError('Internal server error', 500)
  }
}
