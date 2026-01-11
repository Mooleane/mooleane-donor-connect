// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createDonorSchema, donorListQuerySchema } from '@/lib/validation/donor-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = donorListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.flatten() }, { status: 400 })
    }

    const { sort, page, limit, search, status, retentionRisk } = parsedQuery.data

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

    const body = await request.json().catch(() => null)
    const parsedBody = createDonorSchema.safeParse(body)
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues?.[0]
      const field = firstIssue?.path?.length ? firstIssue.path.join('.') : 'request'
      const message = firstIssue?.message || 'Invalid request body'
      return NextResponse.json({ error: `${field}: ${message}`, details: parsedBody.error.flatten() }, { status: 400 })
    }

    const {
      type,
      firstName,
      lastName,
      organizationName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      status,
      retentionRisk,
    } = parsedBody.data

    // Permission check: only STAFF or ADMIN can create donors
    const role = session.user.role || 'STAFF'
    if (role === 'READONLY') return NextResponse.json({ error: 'Insufficient permission to create donor' }, { status: 403 })

    const normalizedFirstName = type === 'organization' ? (organizationName || '') : (firstName || '')
    const normalizedLastName = type === 'organization' ? '' : (lastName || '')

    const donor = await prisma.donor.create({
      data: {
        organizationId: session.user.organizationId,
        firstName: normalizedFirstName.trim(),
        lastName: normalizedLastName.trim(),
        email: email ? String(email).trim() : null,
        phone: phone ? String(phone).trim() : null,
        address: address ? String(address).trim() : null,
        city: city ? String(city).trim() : null,
        state: state ? String(state).trim() : null,
        zipCode: zipCode ? String(zipCode).trim() : null,
        status: status || 'ACTIVE',
        retentionRisk: retentionRisk || 'UNKNOWN',
      },
    })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    console.error('POST /api/donors', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}