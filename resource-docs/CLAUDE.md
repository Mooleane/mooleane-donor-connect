# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DonorConnect** is a donor retention platform focused on solving the first-to-second gift conversion problem for nonprofits. The platform helps small and mid-sized nonprofits improve donor retention through data integration, AI-powered insights, and automated stewardship workflows.

### Core Value Proposition
- Centralize fragmented donor data from CRMs, email platforms, and donation processors
- Identify at-risk first-time donors and provide "next best action" recommendations
- Automate timely, personalized follow-up communications
- Enable resource-constrained teams to operate proactively rather than reactively

### Primary Users
- Development/advancement staff (donor relations managers, major gifts officers)
- Marketing and communications teams
- Database/CRM administrators

## Architecture Overview

### Technology Stack (MVP Implementation)
- **Frontend**: Next.js 14 (App Router) - **JavaScript** (no TypeScript for MVP)
- **Backend**: Next.js API routes (REST endpoints)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Simple email/password auth with bcrypt + HTTP-only cookie sessions
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Testing**: Vitest (unit/component) + Playwright (E2E) + MSW (API mocking)
- **Package Manager**: pnpm

**Future Enhancements** (post-MVP):
- TypeScript migration
- Advanced auth (Auth0/Clerk/Cognito with SSO/SAML)
- Job queue (BullMQ) for async processing
- Analytics warehouse (BigQuery/Snowflake/Redshift)
- CRM and email integrations

### System Components

1. **Frontend Application (Web)**
   - Dashboard with donor profiles, giving history, engagement timelines
   - Campaign/workflow setup for first-to-second gift journeys
   - "Next best action" UI with recommended outreach
   - Data quality/mapping interface (field mapping, duplicate review)
   - Reporting dashboards (retention trends, cohort metrics, conversion funnels)

2. **Backend API (Core Application Server)**
   - REST/GraphQL endpoints
   - RBAC (role-based access control)
   - Business logic for donor lifecycle states, segmentation, workflows
   - Organization-level configuration management
   - Audit logging for sensitive actions

3. **Data Layer**
   - **Operational DB (Postgres)**: Canonical "golden record" donor profiles, gifts, interactions, segments, tasks, workflows
   - **Analytics Warehouse (optional for MVP)**: Denormalized event data for cohort analysis, funnels, attribution

4. **Integrations Layer**
   - CRM connectors (Salesforce NPSP, Bloomerang, DonorPerfect, Blackbaud)
   - Email platform connectors (Mailchimp, HubSpot, Constant Contact)
   - Donation processor connectors (Stripe, PayPal, Classy)
   - Handles incremental sync, retries, rate limits, webhooks, deduplication

5. **Automation & Orchestration**
   - **Job Queue**: Scheduled syncs, workflow execution, data refresh jobs
   - **Workflow/Rules Engine**: Journey definitions (first gift → thank you → impact story → second ask), trigger rules, task generation for staff

6. **Messaging & Notification Services**
   - Transactional email (SendGrid, Postmark, Amazon SES)
   - Template management with personalization tokens
   - Delivery/bounce tracking

7. **AI/Analytics Services**
   - Donor scoring (retention risk, likelihood of second gift)
   - Segmentation recommendations
   - Explanation generation (why a donor is flagged)
   - Start with rules-based for MVP, add ML as data matures

8. **Observability & Admin**
   - Logging, metrics, traces
   - Alerting (sync failures, email deliverability, job backlogs)
   - Audit trail
   - User management and data quality monitoring

## Development Commands

### Project Initialization
```bash
# Initialize Next.js project
pnpm create next-app@latest . --tailwind --app --src-dir

# Install dependencies
pnpm install
```

### Database Operations
```bash
# Install Prisma
pnpm add -D prisma && pnpm add @prisma/client

# Generate Prisma client (ALWAYS run after schema changes)
npx prisma generate

# Create and run migrations
npx prisma migrate dev
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database with test data
npx prisma db seed
```

### Development
```bash
# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing
```bash
# Install test dependencies
pnpm add -D vitest @vitejs/plugin-react jsdom
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D msw
pnpm create playwright

# Run Vitest tests (unit + component)
pnpm test

# Run Vitest in watch mode
pnpm test:watch

# Open Vitest UI
pnpm test:ui

# Run Playwright E2E tests
pnpm test:e2e

# Run Playwright in headed mode (see browser)
pnpm test:e2e --headed

# Run single test file
pnpm test src/components/donors/donor-form.test.jsx
```

### UI Components (shadcn/ui)
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form

# Add multiple components at once
npx shadcn-ui@latest add button card dialog form input label select table tabs toast dropdown-menu avatar badge checkbox textarea calendar popover separator skeleton alert progress sheet
```

## Testing Strategy

### Test Architecture (Vitest + Playwright)

**Two Test Runtimes:**
- **Client-side tests** (`jsdom` environment): React components, hooks, browser behavior
- **Server-side tests** (`node` environment): API routes, business logic, database access

**Client-Side Testing (Default)**
- Vitest config defaults to `jsdom` environment
- React Testing Library (RTL) + `@testing-library/jest-dom`
- MSW (Mock Service Worker) for API mocking
- Component tests automatically run in JSDOM
- Hooks testing via `renderHook` from RTL

**Server-Side Testing (Per-File Override)**
- Use `@vitest-environment node` comment at top of test file
- Direct invocation of Next.js route handlers
- No MSW or JSDOM overhead
- Example location: `/src/app/api/donors/recent/route.test.ts`

**E2E Testing (Playwright)**
- Runs in real browser, completely isolated from Vitest
- Use `page.route()` for network mocking or hit seeded backend
- Test files in `/tests/e2e/`

**Test File Organization:**
```
/src
  /components
    /onboarding
    /explore
  /hooks
  /lib
    /api
    /validation
  /__tests__
    /components
      /onboarding
      /explore
    /hooks
    /api
/tests
  /e2e
    onboarding.spec.ts
    explore.spec.ts
```

## Code Architecture Principles

### MVP-First Approach
- Start with minimal viable features that deliver immediate retention lift
- Avoid over-engineering: don't add features, refactoring, or "improvements" beyond requirements
- Focus on 1-2 key integrations (one CRM + one email provider)
- Use rules-based scoring before introducing ML

### Data Integration Strategy
- Normalize external schemas to internal canonical model
- Handle imperfect/incomplete data gracefully (nonprofits have messy data)
- Progressive improvement model rather than requiring data maturity upfront
- Clear field mapping UI for admins

### Workflow Engine Design
- Journey definitions: "first gift → thank you → impact story → second ask"
- Event-based triggers (donation received, inactivity threshold)
- Priority-based task generation for staff
- Support both automated communications and human touchpoints

### Security & Privacy
- Donor privacy is paramount (nonprofit trust considerations)
- Transparent data usage
- Human-in-the-loop design (avoid "creepy" over-automation)
- Audit trail for all donor data access and modifications

### External Service Integration
- Rate limit handling for all CRM/email APIs
- Webhook support where available, polling fallback
- Retry logic with exponential backoff
- Dead-letter queues for failed jobs
- Domain authentication for email (SPF/DKIM/DMARC)

## Key Business Constraints

### User Constraints
- Small nonprofit teams (understaffed, overextended)
- Limited technical sophistication
- Budget-sensitive (ROI must be explicit and fast)
- Change management fatigue ("another tool" skepticism)

### Product Principles
- **Low learning curve**: Minimal setup, clear onboarding, "time to first win"
- **Efficiency gains over workload**: Don't add complexity
- **Works with imperfect data**: Tolerant of messy/incomplete records
- **Actionable over informational**: Provide "next best action", not just reports
- **Complementary positioning**: Position as enhancement to existing CRM, not replacement

### Success Metrics
- Increased first-to-second gift conversion rate
- Stabilization/reversal of donor retention decline
- Higher donor lifetime value
- Reduced time spent on manual reporting and list building
- Staff confidence in prioritization decisions

## Development Guidelines

### When Writing Code
1. **Security First**: Prevent command injection, XSS, SQL injection, and OWASP Top 10 vulnerabilities
2. **Simplicity**: Only make changes directly requested or clearly necessary
3. **No Premature Abstraction**: Don't create helpers/utilities for one-time operations
4. **Trust Internal Code**: Only validate at system boundaries (user input, external APIs)
5. **Clean Deletion**: Remove unused code completely (no backwards-compatibility hacks like `_unused` variables or `// removed` comments)
6. **Donor Data Sensitivity**: Treat all donor data as PII requiring careful handling

### Database Schema Considerations
- Operational DB (Postgres) stores canonical donor profiles
- Key entities: donors, gifts, interactions, consent/preferences, segments, tasks, workflows, communication_events
- Integration metadata: sync status, field mappings, error logs
- Design for eventual consistency with external CRMs

### API Design
- RBAC enforcement on all endpoints
- Organization-level multi-tenancy
- Rate limiting for external-facing endpoints
- Comprehensive audit logging for donor data access
- Clear error messages for integration failures

## MVP Scope and Critical Patterns

### MVP Features (Standard Option - 25 Days)
- ✅ Core donor management (CRUD) with dashboard
- ✅ Campaign management (create, track goals, view donations)
- ✅ Donation recording with automatic donor metric updates
- ✅ Segment builder with rule-based filtering
- ✅ Workflow builder with step configuration (triggers, delays, conditions)
- ✅ Task management with filtering and assignment
- ✅ Session-based authentication with bcrypt
- ✅ Full test coverage (Vitest + Playwright + MSW)
- ❌ **Not included in MVP**: CRM integrations, email integrations, external API connectors

### Critical Implementation Patterns

#### 1. Session-Based Authentication Pattern
```javascript
// Create session on login (src/lib/session.js)
const token = crypto.randomUUID();
await prisma.session.create({
  data: {
    userId,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
});

// Set HTTP-only cookie
cookies().set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,
  path: '/'
});
```

#### 2. API Route Pattern (All Endpoints)
```javascript
// Standard structure for all API routes
export async function POST(request) {
  // 1. Get session token from cookie
  const token = request.cookies.get('session')?.value;

  // 2. Validate user authentication
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 3. Parse and validate with Zod
  const body = await request.json();
  const data = schema.parse(body); // Throws ZodError if invalid

  // 4. Call business logic function
  const result = await createEntity({ ...data, organizationId: user.organizationId });

  // 5. Return typed JSON response
  return NextResponse.json(result, { status: 201 });
}
```

#### 3. Form Pattern (React Hook Form + Zod)
```javascript
// Reusable pattern for all forms
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});

async function onSubmit(values) {
  const res = await fetch('/api/donors', {
    method: 'POST',
    body: JSON.stringify(values)
  });

  if (res.ok) {
    toast({ title: 'Success' });
    router.push('/donors');
  } else {
    toast({ title: 'Error', variant: 'destructive' });
  }
}

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField name="firstName" ... />
    </form>
  </Form>
);
```

#### 4. Server-Side vs Client-Side Testing
```javascript
// Server-side tests (API routes) - Add at top of file:
/**
 * @vitest-environment node
 */

// Client-side tests (components) - No annotation needed (default)
// Uses JSDOM + RTL + MSW automatically
```

### 15 Critical Files That Establish All Patterns

Once these files are correctly implemented, all other features follow the same patterns:

**Foundation:**
1. `prisma/schema.prisma` - Complete database schema
2. `prisma/seed.js` - Realistic seed data (50+ donors, 200+ donations)

**Authentication:**
3. `src/lib/session.js` - Session management pattern
4. `src/middleware.js` - Route protection pattern
5. `src/app/api/auth/login/route.js` - Auth endpoint pattern

**API Layer:**
6. `src/app/api/donors/route.js` - API route pattern (GET list, POST create)
7. `src/lib/api/donors.js` - Business logic separation pattern
8. `src/lib/validation/donor-schema.js` - Zod validation pattern

**UI Layer:**
9. `src/app/(dashboard)/layout.jsx` - App layout structure
10. `src/app/(dashboard)/donors/page.jsx` - List page pattern
11. `src/components/donors/donor-form.jsx` - Form component pattern

**Testing:**
12. `vitest.config.js` - Test configuration
13. `tests/setup.client.js` - MSW setup pattern
14. `tests/handlers/donors.js` - MSW handler pattern
15. `tests/e2e/donors.spec.js` - E2E test pattern

### Database Schema Overview

**Key Entities:**
- `User` (email/password auth, role, organization) → has many `Session`
- `Organization` (multi-tenancy) → has many `Donor`, `Campaign`, `Segment`, `Workflow`
- `Donor` (full contact info, retention metrics) → has many `Donation`, `Interaction`, `Task`
- `Campaign` (goal, dates, status) → has many `Donation`
- `Segment` (rules as JSON, member count) → triggers `Workflow`
- `Workflow` (trigger, steps as JSON) → has many `WorkflowExecution`
- `Task` (assignedTo, donor, type, priority, status)
- `ActivityLog` (audit trail for sensitive actions)

**Important Enums:**
- `DonorStatus`: ACTIVE, LAPSED, INACTIVE, DO_NOT_CONTACT
- `RetentionRisk`: UNKNOWN, LOW, MEDIUM, HIGH, CRITICAL
- `WorkflowTrigger`: FIRST_DONATION, DONATION_RECEIVED, INACTIVITY_THRESHOLD, SEGMENT_ENTRY, MANUAL, SCHEDULED
- `TaskStatus`: TODO, IN_PROGRESS, COMPLETED, CANCELLED
- `UserRole`: ADMIN, STAFF, MARKETING, READONLY

### Seed Data Requirements
Generate realistic test data for development:
- 2 Organizations
- 5 Users per org (1 admin, 2 staff, 1 marketing, 1 readonly)
- 50-100 Donors with varied retention profiles (40% first-time HIGH risk, 30% two-gift MEDIUM, 20% loyal LOW, 10% lapsed CRITICAL)
- 5-8 Campaigns (various dates, goals, statuses)
- 200-300 Donations distributed realistically
- 5-7 Segments with pre-calculated members
- 3-5 Workflows with defined triggers/steps
- 10-15 Tasks (mix of statuses, priorities)

## Project Status

**Current Phase**: Ready for implementation (planning complete)

**Documentation:**
- ✅ Business context analysis ([business-context.md](business-context.md))
- ✅ Component architecture ([component-architecture.md](component-architecture.md))
- ✅ System architecture diagrams ([architecture.mmd](architecture.mmd), [api.mmd](api.mmd))
- ✅ Testing strategy ([testing-architecture.md](testing-architecture.md))
- ✅ Detailed implementation plan ([implementation-plan.txt](implementation-plan.txt))

**Implementation Plan Overview** (8 Phases, 25 Days):
1. **Phase 1 (Days 1-3)**: Foundation - Project setup, Prisma schema, testing infrastructure, shadcn/ui
2. **Phase 2 (Days 4-5)**: Authentication - Email/password auth with sessions, middleware protection
3. **Phase 3 (Days 6-10)**: Core APIs - All endpoints (donors, campaigns, donations, segments, workflows, tasks)
4. **Phase 4 (Days 11-15)**: Dashboard & Donor UI - Main dashboard, donor list/detail/forms
5. **Phase 5 (Days 16-18)**: Campaign & Donation UI - Campaign and donation management
6. **Phase 6 (Days 19-22)**: Segments & Workflows - Rule builder and workflow editor
7. **Phase 7 (Day 23)**: Task Management - Task list with filtering
8. **Phase 8 (Days 24-25)**: Polish & Testing - Integration testing, UI polish, documentation

**Ready to Start**: Run `pnpm create next-app@latest . --tailwind --app --src-dir` to begin Phase 1
