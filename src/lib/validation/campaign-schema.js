// Zod validation schemas for campaign operations
import { z } from 'zod'

// Enums matching Prisma schema
const CampaignStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])

const campaignBaseSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be 100 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
    goal: z.coerce.number().positive('Goal amount must be greater than 0').optional().nullable(),
    type: z.string().max(50, 'Type must be 50 characters or less').optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    status: CampaignStatusEnum.optional(),
})

export const createCampaignSchema = campaignBaseSchema.extend({
    status: CampaignStatusEnum.default('DRAFT'),
}).refine(
    (data) => {
        // If both dates are provided, endDate must be after startDate
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate
        }
        return true
    },
    { message: 'End date must be after start date', path: ['endDate'] }
)

// Update schema: all fields optional and NO defaults applied
export const updateCampaignSchema = campaignBaseSchema.partial().refine(
    (data) => {
        if (data.startDate && data.endDate) {
            return data.endDate > data.startDate
        }
        return true
    },
    { message: 'End date must be after start date', path: ['endDate'] }
)

export const campaignListQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(200, 'Limit cannot exceed 200').default(200),
    search: z.string().optional(),
    status: CampaignStatusEnum.optional(),
    sortBy: z.enum(['name', 'startDate', 'goal']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
})