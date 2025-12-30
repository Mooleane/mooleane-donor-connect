import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { // allow searching email or city/state if those fields exist on the org model
              // fallback: treat email/website stored in optional fields
              email: { contains: search, mode: 'insensitive' }
            },
          ],
        }
      : undefined

    const organizations = await prisma.organization.findMany({ where, take: 50 })
    return NextResponse.json({ organizations })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // require session
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name } = body || {}
    if (!name || !String(name).trim()) return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })

    const organization = await prisma.organization.create({ data: { name: String(name).trim() } })

    // attach organization to the user (make the user an admin for that org)
    await prisma.user.update({ where: { id: session.user.id }, data: { organizationId: organization.id, role: 'ADMIN' } })

    return NextResponse.json({ organization }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}