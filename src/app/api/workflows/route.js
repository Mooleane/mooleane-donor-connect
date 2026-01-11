// Workflows API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createWorkflowSchema, workflowListQuerySchema } from '@/lib/validation/workflow-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = workflowListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.flatten() }, { status: 400 })
    }

    const { page, limit, search, trigger, isActive, sortBy, sortOrder } = parsedQuery.data
    const where = { organizationId: session.user.organizationId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (trigger) where.trigger = trigger
    if (isActive !== undefined) where.isActive = isActive

    const skip = (Math.max(page, 1) - 1) * limit
    const take = limit
    const orderBy = { [sortBy]: sortOrder }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({ where, orderBy, skip, take }),
      prisma.workflow.count({ where }),
    ])

    return NextResponse.json({ workflows, pagination: { page, limit, total } })
  } catch (error) {
    console.error('GET /api/workflows error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsedBody = createWorkflowSchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsedBody.error.flatten() }, { status: 400 })
    }

    const { name, description, trigger, segmentId, steps, isActive } = parsedBody.data
    const workflow = await prisma.workflow.create({
      data: {
        organizationId: session.user.organizationId,
        name: name.trim(),
        description: description ? String(description) : null,
        trigger,
        segmentId: segmentId && String(segmentId).trim() !== '' ? segmentId : null,
        steps,
        isActive,
      },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    console.error('POST /api/workflows error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
