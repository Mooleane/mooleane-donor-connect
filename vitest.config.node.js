// Vitest configuration for Node environment
// Used for: API route tests, library function tests with mocked dependencies

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    name: 'node',
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.node.js'],
    include: [
      'tests/lib/**/*.test.js',
      'tests/api/**/*.test.js',
    ],
    exclude: [
      '**/node_modules/**',
      '**/integration/**',
      '**/components/**',
      '**/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'prisma/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
