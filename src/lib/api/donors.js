// Business logic for donor operations
import { prisma } from '../db'

/**
 * List donors for an organization with simple paging/filtering
 * @param {Object} opts
 * @param {string} opts.organizationId
 * @param {Object} opts.query - { sort, sortOrder, page, limit, search, status, retentionRisk }
 */
export async function listDonors({ organizationId, query = {} }) {
  const { sort, sortOrder = 'asc', page = 1, limit = 20, search, status, retentionRisk } = query

  const orderBy = sort === 'totalDesc' ? { totalAmount: sortOrder } : { lastName: sortOrder }
  const where = { organizationId }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status
  if (retentionRisk) where.retentionRisk = retentionRisk

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit)
  const take = Number(limit)

  const [donors, total] = await Promise.all([
    prisma.donor.findMany({ where, orderBy, skip, take }),
    prisma.donor.count({ where }),
  ])

  return { donors, total, page: Number(page), limit: Number(limit) }
}

export async function getDonor({ id }) {
  if (!id) return null
  const donor = await prisma.donor.findUnique({
    where: { id },
    include: { donations: { orderBy: { date: 'desc' }, take: 50, include: { campaign: true } } },
  })
  return donor
}

export async function createDonor({ donorData, organizationId }) {
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
    preferredContactMethod,
    tags,
    retentionRisk,
  } = donorData

  const normalizedFirstName = type === 'organization' ? (organizationName || '') : (firstName || '')
  const normalizedLastName = type === 'organization' ? '' : (lastName || '')

  const donor = await prisma.donor.create({
    data: {
      organizationId,
      firstName: normalizedFirstName.trim(),
      lastName: normalizedLastName.trim(),
      email: email ? String(email).trim() : null,
      phone: phone ? String(phone).trim() : null,
      address: address ? String(address).trim() : null,
      city: city ? String(city).trim() : null,
      state: state ? String(state).trim() : null,
      zipCode: zipCode ? String(zipCode).trim() : null,
      status: (status && String(status).toUpperCase()) || 'ACTIVE',
      preferredContactMethod: preferredContactMethod ? String(preferredContactMethod) : null,
      tags: tags ? String(tags) : null,
      retentionRisk: retentionRisk || 'UNKNOWN',
    },
  })

  return donor
}

export async function updateDonor({ id, data }) {
  if (!id) throw new Error('Missing donor id')

  const updateData = {}
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined) continue
    if (value === null) {
      updateData[key] = null
      continue
    }
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '' && ['email', 'phone', 'address', 'city', 'state', 'zipCode'].includes(key)) {
        updateData[key] = null
      } else {
        updateData[key] = trimmed
      }
    } else {
      updateData[key] = value
    }
  }

  const updated = await prisma.donor.update({ where: { id }, data: updateData })
  return updated
}

export async function deleteDonor({ id }) {
  if (!id) throw new Error('Missing donor id')
  if (prisma.donation && typeof prisma.donation.deleteMany === 'function') {
    await prisma.donation.deleteMany({ where: { donorId: id } })
  }
  await prisma.donor.delete({ where: { id } })
  return true
}

export async function updateDonorMetrics(donorId) {
  const donations = await prisma.donation.findMany({ where: { donorId } })
  const totalGifts = donations.length
  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

  let lastGiftDate = null
  if (donations.length > 0) {
    const latest = donations.reduce((a, b) => (new Date(a.receivedAt) > new Date(b.receivedAt) ? a : b))
    lastGiftDate = latest.receivedAt
  }

  let retentionRisk = 'UNKNOWN'
  if (lastGiftDate) {
    const msPerDay = 24 * 60 * 60 * 1000
    const daysSince = Math.floor((Date.now() - new Date(lastGiftDate).getTime()) / msPerDay)
    if (daysSince >= 365) retentionRisk = 'CRITICAL'
    else if (daysSince >= 180) retentionRisk = 'HIGH'
    else if (daysSince >= 90) retentionRisk = 'MEDIUM'
    else if (daysSince >= 30) retentionRisk = 'LOW'
    else retentionRisk = 'UNKNOWN'
  }

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      totalGifts,
      totalAmount,
      lastGiftDate: lastGiftDate || null,
      retentionRisk,
    },
  })
}