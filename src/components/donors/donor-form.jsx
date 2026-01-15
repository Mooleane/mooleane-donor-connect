/**
 * Donor Form Component 
 * TODO: Implement form for creating/editing donors
 */

import React from 'react'

export function DonorForm({ donor = {}, onSubmit, onCancel, submitLabel = 'Save Donor' }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const payload = {
      firstName: form.firstName && form.firstName.value,
      lastName: form.lastName && form.lastName.value,
      phone: form.phone && form.phone.value,
      city: form.city && form.city.value,
      state: form.state && form.state.value,
      email: form.email && form.email.value,
      zipCode: form.zipCode && form.zipCode.value,
      status: form.donorStatus && form.donorStatus.value ? form.donorStatus.value.toUpperCase() : undefined,
      preferredContactMethod: form.preferredContactMethod && form.preferredContactMethod.value,
      tags: form.tags && form.tags.value,
    }
    if (typeof onSubmit === 'function') onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          First name
          <input name="firstName" defaultValue={donor.firstName || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
        <label className="block">
          Last name
          <input name="lastName" defaultValue={donor.lastName || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          Phone
          <input name="phone" type="tel" defaultValue={donor.phone || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
        <label className="block">
          City
          <input name="city" defaultValue={donor.city || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
      </div>

      <label className="block">
        Email
        <input name="email" type="email" defaultValue={donor.email || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          State
          <input name="state" defaultValue={donor.state || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
        <label className="block">
          Zip code
          <input name="zipCode" defaultValue={donor.zipCode || ''} className="w-full border rounded-md px-3 py-2 mt-1" />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          Donor status
          <select name="donorStatus" defaultValue={(donor.status || 'ACTIVE').toLowerCase()} className="w-full border rounded-md px-3 py-2 mt-1">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="lapsed">lapsed</option>
          </select>
        </label>

        <label className="block">
          Preferred contact method
          <select name="preferredContactMethod" defaultValue={donor.preferredContactMethod || 'email'} className="w-full border rounded-md px-3 py-2 mt-1">
            <option value="email">email</option>
            <option value="phone">phone</option>
            <option value="mail">mail</option>
          </select>
        </label>
      </div>

      <label className="block">
        Tags (comma-separated)
        <input name="tags" defaultValue={Array.isArray(donor.tags) ? donor.tags.join(', ') : (donor.tags || '')} className="w-full border rounded-md px-3 py-2 mt-1" />
      </label>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{submitLabel}</button>
      </div>
    </form>
  )
}

export default DonorForm

// TODO: Example usage:
// <DonorForm 
//   donor={editingDonor} 
//   onSubmit={handleCreateDonor}
//   onCancel={() => setShowForm(false)}
// />
