import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Cross-Browser Testing
 * 
 * Configures automated testing across multiple browsers and devices
 * to ensure consistent game functionality and performance.
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Timeout settings
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 5000 // 5 seconds for assertions
  },
  
  // Test configuration
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Global test settings
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Capture artifacts on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Game-specific settings
    actionTimeout: 10000,
    navigationTimeout: 15000
  },
  
  // Projects for different browsers and configurations
  projects: [
    // Desktop Browsers
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    // Mobile Devices
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12']
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    // Tablet Testing
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad Pro']
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    // High DPI Testing
    {
      name: 'high-dpi-chrome',
      use: {
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
        viewport: { width: 1920, height: 1080 }
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    // Low-end device simulation
    {
      name: 'low-end-mobile',
      use: {
        ...devices['Galaxy S5'],
        // Simulate slower CPU
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
      testMatch: '**/cross-browser.test.js'
    },
    
    // Specific feature tests
    {
      name: 'webgl-support',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-webgl', '--enable-accelerated-2d-canvas']
        }
      },
      testMatch: '**/webgl-support.test.js'
    },
    
    {
      name: 'audio-context-test',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required']
        }
      },
      testMatch: '**/audio-context.test.js'
    },
    
    // Performance testing
    {
      name: 'performance-test',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 800, height: 600 }, // Smaller viewport for performance
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--no-sandbox'
          ]
        }
      },
      testMatch: '**/performance-e2e.test.js'
    }
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Output directories
  outputDir: './test-results/playwright-artifacts',
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/setup/global-setup.js'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.js'),
  
  // Test metadata
  metadata: {
    testType: 'cross-browser',
    gameVersion: '2.0.0',
    architecture: 'modular'
  }
});
