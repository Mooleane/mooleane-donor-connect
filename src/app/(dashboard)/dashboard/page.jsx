'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { format, subDays } from 'date-fns'
import jsPDF from 'jspdf'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export default function DashboardPage() {
  // Dashboard summary state
  const [summary, setSummary] = useState(null)
  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(true)

  // Tab state
  const [activeTab, setActiveTab] = useState('donors')

  // Donors tab state
  const [donors, setDonors] = useState([])
  const [donorsLoading, setDonorsLoading] = useState(false)
  const [donorsError, setDonorsError] = useState('')
  const [donorsPage, setDonorsPage] = useState(1)
  const [donorsTotal, setDonorsTotal] = useState(0)
  const donorsLimit = 10

  // Donations tab state
  const [donations, setDonations] = useState([])
  const [donationsLoading, setDonationsLoading] = useState(false)
  const [donationsError, setDonationsError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [donationsPage, setDonationsPage] = useState(1)
  const [donationsTotal, setDonationsTotal] = useState(0)
  const donationsLimit = 10

  // Notes dialog state
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState('')

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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save note')
      }
      const updated = await res.json()

      // Update the donation in all relevant state arrays
      setRecentDonations(prev => prev.map(d => d.id === updated.id ? { ...d, notes: updated.notes } : d))
      setDonations(prev => prev.map(d => d.id === updated.id ? { ...d, notes: updated.notes } : d))
      setReportDonations(prev => Array.isArray(prev) ? prev.map(d => d.id === updated.id ? { ...d, notes: updated.notes } : d) : prev)

      setNoteDialogOpen(false)
      setSelectedDonation(null)
      setNoteText('')
    } catch (err) {
      setNoteError(err.message || 'Failed to save note')
    } finally {
      setNoteSaving(false)
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
      const res = await fetch(`/api/donors?sort=totalDesc&page=${donorsPage}&limit=${donorsLimit}`)
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
      setReportDonations(dData)

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
      ['Date', 'Donor', 'Amount', 'Status'],
      ...reportDonations.map(d => [
        format(new Date(d.date), 'MM/dd'),
        d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—',
        `$${Number(d.amount).toFixed(2)}`,
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
    doc.text(`Total: $${reportSummary.total.toFixed(2)}    Donations: ${reportSummary.count}    Avg: $${reportSummary.avg.toFixed(2)}`, 10, y)
    y += 10

    doc.setFontSize(12)
    doc.text('Date', 10, y)
    doc.text('Donor', 40, y)
    doc.text('Amount', 110, y)
    doc.text('Status', 150, y)
    y += 7
    doc.setLineWidth(0.1)
    doc.line(10, y, 200, y)
    y += 3

    doc.setFontSize(10)
    reportDonations.forEach(d => {
      if (y > 280) {
        doc.addPage()
        y = 10
      }
      doc.text(format(new Date(d.date), 'MM/dd'), 10, y)
      doc.text(d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—', 40, y)
      doc.text(`$${Number(d.amount).toFixed(2)}`, 110, y)
      doc.text(d.status || '—', 150, y)
      y += 7
    })

    doc.save(`donations-report-${reportStart}-to-${reportEnd}.pdf`)
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  // Fetch data when tab changes or pagination changes
  useEffect(() => {
    if (activeTab === 'donors') {
      fetchDonors()
    }
  }, [activeTab, donorsPage])

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
            <Link href="/donors/new">
              <Button>Add Donor</Button>
            </Link>
            <Link href="/donations/new">
              <Button>Record Donation</Button>
            </Link>
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
                <tr><td colSpan="4" className="p-4 text-center text-sm text-gray-500">Loading donations…</td></tr>
              )}

              {!loading && recentDonations.length === 0 && (
                <tr><td colSpan="4" className="p-4 text-center text-sm text-gray-500">No recent donations</td></tr>
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
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Donors</h2>
              <Link href="/donors/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Donor
                </Button>
              </Link>
            </div>

            {donorsLoading && <div className="p-4 text-sm text-gray-500">Loading donors…</div>}
            {donorsError && <div className="p-4 text-sm text-red-600">{donorsError}</div>}

            {!donorsLoading && donors.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No donors found</div>
            )}

            {!donorsLoading && donors.length > 0 && (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-2">Donor</th>
                    <th className="p-2">Phone</th>
                    <th className="p-2">City / State</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map(d => (
                    <tr key={d.id} className="border-t">
                      <td className="p-2">{`${d.firstName || ''} ${d.lastName || ''}`.trim() || '—'}</td>
                      <td className="p-2">{d.phone || '—'}</td>
                      <td className="p-2">{d.city ? `${d.city}${d.state ? ', ' + d.state : ''}` : (d.state ? d.state : '—')}</td>
                      <td className="p-2">{formatCurrency(d.totalAmount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

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
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Donations</h2>
              <Link href="/donations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Donation
                </Button>
              </Link>
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
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id} className="border-t group hover:bg-gray-50 transition-colors">
                      <td className="p-2">{formatDate(d.date)}</td>
                      <td className="p-2">{(d.donor && `${d.donor.firstName || ''} ${d.donor.lastName || ''}`.trim()) || '—'}</td>
                      <td className="p-2">{formatCurrency(d.amount || 0)}</td>
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
                  ))}
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
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-center">Reports</h2>

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
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-xl font-bold">${reportSummary.total.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Donations</div>
                  <div className="text-xl font-bold">{reportSummary.count}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg</div>
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
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportLoading ? (
                      <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                    ) : reportDonations.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center">No donations found for this range.</td></tr>
                    ) : reportDonations.map(d => (
                      <tr key={d.id} className="border-t">
                        <td className="p-2">{format(new Date(d.date), 'MM/dd')}</td>
                        <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—'}</td>
                        <td className="p-2">${Number(d.amount).toFixed(2)}</td>
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
        )}
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
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
            <Button
              onClick={saveNote}
              disabled={noteSaving}
            >
              {noteSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
