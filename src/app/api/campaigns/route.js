// Campaigns API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { campaignListQuerySchema, createCampaignSchema } from '@/lib/validation/campaign-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = campaignListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return jsonError('Invalid query parameters', 400, parsedQuery.error.flatten())
    }

    const { page, limit, search, status, sortBy, sortOrder } = parsedQuery.data
    const where = { organizationId: session.user.organizationId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status

    const skip = (Math.max(page, 1) - 1) * limit
    const take = limit
    const orderBy = { [sortBy]: sortOrder }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({ where, orderBy, skip, take }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({ campaigns, pagination: { page, limit, total } })
  } catch (error) {
    console.error('GET /api/campaigns error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const rawBody = await request.json().catch(() => null)
    const body = rawBody && typeof rawBody === 'object' ? { ...rawBody } : rawBody
    // Back-compat: allow `notes` as an alias for `description`
    if (body && body.notes && !body.description) body.description = body.notes

    const parsedBody = createCampaignSchema.safeParse(body)
    if (!parsedBody.success) {
      return jsonError('Invalid request body', 400, parsedBody.error.flatten())
    }

    const { name, description, goal, startDate, endDate, type, status } = parsedBody.data

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description ? String(description) : null,
        goal: goal ?? null,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        type: type ? String(type).trim() : null,
        status,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('POST /api/campaigns error', error)
    return jsonError('Internal server error', 500)
  }
}