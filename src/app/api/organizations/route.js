import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''

    // Build a safe search query only using fields that exist on the Organization model
    // Also allow matching on related users' email and donors' city/state
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { users: { some: { email: { contains: search, mode: 'insensitive' } } } },
            { donors: { some: { city: { contains: search, mode: 'insensitive' } } } },
            { donors: { some: { state: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : undefined

    // Return a small, flattened shape so the client can show name/email/city/state safely
    const orgs = await prisma.organization.findMany({
      where,
      take: 50,
      include: {
        users: { take: 1, select: { email: true } },
        donors: { take: 1, select: { city: true, state: true } },
      },
    })

    const organizations = orgs.map((o) => ({
      id: o.id,
      name: o.name,
      email: o.users?.[0]?.email || null,
      city: o.donors?.[0]?.city || null,
      state: o.donors?.[0]?.state || null,
      website: null,
    }))

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