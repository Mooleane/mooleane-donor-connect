# API Endpoints TODOs (for tests to pass)

This file lists every API endpoint that needs to be created or completed (or updated) so that the current test suite (and the expected tests described in `tests/README.md`) will pass. Each entry contains:
- HTTP method and path
- Expected request/response shape
- Validation rules and status codes the tests assert
- Authorization / permission checks
- Prisma / DB behavior and organization filtering
- Files to implement / update in `src/app/api/`

---

## Cross-cutting Requirements 🔧

- All API routes (except `auth/*`) MUST use the request-based session pattern:
  - Read session token: `const sessionToken = request.cookies.get('session')?.value`
  - Validate: `const session = await getSession(sessionToken)`
  - If no session -> return `401` with `{ error: 'Unauthorized' }`
- Return structured JSON errors: `{ error: string }` for top-level failures.
- Use `NextResponse.json(body, { status })` or `NextResponse` for responses.
- Validation should return `400` with helpful error messages that tests can assert.
- Use Zod schemas (or similar) to validate request bodies where appropriate.
- Always filter queries by `organizationId` from `session.user.organizationId` to ensure multi-tenancy.
- For auth endpoints that set cookies, set `Set-Cookie` header with:
  - `session=<token>; HttpOnly; Secure; SameSite=Lax; Path=/` (tests check for these flags)
- Remove any usage of the old `getSessionUser()` pattern in API routes.

---

## 1) Auth endpoints (tests exist and more are expected) 🔐

### POST /api/auth/login
File: `src/app/api/auth/login/route.js`

- Request body: `{ email, password }`
- Validations:
  - Email and password required -> `400` if missing
  - Email format validation -> `400` with error containing "email"
- Behavior:
  - Trim `email` before passing to `login` helper
  - Call `login(email, password)` from `@/lib/auth`
  - If `login` returns `null` -> `401` with `{ error: 'Invalid credentials' }`
  - If `login` returns a user object:
    - Call `createSession(user.id)` from `@/lib/session` -> returns token
    - Set cookie `session=<token>` with flags `HttpOnly; Secure; SameSite=Lax`
    - Return `200` with `{ user }` (ensure `password` is not included)
- Error handling:
  - If `login` or `createSession` throws -> `500` with `{ error: 'Internal server error' }`
- Tests referencing: `tests/api/auth/login.test.js`

### POST /api/auth/register
File: `src/app/api/auth/register/route.js`

- Request body: `{ firstName, lastName, email, password }`
- Validations:
  - All fields required -> `400` for missing
  - Email must be valid format -> `400`
  - Password rules (min length, etc.) to be enforced by lib validation
- Behavior:
  - Create the user (hash password in helper) using `@/lib/auth` or `prisma.user.create`
  - If email already exists -> `409` or `400` (tests should assert 409 if present)
  - Create session like login: `createSession(user.id)` and set cookie
  - Return `201` with `{ user }` (without password)
- Error handling: return `500` on DB errors
- Tests to add: registration success, duplicate email, invalid input

### POST /api/auth/logout
File: `src/app/api/auth/logout/route.js`

- Behavior:
  - Read `session` cookie token
  - If token present, destroy session from DB (`deleteSession(token)` helper) and clear cookie
  - Clear cookie by setting `Set-Cookie: session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
  - Return `200` with `{ ok: true }`
- Tests to add: successful logout clears cookie, returns 200; unknown session returns 200

### GET /api/auth/session
File: `src/app/api/auth/session/route.js`

- Behavior:
  - Read `session` cookie token, call `getSession(token)` and return session data
  - If not authenticated -> `401` with `{ error: 'Unauthorized' }`
  - If authenticated -> `200` with `{ user: session.user }` or `{ session }` depending on project's pattern
- Tests to add: authenticated session returns user, missing returns 401

---

## 2) Donors endpoints (tests already exist) 🧾

### GET /api/donors
File: `src/app/api/donors/route.js`

- Behavior:
  - Authenticate session (401 if missing)
  - Query params supported: `page`, `limit`, `search`, `status`, `retentionRisk`
  - Defaults: page=1, limit=10 (or as project defaults)
  - Pagination: calculate `skip = (page - 1) * limit`, `take = limit`
  - Filtering:
    - `search` -> apply OR clause on `firstName`, `lastName`, `email` using `contains` and lowercase `search`
    - `status` -> exact match filter
    - `retentionRisk` -> exact match filter
  - MUST filter by `organizationId: session.user.organizationId`
  - Return `200` with `{ donors, pagination: { page, limit, total } }`
- Tests assert:
  - `401` when unauthenticated
  - Organization filtering in call to `prisma.donor.findMany`
  - Search building uses OR with contains on firstName/lastName/email
  - status & retentionRisk filters included in `where`
  - Pagination skip/take calculations
- Implementation notes:
  - Call `prisma.donor.count({ where })` for total

### POST /api/donors
File: `src/app/api/donors/route.js`

- Behavior:
  - Authenticate session (401 if missing)
  - Authorization: only `ADMIN` and `STAFF` allowed; `READONLY` -> `403` with error referencing "permission"
  - Validate body fields (`firstName` required, `lastName`, `email` with format)
  - On success, create donor with `organizationId` from session
  - Default fields: `status` default to `ACTIVE|LAPSED|INACTIVE` (e.g., default `ACTIVE`), `retentionRisk` default `UNKNOWN`
  - Return `201` with `{ donor }`
- Tests assert:
  - `401` if no session
  - `403` if session.role == 'READONLY'
  - `400` for invalid/missing required fields
  - `400` for invalid email format
  - `201` and creation with `organizationId` from session
  - Default values are set (test checks that prisma.donor.create is called with defaults matching patterns)

### GET /api/donors/[id]
File: `src/app/api/donors/[id]/route.js`

- Behavior:
  - Authenticate session
  - Query donor by `id` and filter by `organizationId` -> if not found or organization mismatch -> `404`
  - Return `200` with donor payload including related data if needed
- Tests to add: not found returns 404, success returns 200

### PATCH /api/donors/[id]
File: `src/app/api/donors/[id]/route.js`

- Behavior:
  - Authenticate session
  - Authorization: only `ADMIN` and `STAFF` allowed
  - Validate body fields (only allow updatable fields)
  - Update donor with `prisma.donor.update` (ensure `where` includes `id` and `organizationId`)
  - Return `200` with updated donor
- Tests to add: 401 if unauthenticated, 403 if READONLY, 400 if invalid data, 200 on success

### DELETE /api/donors/[id]
File: `src/app/api/donors/[id]/route.js`

- Behavior:
  - Authenticate session
  - Authorization: `ADMIN` only
  - Delete donor by id with `organizationId` filter
  - Return `200` or `204` to indicate success
- Tests to add: 401, 403, 404 if not found, 200 (or 204) on success

---

## 3) Donations endpoints 💸

### GET /api/donations
File: `src/app/api/donations/route.js`

- Behavior:
  - Authenticate session
  - Support filtering by donorId, campaignId, date ranges, pagination
  - Filter by `organizationId`
  - Return `200` with `{ donations, pagination }`
- Tests to add: list returns filtered/paginated data

### POST /api/donations
File: `src/app/api/donations/route.js`

- Behavior:
  - Authenticate session
  - Authorization: `ADMIN` and `STAFF` can create donations
  - Validate body: `donorId`, `amount`, `date` (required)
  - Create donation and update donor metrics (`totalGifts`, `totalAmount`, `lastGiftDate`) in a transaction
  - Return `201` with created donation
- Tests to add: unauthenticated -> 401, invalid data -> 400, success -> 201 and donor metrics updated

### GET/PATCH/DELETE /api/donations/[id]
File: `src/app/api/donations/[id]/route.js`

- Behavior similar to donors' id route (auth, organization filter, permissions, etc.)

---

## 4) Campaigns endpoints 📣

### GET /api/campaigns
File: `src/app/api/campaigns/route.js`

- Behavior:
  - Authenticate session
  - Support filters, pagination, organizationId scoping
  - Return `200` with list

### POST /api/campaigns
File: `src/app/api/campaigns/route.js`

- Behavior:
  - Authenticate session
  - Authorization: `ADMIN`, `STAFF`, `MARKETING` roles
  - Validate body
  - Create campaign under `organizationId`
  - Return `201` with campaign

### GET/PATCH/DELETE /api/campaigns/[id]
File: `src/app/api/campaigns/[id]/route.js`

- Behavior: auth, org scoping, role-based permissions, 404 when not found

---

## 5) Segments endpoints 🧭

### GET /api/segments
File: `src/app/api/segments/route.js`

- Behavior: list segments for organization with filters

### POST /api/segments
File: `src/app/api/segments/route.js`

- Behavior: create segment; validate definition; return `201`

### GET/PATCH/DELETE /api/segments/[id]
File: `src/app/api/segments/[id]/route.js`

- Behavior: auth scoped to organization; return appropriate status codes

---

## 6) Workflows endpoints 🔁

### GET /api/workflows
File: `src/app/api/workflows/route.js`

- Behavior: list workflows, filter by status, organization

### POST /api/workflows
File: `src/app/api/workflows/route.js`

- Behavior: create workflow, validate required fields, return `201`

### GET/PATCH/DELETE /api/workflows/[id]
File: `src/app/api/workflows/[id]/route.js`

- Behavior: auth, org scoping, role-based permission checks

---

## Additional Implementation Notes & Acceptance Criteria ✅

- Unit tests in `tests/api/` that import route functions (e.g. `import { GET } from '@/app/api/donors/route'`) expect the route functions to return `Response` objects (NextResponse). Ensure the route exports implement the expected signatures: `GET(request)` and `POST(request)` and `GET(request,{params})` for dynamic routes.
- Use `vi.mock('@/lib/session')` pattern in tests: ensure `src/lib/session.js` exposes `getSession`, `createSession`, and `deleteSession` helpers used by tests and routes.
- Ensure `src/lib/db.js` exports a `prisma` client and that you call `prisma.*` methods with `where: { organizationId: session.user.organizationId, ... }` where appropriate.
- Return consistent error messages that tests assert on (e.g., `Unauthorized`, `Invalid credentials`, `Internal server error`, validation messages containing field names).
- For all create/update operations, ensure to return the created/updated resource in the concise shape tests expect (e.g., `data.donor.id` for donors POST tests).
- Add tests for endpoints that are currently missing (register, logout, donors/[id], donations, campaigns, segments, workflows) if they are required by integration or E2E tests.

---

## Files that currently contain TODOs (quick map)
- `src/app/api/auth/login/route.js` (implement per tests)
- `src/app/api/auth/register/route.js`
- `src/app/api/auth/logout/route.js`
- `src/app/api/auth/session/route.js`
- `src/app/api/donors/route.js`
- `src/app/api/donors/[id]/route.js`
- `src/app/api/donations/route.js`
- `src/app/api/donations/[id]/route.js`
- `src/app/api/campaigns/route.js`
- `src/app/api/campaigns/[id]/route.js`
- `src/app/api/segments/route.js`
- `src/app/api/segments/[id]/route.js`
- `src/app/api/workflows/route.js`
- `src/app/api/workflows/[id]/route.js`

---

## Suggested Implementation Steps (priority order) 🔁
1. Implement `POST /api/auth/login` to make `tests/api/auth/login.test.js` pass.
2. Implement `GET` and `POST` for `/api/donors` (including search, filtering, pagination) to satisfy `tests/api/donors/route.test.js`.
3. Implement permission checks for donors POST (403 for READONLY role).
4. Implement `src/lib/session` helpers or adjust existing ones to ensure `getSession(token)`, `createSession(userId)`, `deleteSession(token)` behave as tests expect.
5. Add and implement `donors/[id]` endpoints (GET/PATCH/DELETE) and add tests (or adapt existing tests if present).
6. Implement `donations` endpoints with donation creation updating donor metrics in a transaction.
7. Implement `campaigns`, `segments`, and `workflows` endpoints with required permission checks.
8. Run the full test suite, fix failing tests, and add tests for any newly implemented behavior.

---

If you'd like, I can:
- Open a PR that implements one high priority endpoint (e.g., `login` or `donors` GET/POST), or
- Create unit tests for any missing endpoints (e.g., `register`, `logout`, donors `[id]`) to capture the expected behavior.

---

Last updated: (auto-generated)
