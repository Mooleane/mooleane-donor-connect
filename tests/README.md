# DonorConnect Test Suite

Comprehensive testing setup for the DonorConnect application using Vitest, React Testing Library, and Playwright.

## 📋 Overview

This test suite provides three testing environments:

1. **Node Environment** - API routes and library functions with mocked dependencies
2. **JSDOM Environment** - React components with React Testing Library
3. **Integration Environment** - Real database tests using Playwright utilities

## 🚀 Quick Start

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:node         # API routes + lib functions (fast, mocked)
pnpm test:client       # React components (JSDOM)
pnpm test:integration  # Database tests (real PostgreSQL)

# Watch mode for development
pnpm test:watch

# Coverage reports
pnpm test:coverage
pnpm test:coverage:node
pnpm test:coverage:client

# Interactive UI
pnpm test:ui

# E2E tests with Playwright
pnpm test:e2e

# Run everything
pnpm test:all
```

## 📁 Directory Structure

```
tests/
├── setup.node.js              # Node environment setup
├── setup.client.js            # JSDOM + React Testing Library setup
├── setup.integration.js       # Database setup with Playwright utilities
│
├── helpers/                   # Shared test utilities
│   ├── database.js           # DB lifecycle (setup/teardown/clean)
│   ├── api-request.js        # Mock Next.js Request/Response
│   ├── test-data.js          # Data factory functions
│   ├── prisma-mock.js        # Prisma mock factory
│   └── next-router-mock.js   # Next.js router mocks
│
├── api/                       # API route tests (Node environment)
│   ├── auth/                 # Authentication endpoints
│   │   ├── login.test.js
│   │   ├── register.test.js
│   │   ├── logout.test.js
│   │   └── session.test.js
│   ├── donors/               # Donor endpoints
│   │   ├── route.test.js    # GET, POST /api/donors
│   │   └── [id].test.js     # GET, PATCH, DELETE /api/donors/[id]
│   ├── donations/            # Similar structure...
│   ├── campaigns/
│   ├── segments/
│   └── workflows/
│
├── integration/              # Real database tests
│   ├── donor-crud.test.js
│   ├── auth-flow.test.js
│   ├── donation-metrics.test.js
│   └── campaign-tracking.test.js
│
├── components/               # Component tests (JSDOM environment)
│   ├── ui/                   # UI primitives
│   │   ├── badge.test.jsx
│   │   ├── button.test.jsx
│   │   └── input.test.jsx
│   ├── donors/
│   │   ├── donor-form.test.jsx
│   │   └── donor-status-badge.test.jsx
│   ├── donations/
│   │   ├── donation-form.test.jsx
│   │   └── donation-list.test.jsx
│   └── auth/
│       └── login-page.test.jsx
│
└── lib/                      # Library unit tests (existing)
    ├── password.test.js
    ├── utils.test.js
    └── api/
        └── donors.test.js
```

## 🧪 Test Patterns

### API Route Tests (Node Environment)

```javascript
// tests/api/donors/route.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/donors/route'
import { createMockRequest, createMockSession } from '../../helpers/api-request'

vi.mock('@/lib/session')
vi.mock('@/lib/db')

it('should return paginated donors', async () => {
  const { getSession } = await import('@/lib/session')
  const { prisma } = await import('@/lib/db')

  getSession.mockResolvedValue(createMockSession())
  prisma.donor.findMany.mockResolvedValue([...mockDonors])

  const request = createMockRequest('GET', '/api/donors')
  const response = await GET(request)

  expect(response.status).toBe(200)
})
```

**Key Points:**
- Use `vi.mock()` to mock dependencies
- Import mocked modules with `await import()`
- Use helpers from `tests/helpers/` to reduce boilerplate
- Test authentication, authorization, validation, and success cases

### Integration Tests (Real Database)

```javascript
// tests/integration/donor-crud.test.js
import { getTestPrisma } from '../helpers/database'
import { createTestDonor } from '../helpers/test-data'

it('should create donor and calculate metrics', async () => {
  const prisma = getTestPrisma()

  const donor = await prisma.donor.create({
    data: createTestDonor({ firstName: 'John' })
  })

  expect(donor.totalGifts).toBe(0)
})
```

**Key Points:**
- Uses real PostgreSQL database
- Database is cleaned before each test
- Use `getTestPrisma()` to get Prisma instance
- Test real database constraints, cascades, and business logic

### Component Tests (JSDOM Environment)

```javascript
// tests/components/donors/donor-form.test.jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonorForm } from '@/components/donors/donor-form'

it('should submit valid donor data', async () => {
  const user = userEvent.setup()
  render(<DonorForm onSubmit={mockOnSubmit} />)

  await user.type(screen.getByLabelText(/first name/i), 'John')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalled()
  })
})
```

**Key Points:**
- Use React Testing Library's `render`, `screen`, `waitFor`
- Use `userEvent` for realistic user interactions
- Query by accessibility roles and labels
- Test user flows, not implementation details

## 🔧 Helper Utilities

### Database Helpers

```javascript
import { setupTestDatabase, cleanDatabase, getTestPrisma } from './helpers/database'

// Setup (called once before all integration tests)
await setupTestDatabase()

// Get Prisma instance
const prisma = getTestPrisma()

// Clean between tests
await cleanDatabase()
```

### API Request Helpers

```javascript
import { createMockRequest, createMockSession } from './helpers/api-request'

// Create mock request
const request = createMockRequest('POST', '/api/donors', {
  firstName: 'John'
})

// Create mock session
const session = createMockSession({ role: 'ADMIN' })
```

### Test Data Factories

```javascript
import { createTestDonor, createTestDonation } from './helpers/test-data'

// Create mock donor data
const donor = createTestDonor({
  firstName: 'John',
  email: 'john@example.com'
})

// Create mock donation
const donation = createTestDonation(donorId, { amount: 100 })
```

### Prisma Mocks

```javascript
import { createPrismaMock, setupDonorMocks } from './helpers/prisma-mock'

const prismaMock = createPrismaMock()
const mockDonor = setupDonorMocks(prismaMock)

prismaMock.donor.findMany.mockResolvedValue([mockDonor])
```

## 🗄️ Integration Test Setup

Integration tests use a real PostgreSQL database. Before running integration tests:

1. **Create `.env.test` file**:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/donorconnect_test"
```

2. **Ensure PostgreSQL is running**:
```bash
# Check if PostgreSQL is running
pg_isready

# Or start PostgreSQL (MacOS with Homebrew)
brew services start postgresql
```

3. **Run integration tests**:
```bash
pnpm test:integration
```

**How it works:**
- Creates unique temporary database for each test run
- Runs Prisma migrations
- Seeds base test data (organization, user)
- Cleans data between tests
- Drops database after all tests complete

## 📊 Coverage Goals

- **API Routes**: 90%+ coverage
- **Business Logic** (lib/): 95%+ coverage
- **Components**: 80%+ coverage

```bash
# Generate coverage reports
pnpm test:coverage

# View HTML report
open coverage/index.html
```

## 🎯 Writing New Tests

### 1. Choose the Right Environment

- **Node environment** → API routes, library functions
- **JSDOM environment** → React components
- **Integration environment** → Database operations

### 2. Use Existing Patterns

Reference similar tests:
- API test → `tests/api/donors/route.test.js`
- Integration test → `tests/integration/donor-crud.test.js`
- Component test → `tests/components/donors/donor-status-badge.test.jsx`

### 3. Use Helper Utilities

Don't reinvent the wheel - use helpers from `tests/helpers/`:
- `createMockRequest()` for API tests
- `createTestDonor()` for test data
- `getTestPrisma()` for integration tests

### 4. Follow Test Naming Convention

```javascript
describe('Feature/Component Name', () => {
  it('should [expected behavior] when [condition]', () => {
    // Test code
  })
})
```

Examples:
- `should return 401 if not authenticated`
- `should create donor with valid data`
- `should validate email format`

## 🐛 Troubleshooting

### "Cannot find module '@/lib/...'"

Check vitest.config resolve.alias paths are correct.

### "document is not defined"

Ensure test uses JSDOM environment (add `// vitest-environment jsdom` at top).

### "Database connection refused"

Check DATABASE_URL in `.env.test` and ensure PostgreSQL is running.

### "Mock not working"

Use `await import()` AFTER `vi.mock()` declaration:

```javascript
vi.mock('@/lib/session')

// Later in test:
const { getSession } = await import('@/lib/session')
getSession.mockResolvedValue(...)
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎓 For Students

This test suite is designed to help you verify your implementations:

1. **Read the tests** - They show you what behavior is expected
2. **Run tests as you code** - Use `pnpm test:watch`
3. **Check coverage** - Ensure your code is tested
4. **Learn from failures** - Test errors point you to issues

When you implement a feature:
1. Run the relevant test file
2. See what fails
3. Implement the feature
4. Watch tests pass!

Example workflow:
```bash
# Watch donor API tests while implementing
pnpm test:node -- tests/api/donors

# Watch component tests
pnpm test:client -- tests/components/donors

# Run integration tests for database logic
pnpm test:integration -- tests/integration/donor-crud
```

## 🤝 Contributing

When adding new features to DonorConnect:

1. Write tests first (TDD) or alongside your implementation
2. Ensure all tests pass before committing
3. Add test coverage for edge cases
4. Update this README if adding new test patterns

---

**Happy Testing! 🎉**
