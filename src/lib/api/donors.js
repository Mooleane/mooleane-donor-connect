// Business logic for donor operations
import { prisma } from '../db'

/**
 * TODO: Get a single donor by ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object|null>} Donor object or null
 */
export async function getDonor(params) {
  // TODO: Query single donor with related data (donations, interactions, tasks)
  // TODO: Calculate donor metrics (totalAmount, totalGifts, avgGift, lastGiftDate)
  // TODO: Return donor object or null
}

/**
 * TODO: Create a new donor
 * @param {Object} donorData - Donor data to create
 * @returns {Promise<Object>} Created donor object
 */
export async function createDonor(donorData) {
  // TODO: Create donor in database
  // TODO: Return created donor with calculated fields
}

/**
 * TODO: Update an existing donor
 * @param {Object} params - Update parameters (id, organizationId, data)
 * @returns {Promise<Object>} Updated donor object
 */
export async function updateDonor(params) {
  // TODO: Update donor in database
  // TODO: Recalculate metrics if needed
  // TODO: Return updated donor
}

/**
 * TODO: Delete a donor
 * @param {Object} params - Delete parameters (id, organizationId)
 */
export async function deleteDonor(params) {
  // TODO: Delete donor and related data
  // TODO: Handle cascade deletes appropriately
}

/**
 * TODO: Update donor metrics after donation changes
 * @param {string} donorId - Donor ID to update metrics for
 */
export async function updateDonorMetrics(donorId) {
  // Calculate donation metrics and update donor record
  const donations = await prisma.donation.findMany({ where: { donorId } })
  const totalGifts = donations.length
  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

  let lastGiftDate = null
  if (donations.length > 0) {
    const latest = donations.reduce((a, b) => (new Date(a.receivedAt) > new Date(b.receivedAt) ? a : b))
    lastGiftDate = latest.receivedAt
  }

  // Determine retention risk based on last gift date
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