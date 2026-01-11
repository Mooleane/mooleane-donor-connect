// Segments API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createSegmentSchema, segmentListQuerySchema } from '@/lib/validation/segment-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = segmentListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return jsonError('Invalid query parameters', 400, parsedQuery.error.flatten())
    }

    const { page, limit, search, sortBy, sortOrder } = parsedQuery.data
    const where = { organizationId: session.user.organizationId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (Math.max(page, 1) - 1) * limit
    const take = limit
    const orderBy = { [sortBy]: sortOrder }

    const [segments, total] = await Promise.all([
      prisma.segment.findMany({ where, orderBy, skip, take }),
      prisma.segment.count({ where }),
    ])

    return NextResponse.json({ segments, pagination: { page, limit, total } })
  } catch (error) {
    console.error('GET /api/segments error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const body = await request.json().catch(() => null)
    const parsedBody = createSegmentSchema.safeParse(body)
    if (!parsedBody.success) {
      return jsonError('Invalid request body', 400, parsedBody.error.flatten())
    }

    const { name, description, rules } = parsedBody.data
    const segment = await prisma.segment.create({
      data: {
        organizationId: session.user.organizationId,
        name: name.trim(),
        description: description ? String(description) : null,
        rules,
      },
    })

    return NextResponse.json({ segment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/segments error', error)
    return jsonError('Internal server error', 500)
  }
}