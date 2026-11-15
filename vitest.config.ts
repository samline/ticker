import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      include: ['src/**'],
      thresholds: { branches: 90, functions: 95, lines: 95, statements: 95 },
    },
  },
})
