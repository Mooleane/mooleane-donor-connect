// Next.js router mock helpers
// Provides mock router for component testing

import { vi } from 'vitest'

// Shared router state
let mockRouterState = {
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: vi.fn().mockResolvedValue(true),
  replace: vi.fn().mockResolvedValue(true),
  reload: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
}

/**
 * Update mock router state
 * @param {object} overrides - Properties to override in router
 * @returns {object} Updated router state
 */
export function mockRouter(overrides = {}) {
  mockRouterState = {
    ...mockRouterState,
    ...overrides,
    push: overrides.push || mockRouterState.push,
    replace: overrides.replace || mockRouterState.replace,
    events: overrides.events || mockRouterState.events,
  }
  return mockRouterState
}

/**
 * Get current router state
 * @returns {object} Current mock router
 */
export function getRouter() {
  return mockRouterState
}

/**
 * Reset router to default state
 * Call this in beforeEach to ensure test isolation
 */
export function resetRouter() {
  mockRouterState = {
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    push: vi.fn().mockResolvedValue(true),
    replace: vi.fn().mockResolvedValue(true),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  }
}

// Next.js App Router hooks (next/navigation)

/**
 * Mock useRouter hook from next/navigation
 * @returns {object} Mock router for App Router
 */
export function mockUseRouter() {
  return {
    push: mockRouterState.push,
    replace: mockRouterState.replace,
    back: mockRouterState.back,
    forward: mockRouterState.forward,
    refresh: vi.fn(),
    prefetch: mockRouterState.prefetch,
  }
}

/**
 * Mock usePathname hook from next/navigation
 * @returns {string} Current pathname
 */
export function mockUsePathname() {
  return mockRouterState.pathname
}

/**
 * Mock useSearchParams hook from next/navigation
 * @returns {URLSearchParams} Search params object
 */
export function mockUseSearchParams() {
  const params = new URLSearchParams()
  Object.entries(mockRouterState.query).forEach(([key, value]) => {
    params.set(key, String(value))
  })
  return params
}

/**
 * Mock useParams hook from next/navigation
 * @returns {object} Route params
 */
export function mockUseParams() {
  return mockRouterState.query
}

/**
 * Create mock router with specific pathname and query
 * Convenience helper for common test scenarios
 * @param {string} pathname - Route pathname
 * @param {object} query - Query parameters
 * @returns {object} Configured mock router
 */
export function createMockRouter(pathname = '/', query = {}) {
  return mockRouter({
    pathname,
    route: pathname,
    asPath: pathname + (Object.keys(query).length ? '?' + new URLSearchParams(query) : ''),
    query,
  })
}
