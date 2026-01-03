"use client"
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";

export default function ReportsPage() {
  // Default: last 7 days
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");
  const [start, setStart] = useState(weekAgo);
  const [end, setEnd] = useState(today);
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0, avg: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch donations and summary
  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const dRes = await fetch(`/api/donations?start=${start}&end=${end}`);
      const dData = await dRes.json();
      if (!dRes.ok) throw new Error(dData.error || "Failed to fetch donations");
      setDonations(dData);

      const sRes = await fetch(`/api/donations/totals?start=${start}&end=${end}`);
      const sData = await sRes.json();
      if (!sRes.ok) throw new Error(sData.error || "Failed to fetch summary");
      setSummary({
        total: sData.total,
        count: sData.count,
        avg: sData.count ? sData.total / sData.count : 0,
      });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, []);

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["Date", "Donor", "Amount", "Status"],
      ...donations.map(d => [
        format(new Date(d.date), "MM/dd"),
        d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : "—",
        `$${Number(d.amount).toFixed(2)}`,
        d.status || "—"
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-report-${start}-to-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Placeholder for PDF export
  const exportPDF = () => {
    alert("PDF export coming soon!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-2">Reports</h1>

      {/* Create a Report */}
      <section className="bg-white rounded border p-4 mb-4">
        <div className="font-semibold mb-2">Create a Report</div>
        <div className="flex items-center gap-4">
          <label className="text-sm">Select Date Range for Report</label>
          <input type="date" value={start} max={end} onChange={e => setStart(e.target.value)} className="border rounded px-2 py-1" />
          <span>to</span>
          <input type="date" value={end} min={start} max={today} onChange={e => setEnd(e.target.value)} className="border rounded px-2 py-1" />
          <button onClick={fetchReport} className="ml-4 px-4 py-1 bg-blue-600 text-white rounded">Generate Report</button>
        </div>
      </section>

      {/* Report Generated */}
      <section className="bg-white rounded border p-4">
        <div className="font-semibold mb-2">Report Generated</div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-8 mb-4">
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold">${summary.total.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Donations</div>
            <div className="text-xl font-bold">{summary.count}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Avg</div>
            <div className="text-xl font-bold">${summary.avg.toFixed(2)}</div>
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
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center">No donations found for this range.</td></tr>
              ) : donations.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{format(new Date(d.date), "MM/dd")}</td>
                  <td className="p-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : "—"}</td>
                  <td className="p-2">${Number(d.amount).toFixed(2)}</td>
                  <td className="p-2">{d.status || "—"}</td>
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
      </section>
    </div>
  );
}