import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    })
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

    return NextResponse.json({ organization: org })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
