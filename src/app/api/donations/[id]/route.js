// Donations API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request, { params }) {
  try {
    // TODO: Get donation by ID
  } catch (error) {
    // TODO: Handle errors
  }
}

export async function PATCH(request, { params }) {
  try {
    // TODO: Update donation
  } catch (error) {
    // TODO: Handle errors
  }
}

import { prisma } from '@/lib/db'

export async function DELETE(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Next.js 16 API routes: params may be under context.params or context (for edge compatibility)
    let id = context?.params?.id || context?.id
    if (!id) {
      // fallback: try to parse from URL
      const urlParts = request.url.split('/');
      id = urlParts[urlParts.length - 1];
    }
    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    // Find the donation and check org
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true }
    })
    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.donation.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/donations/[id] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}