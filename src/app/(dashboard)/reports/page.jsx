import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ReportsPage() {
  const user = await getSessionUser()
  if (!user) return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-gray-600">Unauthorized</p>
    </div>
  )

  const donations = await prisma.donation.findMany({
    where: { donor: { organizationId: user.organizationId } },
    orderBy: { date: 'desc' },
    include: { donor: true, campaign: true }
  })

  const total = donations.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600 mt-2">Auto-generated report for all donations</p>
      </div>

      <div className="p-4 bg-white rounded border">
        <div className="text-sm text-gray-500">Total Donations</div>
        <div className="text-2xl font-semibold">{donations.length}</div>
        <div className="text-sm text-gray-500 mt-2">Total Raised</div>
        <div className="text-2xl font-semibold">${total.toFixed(2)}</div>
      </div>

      <div className="bg-white rounded border p-4">
        <h2 className="text-lg font-semibold mb-2">All Donations</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Date</th>
              <th className="p-2">Donor</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Campaign</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{new Date(d.date).toLocaleDateString()}</td>
                <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : '—'}</td>
                <td className="p-2">${Number(d.amount).toFixed(2)}</td>
                <td className="p-2">{d.campaign ? d.campaign.name : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <Link href="/dashboard"><a className="text-sm text-blue-600">Back to Dashboard</a></Link>
      </div>
    </div>
  )
}