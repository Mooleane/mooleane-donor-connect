// Authentication API - User Registration
import { NextResponse } from 'next/server'
import { register } from '@/lib/auth'
import { createSession } from '@/lib/session'
import { jsonError } from '@/lib/api/route-response'

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, organizationId, organizationName } = body || {}

    if (!firstName || !lastName || !email || !password) {
      return jsonError('Missing required fields', 400)
    }

    try {
      const user = await register({ firstName, lastName, email, password, organizationId, organizationName })
      const token = await createSession(user.id)

      const res = NextResponse.json({ user }, { status: 201 })
      res.cookies.set('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/' })
      return res
    } catch (err) {
      if (err && err.code === 'DUPLICATE_EMAIL') {
        return jsonError('Email already exists', 409)
      }
      return jsonError('Internal server error', 500)
    }
  } catch (error) {
    return jsonError('Invalid request body', 400)
  }
} 