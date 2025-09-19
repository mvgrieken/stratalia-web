import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: [
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.test.tsx',
      'src/__tests__/**/*.spec.ts',
      'src/__tests__/**/*.spec.tsx',
    ],
    exclude: [
      'node_modules/',
      '.next/',
      'dist/',
      'coverage/',
      'playwright_tests/',
      'tests/',
      'tests-examples/',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.ts',
      ]
    },
    deps: {
      inline: ['@sentry/node']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
