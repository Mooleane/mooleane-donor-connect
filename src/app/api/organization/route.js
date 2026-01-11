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
