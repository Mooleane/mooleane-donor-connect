// Segments API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateSegmentSchema } from '@/lib/validation/segment-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing segment id' }, { status: 400 })

    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: { members: { take: 100 } },
    })
    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ segment })
  } catch (error) {
    console.error('GET /api/segments/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing segment id' }, { status: 400 })

    const existing = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json().catch(() => null)
    const parsed = updateSegmentSchema.safeParse(body)
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

    const segment = await prisma.segment.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ segment })
  } catch (error) {
    console.error('PATCH /api/segments/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing segment id' }, { status: 400 })

    const existing = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.segment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/segments/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}