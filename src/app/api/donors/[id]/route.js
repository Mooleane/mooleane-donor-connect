// Donors API - Individual Donor Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    // TODO: Get and validate session
    // TODO: Get donor ID from params (await params)
    // TODO: Query single donor with related data
    // TODO: Return donor data or 404 if not found
  } catch (error) {
    // TODO: Handle errors and return appropriate responses
  }
}

export async function PATCH(request, { params }) {
  try {
    // TODO: Get and validate session
    // TODO: Check user permissions (ADMIN, STAFF)
    // TODO: Get donor ID from params (await params)
    // TODO: Parse and validate request body
    // TODO: Update donor in database
    // TODO: Return updated donor
  } catch (error) {
    // TODO: Handle validation errors and other errors
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let id = params?.id || params?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    // Find donor and validate org
    const donor = await prisma.donor.findUnique({ where: { id } })
    if (!donor || donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete related donations first, then donor
    await prisma.donation.deleteMany({ where: { donorId: id } })
    await prisma.donor.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
