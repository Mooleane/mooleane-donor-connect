'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw, Info, Edit2 } from 'lucide-react'
import { formatCurrency, formatDate, calculateDonorRiskLevel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
// Tooltip removed; using Dialog-based popup for explanation
import { format, subDays } from 'date-fns'
import jsPDF from 'jspdf'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import DonationForm from '@/components/donations/donation-form'
import DonorForm from '@/components/donors/donor-form'
import DonationList from '@/components/donations/donation-list'

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Loading dashboard…</div>}>
      <DashboardPageContent />
    </Suspense>
  )
}

function DashboardPageContent() {
  // Dashboard summary state
  const [summary, setSummary] = useState(null)
  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(true)

  // Insights state
  const [insights, setInsights] = useState([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState('')
  const [insightsScope, setInsightsScope] = useState('month') // 'month' | 'lifetime'
  // Current user (for tier display)
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState('donors')

  const searchParams = useSearchParams()

  // Risk info popup state
  const [riskPopupOpen, setRiskPopupOpen] = useState(false)

  // Donors tab state
  const [donors, setDonors] = useState([])
  const [donorsLoading, setDonorsLoading] = useState(false)
  const [donorsError, setDonorsError] = useState('')
  const [donorsPage, setDonorsPage] = useState(1)
  const [donorsTotal, setDonorsTotal] = useState(0)
  const donorsLimit = 10

  // Donor search & filter state
  const [donorFilterName, setDonorFilterName] = useState('')
  const [donorFilterTags, setDonorFilterTags] = useState('')
  const [donorFilterEmail, setDonorFilterEmail] = useState('')
  const [donorFilterCityState, setDonorFilterCityState] = useState('')
  const [donorFilterZip, setDonorFilterZip] = useState('')
  const [donorFilterPhone, setDonorFilterPhone] = useState('')
  const [donorFilterRisk, setDonorFilterRisk] = useState('') // '', 'LOW','MEDIUM','HIGH'
  const [donorFilterStatus, setDonorFilterStatus] = useState('') // '', 'ACTIVE','LAPSED','INACTIVE','DO_NOT_CONTACT'
  const [donorFilterMinGifts, setDonorFilterMinGifts] = useState('')
  const [donorSortOrder, setDonorSortOrder] = useState('totalDesc') // 'totalDesc' | 'totalAsc'

  // Donors tab totals (organization-wide)
  const [donorTotals, setDonorTotals] = useState({ totalAmount: 0, totalGifts: 0 })
  const [donorTotalsLoading, setDonorTotalsLoading] = useState(false)
  const [donorTotalsError, setDonorTotalsError] = useState('')

  // Helper function to get risk level badge styling
  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Donations tab state
  const [donations, setDonations] = useState([])
  const [donationsLoading, setDonationsLoading] = useState(false)
  const [donationsError, setDonationsError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [donationsPage, setDonationsPage] = useState(1)
  const [donationsTotal, setDonationsTotal] = useState(0)
  const donationsLimit = 10

  // Donation filters (client-side)
  const [donationFilterStart, setDonationFilterStart] = useState('')
  const [donationFilterEnd, setDonationFilterEnd] = useState('')
  const [donationFilterType, setDonationFilterType] = useState('')
  const [donationFilterMinAmount, setDonationFilterMinAmount] = useState('')
  const [donationFilterMaxAmount, setDonationFilterMaxAmount] = useState('')
  const [donationFilterDonorName, setDonationFilterDonorName] = useState('')

  // Notes dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState('')

  // Add/Edit Donor dialog state
  const [donorDialogOpen, setDonorDialogOpen] = useState(false)
  const [editingDonorId, setEditingDonorId] = useState(null)
  const [donorForm, setDonorForm] = useState({ firstName: '', lastName: '', phone: '', city: '', state: '', email: '', zipCode: '', status: 'ACTIVE', preferredContactMethod: 'email', tags: '' })
  const [donorSaving, setDonorSaving] = useState(false)
  const [donorError, setDonorError] = useState('')

  // Record/Edit Donation dialog state
  const [donationDialogOpen, setDonationDialogOpen] = useState(false)
  const [editingDonationId, setEditingDonationId] = useState(null)
  const [donationForm, setDonationForm] = useState({ donorId: '', amount: '', method: '', date: '', notes: '' })
  const [donationSaving, setDonationSaving] = useState(false)
  const [donationError, setDonationError] = useState('')

  // Reports tab state
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const [reportStart, setReportStart] = useState(weekAgo)
  const [reportEnd, setReportEnd] = useState(today)
  const [reportDonations, setReportDonations] = useState([])
  const [reportSummary, setReportSummary] = useState({ total: 0, count: 0, avg: 0 })
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  // Open note dialog
  const openNoteDialog = (donation) => {
    setSelectedDonation(donation)
    setNoteText(donation.notes || '')
    setNoteError('')
    setNoteDialogOpen(true)
  }

  // Save note
  const saveNote = async () => {
    if (!selectedDonation) return
    setNoteSaving(true)
    setNoteError('')
    try {
      const res = await fetch(`/api/donations/${selectedDonation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save note')
      }
      const updatedDonation = data && data.donation ? data.donation : data

      // Update the donation in all relevant state arrays
      setRecentDonations(prev => prev.map(d => d.id === updatedDonation.id ? { ...d, notes: updatedDonation.notes } : d))
      setDonations(prev => prev.map(d => d.id === updatedDonation.id ? { ...d, notes: updatedDonation.notes } : d))
      setReportDonations(prev => Array.isArray(prev) ? prev.map(d => d.id === updatedDonation.id ? { ...d, notes: updatedDonation.notes } : d) : prev)

      setNoteDialogOpen(false)
      setSelectedDonation(null)
      setNoteText('')
    } catch (err) {
      setNoteError(err.message || 'Failed to save note')
    } finally {
      setNoteSaving(false)
    }
  }

  // Open add/edit donor dialog
  const openDonorDialog = (donor = null) => {
    if (donor) {
      setEditingDonorId(donor.id)
      setDonorForm({
        firstName: donor.firstName || '',
        lastName: donor.lastName || '',
        phone: donor.phone || '',
        city: donor.city || '',
        state: donor.state || '',
        email: donor.email || '',
        zipCode: donor.zipCode || '',
        status: donor.status || 'ACTIVE',
        preferredContactMethod: donor.preferredContactMethod || 'email',
        tags: Array.isArray(donor.tags) ? donor.tags.join(', ') : (donor.tags || '')
      })
    } else {
      setEditingDonorId(null)
      setDonorForm({ firstName: '', lastName: '', phone: '', city: '', state: '', email: '', zipCode: '', status: 'ACTIVE', preferredContactMethod: 'email', tags: '' })
    }
    setDonorError('')
    setDonorDialogOpen(true)
  }

  // Save donor (add or edit). Accepts optional payloadArg from DonorForm.
  const saveDonor = async (payloadArg) => {
    setDonorSaving(true)
    setDonorError('')
    try {
      const payload = payloadArg ? {
        firstName: (payloadArg.firstName || '').trim(),
        lastName: (payloadArg.lastName || '').trim(),
        phone: (payloadArg.phone || '').trim(),
        city: (payloadArg.city || '').trim(),
        state: (payloadArg.state || '').trim(),
        email: (payloadArg.email || '').trim(),
        zipCode: (payloadArg.zipCode || '').trim(),
        status: (payloadArg.status || '').toUpperCase() || 'ACTIVE',
        preferredContactMethod: payloadArg.preferredContactMethod || 'email',
        tags: payloadArg.tags || ''
      } : {
        firstName: donorForm.firstName?.trim() || '',
        lastName: donorForm.lastName?.trim() || '',
        phone: donorForm.phone?.trim() || '',
        city: donorForm.city?.trim() || '',
        state: donorForm.state?.trim() || '',
        email: donorForm.email?.trim() || '',
        zipCode: donorForm.zipCode?.trim() || '',
        status: donorForm.status || 'ACTIVE',
        preferredContactMethod: donorForm.preferredContactMethod || 'email',
        tags: donorForm.tags || ''
      }

      // If a phone number is provided, only allow digits, spaces, dashes, and pluses
      if (payload.phone && !/^[0-9+\s-]+$/.test(payload.phone)) {
        setDonorError('Phone number may only contain digits, spaces, dashes, and +.')
        setDonorSaving(false)
        return
      }

      const method = editingDonorId ? 'PUT' : 'POST'
      const url = editingDonorId ? `/api/donors/${editingDonorId}` : '/api/donors'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Failed to ${editingDonorId ? 'update' : 'add'} donor`)

      const updated = data?.donor || data

      if (editingDonorId) {
        // Update the donor in the list
        setDonors(prev => Array.isArray(prev) ? prev.map(d => d.id === updated.id ? updated : d) : [updated])
      } else {
        // Prepend new donor to list
        setDonors(prev => Array.isArray(prev) ? [updated, ...prev] : [updated])
      }

      setDonorDialogOpen(false)
      setEditingDonorId(null)
      // Refresh dashboard stats after adding/updating donor
      try {
        fetchSummary()
        fetchDonorTotals()
      } catch (e) {
        // ignore
      }
    } catch (e) {
      setDonorError(e.message || `Failed to ${editingDonorId ? 'update' : 'add'} donor`)
    } finally {
      setDonorSaving(false)
    }
  }

  // Delete donor handler (also remove donations in UI)
  const handleDeleteDonor = async (id) => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this donor and all their donations?')) return
    try {
      const res = await fetch(`/api/donors/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to delete donor')
      }

      setDonors(prev => prev.filter(d => d.id !== id))
      setDonations(prev => Array.isArray(prev) ? prev.filter(r => r.donorId !== id) : prev)
      setRecentDonations(prev => Array.isArray(prev) ? prev.filter(r => r.donor?.id !== id && r.donorId !== id) : prev)
      setReportDonations(prev => Array.isArray(prev) ? prev.filter(r => r.donorId !== id) : prev)

      // Keep donors totals in sync after deleting donor + donations
      try {
        fetchDonorTotals()
        fetchSummary()
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setDonorsError(err.message || 'Failed to delete donor')
    }
  }

  // Ensure donor options when opening donation dialog
  const ensureDonorOptions = async () => {
    try {
      if (!Array.isArray(donors) || donors.length === 0) {
        const res = await fetch('/api/donors?limit=50')
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setDonors(data.donors || data || [])
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Open record/edit donation dialog
  const openDonationDialog = async (donation = null) => {
    if (donation) {
      setEditingDonationId(donation.id)
      setDonationForm({
        donorId: donation.donorId || '',
        amount: String(donation.amount || ''),
        method: donation.method || '',
        date: donation.date ? donation.date.split('T')[0] : today,
        notes: donation.notes || ''
      })
    } else {
      setEditingDonationId(null)
      setDonationForm({ donorId: '', amount: '', method: '', date: today, notes: '' })
    }
    setDonationError('')
    setDonationDialogOpen(true)
    await ensureDonorOptions()
  }

  // Save donation (add or edit)
  const saveDonation = async () => {
    if (!donationForm.date) {
      setDonationError('Please select a valid date for the donation.')
      return
    }

    if (!donationForm.amount || isNaN(donationForm.amount) || Number(donationForm.amount) <= 0) {
      setDonationError('Please enter a valid donation amount greater than 0.')
      return
    }

    if (!donationForm.method?.trim()) {
      setDonationError('Please provide a payment method for the donation.')
      return
    }

    setDonationSaving(true)
    setDonationError('')
    try {
      const payload = {
        donorId: donationForm.donorId,
        amount: Number(donationForm.amount || 0),
        method: donationForm.method?.trim() || '',
        date: donationForm.date,
        notes: donationForm.notes || ''
      }

      const method = editingDonationId ? 'PUT' : 'POST'
      const url = editingDonationId ? `/api/donations/${editingDonationId}` : '/api/donations'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Failed to ${editingDonationId ? 'update' : 'record'} donation`)

      // API routes return an object shaped { donation: { ... } }
      // Extract the donation object so state arrays contain donation records with `id`.
      const updated = data && data.donation ? data.donation : data

      if (editingDonationId) {
        // Update the donation in all relevant state arrays
        setRecentDonations(prev => Array.isArray(prev) ? prev.map(d => d.id === updated.id ? updated : d) : prev)
        setDonations(prev => Array.isArray(prev) ? prev.map(d => d.id === updated.id ? updated : d) : prev)
        setReportDonations(prev => Array.isArray(prev) ? prev.map(d => d.id === updated.id ? updated : d) : prev)
      } else {
        // Prepend new donation
        setDonations(prev => Array.isArray(prev) ? [updated, ...prev] : [updated])
        setRecentDonations(prev => Array.isArray(prev) ? [updated, ...prev] : [updated])
      }

      // Refresh donors list to get updated totals
      if (activeTab === 'donors') {
        fetchDonors()
      }
      // Refresh donations list if on that tab
      if (activeTab === 'donations') {
        fetchDonations()
      }

      // Refresh dashboard summary and totals after donation add/update
      try {
        fetchSummary()
        fetchDonorTotals()
      } catch (e) {
        // ignore
      }

      setDonationDialogOpen(false)
      setEditingDonationId(null)
    } catch (e) {
      setDonationError(e.message || `Failed to ${editingDonationId ? 'update' : 'record'} donation`)
    } finally {
      setDonationSaving(false)
    }
  }

  // Insights cache config
  const INSIGHTS_CACHE_KEY_BASE = 'donorconnect_insights'
  const INSIGHTS_CACHE_TTL = 1000 * 60 * 60 * 6 // 6 hours

  // Fetch AI insights (uses localStorage cache unless `force` is true)
  const fetchInsights = async (force = false, scopeArg) => {
    setInsightsLoading(true)
    setInsightsError('')
    try {
      const scope = scopeArg || insightsScope
      const cacheKey = `${INSIGHTS_CACHE_KEY_BASE}:${scope}`

      if (!force && typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(cacheKey)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed?.insights && parsed?.generatedAt && (Date.now() - parsed.generatedAt) < INSIGHTS_CACHE_TTL) {
              setInsights(parsed.insights)
              setInsightsLoading(false)
              return
            }
          }
        } catch (e) {
          console.warn('Failed to read insights cache', e)
        }
      }

      let url = '/api/dashboard/insights'
      const params = new URLSearchParams()
      if (force) params.set('regen', '1')
      if (scope === 'lifetime') params.set('scope', 'lifetime')
      else params.set('scope', 'month')
      const paramStr = params.toString()
      if (paramStr) url += `?${paramStr}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load insights')
      const payload = await res.json()
      const insightsArr = payload.insights || []
      setInsights(insightsArr)

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify({ insights: insightsArr, generatedAt: Date.now() }))
        }
      } catch (e) {
        // ignore cache write failures
      }
    } catch (err) {
      console.error(err)
      setInsightsError('Failed to generate insights')
    } finally {
      setInsightsLoading(false)
    }
  }

  // Fetch dashboard summary
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

  // Fetch donors
  const fetchDonors = async () => {
    setDonorsLoading(true)
    setDonorsError('')
    try {
      let url = `/api/donors?sort=${donorSortOrder}&page=${donorsPage}&limit=${donorsLimit}`
      if (donorFilterStatus) url += `&status=${encodeURIComponent(donorFilterStatus)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load donors')
      const payload = await res.json()
      setDonors(payload.donors || [])
      setDonorsTotal(payload.pagination?.total || 0)
    } catch (err) {
      console.error(err)
      setDonorsError('Failed to load donors')
    } finally {
      setDonorsLoading(false)
    }
  }

  // Fetch organization-wide donor totals (based on all donations)
  const fetchDonorTotals = async () => {
    setDonorTotalsLoading(true)
    setDonorTotalsError('')
    try {
      const res = await fetch('/api/donations/totals')
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Failed to load totals')
      setDonorTotals({
        totalAmount: Number(payload.total || 0),
        totalGifts: Number(payload.count || 0),
      })
    } catch (err) {
      console.error(err)
      setDonorTotalsError(err.message || 'Failed to load totals')
    } finally {
      setDonorTotalsLoading(false)
    }
  }

  // Fetch donations
  const fetchDonations = async () => {
    setDonationsLoading(true)
    setDonationsError('')
    try {
      const res = await fetch(`/api/donations?page=${donationsPage}&limit=${donationsLimit}`)
      if (!res.ok) throw new Error('Failed to load donations')
      const payload = await res.json()
      setDonations(payload.donations || [])
      setDonationsTotal(payload.pagination?.total || 0)
    } catch (err) {
      console.error(err)
      setDonationsError('Failed to load donations')
    } finally {
      setDonationsLoading(false)
    }
  }

  // Delete donation handler
  const handleDeleteDonation = async (id) => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this donation?')) return
    setDeletingId(id)
    setDonationsError('')
    try {
      const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to delete donation')
      }
      setDonations(donations => donations.filter(d => d.id !== id))
      // Refresh donors list to get updated totals
      if (activeTab === 'donors') {
        fetchDonors()
      }
      // Refresh dashboard summary and totals after deletion
      try {
        fetchSummary()
        fetchDonorTotals()
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setDonationsError(err.message || 'Failed to delete donation')
    } finally {
      setDeletingId(null)
    }
  }

  // Fetch report
  const fetchReport = async () => {
    setReportLoading(true)
    setReportError('')
    try {
      const dRes = await fetch(`/api/donations?start=${reportStart}&end=${reportEnd}`)
      const dData = await dRes.json()
      if (!dRes.ok) throw new Error(dData.error || 'Failed to fetch donations')
      // API may return an object { donations: [...] } or an array directly.
      setReportDonations(Array.isArray(dData) ? dData : (dData?.donations || []))

      const sRes = await fetch(`/api/donations/totals?start=${reportStart}&end=${reportEnd}`)
      const sData = await sRes.json()
      if (!sRes.ok) throw new Error(sData.error || 'Failed to fetch summary')
      setReportSummary({
        total: sData.total,
        count: sData.count,
        avg: sData.count ? sData.total / sData.count : 0,
      })
    } catch (e) {
      setReportError(e.message)
    }
    setReportLoading(false)
  }

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Date', 'Donor', 'Amount', 'Donor Total Amount', 'Donor Total Gifts', 'Status'],
      ...reportDonations.map(d => [
        format(new Date(d.date), 'MM/dd'),
        d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—',
        `$${Number(d.amount).toFixed(2)}`,
        `$${Number(d.donor?.totalAmount || 0).toFixed(2)}`,
        String(d.donor?.totalGifts ?? 0),
        d.status || '—'
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-report-${reportStart}-to-${reportEnd}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF()
    let y = 10
    doc.setFontSize(16)
    doc.text('Donations Report', 10, y)
    y += 10
    doc.setFontSize(10)
    doc.text(`Date Range: ${reportStart} to ${reportEnd}`, 10, y)
    y += 10
    doc.text(`Total Amount: $${reportSummary.total.toFixed(2)}    Total Gifts: ${reportSummary.count}    Avg Gift: $${reportSummary.avg.toFixed(2)}`, 10, y)
    y += 10

    doc.setFontSize(10)
    doc.text('Date', 10, y)
    doc.text('Donor', 28, y)
    doc.text('Amount', 90, y)
    doc.text('Donor Total', 115, y)
    doc.text('Gifts', 155, y)
    doc.text('Status', 180, y)
    y += 7
    doc.setLineWidth(0.1)
    doc.line(10, y, 200, y)
    y += 3

    doc.setFontSize(9)
    reportDonations.forEach(d => {
      if (y > 280) {
        doc.addPage()
        y = 10
      }
      doc.text(format(new Date(d.date), 'MM/dd'), 10, y)
      doc.text(d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—', 28, y)
      doc.text(`$${Number(d.amount).toFixed(2)}`, 90, y)
      doc.text(`$${Number(d.donor?.totalAmount || 0).toFixed(2)}`, 115, y)
      doc.text(String(d.donor?.totalGifts ?? 0), 155, y)
      doc.text(d.status || '—', 180, y)
      y += 7
    })

    doc.save(`donations-report-${reportStart}-to-${reportEnd}.pdf`)
  }

  useEffect(() => {
    // If a `tab` query param is present, set the active tab accordingly
    try {
      const tab = searchParams?.get?.('tab')
      if (tab && ['donors', 'donations', 'reports'].includes(tab)) {
        setActiveTab(tab)
      }
    } catch (e) {
      // ignore
    }

    async function fetchSession() {
      setCheckingUser(true)
      try {
        const res = await fetch('/api/auth/session')
        if (!res.ok) {
          setUser(null)
        } else {
          const data = await res.json()
          setUser(data.user || null)
        }
      } catch (e) {
        setUser(null)
      }
      setCheckingUser(false)
    }

    fetchSession()

    fetchSummary()
    fetchInsights()
  }, [])

  // Fetch data when tab changes or pagination changes
  useEffect(() => {
    if (activeTab === 'donors') {
      // Fetch donors when page, status filter, or sort order changes
      fetchDonors()
    }
  }, [activeTab, donorsPage, donorFilterStatus, donorSortOrder])

  useEffect(() => {
    if (activeTab === 'donors') {
      fetchDonorTotals()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'donations') {
      fetchDonations()
    }
  }, [activeTab, donationsPage])

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReport()
    }
  }, [activeTab])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your donor retention platform</p>
      </div>

      {/* Summary Cards */}
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

      {/* Recent Donations Section */}
      <div className="bg-white rounded border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Donations</h2>
          <div className="space-x-2">
            <Button variant="outline" onClick={openDonorDialog}>Add Donor</Button>
            <Button variant="outline" onClick={openDonationDialog}>Record Donation</Button>
            <Button variant="outline" onClick={() => {
              if (recentDonations.length > 0) {
                openNoteDialog(recentDonations[0])
              }
            }} disabled={recentDonations.length === 0}>
              Insert Note
            </Button>
          </div>
        </div>

        <div>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-2">Date</th>
                <th className="p-2">Donor</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr key="loading"><td colSpan="4" className="p-4 text-center text-sm text-gray-500">Loading donations…</td></tr>
              )}

              {!loading && recentDonations.length === 0 && (
                <tr key="empty"><td colSpan="4" className="p-4 text-center text-sm text-gray-500">No recent donations</td></tr>
              )}

              {recentDonations.map(d => (
                <tr key={d.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => openNoteDialog(d)}>
                  <td className="p-2">{new Date(d.date).toLocaleDateString()}</td>
                  <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—'}</td>
                  <td className="p-2">${Number(d.amount).toFixed(2)}</td>
                  <td className="p-2 text-gray-600">{d.notes || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Insights Section */}
      <div className="bg-white rounded border p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">AI Insights [{insightsScope === 'month' ? 'This Month' : 'Lifetime'}]</h2>
            <button
              type="button"
              onClick={() => {
                const newScope = insightsScope === 'month' ? 'lifetime' : 'month'
                setInsightsScope(newScope)
                fetchInsights(false, newScope)
              }}
              className="text-sm px-2 py-1 border rounded bg-white hover:bg-gray-50"
            >
              {insightsScope === 'month' ? 'Show Lifetime' : 'Show This Month'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchInsights(true)}
              disabled={insightsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${insightsLoading ? 'animate-spin' : ''}`} />
              Regenerate AI Insights
            </Button>
            <span className="text-sm text-gray-500 ml-2">You have {user?.isPro ? 250 : 50} insights per month</span>
          </div>
        </div>

        <div className="space-y-2">
          {insightsLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin inline-block mr-2" />
              Generating AI insights...
            </div>
          )}

          {insightsError && (
            <div className="p-4 text-center text-sm text-red-600">{insightsError}</div>
          )}

          {!insightsLoading && !insightsError && insights.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">No insights available</div>
          )}

          {!insightsLoading && !insightsError && insights.length > 0 && (
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setActiveTab('donors')}
          className={`px-6 py-2 rounded border font-medium transition-colors ${activeTab === 'donors'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
          Donors
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-6 py-2 rounded border font-medium transition-colors ${activeTab === 'donations'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
          Donations
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-2 rounded border font-medium transition-colors ${activeTab === 'reports'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded border p-4 min-h-[400px]">
        {/* Donors Tab */}
        {activeTab === 'donors' && (
          <div className="space-y-4">
            <div className="flex justify-end items-center gap-2">
              <Button variant="outline" onClick={openDonorDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Donor
              </Button>
              <Button variant="outline" onClick={openDonationDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Record Donation
              </Button>
            </div>

            <div className="border rounded p-4">
              <div className="font-semibold mb-2">Donor Totals</div>
              {donorTotalsError && <div className="text-sm text-red-600 mb-2">{donorTotalsError}</div>}
              <div className="flex gap-8 flex-wrap">
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="text-xl font-bold">{donorTotalsLoading ? '—' : formatCurrency(donorTotals.totalAmount)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Gifts</div>
                  <div className="text-xl font-bold">{donorTotalsLoading ? '—' : donorTotals.totalGifts}</div>
                </div>
              </div>
            </div>

            {donorsError && <div className="p-4 text-sm text-red-600">{donorsError}</div>}

            {/* Donor Filters */}
            <div className="border rounded p-3 mb-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <label className="text-sm">Name</label>
                  <input type="search" placeholder="Search name" value={donorFilterName} onChange={e => setDonorFilterName(e.target.value)} className="border rounded px-2 py-1 flex-1" />
                </div>

                <div className="flex items-center gap-2 min-w-[160px]">
                  <label className="text-sm">Tags</label>
                  <input placeholder="tag1, tag2" value={donorFilterTags} onChange={e => setDonorFilterTags(e.target.value)} className="border rounded px-2 py-1" />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                  <label className="text-sm">Email</label>
                  <input placeholder="email" value={donorFilterEmail} onChange={e => setDonorFilterEmail(e.target.value)} className="border rounded px-2 py-1" />
                </div>

                <div className="flex items-center gap-2 min-w-[160px]">
                  <label className="text-sm">City / State</label>
                  <input placeholder="city or state" value={donorFilterCityState} onChange={e => setDonorFilterCityState(e.target.value)} className="border rounded px-2 py-1" />
                </div>

                <div className="flex items-center gap-2 min-w-[140px]">
                  <label className="text-sm">Zip</label>
                  <input placeholder="zip" value={donorFilterZip} onChange={e => setDonorFilterZip(e.target.value)} className="border rounded px-2 py-1 w-28" />
                </div>

                <div className="flex items-center gap-2 min-w-[160px]">
                  <label className="text-sm">Phone</label>
                  <input placeholder="phone" value={donorFilterPhone} onChange={e => setDonorFilterPhone(e.target.value)} className="border rounded px-2 py-1" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm flex items-center gap-1">
                    Risk
                    <button
                      type="button"
                      onClick={() => setRiskPopupOpen(true)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      title="What is retention risk?"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </label>
                  <select value={donorFilterRisk} onChange={e => setDonorFilterRisk(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Any</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Status</label>
                  <select value={donorFilterStatus} onChange={e => setDonorFilterStatus(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Any</option>
                    <option value="ACTIVE">Active</option>
                    <option value="LAPSED">Lapsed</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DO_NOT_CONTACT">Do Not Contact</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Min Gifts</label>
                  <input type="number" min="0" placeholder="0" value={donorFilterMinGifts} onChange={e => setDonorFilterMinGifts(e.target.value)} className="border rounded px-2 py-1 w-20" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Sort</label>
                  <select value={donorSortOrder} onChange={e => setDonorSortOrder(e.target.value)} className="border rounded px-2 py-1">
                    <option value="totalDesc">Totals: Greatest → Least</option>
                    <option value="totalAsc">Totals: Least → Greatest</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button className="px-3 py-1 border rounded" onClick={() => {
                    setDonorFilterName(''); setDonorFilterTags(''); setDonorFilterEmail(''); setDonorFilterCityState(''); setDonorFilterZip(''); setDonorFilterPhone(''); setDonorFilterRisk(''); setDonorFilterStatus(''); setDonorFilterMinGifts(''); setDonorSortOrder('totalDesc')
                  }}>Reset</button>
                </div>
              </div>
            </div>

            {/* Filtered donors list */}
            {
              (() => {
                const filters = {
                  name: donorFilterName.trim().toLowerCase(),
                  tags: donorFilterTags.trim().toLowerCase(),
                  email: donorFilterEmail.trim().toLowerCase(),
                  citystate: donorFilterCityState.trim().toLowerCase(),
                  zip: donorFilterZip.trim(),
                  phone: donorFilterPhone.trim().toLowerCase(),
                  risk: donorFilterRisk,
                  status: donorFilterStatus,
                  minGifts: donorFilterMinGifts ? Number(donorFilterMinGifts) : null,
                }

                const matched = (Array.isArray(donors) ? donors : []).filter(d => {
                  try {
                    if (filters.name) {
                      const name = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase()
                      if (!name.includes(filters.name)) return false
                    }
                    if (filters.tags) {
                      const tagsStr = Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || '')
                      if (!tagsStr.toLowerCase().includes(filters.tags)) return false
                    }
                    if (filters.email && !(d.email || '').toLowerCase().includes(filters.email)) return false
                    if (filters.citystate) {
                      const cs = `${d.city || ''} ${d.state || ''}`.toLowerCase()
                      if (!cs.includes(filters.citystate)) return false
                    }
                    if (filters.zip && !(d.zipCode || '').includes(filters.zip)) return false
                    if (filters.phone && !(d.phone || '').toLowerCase().includes(filters.phone)) return false
                    if (filters.minGifts !== null) {
                      const giftCount = Number(d.totalGifts ?? d.giftCount ?? 0)
                      if (giftCount < filters.minGifts) return false
                    }
                    if (filters.risk) {
                      const r = calculateDonorRiskLevel(d)
                      if (r !== filters.risk) return false
                    }
                    if (filters.status) {
                      if ((d.status || '') !== filters.status) return false
                    }
                    return true
                  } catch (e) {
                    return true
                  }
                })

                const sorted = matched.sort((a, b) => {
                  const aTotal = Number(a.totalAmount || a.amount || 0)
                  const bTotal = Number(b.totalAmount || b.amount || 0)
                  if (donorSortOrder === 'totalAsc') return aTotal - bTotal
                  return bTotal - aTotal
                })

                return (
                  <DonationList
                    donations={sorted}
                    onEdit={(d) => openDonorDialog(d)}
                    onDelete={(id) => handleDeleteDonor(id)}
                    onShowRiskInfo={() => setRiskPopupOpen(true)}
                    isLoading={donorsLoading}
                  />
                )
              })()
            }

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setDonorsPage(p => Math.max(1, p - 1))}
                disabled={donorsPage === 1}
              >
                Previous
              </button>
              <span className="px-2">Page {donorsPage} of {Math.max(1, Math.ceil(donorsTotal / donorsLimit))}</span>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                onClick={() => setDonorsPage(p => p + 1)}
                disabled={donorsPage >= Math.ceil(donorsTotal / donorsLimit)}
              >
                Next
              </button>
            </div>
          </div>
        )
        }

        {/* Donations Tab */}
        {
          activeTab === 'donations' && (
            <div className="space-y-4">

              {/* Filters */}
              <div className="border rounded p-3 mb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Date</label>
                    <input type="date" value={donationFilterStart} onChange={e => setDonationFilterStart(e.target.value)} className="border rounded px-2 py-1" />
                    <span>to</span>
                    <input type="date" value={donationFilterEnd} onChange={e => setDonationFilterEnd(e.target.value)} className="border rounded px-2 py-1" />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">Type</label>
                    <select value={donationFilterType} onChange={e => setDonationFilterType(e.target.value)} className="border rounded px-2 py-1">
                      <option value="">All</option>
                      {Array.from(new Set((donations || []).map(d => d.method).filter(Boolean))).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">Amount</label>
                    <input type="number" placeholder="min" value={donationFilterMinAmount} onChange={e => setDonationFilterMinAmount(e.target.value)} className="border rounded px-2 py-1 w-24" />
                    <input type="number" placeholder="max" value={donationFilterMaxAmount} onChange={e => setDonationFilterMaxAmount(e.target.value)} className="border rounded px-2 py-1 w-24" />
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm">Donor</label>
                    <input type="search" placeholder="Search donor name" value={donationFilterDonorName} onChange={e => setDonationFilterDonorName(e.target.value)} className="border rounded px-2 py-1 flex-1" />
                  </div>
                </div>
              </div>

              {donationsLoading && <div className="p-4 text-sm text-gray-500">Loading donations…</div>}
              {donationsError && <div className="p-4 text-sm text-red-600">{donationsError}</div>}

              {!donationsLoading && donations.length === 0 && (
                <div className="p-4 text-sm text-gray-500">No donations found</div>
              )}

              {!donationsLoading && donations.length > 0 && (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="p-2">Date</th>
                      <th className="p-2">Donor</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Pay Method</th>
                      <th className="p-2">Notes</th>
                      <th className="p-2">Edit</th>
                      <th className="p-2">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(function () {
                      const start = donationFilterStart ? new Date(donationFilterStart) : null
                      const end = donationFilterEnd ? new Date(donationFilterEnd) : null
                      const min = donationFilterMinAmount ? Number(donationFilterMinAmount) : null
                      const max = donationFilterMaxAmount ? Number(donationFilterMaxAmount) : null
                      const rows = (Array.isArray(donations) ? donations : []).filter(d => {
                        try {
                          if (donationFilterType && d.method !== donationFilterType) return false
                          if (donationFilterDonorName) {
                            const name = `${d.donor?.firstName || d.firstName || ''} ${d.donor?.lastName || d.lastName || ''}`.toLowerCase()
                            if (!name.includes(donationFilterDonorName.toLowerCase())) return false
                          }
                          if (min !== null && Number(d.amount || d.totalAmount || 0) < min) return false
                          if (max !== null && Number(d.amount || d.totalAmount || 0) > max) return false
                          if (start || end) {
                            const dt = new Date(d.date || d.createdAt || d.updatedAt)
                            if (start && dt < start) return false
                            if (end) {
                              const endDay = new Date(end)
                              endDay.setHours(23, 59, 59, 999)
                              if (dt > endDay) return false
                            }
                          }
                          return true
                        } catch (e) {
                          return true
                        }
                      })
                      return rows.map((d, idx) => (
                        <tr key={d.id || `donation-${idx}`} className="border-t group hover:bg-gray-50 transition-colors">
                          <td className="p-2">{formatDate(d.date)}</td>
                          <td className="p-2">{(d.donor && `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim()) || (d.firstName || d.lastName ? `${d.firstName || ''} ${d.lastName || ''}`.trim() : '—')}</td>
                          <td className="p-2">{formatCurrency(d.amount || d.totalAmount || 0)}</td>
                          <td className="p-2">
                            {d.method ? (
                              <Badge className="bg-blue-500 text-white">{d.method}</Badge>
                            ) : (
                              <Badge className="bg-gray-300 text-black">—</Badge>
                            )}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => openNoteDialog(d)}
                              className="text-left text-gray-600 hover:text-blue-600 hover:underline"
                            >
                              {d.notes || 'Add note...'}
                            </button>
                          </td>
                          <td className="p-2 text-right">
                            <button
                              aria-label="Edit donation"
                              title="Edit donation"
                              className="text-blue-500 hover:text-white hover:bg-blue-500 rounded-full w-7 h-7 flex items-center justify-center opacity-70 group-hover:opacity-100 transition inline-flex"
                              onClick={(e) => { e.stopPropagation(); openDonationDialog(d) }}
                              type="button"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="p-2 text-right">
                            <button
                              aria-label="Delete donation"
                              title="Delete donation"
                              className="text-red-500 hover:text-white hover:bg-red-500 rounded-full w-7 h-7 flex items-center justify-center opacity-70 group-hover:opacity-100 transition"
                              onClick={(e) => { e.stopPropagation(); handleDeleteDonation(d.id) }}
                              type="button"
                              disabled={deletingId === d.id}
                            >
                              <span className="sr-only">Delete</span>
                              {deletingId === d.id ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                '×'
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setDonationsPage(p => Math.max(1, p - 1))}
                  disabled={donationsPage === 1}
                >
                  Previous
                </button>
                <span className="px-2">Page {donationsPage} of {Math.max(1, Math.ceil(donationsTotal / donationsLimit))}</span>
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setDonationsPage(p => p + 1)}
                  disabled={donationsPage >= Math.ceil(donationsTotal / donationsLimit)}
                >
                  Next
                </button>
              </div>
            </div>
          )
        }

        {/* Reports Tab */}
        {
          activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Create a Report */}
              <div className="border rounded p-4">
                <div className="font-semibold mb-2">Create a Report</div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm">Select Date Range for Report</label>
                  <input
                    type="date"
                    value={reportStart}
                    max={reportEnd}
                    onChange={e => setReportStart(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={reportEnd}
                    min={reportStart}
                    max={today}
                    onChange={e => setReportEnd(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                  <button onClick={fetchReport} className="px-4 py-1 bg-blue-600 text-white rounded">
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Report Generated */}
              <div className="border rounded p-4">
                <div className="font-semibold mb-2">Report Generated</div>
                {reportError && <div className="text-red-600 mb-2">{reportError}</div>}
                <div className="flex gap-8 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                    <div className="text-xl font-bold">${reportSummary.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Gifts</div>
                    <div className="text-xl font-bold">{reportSummary.count}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Avg Gift</div>
                    <div className="text-xl font-bold">${reportSummary.avg.toFixed(2)}</div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border">
                    <thead>
                      <tr className="bg-gray-100 text-left text-sm text-gray-600">
                        <th className="p-2">Date</th>
                        <th className="p-2">Donor</th>
                        <th className="p-2">Amount</th>
                        <th className="p-2">Donor Total Amount</th>
                        <th className="p-2">Donor Total Gifts</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportLoading ? (
                        <tr key="loading"><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                      ) : reportDonations.length === 0 ? (
                        <tr key="empty"><td colSpan={6} className="p-4 text-center">No donations found for this range.</td></tr>
                      ) : reportDonations.map((d, idx) => (
                        <tr key={d.id || `report-donation-${idx}`} className="border-t">
                          <td className="p-2">{format(new Date(d.date), 'MM/dd')}</td>
                          <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—'}</td>
                          <td className="p-2">${Number(d.amount).toFixed(2)}</td>
                          <td className="p-2">${Number(d.donor?.totalAmount || 0).toFixed(2)}</td>
                          <td className="p-2">{d.donor?.totalGifts ?? 0}</td>
                          <td className="p-2">{d.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-4 mt-4">
                  <button onClick={exportCSV} className="px-4 py-2 bg-gray-200 rounded">Export CSV</button>
                  <button onClick={exportPDF} className="px-4 py-2 bg-gray-200 rounded">Export PDF</button>
                </div>
              </div>
            </div>
          )
        }
      </div >

      {/* Note Dialog */}
      < Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} >
        <DialogContent onClose={() => setNoteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {selectedDonation?.notes ? 'Edit Note' : 'Add Note'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {selectedDonation && (
              <div className="mb-4 text-sm text-gray-600">
                <p><strong>Donor:</strong> {selectedDonation.donor ? `${selectedDonation.donor.firstName} ${selectedDonation.donor.lastName}` : '—'}</p>
                <p><strong>Amount:</strong> ${Number(selectedDonation.amount).toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(selectedDonation.date).toLocaleDateString()}</p>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter a note for this donation..."
              className="w-full border rounded-md p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {noteError && (
              <p className="text-red-600 text-sm mt-2">{noteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoteDialogOpen(false)}
              disabled={noteSaving}
            >
              Cancel
            </Button>
            <Button variant="outline"
              onClick={saveNote}
              disabled={noteSaving}
            >
              {noteSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Retention Risk Popup (Dialog) */}
      <Dialog open={riskPopupOpen} onOpenChange={setRiskPopupOpen}>
        <DialogContent onClose={() => setRiskPopupOpen(false)}>
          <DialogHeader>
            <DialogTitle>Retention Risk Explanation</DialogTitle>
          </DialogHeader>

          <div className="py-2 text-sm text-gray-700">
            <p className="mb-2">Retention Risk is derived from two factors:</p>
            <ul className="list-disc ml-5">
              <li>Donation recency: less than 3 months = Low; 3–6 months = Medium; &gt;6 months = High.</li>
              <li>Contact completeness: having a phone number or email address reduces risk (Low vs Medium).</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRiskPopupOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Donor Dialog */}
      < Dialog open={donorDialogOpen} onOpenChange={setDonorDialogOpen} >
        <DialogContent onClose={() => setDonorDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingDonorId ? `Edit ${donorForm.firstName || 'Donor'} ${donorForm.lastName || ''}`.trim() : 'Add Donor'}</DialogTitle>
          </DialogHeader>

          {donorError && <p className="text-red-600 text-sm px-4">{donorError}</p>}

          <div className="py-4">
            <DonorForm
              donor={donorForm}
              onSubmit={(payload) => saveDonor(payload)}
              onCancel={() => setDonorDialogOpen(false)}
              submitLabel={editingDonorId ? 'Update Donor' : 'Save Donor'}
            />
          </div>

        </DialogContent>
      </Dialog >

      {/* Record/Edit Donation Dialog */}
      < Dialog open={donationDialogOpen} onOpenChange={setDonationDialogOpen} >
        <DialogContent onClose={() => setDonationDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingDonationId ? `Edit Donation` : 'Record Donation'}</DialogTitle>
          </DialogHeader>

          <DonationForm
            donation={donationForm}
            donors={donors}
            onChange={(field, value) => setDonationForm(f => ({ ...f, [field]: value }))}
          />

          {donationError && <p className="text-red-600 text-sm">{donationError}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDonationDialogOpen(false)} disabled={donationSaving}>Cancel</Button>
            <Button variant="outline" onClick={saveDonation} disabled={donationSaving}>{donationSaving ? (editingDonationId ? 'Updating...' : 'Recording...') : (editingDonationId ? 'Update Donation' : 'Record Donation')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  )
}
