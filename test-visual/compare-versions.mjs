import VisualTestRunner from './scripts/visual-test-runner.js';

const runner = new VisualTestRunner({
  baseUrl: 'http://localhost:3000'
});

async function runTests() {
  try {
    await runner.init({ headless: false });
    console.log('✅ Visual test runner initialized');
    
    // Test monolithic version
    console.log('📸 Testing monolithic version...');
    await runner.navigateToGame('http://localhost:3000/index.html');
    await runner.navigateToLevel(5);
    await runner.captureScreenshot({
      description: 'level-5-bowls-monolithic',
      status: 'baseline',
      level: 5,
      viewport: 'desktop'
    });
    
    // Test modular version  
    console.log('📸 Testing modular version...');
    await runner.navigateToGame('http://localhost:3000/src/index.html?level=5');
    // Level is set via URL parameter, no need to call navigateToLevel
    await runner.captureScreenshot({
      description: 'level-5-bowls-modular',
      status: 'investigating',
      level: 5,
      viewport: 'desktop'
    });
    
    console.log('✅ Screenshots captured');
    await runner.cleanup();
  } catch (error) {
    console.error('❌ Test failed:', error);
    await runner.cleanup();
  }
}

runTests();