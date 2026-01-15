/**
 * Donation List Component
 * TODO: Implement table for displaying donations with filtering and sorting
 */

import { Badge } from '@/components/ui/badge'
import { Edit2, Info } from 'lucide-react'
import { formatCurrency, calculateDonorRiskLevel } from '@/lib/utils'

export function DonationList({ donations = [], onEdit, onDelete, isLoading = false, onShowRiskInfo }) {
  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {isLoading && <div className="p-4 text-sm text-gray-500">Loading donors…</div>}

      {!isLoading && (!Array.isArray(donations) || donations.length === 0) && (
        <div className="p-4 text-sm text-gray-500">No donors found</div>
      )}

      {!isLoading && Array.isArray(donations) && donations.length > 0 && (
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Donor</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">City / State</th>
              <th className="p-2">Zip</th>
              <th className="p-2">Preferred Contact</th>
              <th className="p-2">Status</th>
              <th className="p-2">Tags</th>
              <th className="p-2">Total Amount</th>
              <th className="p-2">Total Gifts</th>
              <th className="p-2">
                <div className="flex items-center gap-1">
                  Retention Risk
                  <button
                    type="button"
                    aria-label="Risk level info"
                    onClick={(e) => { e.stopPropagation(); onShowRiskInfo && onShowRiskInfo() }}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </th>
              <th className="p-2 text-right">Edit</th>
              <th className="p-2 text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d, idx) => {
              const riskLevel = calculateDonorRiskLevel(d)
              return (
                <tr key={d.id || `donor-${idx}`} className="border-t">
                  <td className="p-2">{`${d.firstName || ''} ${d.lastName || ''}`.trim() || '—'}</td>
                  <td className="p-2">{d.email || '—'}</td>
                  <td className="p-2">{d.phone || '—'}</td>
                  <td className="p-2">{d.city ? `${d.city}${d.state ? ', ' + d.state : ''}` : (d.state ? d.state : '—')}</td>
                  <td className="p-2">{d.zipCode || '—'}</td>
                  <td className="p-2">{d.preferredContactMethod || '—'}</td>
                  <td className="p-2">{d.status || '—'}</td>
                  <td className="p-2">{Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || '—')}</td>
                  <td className="p-2">{formatCurrency(d.totalAmount || d.amount || 0)}</td>
                  <td className="p-2">{d.totalGifts ?? d.giftCount ?? 0}</td>
                  <td className="p-2">
                    <Badge className={getRiskBadgeColor(riskLevel)}>{riskLevel}</Badge>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      aria-label="Edit donor"
                      title="Edit donor"
                      className="text-blue-500 hover:text-white hover:bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center opacity-70 transition inline-flex"
                      onClick={(e) => { e.stopPropagation(); onEdit && onEdit(d) }}
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      aria-label="Delete donor"
                      title="Delete donor"
                      className="text-red-500 hover:text-white hover:bg-red-500 rounded-full w-7 h-7 flex items-center justify-center opacity-70 transition"
                      onClick={(e) => { e.stopPropagation(); onDelete && onDelete(d.id) }}
                      type="button"
                    >
                      <span className="sr-only">Delete</span>
                      ×
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default DonationList

// TODO: Example usage:
// <DonationList 
//   donations={donations}
//   onEdit={handleEditDonation}
//   onDelete={handleDeleteDonation}
//   isLoading={isLoading}
// />