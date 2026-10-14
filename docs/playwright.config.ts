import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:4327/ticker/docs/', browserName: 'chromium' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4327 --ignore-lock',
    url: 'http://127.0.0.1:4327/ticker/docs/',
    reuseExistingServer: !process.env.CI,
  },
})
