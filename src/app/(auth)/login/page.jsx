'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginPageComponent from '@/components/auth/login-page'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit({ email, password }) {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      try { localStorage.setItem('donorconnect:auth', String(Date.now())); } catch (e) { }
      try { window.dispatchEvent(new CustomEvent('auth:login')); } catch (e) { }
      router.push('/onboarding')
    } catch (err) {
      setError('Login failed')
      setLoading(false)
    }
  }

  return <LoginPageComponent onSubmit={handleSubmit} loading={loading} error={error} />
}