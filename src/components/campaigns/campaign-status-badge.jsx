/**
 * Campaign Status Badge Component
 * TODO: Implement status badge for campaign states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CampaignStatusBadge({ status, className }) {
  // TODO: Define status variants and their styling
  const statusVariants = {
    // TODO: Add status mappings:
    // - draft: gray
    // - active: green
    // - paused: yellow
    // - completed: blue
    // - cancelled: red
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
// <CampaignStatusBadge status="active" />
// <CampaignStatusBadge status="draft" className="ml-2" />