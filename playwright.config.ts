import { PlaywrightTestConfig, devices } from "@playwright/test"
import dotenv from "dotenv"

import path from "path"

dotenv.config({ path: path.resolve(__dirname, "./.env.local") })

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // Timeout per test
  timeout: 1 * 80 * 1000,
  // Test directory
  testDir: "specs/e2e",
  // If a test fails, retry it additional 2 times
  retries: 0,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: "test-results/",
  workers: 1,
  maxFailures: 2,

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: "pnpm run dev",
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "retry-with-trace",
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    // Artifacts
    screenshot: "only-on-failure",
    video: "retry-with-video",
  },

  projects: [
    {
      name: "Chromium",
      use: {
        // Configure the browser to use.
        browserName: "chromium",
        // Any Chromium-specific options.
        viewport: { width: 1200, height: 900 },
        baseURL: `${process.env.E2E_BASE_PROTOCOL}:${process.env.E2E_BASE_URL}:${process.env.E2E_BASE_PORT}`,
        launchOptions: {
          // logger: {
          //   isEnabled: (name, severity) => true,
          //   log: (name, severity, message, args) =>
          //     console.log(name, severity, message, args),
          // },
          // slowMo: 100,
          // devtools: true,
        },
      },
    },
    // {
    //   name: "Mobile Safari",
    //   use: devices["iPhone 12"],
    // },
  ],
}
export default config
