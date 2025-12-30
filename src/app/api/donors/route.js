// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Basic donor list for selection (no pagination for now)
    const donors = await prisma.donor.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { lastName: 'asc' },
      take: 200,
    })

    return NextResponse.json({ donors })
  } catch (error) {
    console.error('GET /api/donors', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { firstName, lastName, email, phone } = body

    if (!firstName) return NextResponse.json({ error: 'firstName is required' }, { status: 400 })

    const donor = await prisma.donor.create({
      data: {
        organizationId: session.user.organizationId,
        firstName: firstName,
        lastName: lastName || '',
        email: email || null,
        phone: phone || null,
      },
    })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    console.error('POST /api/donors', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}