import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const where = { donor: { organizationId: session.user.organizationId } }
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end)
      }
    }

    const [total, count] = await Promise.all([
      prisma.donation.aggregate({
        _sum: { amount: true },
        where
      }),
      prisma.donation.count({ where })
    ])

    const totalAmount = total._sum.amount || 0
    return NextResponse.json({ total: totalAmount, count })
  } catch (error) {
    console.error('GET /api/donations/totals error', error)
    return jsonError('Internal server error', 500)
  }
}
