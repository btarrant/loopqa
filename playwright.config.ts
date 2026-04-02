import { defineConfig, devices } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';
const browserProjects = [
  {
    name: 'chromium',
    dependencies: ['setup'],
    testIgnore: /auth\.setup\.ts/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: authFile
    }
  },
  {
    name: 'firefox',
    dependencies: ['setup'],
    testIgnore: /auth\.setup\.ts/,
    use: {
      ...devices['Desktop Firefox'],
      storageState: authFile
    }
  }
];

if (process.platform !== 'darwin') {
  browserProjects.push({
    name: 'webkit',
    dependencies: ['setup'],
    testIgnore: /auth\.setup\.ts/,
    use: {
      ...devices['Desktop Safari'],
      storageState: authFile
    }
  });
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://animated-gingersnap-8cf7f2.netlify.app/',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/
    },
    ...browserProjects
  ]
});
