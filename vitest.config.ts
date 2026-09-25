import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      thresholds: {
        branches: 65,
        functions: 80,
        lines: 85,
        statements: 80,
      },
    },
  },
})
