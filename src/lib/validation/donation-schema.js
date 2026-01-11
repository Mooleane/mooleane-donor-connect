// Zod validation schemas for donation operations
import { z } from 'zod'

// Enums matching Prisma schema
const DonationTypeEnum = z.enum(['ONE_TIME', 'RECURRING', 'PLEDGE', 'IN_KIND'])

export const createDonationSchema = z.object({
	donorId: z.string().min(1, 'Donor ID is required'),
	campaignId: z.string().optional().nullable(),
	amount: z.coerce.number().positive('Amount must be greater than 0'),
	date: z.coerce.date(),
	type: DonationTypeEnum.default('ONE_TIME'),
	method: z.string().max(50, 'Method must be 50 characters or less').optional().nullable(),
	notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})

// Update schema: all fields optional and NO defaults applied
export const updateDonationSchema = z.object({
	campaignId: z.string().optional().nullable(),
	amount: z.coerce.number().positive('Amount must be greater than 0').optional(),
	date: z.coerce.date().optional(),
	type: DonationTypeEnum.optional(),
	method: z.string().max(50, 'Method must be 50 characters or less').optional().nullable(),
	notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})

export const donationListQuerySchema = z.object({
	page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
	limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
	start: z.string().optional(),
	end: z.string().optional(),
	donorId: z.string().optional(),
	campaignId: z.string().optional(),
	type: DonationTypeEnum.optional(),
	sortBy: z.enum(['date', 'amount']).default('date'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
	(val) => {
		if (!val.start && !val.end) return true
		if (val.start && !Number.isNaN(Date.parse(val.start)) && val.end && !Number.isNaN(Date.parse(val.end))) {
			return Date.parse(val.end) >= Date.parse(val.start)
		}
		return false
	},
	{ message: 'Invalid start/end date range', path: ['end'] }
)
