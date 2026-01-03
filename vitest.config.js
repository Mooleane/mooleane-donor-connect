// Vitest configuration for DonorConnect
// Supports Node (API tests) and JSDOM (component tests) environments

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    // Auto-detect environment based on file path
    environmentMatchGlobs: [
      ['tests/components/**', 'jsdom'],
      ['tests/integration/**', 'node'],
      ['tests/api/**', 'node'],
      ['tests/lib/**', 'node'],
    ],
    setupFiles: ['./tests/setup.js'],
    exclude: process.env.RUN_INTEGRATION === '1' ? [] : ['tests/integration/**'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
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
