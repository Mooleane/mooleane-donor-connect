/**
 * Donation Form Component
 * TODO: Implement form for creating/editing donations
 */

import React from 'react'

/**
 * Reusable DonationForm — mirrors the dashboard dialog HTML so tests and UI match.
 * Props:
 * - donation: object with donorId, amount, method, date, notes
 * - donors: array of donor options
 * - onChange: function(field, value) called on input changes
 * - onSubmit: optional submit handler if used as a standalone form
 */
export function DonationForm({ donation = {}, donors = [], onChange, onSubmit, onCancel }) {
  const handleChange = (field) => (e) => {
    const v = e.target.value
    if (typeof onChange === 'function') onChange(field, v)
  }

  const handleSubmit = (e) => {
    if (typeof onSubmit !== 'function') return
    e.preventDefault()
    const payload = {
      donorId: donation.donorId || '',
      amount: donation.amount || '',
      method: donation.method || '',
      date: donation.date || '',
      notes: donation.notes || ''
    }
    onSubmit(payload)
  }

  return (
    <div className="py-4 space-y-3">
      <div>
        <label htmlFor="donorId" className="block text-sm font-medium text-gray-700 mb-1">Donor</label>
        <select
          id="donorId"
          name="donorId"
          value={donation.donorId || ''}
          onChange={handleChange('donorId')}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">Select a donor…</option>
          {Array.isArray(donors) && donors.map(d => (
            <option key={d.id} value={d.id}>{`${d.firstName || ''} ${d.lastName || ''}`.trim() || '—'}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={donation.amount || ''}
            onChange={handleChange('amount')}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <input
            id="method"
            name="method"
            type="text"
            value={donation.method || ''}
            onChange={handleChange('method')}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={donation.date || ''}
            onChange={handleChange('date')}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input
            id="notes"
            name="notes"
            type="text"
            value={donation.notes || ''}
            onChange={handleChange('notes')}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
      {typeof onSubmit === 'function' && (
        <div className="pt-2">
          <button onClick={handleSubmit} className="inline-flex items-center px-3 py-2 border rounded-md">Save</button>
          {typeof onCancel === 'function' && (
            <button onClick={onCancel} className="ml-2 inline-flex items-center px-3 py-2 border rounded-md">Cancel</button>
          )}
        </div>
      )}
    </div>
  )
}

export default DonationForm
