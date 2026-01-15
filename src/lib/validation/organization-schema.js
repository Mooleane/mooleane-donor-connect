import { z } from 'zod'

export const organizationsListQuerySchema = z.object({
    search: z.string().max(200, 'Search must be 200 characters or less').optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
})

export const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Organization name is required').max(200, 'Organization name must be 200 characters or less'),
})

export const selectOrganizationSchema = z.object({
    organizationId: z.string().min(1, 'organizationId is required'),
})
