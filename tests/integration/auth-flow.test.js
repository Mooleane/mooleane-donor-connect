/**
 * Integration placeholder: auth flow
 * Replace with real database interactions using tests/helpers/database.js
 */
// vitest-environment node

import { describe, it, expect, beforeEach } from 'vitest'
import { getTestPrisma } from '../helpers/database'
import { createTestUser } from '../helpers/test-data'

describe('Integration: auth flow', () => {
    let prisma

    beforeEach(() => {
        prisma = getTestPrisma()
    })

    it('creates a user and retrieves it from DB', async () => {
        const user = await prisma.user.create({ data: createTestUser({ email: 'int@example.com' }) })
        const fetched = await prisma.user.findUnique({ where: { id: user.id } })

        expect(fetched).toBeDefined()
        expect(fetched.email).toBe('int@example.com')
    })
})
