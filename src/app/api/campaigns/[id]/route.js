// Campaigns API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateCampaignSchema } from '@/lib/validation/campaign-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request, { params } = {}) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)
    let id = params?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return jsonError('Missing campaign id', 400)

    const campaign = await prisma.campaign.findUnique({ where: { id } })
    if (!campaign) return jsonError('Not found', 404)
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('GET /api/campaigns/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function PUT(request, { params } = {}) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    let id = params?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return jsonError('Missing campaign id', 400)

    const existing = await prisma.campaign.findUnique({ where: { id } })
    if (!existing) return jsonError('Not found', 404)

    const rawBody = await request.json().catch(() => null)
    const body = rawBody && typeof rawBody === 'object' ? { ...rawBody } : rawBody
    if (body && body.notes && !body.description) body.description = body.notes

    const parsed = updateCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError('Invalid request body', 400, parsed.error.flatten())
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

    const campaign = await prisma.campaign.update({ where: { id }, data: updateData })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('PATCH /api/campaigns/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function DELETE(request, { params } = {}) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    if (session.user.role !== 'ADMIN') {
      return jsonError('Insufficient permission to delete campaign', 403)
    }

    const id = params?.id
    if (!id) return jsonError('Missing campaign id', 400)

    const existing = await prisma.campaign.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return jsonError('Not found', 404)

    await prisma.campaign.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/campaigns/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}