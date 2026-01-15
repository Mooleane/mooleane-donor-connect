// Donors API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createDonorSchema, donorListQuerySchema } from '@/lib/validation/donor-schema'
import { jsonError } from '@/lib/api/route-response'
import { listDonors, createDonor } from '@/lib/api/donors'

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

    const { page, limit, donors, total } = await listDonors({
      organizationId: session.user.organizationId,
      query: parsedQuery.data,
    })

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

    // Permission check: only STAFF or ADMIN can create donors
    const role = session.user.role || 'STAFF'
    if (role === 'READONLY') return jsonError('Insufficient permission to create donor', 403)

    const donor = await createDonor({ donorData: parsedBody.data, organizationId: session.user.organizationId })

    return NextResponse.json({ donor }, { status: 201 })
  } catch (error) {
    console.error('POST /api/donors', error)
    return jsonError('Internal server error', 500)
  }
}