# DonorConnect Development Guide

## Project Overview
DonorConnect is a donor retention platform solving first-to-second gift conversion for nonprofits. Built as an MVP with Next.js 16 App Router + PostgreSQL + Prisma 7, deliberately using **JavaScript (not TypeScript)** for rapid development.

## Architecture & Data Flow

### Multi-tenant Design
- Organizations are the primary tenant boundary
- All data models include `organizationId` for isolation
- Users belong to organizations via `User.organizationId`
- Session management uses `getSessionUser()` which includes organization context

### Database Schema Patterns
- **Prisma 7 schema**: Complete nonprofit domain model in `prisma/schema.prisma`
- **Key entities**: User, Organization, Donor, Donation, Campaign, Segment, Workflow, Task
- **Enums**: 12 domain-specific enums (DonorStatus, RetentionRisk, DonationType, etc.)
- **Retention tracking**: Donors have calculated fields like `totalAmount`, `totalGifts`, `lastGiftDate`
- **Use seed data**: `npx prisma db seed` creates realistic test data with 75 donors across risk profiles
- **Prisma client**: Custom configuration in `prisma/client.js` with Neon PostgreSQL adapter

### Authentication & Sessions
- **Custom session management**: HTTP-only cookies with database sessions (not JWT)
- **No external auth providers**: Simple email/password with bcrypt
- **Session pattern**: 
  - API routes: Use `getSession(sessionToken)` where `sessionToken = request.cookies.get('session')?.value`
  - Server Components: Use `getSessionUser()` (calls `getSession()` internally)
- **Cookie handling**: Use `NextResponse.cookies.set()` in API routes, never `cookies().set()`
- **Protection**: Route groups `(auth)` for public, `(dashboard)` for protected pages
- **Known Working**: Login, logout, session validation API endpoints
- **Prisma 7**: Using custom client configuration in `prisma/client.js` with Neon PostgreSQL

## Development Patterns

### **⚠️ CRITICAL: Authentication System Update Required**

The authentication system has been recently fixed for Next.js 16 compatibility. Many API routes still use the old pattern and need updating:

**❌ Old Pattern (BROKEN):**
```javascript
import { getSessionUser } from '@/lib/session'
export async function GET() {
  const user = await getSessionUser() // Fails in API routes
}
```

**✅ New Pattern (WORKING):**
```javascript
import { getSession } from '@/lib/session'
export async function GET(request) {
  const sessionToken = request.cookies.get('session')?.value
  const session = await getSession(sessionToken)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user
}
```

**Files Requiring Updates:** All API routes in `/src/app/api/` except `/auth/` routes are using the old pattern and will fail.

### API Route Structure
```javascript
// Standard pattern: /src/app/api/[entity]/route.js
export async function GET(request) {
  const sessionToken = request.cookies.get('session')?.value // Get session token
  const session = await getSession(sessionToken) // Validate session
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Query with organizationId filter using session.user.organization.id
}
```

### Component Organization
- **shadcn/ui components**: Pre-configured in `src/components/ui/`
- **Domain components**: `src/components/donors/`, `src/components/campaigns/`
- **Business logic**: Separate API layer in `src/lib/api/[entity].js`
- **Validation**: Zod schemas in `src/lib/validation/[entity]-schema.js`

### Form & Validation Pattern
- React Hook Form + Zod resolvers for all forms
- Server-side validation mirrors client-side schemas
- Example: `createDonorSchema` used in both form validation and API routes

## Key Commands & Workflows

### Tech Stack (Current Versions)
- **Next.js**: 16.0.10 (App Router)
- **React**: 19.2.3
- **Prisma**: 7.1.0 with PostgreSQL adapter
- **Tailwind CSS**: 4.1.18
- **Vitest**: 4.0.15
- **pnpm**: 10.18.1
- **Zod**: 4.2.0
- **React Hook Form**: 7.68.0

### Database Operations
```bash
# Essential database commands
npx prisma generate              # After schema changes (outputs to prisma/generated/)
npx prisma migrate dev           # Create & apply migrations  
npx prisma studio                # Visual database browser
npx prisma db seed               # Load test data (75 donors, 200+ donations)

# Environment setup (first time)
cp .env.example .env             # Copy and configure DATABASE_URL
# For Neon/cloud: ?sslmode=require
# For local dev: ?sslmode=disable
```

### Development
```bash
pnpm dev                         # Start dev server (localhost:3000)
pnpm build                       # Build for production
pnpm start                       # Start production server
pnpm lint                        # Run ESLint
pnpm test                        # Run Vitest unit tests
pnpm test:watch                  # Run tests in watch mode
pnpm test:ui                     # Open Vitest UI
pnpm test:e2e                    # Run Playwright E2E tests
```

**Note:** Playwright requires separate setup:
```bash
npm init playwright@latest      # One-time setup
npx playwright install          # Install browsers
```

### Login Credentials (after seeding)
- Email: `admin@hopefoundation.org` 
- Password: `password123`

## Project-Specific Conventions

### File Naming & Structure
- **Route groups**: `(auth)` and `(dashboard)` for logical page organization
- **API routes**: Follow REST conventions (`route.js` for collection, `[id]/route.js` for individual)
- **Components**: PascalCase files, kebab-case for multi-word (`donor-form.jsx`)
- **Business logic**: Separate from API routes into `src/lib/api/` modules
- **Config files**: 
  - `prisma.config.js` - Prisma 7 configuration
  - `vitest.config.js` - Test configuration
  - `postcss.config.mjs` - PostCSS with Tailwind 4
  - `tailwind.config.js` - Tailwind configuration

### Data Access Patterns
- **Prisma singleton**: Import `{ prisma }` from `@/lib/db`
- **Custom output**: Prisma client generates to `prisma/generated/` (configured in prisma.config.js)
- **PostgreSQL adapter**: Uses @prisma/adapter-pg with pg driver for Neon compatibility
- **Path aliases**: Use `@/*` for src imports (configured in jsconfig.json)
- **Organization filtering**: Always filter queries by `user.organizationId`
- **Calculated fields**: Use Prisma aggregations for donor metrics (total gifts, amounts)
- **Relationships**: Extensive use of Prisma `include` for related data

### Error Handling
- API routes return structured JSON with `{ error: string }` for failures
- Form validation errors bubble up from Zod schemas
- Session failures redirect to `/login` (handled in layout)

## Testing Strategy
- **Unit**: Vitest 4 for business logic and utilities
- **E2E**: Playwright for user workflows (requires separate installation)
- **API mocking**: MSW handlers in `tests/handlers/`
- **Test data**: Use seeded database state for consistent tests
- **Coverage**: V8 provider with text/json/html reporting

## Integration Points
- **Email**: Placeholder for future SendGrid/Postmark integration
- **CRM sync**: Schema ready for Salesforce/Bloomerang connectors  
- **Analytics**: Donor segments and workflow execution tracking built-in

## Current Status & Priorities

### ✅ **Authentication System: FULLY WORKING**
- Login/logout/session validation: All tested and functional
- HTTP-only cookies with proper Next.js 16 compatibility
- Secure session management with database storage

### ⚠️ **PRIORITY: Update Remaining API Routes**
20+ API routes in `/src/app/api/` (except auth routes) need authentication pattern updates:
- Replace `getSessionUser()` with proper request-based session handling
- Update all entity endpoints: donors, campaigns, donations, segments, workflows
- Current pattern causes 500 errors due to `cookies()` incompatibility in API routes

### 🧪 **Testing Status**
- Authentication flow: Fully tested (login → session → logout)
- API routes: Need testing after authentication updates
- E2E tests: Available but may need updates for new auth pattern

Refer to `resource-docs/CLAUDE.md` for detailed architecture and `PROJECT-STATUS.md` for implementation progress.