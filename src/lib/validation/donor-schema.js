// Zod validation schemas for donor operations
import { z } from 'zod'

// Enums matching Prisma schema
const DonorStatusEnum = z.enum(['ACTIVE', 'LAPSED', 'INACTIVE', 'DO_NOT_CONTACT'])
const RetentionRiskEnum = z.enum(['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

const donorBaseSchema = z.object({
    // Matches current UI/API contract for creating donors
    type: z.enum(['individual', 'organization']).default('individual'),
    firstName: z.string().max(50, 'First name must be 50 characters or less').optional(),
    lastName: z.string().max(50, 'Last name must be 50 characters or less').optional(),
    organizationName: z.string().max(100, 'Organization name must be 100 characters or less').optional(),

    email: z.string().email('Invalid email format').optional().nullable(),
    phone: z.string().max(20, 'Phone must be 20 characters or less').optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    status: DonorStatusEnum.optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'mail']).optional(),
    tags: z.string().optional().nullable(),
    retentionRisk: RetentionRiskEnum.optional(),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})

export const createDonorSchema = donorBaseSchema.superRefine((val, ctx) => {
    if (val.type === 'organization') {
        if (!val.organizationName || val.organizationName.trim() === '') {
            ctx.addIssue({ path: ['organizationName'], code: z.ZodIssueCode.custom, message: 'Organization name is required' })
        }
    } else {
        if (!val.firstName || val.firstName.trim() === '') {
            ctx.addIssue({ path: ['firstName'], code: z.ZodIssueCode.custom, message: 'First name is required' })
        }
    }
})

// Update schema: all fields optional and NO defaults applied
export const updateDonorSchema = z.object({
    firstName: z.string().max(50, 'First name must be 50 characters or less').optional(),
    lastName: z.string().max(50, 'Last name must be 50 characters or less').optional(),
    email: z.string().email('Invalid email format').optional().nullable(),
    phone: z.string().max(20, 'Phone must be 20 characters or less').optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    status: DonorStatusEnum.optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'mail']).optional(),
    tags: z.string().optional().nullable(),
    retentionRisk: RetentionRiskEnum.optional(),
    notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})

export const donorListQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(500, 'Limit cannot exceed 500').default(200),
    search: z.string().optional(),
    status: DonorStatusEnum.optional(),
    retentionRisk: RetentionRiskEnum.optional(),
    sort: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
})