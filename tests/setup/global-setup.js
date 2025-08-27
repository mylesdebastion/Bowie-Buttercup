/**
 * Global Playwright Test Setup
 * 
 * Prepares the test environment before running cross-browser tests
 */

async function globalSetup(config) {
  console.log('🚀 Starting global test setup...');
  
  // Ensure test artifacts directory exists
  const fs = require('fs');
  const path = require('path');
  
  const testResultsDir = path.join(__dirname, '../../test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Create browser-specific directories
  const browsers = ['chromium', 'firefox', 'webkit', 'mobile-chrome', 'mobile-safari'];
  browsers.forEach(browser => {
    const browserDir = path.join(testResultsDir, browser);
    if (!fs.existsSync(browserDir)) {
      fs.mkdirSync(browserDir, { recursive: true });
    }
  });
  
  // Wait a moment for any previous processes to clean up
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Set up test environment variables
  process.env.PLAYWRIGHT_TEST_MODE = 'true';
  process.env.GAME_PERFORMANCE_MONITORING = 'true';
  
  console.log('✅ Global test setup complete');
}

module.exports = globalSetup;
