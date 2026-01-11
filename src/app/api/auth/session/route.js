// Authentication API - Session Check
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { jsonError } from '@/lib/api/route-response'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return jsonError('Unauthorized', 401)

    return NextResponse.json({ user: session.user }, { status: 200 })
  } catch (error) {
    console.error('GET /api/auth/session', error)
    return jsonError('Internal server error', 500)
  }
}