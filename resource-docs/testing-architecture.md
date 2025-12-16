Short answer: **not yet** — but below is a **complete, explicit setup** that **does** include:

1. **Default client-side Vitest configuration (JSDOM + RTL)**
2. **Explicit server-side (Node) testing per file for API routes**
3. **A clear pattern for separating client vs server tests**
4. **Concrete file examples you can copy-paste**

This is written to match **Next.js + Vitest** best practices as of now.

---

# 1. Two Test Runtimes (This Is the Key Concept)

You should treat your tests as running in **two distinct environments**:

| Test Type         | Environment | Purpose                                   |
| ----------------- | ----------- | ----------------------------------------- |
| Client-side tests | `jsdom`     | React components, hooks, browser behavior |
| Server-side tests | `node`      | API routes, business logic, DB access     |

Vitest supports this **per file**, which is exactly what you’re asking about.

---

# 2. Default Client-Side Vitest Configuration (JSDOM)

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // ✅ Default environment = client-side
    environment: 'jsdom',

    // ✅ Global test setup
    setupFiles: './test/setup.client.ts',

    // ✅ Good defaults
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,

    // ✅ Enable CSS imports in components
    css: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

This means:

* **All tests default to client-side**
* You do **not** need to annotate component tests
* RTL + hooks + JSDOM work automatically

---

# 3. Client-Side Test Setup (RTL + JSDOM)

### `test/setup.client.ts`

```ts
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './testServer'

// MSW lifecycle
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Optional: mock next/navigation for App Router
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual<any>('next/navigation')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
  }
})
```

---

# 4. MSW Server (Client Tests)

### `test/testServer.ts`

```ts
import { setupServer } from 'msw/node'
import { donorsHandlers } from './handlers/donors'
import { donationsHandlers } from './handlers/donations'
import { campaignsHandlers } from './handlers/campaigns'

export const server = setupServer(
  ...donorsHandlers,
  ...donationsHandlers,
  ...campaignsHandlers
)
```

Handlers live in:

```txt
test/handlers/
  donors.ts
  donations.ts
  campaigns.ts
```

---

# 5. Server-Side (Node) Tests Per File (API Routes)

This is the part you explicitly asked about.

## Option A (Recommended): **Per-file environment override**

### Example: `/src/app/api/donors/recent/route.test.ts`

```ts
/**
 * @vitest-environment node
 */

import { GET } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/donors/recent', () => {
  it('returns recent donors', async () => {
    const req = new NextRequest('http://localhost/api/donors/recent')

    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data).toHaveLength(3)
  })
})
```

✔ Runs in **Node**
✔ No JSDOM
✔ No MSW
✔ Tests the route handler directly

---

## Option B: Separate Server Config (Optional)

If you want stricter separation:

```ts
// vitest.server.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.server.test.ts'],
  },
})
```

But **per-file override is usually enough** and simpler.

---

# 6. Component Test Example (Client Default)

### `DonorForm.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DonorForm from '../DonorForm'

describe('DonorForm', () => {
  it('shows validation error when email is missing', async () => {
    render(<DonorForm />)

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i })
    )

    expect(
      await screen.findByText(/email is required/i)
    ).toBeInTheDocument()
  })
})
```

✔ Runs in JSDOM
✔ RTL + hooks ready
✔ No config required in file

---

# 7. Hooks Testing (Client Default)

### `useRecentDonors.test.ts`

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { useRecentDonors } from '@/hooks/useRecentDonors'

describe('useRecentDonors', () => {
  it('fetches recent donors', async () => {
    const { result } = renderHook(() => useRecentDonors())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(3)
  })
})
```

✔ Uses JSDOM
✔ MSW intercepts fetch
✔ No router or window hacks needed

---

# 8. Playwright Is Cleanly Isolated

Playwright:

* Runs independently
* Uses real browser
* Should **not reuse Vitest/MSW**
* Can mock network via `page.route()` or hit a seeded backend

Your current setup supports that clean separation.

---

# 9. Summary (Explicit Answers to Your Question)

### ❓ “Does this include the default client-side Vitest configuration?”

**Yes.**

* JSDOM is the default
* RTL, hooks, and browser APIs are ready without annotations

### ❓ “Does this include in-file server-side testing per file?”

**Yes.**

* `@vitest-environment node` per test file
* Direct invocation of Next.js route handlers
* No separate runner required

### ❓ “Is this a standard, production-safe setup?”

**Yes.**
This is the same pattern used by teams running:

* Next.js App Router
* API route unit tests
* MSW-powered component tests
* Playwright E2E