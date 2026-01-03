"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [org, setOrg] = useState({ name: "", cityState: "", email: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // ...existing code for users, invite, backups, selectedBackup...
  const [users, setUsers] = useState([
    { username: "Janedoe12", email: "jdoe12@e.com", role: "Admin", status: "Active" },
    { username: "MarsJoll07", email: "marsj07@e.com", role: "Staff", status: "Active" },
    { username: "SammyJ2", email: "samj@e.com", role: "Volunteer", status: "Invited" }
  ]);
  const [invite, setInvite] = useState({ email: "", role: "Staff" });
  const [backups] = useState([
    { date: "9/13/2025", count: 2 },
    { date: "9/13/2025", count: 1 },
    { date: "9/12/2025", count: 6 },
    { date: "9/12/2025", count: 5 },
    { date: "9/12/2025", count: 4 }
  ]);
  const [selectedBackup, setSelectedBackup] = useState(null);

  useEffect(() => {
    async function fetchOrg() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/organization");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load organization");
        setOrg({
          name: data.organization.name || "",
          cityState: data.organization.cityState || "",
          email: data.organization.email || "",
          website: data.organization.website || ""
        });
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchOrg();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-2">Settings</h1>

      {/* Organization Info */}
      <section className="bg-white rounded border p-4">
        <div className="font-semibold mb-2">Organization Info</div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <input className="border rounded px-2 py-1" placeholder="Organization Name" value={org.name} onChange={e => setOrg({ ...org, name: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="City/State" value={org.cityState} onChange={e => setOrg({ ...org, cityState: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Email" value={org.email} onChange={e => setOrg({ ...org, email: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Website (optional)" value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} />
          </div>
        )}
        <button className="mt-4 px-4 py-1 bg-blue-600 text-white rounded" disabled={loading}>Save Changes</button>
      </section>

      {/* Users & Access */}
      <section className="bg-white rounded border p-4">
        <div className="font-semibold mb-2">Users & Access</div>
        <table className="w-full table-auto mb-2">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.username} className="border-t">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.status}</td>
                <td className="p-2">{u.status !== "Active" && <button className="text-xs text-red-600 underline">Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invite Users */}
        <div className="flex items-end gap-2 mb-2">
          <input className="border rounded px-2 py-1" placeholder="email" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} />
          <select className="border rounded px-2 py-1" value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })}>
            <option>Co-Admin</option>
            <option>Staff</option>
            <option>Volunteer</option>
          </select>
          <button className="px-4 py-1 bg-blue-600 text-white rounded">Invite User</button>
        </div>
      </section>

      {/* Data Backups */}
      <section className="bg-white rounded border p-4">
        <div className="font-semibold mb-2">Data Backups (locally stored)</div>
        <div className="flex flex-col gap-1">
          {backups.map((b, i) => (
            <button
              key={i}
              className={`text-left px-2 py-1 rounded ${selectedBackup === i ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setSelectedBackup(i)}
            >
              {b.date} - {b.count}
            </button>
          ))}
        </div>
        <button className="mt-3 px-4 py-1 bg-blue-600 text-white rounded" disabled={selectedBackup === null}>Load</button>
      </section>
    </div>
  );
}
