// Vitest workspace configuration for DonorConnect
// Separates testing environments: Node (API), JSDOM (Components), Integration (DB)

import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Node environment - API routes, lib functions with mocked Prisma
  './vitest.config.node.js',

  // JSDOM environment - React components with React Testing Library
  './vitest.config.client.js',

  // Integration tests - Real database with Playwright utilities
  './vitest.config.integration.js',
])
