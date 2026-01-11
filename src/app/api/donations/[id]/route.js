// Donations API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { recalculateDonorTotals } from '@/lib/api/recalculate-donor-totals'
import { updateDonationSchema } from '@/lib/validation/donation-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    let id = context?.params?.id || context?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return jsonError('Missing donation id', 400)

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true, campaign: true }
    })

    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return jsonError('Not found', 404)
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error('GET /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function PATCH(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    let id = context?.params?.id || context?.id
    if (!id) {
      const urlParts = request.url.split('/')
      id = urlParts[urlParts.length - 1]
    }
    if (!id) return jsonError('Missing donation id', 400)

    // Find the donation and check org
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true }
    })

    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return jsonError('Not found', 404)
    }

    const body = await request.json().catch(() => null)
    const parsed = updateDonationSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError('Invalid request body', 400, parsed.error.flatten())
    }

    const { notes, amount, date, campaignId, type, method } = parsed.data

    // Build update data - only include fields that are provided
    const updateData = {}
    if (notes !== undefined) updateData.notes = notes === null ? null : String(notes)
    if (amount !== undefined) updateData.amount = amount
    if (date !== undefined) updateData.date = date
    if (campaignId !== undefined) updateData.campaignId = campaignId && String(campaignId).trim() !== '' ? campaignId : null
    if (type !== undefined) updateData.type = type
    if (method !== undefined) updateData.method = method === null ? null : String(method).trim()

    const updated = await prisma.donation.update({
      where: { id },
      data: updateData,
      include: { donor: true, campaign: true }
    })

    // Recalculate donor totals if amount or date was changed
    if (amount !== undefined || date !== undefined) {
      await recalculateDonorTotals(donation.donorId)
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function DELETE(request, context) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    // Next.js 16 API routes: params may be under context.params or context (for edge compatibility)
    let id = context?.params?.id || context?.id
    if (!id) {
      // fallback: try to parse from URL
      const urlParts = request.url.split('/');
      id = urlParts[urlParts.length - 1];
    }
    if (!id) return jsonError('Missing donation id', 400)

    // Find the donation and check org
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true }
    })
    if (!donation || !donation.donor || donation.donor.organizationId !== session.user.organizationId) {
      return jsonError('Not found', 404)
    }

    await prisma.donation.delete({ where: { id } })

    // Recalculate donor totals after deletion
    await recalculateDonorTotals(donation.donorId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}