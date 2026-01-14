"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [org, setOrg] = useState({ name: "", cityState: "", email: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();


  useEffect(() => {
    async function fetchSession() {
      setCheckingSession(true);
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user || null);
        }
      } catch (e) {
        setUser(null);
      }
      setCheckingSession(false);
    }
    fetchSession();

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
    <main className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-2">Settings</h1>

      {/* Organization Info */}
      <section className="bg-white rounded border p-4">
        <div className="font-semibold mb-2">Organization Info [admin-only modification]</div>
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

      {/* Account / Sign Out */}
      {checkingSession ? null : user ? (
        <section className="bg-white rounded border p-4">
          <div className="font-semibold mb-2">Account</div>
          <div className="text-sm text-gray-700 mb-3">Signed in as <strong>{user.email || user.name || 'user'}</strong></div>
          <button
            className="px-4 py-1 bg-red-600 text-white rounded"
            onClick={async () => {
              setLoggingOut(true);
              try {
                const res = await fetch('/api/auth/logout', { method: 'POST' });
                if (res.ok) {
                  router.push('/login');
                } else {
                  const data = await res.json();
                  alert(data?.error || 'Failed to log out');
                  setLoggingOut(false);
                }
              } catch (e) {
                alert(e.message || 'Failed to log out');
                setLoggingOut(false);
              }
            }}
            disabled={loggingOut}
          >
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </section>
      ) : null}
    </main>
  );
}
