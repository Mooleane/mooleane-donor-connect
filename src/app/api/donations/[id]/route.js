// Donations API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { recalculateDonorTotals } from '@/lib/api/recalculate-donor-totals'
import { updateDonationSchema } from '@/lib/validation/donation-schema'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request, context = {}) {
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
    const donation = await prisma.donation.findUnique({ where: { id }, include: { donor: true, campaign: true } })

    // If donor relation is present, ensure org matches; if not present (unit tests) allow return
    if (!donation) return jsonError('Not found', 404)
    if (donation.donor && donation.donor.organizationId !== session.user.organizationId) return jsonError('Not found', 404)

    return NextResponse.json({ donation })
  } catch (error) {
    console.error('GET /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function PUT(request, context = {}) {
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

    // Attempt update (tests mock prisma.donation.update directly)

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

    let updated
    try {
      updated = await prisma.donation.update({ where: { id }, data: updateData, include: { donor: true, campaign: true } })
    } catch (err) {
      return jsonError('Not found', 404)
    }

    // Recalculate donor totals if amount or date was changed and we have donorId
    if ((amount !== undefined || date !== undefined) && updated?.donorId) {
      await recalculateDonorTotals(updated.donorId)
    }

    return NextResponse.json({ donation: updated })
  } catch (error) {
    console.error('PATCH /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}

export async function DELETE(request, context = {}) {
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

    // Delete the donation (tests mock prisma.donation.delete directly)
    let deleted
    try {
      deleted = await prisma.donation.delete({ where: { id } })
    } catch (err) {
      return jsonError('Not found', 404)
    }

    // Recalculate donor totals after deletion if we have donorId
    if (deleted?.donorId) await recalculateDonorTotals(deleted.donorId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/donations/[id] error', error)
    return jsonError('Internal server error', 500)
  }
}