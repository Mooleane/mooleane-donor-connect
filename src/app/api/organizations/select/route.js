import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { jsonError } from '@/lib/api/route-response'
import { selectOrganizationSchema } from '@/lib/validation/organization-schema'

export async function POST(request) {
    try {
        const sessionToken = request.cookies.get('session')?.value
        const session = await getSession(sessionToken)
        if (!session) return jsonError('Unauthorized', 401)

        const body = await request.json().catch(() => null)
        const parsed = selectOrganizationSchema.safeParse(body)
        if (!parsed.success) return jsonError('Invalid request body', 400, parsed.error.flatten())

        const orgId = parsed.data.organizationId
        const organization = await prisma.organization.findUnique({ where: { id: orgId } })
        if (!organization) return jsonError('Organization not found', 404)

        await prisma.user.update({ where: { id: session.user.id }, data: { organizationId: orgId } })

        return NextResponse.json({ organization: { id: organization.id, name: organization.name } })
    } catch (err) {
        return jsonError('Internal server error', 500)
    }
}
