import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end configuration.
 *
 * Two projects exist for a reason the specification insists on: cross-instance
 * fan-out and per-viewer state are only provable with two connected clients, so
 * the multi-client project runs serially with its own workers setting while the
 * default project may parallelise.
 */
const baseURL = process.env['PUBLIC_APP_URL'] ?? 'http://localhost:5173';
const isCI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Outside CI the worker count is deliberately left ABSENT rather than set to
  // `undefined`, so the runner applies its own default. Under
  // `exactOptionalPropertyTypes` an optional property that is present-but-undefined
  // is not the same as one that is missing, so the key is spread in conditionally.
  ...(isCI ? { workers: 2 } : {}),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'multi-client',
      testMatch: /realtime\.spec\.ts/,
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'a11y',
      testDir: '.',
      testMatch: /a11y\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
