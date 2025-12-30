'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecordDonation from '@/components/donations/record-donation'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [showRecord, setShowRecord] = useState(false)
  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/summary')
      if (!res.ok) throw new Error('Failed')
      const payload = await res.json()
      setSummary(payload)
      setRecentDonations(payload.recentDonations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleRecorded = (donation) => {
    // Prepend new donation to list and refresh summary
    setRecentDonations(prev => [donation, ...prev].slice(0, 5))
    fetchSummary()
    setShowRecord(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your donor retention platform</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Total Donations</div>
          <div className="text-2xl font-semibold">{loading ? '—' : (summary?.totals?.totalDonationsCount ?? 0)}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Total Raised</div>
          <div className="text-2xl font-semibold">{loading ? '—' : `$${(summary?.totals?.totalRaised ?? 0).toFixed(2)}`}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Month's Total</div>
          <div className="text-2xl font-semibold">{loading ? '—' : `$${(summary?.month?.monthTotalRaised ?? 0).toFixed(2)}`}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Month's Donations</div>
          <div className="text-2xl font-semibold">{loading ? '—' : (summary?.month?.monthDonationsCount ?? 0)}</div>
        </div>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Donations</h2>
          <div className="space-x-2">
            <Link href="/donors/new">
              <Button>Add Donor</Button>
            </Link>
            <Button onClick={() => setShowRecord(true)}>Record Donation</Button>
            <Link href="/reports">
              <Button variant="outline">View Reports</Button>
            </Link>
          </div>
        </div>

        {showRecord && (
          <div className="mb-4">
            <RecordDonation onRecorded={handleRecorded} />
          </div>
        )}

        <div>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Date</th>
                <th className="p-2">Donor</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Campaign</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="4" className="p-4 text-center text-sm text-gray-500">Loading donations…</td></tr>
              )}

              {!loading && recentDonations.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-sm text-gray-500">No recent donations</td></tr>
              )}

              {recentDonations.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—'}</td>
                  <td className="p-2">${Number(d.amount).toFixed(2)}</td>
                  <td className="p-2">{d.campaign ? d.campaign.name : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
