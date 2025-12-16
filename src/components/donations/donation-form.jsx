/**
 * Donation Form Component
 * TODO: Implement form for creating/editing donations
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function DonationForm({ donation, donors, onSubmit, onCancel }) {
  // TODO: Import and use donation validation schema
  // const schema = createDonationSchema // TODO: Import from validation
  
  // TODO: Initialize form with react-hook-form and zod resolver
  const form = {
    // TODO: Implement useForm with:
    // - resolver: zodResolver(schema)
    // - defaultValues for edit mode
  }

  // TODO: Implement form submission handler
  const handleSubmit = async (data) => {
    // TODO: Call onSubmit prop with form data
    // TODO: Handle form errors
  }

  return (
    <>
      {/* TODO: Implement donation form with fields:
          - donorId (select from donors)
          - amount (number input with proper validation)
          - donationType (select: one-time, monthly, annual)
          - date (date input)
          - campaignId (optional select)
          - notes (textarea, optional)
      */}
      
      {/* TODO: Add form validation and error handling */}
      {/* TODO: Add submit and cancel buttons */}
      {/* TODO: Handle loading state during submission */}
    </>
  )
}

// TODO: Example usage:
// <DonationForm 
//   donation={editingDonation} 
//   donors={allDonors}
//   onSubmit={handleCreateDonation}
//   onCancel={() => setShowForm(false)}
// />