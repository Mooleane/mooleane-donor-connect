// Authentication API - User Registration
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, organizationId, organizationName } = body || {}

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    try {
      const user = await register({ firstName, lastName, email, password, organizationId, organizationName })
      const token = await createSession(user.id)

      const res = NextResponse.json({ user }, { status: 201 })
      res.cookies.set('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' })
      return res
    } catch (err) {
      if (err && err.code === 'DUPLICATE_EMAIL') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
} 