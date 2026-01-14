import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })
    if (!org) return jsonError('Organization not found', 404)

    return NextResponse.json({ organization: org })
  } catch (err) {
    return jsonError('Internal server error', 500)
  }
}

export async function PATCH(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const body = await request.json().catch(() => ({}))
    const { name } = body

    if (!name || typeof name !== 'string') return jsonError('Invalid request body', 400)

    const updated = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: { name: name.trim() },
    })

    return NextResponse.json({ organization: updated })
  } catch (err) {
    return jsonError('Internal server error', 500)
  }
}
