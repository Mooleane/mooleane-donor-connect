// Zod validation schemas for workflow operations
import { z } from 'zod'

// Enums matching Prisma schema
const WorkflowTriggerEnum = z.enum(['FIRST_DONATION', 'DONATION_RECEIVED', 'INACTIVITY_THRESHOLD', 'SEGMENT_ENTRY', 'MANUAL', 'SCHEDULED'])

// Workflow steps are JSON structures
const WorkflowStepSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['email', 'task', 'segment_update', 'delay']),
    config: z.record(z.any()),
})

export const createWorkflowSchema = z.object({
    name: z.string().min(1, 'Workflow name is required').max(100, 'Workflow name must be 100 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
    trigger: WorkflowTriggerEnum,
    segmentId: z.string().optional().nullable(),
    steps: z.array(WorkflowStepSchema).min(1, 'At least one step is required'),
    isActive: z.boolean().default(false),
})

// Update schema: all fields optional and NO defaults applied
export const updateWorkflowSchema = z.object({
    name: z.string().min(1, 'Workflow name is required').max(100, 'Workflow name must be 100 characters or less').optional(),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
    trigger: WorkflowTriggerEnum.optional(),
    segmentId: z.string().optional().nullable(),
    steps: z.array(WorkflowStepSchema).min(1, 'At least one step is required').optional(),
    isActive: z.coerce.boolean().optional(),
})

export const workflowListQuerySchema = z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(200, 'Limit cannot exceed 200').default(20),
    search: z.string().optional(),
    trigger: WorkflowTriggerEnum.optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(['name', 'createdAt', 'executionCount']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
})