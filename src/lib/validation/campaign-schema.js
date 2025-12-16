// Zod validation schemas for campaign operations
import { z } from 'zod'

// TODO: Define CampaignStatusEnum - DRAFT, ACTIVE, PAUSED, COMPLETED

// TODO: Define createCampaignSchema with fields:
// - name: required string, max 100 chars
// - description: optional string, max 1000 chars
// - goalAmount: optional positive number
// - startDate: coerce to date
// - endDate: optional coerce to date
// - status: CampaignStatusEnum, default DRAFT

// TODO: Define updateCampaignSchema
// TODO: Define campaignListQuerySchema