/**
 * Global Playwright Test Teardown
 * 
 * Cleans up after cross-browser tests complete
 */

async function globalTeardown(config) {
  console.log('🧟 Starting global test teardown...');
  
  // Generate cross-browser compatibility report
  const fs = require('fs');
  const path = require('path');
  
  try {
    const resultsPath = path.join(__dirname, '../../test-results/playwright-results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      // Generate compatibility matrix
      const compatibilityReport = generateCompatibilityReport(results);
      
      const reportPath = path.join(__dirname, '../../test-results/cross-browser-compatibility.json');
      fs.writeFileSync(reportPath, JSON.stringify(compatibilityReport, null, 2));
      
      console.log('📊 Cross-browser compatibility report generated');
      console.log(`Total tests: ${compatibilityReport.totalTests}`);
      console.log(`Passed: ${compatibilityReport.passed}`);
      console.log(`Failed: ${compatibilityReport.failed}`);
      console.log(`Success rate: ${compatibilityReport.successRate}%`);
    }
  } catch (error) {
    console.log('⚠️ Could not generate compatibility report:', error.message);
  }
  
  // Clean up environment variables
  delete process.env.PLAYWRIGHT_TEST_MODE;
  delete process.env.GAME_PERFORMANCE_MONITORING;
  
  console.log('✅ Global test teardown complete');
}

function generateCompatibilityReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.suites?.length || 0,
    passed: 0,
    failed: 0,
    browsers: {},
    features: {},
    performance: {}
  };
  
  // Process test results
  if (results.suites) {
    results.suites.forEach(suite => {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          if (spec.tests) {
            spec.tests.forEach(test => {
              const browserName = extractBrowserName(test.projectName || 'unknown');
              
              if (!report.browsers[browserName]) {
                report.browsers[browserName] = {
                  total: 0,
                  passed: 0,
                  failed: 0,
                  tests: []
                };
              }
              
              report.browsers[browserName].total++;
              
              if (test.results && test.results.length > 0) {
                const result = test.results[0];
                if (result.status === 'passed') {
                  report.passed++;
                  report.browsers[browserName].passed++;
                } else {
                  report.failed++;
                  report.browsers[browserName].failed++;
                }
                
                report.browsers[browserName].tests.push({
                  name: test.title,
                  status: result.status,
                  duration: result.duration
                });
              }
            });
          }
        });
      }
    });
  }
  
  // Calculate success rate
  const totalTests = report.passed + report.failed;
  report.successRate = totalTests > 0 ? Math.round((report.passed / totalTests) * 100) : 0;
  
  return report;
}

function extractBrowserName(projectName) {
  const browserMap = {
    'chromium': 'Chrome',
    'firefox': 'Firefox', 
    'webkit': 'Safari',
    'mobile-chrome': 'Mobile Chrome',
    'mobile-safari': 'Mobile Safari'
  };
  
  for (const [key, value] of Object.entries(browserMap)) {
    if (projectName.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return 'Unknown';
}

module.exports = globalTeardown;
