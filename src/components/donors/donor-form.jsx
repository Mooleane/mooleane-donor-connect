/**
 * Donor Form Component 
 * TODO: Implement form for creating/editing donors
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export function DonorForm({ donor, onSubmit, onCancel }) {
  // TODO: Import and use donor validation schema
  // const schema = createDonorSchema // TODO: Import from validation
  
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
      {/* TODO: Implement donor form with fields:
          - firstName (required)
          - lastName (required)  
          - email (required, email validation)
          - phone (optional, phone validation)
          - address (optional)
          - city (optional)
          - state (optional)
          - zipCode (optional)
          - donorStatus (select: active, inactive, lapsed)
          - retentionRisk (select: low, medium, high)
          - preferredContactMethod (select: email, phone, mail)
          - tags (optional, comma-separated or tag input)
          - notes (optional, textarea)
      */}
      
      {/* TODO: Add form validation and error handling */}
      {/* TODO: Add submit and cancel buttons */}
      {/* TODO: Handle loading state during submission */}
    </>
  )
}

// TODO: Example usage:
// <DonorForm 
//   donor={editingDonor} 
//   onSubmit={handleCreateDonor}
//   onCancel={() => setShowForm(false)}
// />
