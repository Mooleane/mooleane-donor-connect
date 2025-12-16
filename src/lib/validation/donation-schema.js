// Zod validation schemas for donation operations
import { z } from 'zod'

// TODO: Define DonationTypeEnum - ONE_TIME, RECURRING, PLEDGE, IN_KIND

// TODO: Define createDonationSchema with fields:
// - donorId: required string, cuid format
// - campaignId: optional string, cuid format (nullable)
// - amount: coerce to positive number
// - date: coerce to date
// - type: DonationTypeEnum, default ONE_TIME
// - method: optional string, max 50 chars (nullable)
// - notes: optional string, max 1000 chars (nullable)

// TODO: Define updateDonationSchema - same as create but all fields optional

// TODO: Define donationListQuerySchema with filtering and pagination options
