// Zod validation schemas for donation operations
import { z } from 'zod'

// TODO: Define DonationTypeEnum - ONE_TIME, RECURRING, PLEDGE, IN_KIND


export const createDonationSchema = z.object({
	donorId: z.string().min(1),
	campaignId: z.string().optional().nullable(),
	amount: z.coerce.number().positive(),
	date: z.coerce.date(),
	// type: z.nativeEnum(DonationTypeEnum).default('ONE_TIME'), // Uncomment if enum is defined
	method: z.string().max(50).optional().nullable(),
	notes: z.string().max(1000).optional().nullable(),
})

// TODO: Define updateDonationSchema - same as create but all fields optional

// TODO: Define donationListQuerySchema with filtering and pagination options
