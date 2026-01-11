// Campaigns API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateCampaignSchema } from '@/lib/validation/campaign-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })

    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('GET /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })

    const existing = await prisma.campaign.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const rawBody = await request.json().catch(() => null)
    const body = rawBody && typeof rawBody === 'object' ? { ...rawBody } : rawBody
    if (body && body.notes && !body.description) body.description = body.notes

    const parsed = updateCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }

    const updateData = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue
      if (value === null) {
        updateData[key] = null
        continue
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        updateData[key] = trimmed === '' ? null : trimmed
      } else {
        updateData[key] = value
      }
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('PATCH /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permission to delete campaign' }, { status: 403 })
    }

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 })

    const existing = await prisma.campaign.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.campaign.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/campaigns/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}