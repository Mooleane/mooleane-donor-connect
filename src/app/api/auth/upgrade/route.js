import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { jsonError } from '@/lib/api/route-response'

export async function POST(request) {
    try {
        const sessionToken = request.cookies.get('session')?.value
        const session = await getSession(sessionToken)
        if (!session) return jsonError('Unauthorized', 401)

        // For MVP, simply mark the user as pro. Real implementation should verify payment.
        const updated = await prisma.user.update({ where: { id: session.user.id }, data: { isPro: true } })

        // Return updated user (omit sensitive fields)
        const { password, ...safeUser } = updated
        return NextResponse.json({ user: safeUser }, { status: 200 })
    } catch (error) {
        console.error('POST /api/auth/upgrade', error)
        return jsonError('Internal server error', 500)
    }
}
