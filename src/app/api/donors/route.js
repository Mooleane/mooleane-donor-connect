// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const sort = url.searchParams.get('sort') || ''
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '200', 10)
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''
    const retentionRisk = url.searchParams.get('retentionRisk') || ''

    // Support sorting by total amount descending for ranking donors by total given
    const orderBy = sort === 'totalDesc' ? { totalAmount: 'desc' } : { lastName: 'asc' }

    // Build where clause
    const where = { organizationId: session.user.organizationId }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) where.status = status
    if (retentionRisk) where.retentionRisk = retentionRisk

    const skip = (Math.max(page, 1) - 1) * limit
    const take = limit

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({ where, orderBy, skip, take }),
      prisma.donor.count({ where }),
    ])

    return NextResponse.json({ donors, pagination: { total } })
  } catch (error) {
    console.error('GET /api/donors', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, firstName, lastName, organizationName, email, phone, city, state } = body

    // Permission check: only STAFF or ADMIN can create donors
    const role = session.user.role || 'STAFF'
    if (role === 'READONLY') return NextResponse.json({ error: 'Insufficient permission to create donor' }, { status: 403 })

    if (type === 'organization') {
      if (!organizationName) return NextResponse.json({ error: 'organizationName is required' }, { status: 400 })
    } else {
      if (!firstName) return NextResponse.json({ error: 'firstName is required' }, { status: 400 })
    }

    // Basic email validation if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const donor = await prisma.donor.create({
      data: {
        organizationId: session.user.organizationId,
        firstName: type === 'organization' ? organizationName : firstName,
        lastName: type === 'organization' ? '' : (lastName || ''),
        email: email || null,
        phone: phone || null,
        city: city || null,
        state: state || null,
        status: 'ACTIVE',
        retentionRisk: 'UNKNOWN',
      },
    })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    console.error('POST /api/donors', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}