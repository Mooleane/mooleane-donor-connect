'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function RecordDonation({ onRecorded }) {
  const [donors, setDonors] = useState([])
  const [donorId, setDonorId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/donors')
      .then(r => r.json())
      .then(data => setDonors(data.donors || []))
      .catch(() => setDonors([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!donorId) return setError('Select a donor or add one first')
    if (!amount || Number(amount) <= 0) return setError('Enter a positive amount')

    setLoading(true)
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId, amount: Number(amount), date })
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed')
      setAmount('')
      setDonorId('')
      onRecorded && onRecorded(payload.donation)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Donor</label>
        <select value={donorId} onChange={(e) => setDonorId(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2">
          <option value="">-- Select donor --</option>
          {donors.map(d => (
            <option key={d.id} value={d.id}>{d.firstName} {d.lastName} {d.email ? `(${d.email})` : ''}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input className="mt-1 block w-full rounded border px-3 py-2" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input className="mt-1 block w-full rounded border px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Recording...' : 'Record Donation'}</Button>
      </div>
    </form>
  )
}
