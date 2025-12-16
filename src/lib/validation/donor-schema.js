// Zod validation schemas for donor operations
import { z } from 'zod'

// TODO: Define DonorStatusEnum - ACTIVE, LAPSED, PENDING, INACTIVE

// TODO: Define RetentionRiskEnum - LOW, MEDIUM, HIGH, CRITICAL

// TODO: Define createDonorSchema with fields:
// - firstName: required string, max 50 chars
// - lastName: required string, max 50 chars  
// - email: required email format
// - phone: optional string, max 20 chars
// - address: optional object with street, city, state, zip
// - status: DonorStatusEnum, default ACTIVE
// - retentionRisk: RetentionRiskEnum, default LOW
// - notes: optional string, max 1000 chars

// TODO: Define updateDonorSchema - same as create but all fields optional

// TODO: Define donorListQuerySchema with fields:
// - page: coerce to number, min 1, default 1
// - limit: coerce to number, min 1, max 100, default 20
// - search: optional string
// - status: optional DonorStatusEnum
// - retentionRisk: optional RetentionRiskEnum
// - sortBy: enum of sortable fields, default 'firstName'
// - sortOrder: 'asc' or 'desc', default 'asc'