// Authentication API - User Login
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email: rawEmail, password } = body || {}

    if (!rawEmail) return NextResponse.json({ error: 'email is required' }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'password is required' }, { status: 400 })

    const email = String(rawEmail).trim()

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

    const user = await login(email, password)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = await createSession(user.id)
    const res = NextResponse.json({ user }, { status: 200 })
    // Tests expect Secure flag to be present
    res.cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/' })
    return res
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 