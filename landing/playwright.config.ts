import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  workers: 1,
  // CI runs each project on its own runner; examples.spec.ts is about half of
  // the suite's time. Locally both projects still run in one worker.
  projects: [
    { name: 'examples', testMatch: 'examples.spec.ts' },
    { name: 'site', testIgnore: 'examples.spec.ts' },
  ],
  use: { baseURL: 'http://127.0.0.1:4324/ticker/', browserName: 'chromium' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4324 --ignore-lock',
    url: 'http://127.0.0.1:4324/ticker/',
    reuseExistingServer: !process.env.CI,
  },
})
