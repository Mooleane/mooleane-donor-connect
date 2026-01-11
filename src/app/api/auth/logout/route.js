// Authentication API - User Logout
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'
import { jsonError } from '@/lib/api/route-response'

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    await deleteSession(sessionToken)

    const res = NextResponse.json({ ok: true }, { status: 200 })
    // Clear cookie
    res.cookies.set('session', '', { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 0 })
    return res
  } catch (error) {
    console.error('POST /api/auth/logout', error)
    return jsonError('Internal server error', 500)
  }
}