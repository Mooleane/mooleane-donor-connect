'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function DonationsPage() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true)
      setError('')
      try {
        // get recent donations (most recent first)
        const res = await fetch('/api/donations?limit=50')
        if (!res.ok) throw new Error('Failed to load donations')
        const payload = await res.json()
        const list = (payload.donations || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date))
        setDonations(list)
      } catch (err) {
        console.error(err)
        setError('Failed to load donations')
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Donations</h1>
          <p className="text-gray-600 mt-2">Track incoming donations and payment status</p>
        </div>
        <Link href="/donations/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Donation
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Donations</h2>
          <div />
        </div>

        {loading && <div className="p-4 text-sm text-gray-500">Loading donations…</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}

        {!loading && donations.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No donations found</div>
        )}

        {!loading && donations.length > 0 && (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Date</th>
                <th className="p-2">Donor</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Pay Method</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{formatDate(d.date)}</td>
                  <td className="p-2">{(d.donor && `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim()) || '—'}</td>
                  <td className="p-2">{formatCurrency(d.amount || 0)}</td>
                  <td className="p-2">
                    {/* Show method or placeholder */}
                    {d.method ? (
                      <Badge className="bg-blue-500 text-white">{d.method}</Badge>
                    ) : (
                      <Badge className="bg-gray-300 text-black">—</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}