// Utility functions for shadcn/ui

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format date
export function formatDate(date) {
  if (date === null || date === undefined) return 'Invalid Date'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(d)
  } catch (error) {
    // Fallback if Intl is not available
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }
}

// Format date and time
export function formatDateTime(date) {
  if (!date) return 'N/A'
  try {
    return new Intl.DateFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  } catch (error) {
    // Fallback if Intl is not available
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

// Calculate donor risk level based on time since last donation and contact info
export function calculateDonorRiskLevel(donor) {
  if (!donor) return 'UNKNOWN'

  // Base risk from contact information (phone or email counts as complete contact info)
  let contactRisk = donor.phone || donor.email ? 'LOW' : 'MEDIUM'

  // Adjust risk based on time since last donation
  if (!donor.lastGiftDate) {
    return 'HIGH' // No donation history
  }

  const now = new Date()
  const lastDonationDate = new Date(donor.lastGiftDate)
  const monthsAgo = (now - lastDonationDate) / (1000 * 60 * 60 * 24 * 30)

  if (monthsAgo < 3) {
    return contactRisk === 'LOW' ? 'LOW' : 'MEDIUM'
  } else if (monthsAgo < 6) {
    return 'MEDIUM'
  } else {
    return 'HIGH'
  }
}
