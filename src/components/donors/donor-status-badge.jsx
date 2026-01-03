/**
 * Donor Status Badge Component
 * TODO: Implement status badge for donor states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DonorStatusBadge({ status, className }) {
  // Map status -> display label and styling
  const map = {
    ACTIVE: { label: 'Active', className: 'bg-green-500 text-white' },
    LAPSED: { label: 'Lapsed', className: 'bg-yellow-400 text-black' },
    INACTIVE: { label: 'Inactive', className: 'bg-gray-400 text-white' },
    DO_NOT_CONTACT: { label: 'Do Not Contact', className: 'bg-red-500 text-white' },
  }

  const { label, className: statusClass } = map[status] || { label: 'Unknown', className: 'bg-gray-300 text-black' }

  return <Badge className={cn(statusClass, className)}>{label}</Badge>
}

// TODO: Example usage:
// <DonorStatusBadge status="ACTIVE" />
// <DonorStatusBadge status="LAPSED" className="ml-2" />