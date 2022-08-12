import { PlaywrightTestConfig } from "@playwright/test"

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // Timeout per test
  timeout: 2 * 60 * 1000,
  // Timeout per expect
  expect: {
    timeout: 10 * 1000,
  },
  // Test directory
  testDir: "specs/e2e",
  // If a test fails, retry it additional 2 times
  retries: 5,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: "test-results/",
  workers: 5,
  maxFailures: 2,

  use: {
    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "retry-with-trace",
    headless: true,
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
        headless: true,
        viewport: { width: 1200, height: 900 },
        baseURL: `${process.env.E2E_BASE_PROTOCOL}://${process.env.E2E_BASE_URL}:${process.env.E2E_BASE_PORT}`,
        ignoreHTTPSErrors: true,
      },
    },
  ],
}
export default config
