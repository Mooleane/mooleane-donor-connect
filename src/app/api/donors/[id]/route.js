// Donors API - Individual Donor Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateDonorSchema } from '@/lib/validation/donor-schema'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing donor id' }, { status: 400 })

    const donor = await prisma.donor.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        donations: { orderBy: { date: 'desc' }, take: 50, include: { campaign: true } },
      },
    })

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ donor })
  } catch (error) {
    console.error('GET /api/donors/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let id = params?.id
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

    const body = await request.json().catch(() => null)
    const parsed = updateDonorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.flatten() }, { status: 400 })
    }

    // Build update data - only include fields that are provided
    const updateData = {}
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue
      if (value === null) {
        updateData[key] = null
        continue
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        // Required-ish name fields can be empty string; optional contact fields become null when blank
        if (trimmed === '' && ['email', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)) {
          updateData[key] = null
        } else {
          updateData[key] = trimmed
        }
      } else {
        updateData[key] = value
      }
    }

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
