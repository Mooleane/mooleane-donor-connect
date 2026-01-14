"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [org, setOrg] = useState({ name: "", cityState: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const [saving, setSaving] = useState(false);


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

    // Read any organization selected during onboarding for a quick placeholder
    let hasSaved = false;
    let savedOrg = null;
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('selectedOrg');
        if (saved) {
          const parsed = JSON.parse(saved);
          savedOrg = parsed;
          const city = parsed.city || '';
          const state = parsed.state || '';
          const cityState = [city, state].filter(Boolean).join(', ');
          setOrg({
            name: parsed.name || '',
            cityState,
            website: parsed.website || ''
          });
          hasSaved = true;
          setLoading(false);
        }
      }
    } catch (e) {
      // ignore localStorage/parse errors
    }

    async function fetchOrg() {
      if (!hasSaved) setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/organization");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load organization");

        const fetched = data.organization || {};
        const fetchedCity = fetched.city || '';
        const fetchedState = fetched.state || '';
        const fetchedCityState = [fetchedCity, fetchedState].filter(Boolean).join(', ') || fetched.cityState || '';

        setOrg({
          name: fetched.name || (savedOrg && savedOrg.name) || "",
          cityState: fetchedCityState || (savedOrg && ([savedOrg.city || '', savedOrg.state || ''].filter(Boolean).join(', '))) || "",
          website: fetched.website || (savedOrg && savedOrg.website) || ""
        });
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    fetchOrg();

    // Listen for storage changes (selection made elsewhere) to update settings dynamically
    function onStorage(e) {
      if (e.key === 'selectedOrg') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            const cityState = [parsed.city || '', parsed.state || ''].filter(Boolean).join(', ');
            setOrg({
              name: parsed.name || '',
              cityState,
              website: parsed.website || ''
            });
            setLoading(false);
          } catch (err) {
            // ignore
          }
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
            <input className="border rounded px-2 py-1" placeholder="Website (optional)" value={org.website} onChange={e => setOrg({ ...org, website: e.target.value })} />
          </div>
        )}
        <button
          className="mt-4 px-4 py-1 bg-blue-600 text-white rounded"
          disabled={loading || saving}
          onClick={async () => {
            setSaving(true)
            setError("")
            try {
              const res = await fetch('/api/organization', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: org.name, cityState: org.cityState, website: org.website }),
              })
              const data = await res.json().catch(() => ({}))
              if (!res.ok) {
                setError(data.error || 'Failed to save organization')
                setSaving(false)
                return
              }

              const updated = data.organization || {}
              setOrg(prev => ({
                name: updated.name || prev.name,
                cityState: prev.cityState,
                website: prev.website,
              }))

              // update any onboarding/local selection
              try {
                if (typeof window !== 'undefined') {
                  const saved = JSON.parse(localStorage.getItem('selectedOrg') || 'null')
                  if (saved) {
                    const merged = { ...saved, name: updated.name || saved.name, website: prev.website }
                    localStorage.setItem('selectedOrg', JSON.stringify(merged))
                  }
                }
              } catch (e) {
                // ignore localStorage errors
              }

              alert('Organization updated')
            } catch (e) {
              setError(e.message || 'Failed to save organization')
            }
            setSaving(false)
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </section>

      {/* Account / Sign Out */}
      {checkingSession ? null : user ? (
        <>
          <section className="bg-white rounded border p-4 mb-4">
            <div className="font-semibold mb-2">Upgrade to Pro</div>
            <div className="text-sm text-gray-700 mb-3">Current tier: <strong>{user.isPro ? 'Pro' : 'Free'}</strong></div>
            {user.isPro ? (
              <div className="text-sm text-gray-500">You have Pro access and receive 5x AI insights.</div>
            ) : (
              <button
                className="px-4 py-1 bg-green-600 text-white rounded"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/auth/upgrade', { method: 'POST' })
                    if (!res.ok) {
                      const data = await res.json().catch(() => ({}))
                      alert(data?.error || 'Upgrade failed')
                      return
                    }
                    const data = await res.json()
                    setUser(data.user || null)
                    alert('Upgraded to Pro, you have 5x more AI insights!')
                  } catch (e) {
                    alert(e.message || 'Upgrade failed')
                  }
                }}
              >
                Upgrade to Pro
              </button>
            )}
          </section>

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
        </>
      ) : null}
    </main>
  );
}
