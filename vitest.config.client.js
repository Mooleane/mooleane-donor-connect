// Vitest configuration for JSDOM environment
// Used for: React component tests with React Testing Library

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'client',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.client.js'],
    include: ['tests/components/**/*.test.{js,jsx}'],
    exclude: ['**/node_modules/**', '**/integration/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**', 'src/app/**/*.jsx'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'src/app/api/**', // Exclude API routes from client coverage
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
