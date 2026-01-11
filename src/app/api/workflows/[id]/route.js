// Workflows API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateWorkflowSchema } from '@/lib/validation/workflow-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const id = params?.id
    if (!id) return jsonError('Missing workflow id', 400)

    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!workflow) return jsonError('Not found', 404)
    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('GET /api/workflows/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const id = params?.id
    if (!id) return jsonError('Missing workflow id', 400)

    const existing = await prisma.workflow.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return jsonError('Not found', 404)

    const body = await request.json().catch(() => null)
    const parsed = updateWorkflowSchema.safeParse(body)
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

    if (Object.prototype.hasOwnProperty.call(updateData, 'segmentId')) {
      updateData.segmentId = updateData.segmentId && String(updateData.segmentId).trim() !== '' ? updateData.segmentId : null
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error('PATCH /api/workflows/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const id = params?.id
    if (!id) return jsonError('Missing workflow id', 400)

    const existing = await prisma.workflow.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!existing) return jsonError('Not found', 404)

    await prisma.workflow.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/workflows/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}
