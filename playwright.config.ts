import { defineConfig, devices } from '@playwright/test'

function includeLocalAddresses(value: string | undefined) {
  const addresses = new Set((value ?? '').split(',').filter(Boolean))
  addresses.add('127.0.0.1')
  addresses.add('localhost')
  return [...addresses].join(',')
}

process.env.NO_PROXY = includeLocalAddresses(process.env.NO_PROXY)
process.env.no_proxy = includeLocalAddresses(process.env.no_proxy)

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
