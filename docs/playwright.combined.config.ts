import { defineConfig } from '@playwright/test'
import config from './playwright.config'
export default defineConfig({
  ...config,
  webServer: {
    command: 'npm --prefix ../landing run preview -- --host 127.0.0.1 --port 4327 --ignore-lock',
    url: 'http://127.0.0.1:4327/ticker/docs/',
    reuseExistingServer: !process.env.CI,
  },
})
