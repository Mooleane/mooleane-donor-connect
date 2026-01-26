'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    // If there's a query, use the search param; otherwise fetch all organizations
    const url = query ? `/api/organizations?search=${encodeURIComponent(query)}` : `/api/organizations?limit=100`

    fetch(url, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setResults(data.organizations || [])
      })
      .catch(() => {
        if (!mounted) return
        setError('Unable to search organizations')
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [query])

  async function handleSelect(org) {
    if (!org) return

    try {
      const res = await fetch('/api/organizations/select', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id }),
      })

      if (!res.ok) {
        // fallback to storing locally if server call fails
        try { if (typeof window !== 'undefined') localStorage.setItem('selectedOrg', JSON.stringify(org)) } catch (e) { }
        router.push('/dashboard')
        return
      }

      // Success: navigate to dashboard (server session now reflects new organization)
      router.push('/dashboard')
    } catch (err) {
      try { if (typeof window !== 'undefined') localStorage.setItem('selectedOrg', JSON.stringify(org)) } catch (e) { }
      router.push('/dashboard')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError(null)
    if (!newOrgName.trim()) return setCreateError('Organization name is required')
    setCreating(true)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOrgName })
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Could not create organization')
        setCreating(false)
        return
      }

      // Redirect to dashboard after creating org
      router.push('/dashboard')
    } catch (err) {
      setCreateError('Could not create organization')
      setCreating(false)
    }
  }

  return (
    <Card className="max-w-6xl w-full mx-auto py-20 px-8 min-h-[80vh]">
      <CardHeader>
        <CardTitle>Find your organization</CardTitle>
        <CardDescription>
          Search for your organization or create a new one to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search organizations (name, city, state)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search organizations"
          />
          {loading && <div className="mt-2 text-sm text-gray-600">Searching...</div>}
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

          <div className="mt-4">
            {results.length === 0 && query && !loading ? (
              <div className="text-sm text-gray-600">No organizations found.</div>
            ) : null}

            {results.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 px-2">Action</th>
                      <th className="py-2 px-2">Organization</th>
                      <th className="py-2 px-2">City/State</th>
                      <th className="py-2 px-2">Email</th>
                      <th className="py-2 px-2">Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((org) => (
                      <tr key={org.id} className="border-t">
                        <td className="py-2 px-2">
                          <Button variant="ghost" onClick={() => handleSelect(org)}>Select</Button>
                        </td>
                        <td className="py-2 px-2 break-words max-w-xs">{org.name}</td>
                        <td className="py-2 px-2 break-words max-w-xs">{org.city || '-'}{org.state ? `, ${org.state}` : ''}</td>
                        <td className="py-2 px-2 break-words max-w-xs">{org.email || '-'}</td>
                        <td className="py-2 px-2 break-words max-w-xs">{org.website || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Demo organization: "Hope Foundation" <br />
            Can't find your organization? Add it manually.
          </div>
        </div>

        <hr className="my-6" />

        <div>
          <CardTitle className="mb-2">Create a new organization</CardTitle>
          {createError && <div className="mb-2 text-sm text-red-600">{createError}</div>}
          <form onSubmit={handleCreate} className="space-y-3">
            <Input placeholder="Organization name" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} aria-label="Organization name" />
            <div className="flex items-center gap-3">
              <Button variant="outline" type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create organization'}</Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
