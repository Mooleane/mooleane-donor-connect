'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import RecordDonation from '@/components/donations/record-donation'

export default function NewDonationPage() {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const onClose = () => {
    setOpen(false)
    router.push('/dashboard')
  }

  const handleRecorded = (donation) => {
    // After recording, navigate back to dashboard which will refresh summary
    router.push('/dashboard')
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Donation</DialogTitle>
          <DialogDescription>
            Quickly record a donation for an existing donor
          </DialogDescription>
        </DialogHeader>

        <RecordDonation onRecorded={handleRecorded} />
      </DialogContent>
    </Dialog>
  )
}
