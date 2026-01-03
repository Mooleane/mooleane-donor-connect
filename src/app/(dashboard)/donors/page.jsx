'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function DonorsPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/donors?sort=totalDesc')
        if (!res.ok) throw new Error('Failed to load donors')
        const payload = await res.json()
        // Show only donors who have donated and sort greatest to least by totalAmount
        const list = (payload.donors || []).filter(d => (d.totalAmount || 0) > 0).slice().sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
        setDonors(list)
      } catch (err) {
        console.error(err)
        setError('Failed to load donors')
      } finally {
        setLoading(false)
      }
    }

    fetchDonors()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Donors</h1>
          <p className="text-gray-600 mt-2">Manage your donor relationships and track engagement</p>
        </div>
        <Link href="/donors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Donor
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Donors</h2>
          <div />
        </div>

        {loading && <div className="p-4 text-sm text-gray-500">Loading donors…</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}

        {!loading && donors.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No donors found</div>
        )}

        {!loading && donors.length > 0 && (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Donor</th>
                <th className="p-2">Phone</th>
                <th className="p-2">City / State</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {donors.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{`${d.firstName || ''} ${d.lastName || ''}`.trim() || '—'}</td>
                  <td className="p-2">{d.phone || '—'}</td>
                  <td className="p-2">{d.city ? `${d.city}${d.state ? ', ' + d.state : ''}` : (d.state ? d.state : '—')}</td>
                  <td className="p-2">{formatCurrency(d.totalAmount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}