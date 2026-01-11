// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createDonorSchema, donorListQuerySchema } from '@/lib/validation/donor-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const url = new URL(request.url)
    const query = Object.fromEntries(url.searchParams.entries())
    const parsedQuery = donorListQuerySchema.safeParse(query)
    if (!parsedQuery.success) {
      return jsonError('Invalid query parameters', 400, parsedQuery.error.flatten())
    }

    const { sort, sortOrder, page, limit, search, status, retentionRisk } = parsedQuery.data

    // Support sorting by total amount descending for ranking donors by total given
    const orderBy = sort === 'totalDesc' ? { totalAmount: sortOrder } : { lastName: sortOrder }

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

    return NextResponse.json({ donors, pagination: { page, limit, total } })
  } catch (error) {
    console.error('GET /api/donors', error)
    return jsonError('Internal server error', 500)
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    const body = await request.json().catch(() => null)
    const parsedBody = createDonorSchema.safeParse(body)
    if (!parsedBody.success) {
      const firstIssue = parsedBody.error.issues?.[0]
      const field = firstIssue?.path?.length ? firstIssue.path.join('.') : 'request'
      const message = firstIssue?.message || 'Invalid request body'
      return jsonError(`${field}: ${message}`, 400, parsedBody.error.flatten())
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
    if (role === 'READONLY') return jsonError('Insufficient permission to create donor', 403)

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
    return jsonError('Internal server error', 500)
  }
}