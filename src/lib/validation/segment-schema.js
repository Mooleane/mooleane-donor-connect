// Zod validation schemas for segment operations
import { z } from 'zod'

// Segment rules are JSON structures with criteria
const SegmentRuleSchema = z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'between', 'in']),
    value: z.any(),
})

export const createSegmentSchema = z.object({
    name: z.string().min(1, 'Segment name is required').max(100, 'Segment name must be 100 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
    rules: z.array(SegmentRuleSchema).min(1, 'At least one rule is required'),
})

// Update schema: all fields optional and NO defaults applied
export const updateSegmentSchema = z.object({
    name: z.string().min(1, 'Segment name is required').max(100, 'Segment name must be 100 characters or less').optional(),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
    rules: z.array(SegmentRuleSchema).min(1, 'At least one rule is required').optional(),
})

export const segmentListQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'memberCount', 'createdAt']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
})