// Campaigns API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // For now, return all campaigns for the organization
    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { name: 'asc' },
      take: 200,
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('GET /api/campaigns error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, notes } = body
    if (!name || name.trim() === '') return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        notes: notes || null,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('POST /api/campaigns error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}