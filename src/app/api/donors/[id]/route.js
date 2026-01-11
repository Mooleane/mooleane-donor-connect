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

    const body = await request.json()
    const { firstName, lastName, email, phone, city, state } = body

    // Build update data - only include fields that are provided
    const updateData = {}
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || ''
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || ''
    if (email !== undefined) updateData.email = email?.trim() || ''
    if (phone !== undefined) updateData.phone = phone?.trim() || ''
    if (city !== undefined) updateData.city = city?.trim() || ''
    if (state !== undefined) updateData.state = state?.trim() || ''

    const updated = await prisma.donor.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ donor: updated })
  } catch (error) {
    console.error('PATCH /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
