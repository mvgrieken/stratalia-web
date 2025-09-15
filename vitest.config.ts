import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      },
      exclude: [
        'node_modules/',
        '.next/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/*.config.ts',
        'src/__tests__/',
        'tests/'
      ]
    }
  }
})
