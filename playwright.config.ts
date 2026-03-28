import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    channel: 'chrome'
  },
  webServer: [
    {
      command: 'node dist/server.js',
      cwd: './server',
      url: 'http://127.0.0.1:4000/api/health',
      reuseExistingServer: true
    },
    {
      command: 'npm --workspace client run preview',
      cwd: '.',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true
    }
  ]
});
