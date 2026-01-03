'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function RecordDonation({ onRecorded }) {
  const [donors, setDonors] = useState([])
  const [donorId, setDonorId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [showAddCampaign, setShowAddCampaign] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/donors')
      .then(r => r.json())
      .then(data => setDonors(data.donors || []))
      .catch(() => setDonors([]))

    fetch('/api/campaigns')
      .then(r => r.json())
      .then(data => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
  }, [])

  const handleAddCampaign = async () => {
    if (!newCampaignName || newCampaignName.trim() === '') return
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCampaignName.trim() })
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed to create campaign')
      // Prepend new campaign and select it
      setCampaigns(prev => [payload.campaign, ...prev])
      setCampaignId(payload.campaign.id)
      setNewCampaignName('')
      setShowAddCampaign(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!donorId) return setError('Select a donor or add one first')
    if (!amount || Number(amount) <= 0) return setError('Enter a positive amount')

    setLoading(true)
    try {
      const body = { donorId, amount: Number(amount), date }
      if (campaignId) body.campaignId = campaignId

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || 'Failed')
      setAmount('')
      setDonorId('')
      setCampaignId('')
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Campaign <span className="text-sm text-gray-500">(optional)</span></label>
        <div className="flex items-center space-x-2 mt-1">
          <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="block w-full rounded border px-3 py-2">
            <option value="">-- Select campaign --</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setShowAddCampaign(prev => !prev)}>{showAddCampaign ? 'Cancel' : 'Add campaign'}</button>
        </div>

        {showAddCampaign && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            <input value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} placeholder="Campaign name" className="rounded border px-3 py-2" />
            <div className="flex space-x-2">
              <Button variant="outline" type="button" onClick={() => { setShowAddCampaign(false); setNewCampaignName('') }}>Cancel</Button>
              <Button type="button" onClick={handleAddCampaign}>Create</Button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center justify-end">
        <Button type="submit" disabled={loading}>{loading ? 'Recording...' : 'Record Donation'}</Button>
      </div>
    </form>
  )
}
