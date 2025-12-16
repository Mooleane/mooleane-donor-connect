/**
 * Donor Status Badge Component
 * TODO: Implement status badge for donor states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DonorStatusBadge({ status, className }) {
  // TODO: Define status variants and their styling
  const statusVariants = {
    // TODO: Add status mappings:
    // - ACTIVE: green
    // - INACTIVE: gray  
    // - LAPSED: yellow
    // - PROSPECTIVE: blue
  }

  // TODO: Get variant based on status
  const variant = 'default' // TODO: Replace with statusVariants[status] || 'default'

  return (
    <>
      {/* TODO: Implement Badge component with proper variant */}
      {/* TODO: Apply custom className if provided */}
      {/* TODO: Display formatted status text */}
    </>
  )
}

// TODO: Example usage:
// <DonorStatusBadge status="ACTIVE" />
// <DonorStatusBadge status="LAPSED" className="ml-2" />