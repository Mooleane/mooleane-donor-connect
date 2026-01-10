// Donations API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let id = context?.params?.id || context?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true, campaign: true }
    })

    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error('GET /api/donations/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let id = context?.params?.id || context?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    // Find the donation and check org
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true }
    })

    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const { notes, amount, date, campaignId, type, method } = body

    // Build update data - only include fields that are provided
    const updateData = {}
    if (notes !== undefined) updateData.notes = notes
    if (amount !== undefined) updateData.amount = Number(amount)
    if (date !== undefined) updateData.date = new Date(date)
    if (campaignId !== undefined) updateData.campaignId = campaignId
    if (type !== undefined) updateData.type = type
    if (method !== undefined) updateData.method = method

    const updated = await prisma.donation.update({
      where: { id },
      data: updateData,
      include: { donor: true, campaign: true }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/donations/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Next.js 16 API routes: params may be under context.params or context (for edge compatibility)
    let id = context?.params?.id || context?.id
    if (!id) {
      // fallback: try to parse from URL
      const urlParts = request.url.split('/');
      id = urlParts[urlParts.length - 1];
    }
    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    // Find the donation and check org
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true }
    })
    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.donation.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/donations/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}