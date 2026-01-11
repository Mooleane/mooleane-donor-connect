// Authentication API - User Login
import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { jsonError } from '@/lib/api/route-response'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email: rawEmail, password } = body || {}

    if (!rawEmail) return jsonError('email is required', 400)
    if (!password) return jsonError('password is required', 400)

    const email = String(rawEmail).trim()

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return jsonError('Invalid email format', 400)

    const user = await login(email, password)
    if (!user) return jsonError('Invalid credentials', 401)

    const token = await createSession(user.id)
    const res = NextResponse.json({ user }, { status: 200 })
    // Tests expect Secure flag to be present
    res.cookies.set('session', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/' })
    return res
  } catch (error) {
    return jsonError('Internal server error', 500)
  }
} 