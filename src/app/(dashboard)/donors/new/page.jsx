'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const donorSchema = z.object({
  type: z.enum(['individual', 'organization']).default('individual'),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  organizationName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.type === 'individual') {
    if (!val.firstName || val.firstName.trim() === '') {
      ctx.addIssue({ path: ['firstName'], code: z.ZodIssueCode.custom, message: 'First name is required for individuals' })
    }
  } else {
    if (!val.organizationName || val.organizationName.trim() === '') {
      ctx.addIssue({ path: ['organizationName'], code: z.ZodIssueCode.custom, message: 'Organization name is required' })
    }
  }
})

export default function NewDonorPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(donorSchema),
    defaultValues: { type: 'individual' }
  })

  const type = watch('type')

  const onClose = () => {
    setOpen(false)
    router.push('/donors')
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.status === 201) {
        router.push('/donors')
      } else {
        const payload = await res.json()
        setError(payload?.error || 'Failed to create donor')
      }
    } catch (err) {
      console.error(err)
      setError('Internal error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Donor</DialogTitle>
          <DialogDescription>
            Create an individual or organization donor profile
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select {...register('type')} className="rounded border px-3 py-2">
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {type === 'individual' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input {...register('firstName')} className="mt-1 block w-full rounded border px-3 py-2" />
                {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                <input {...register('phone')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input {...register('lastName')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                <input {...register('email')} className="mt-1 block w-full rounded border px-3 py-2" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name (optional)</label>
                <input {...register('middleName')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City / State</label>
                <input {...register('city')} placeholder="City" className="mt-1 block w-full rounded border px-3 py-2 mb-2" />
                <input {...register('state')} placeholder="State" className="mt-1 block w-full rounded border px-3 py-2" />
              </div>
            </div>
          )}

          {type === 'organization' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                <input {...register('organizationName')} className="mt-1 block w-full rounded border px-3 py-2" />
                {errors.organizationName && <p className="text-sm text-red-600 mt-1">{errors.organizationName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
                <input {...register('phone')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City / State</label>
                <input {...register('city')} placeholder="City" className="mt-1 block w-full rounded border px-3 py-2 mb-2" />
                <input {...register('state')} placeholder="State" className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                <input {...register('email')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website (optional)</label>
                <input {...register('website')} className="mt-1 block w-full rounded border px-3 py-2" />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div />
              <div className="flex space-x-2">
                <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Confirm'}</Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}