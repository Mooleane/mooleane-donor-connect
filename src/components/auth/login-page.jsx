import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage({ onSubmit, loading = false, error = null }) {
    const handleSubmit = async (e) => {
        e.preventDefault()
        const form = e.target
        const email = form.email && form.email.value
        const password = form.password && form.password.value
        if (typeof onSubmit === 'function') {
            onSubmit({ email, password })
            return
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) return

            try { localStorage.setItem('donorconnect:auth', String(Date.now())); } catch (e) { }
            try { window.dispatchEvent(new CustomEvent('auth:login')); } catch (e) { }
            if (typeof window !== 'undefined') window.location.href = '/onboarding'
        } catch (err) {
            // silent fallback
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                    Sign in to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input name="email" type="email" placeholder="Email" aria-label="Email" />
                    <Input name="password" type="password" placeholder="Password" aria-label="Password" />

                    <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Demo credentials: admin@hopefoundation.org / password123
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default LoginPage
