// Comprehensive Visual & Functional Parity Test
// Tests modular game against monolithic baseline
const { chromium } = require('playwright');
const helpers = require('./lib/helpers');

// Game URLs (we'll test both simultaneously)
const MODULAR_URL = 'http://localhost:3000/src/index.html';
const MONOLITHIC_URL = 'http://localhost:3000/index.html.monolithic-backup';

async function testGame(browser, url, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎮 Testing ${label}: ${url}`);
  console.log('='.repeat(60));

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and wait for game
    console.log('📥 Loading game...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for canvas and game initialization
    await helpers.waitForGameReady(page, {
      canvasSelector: '#gameCanvas',
      timeout: 15000
    });

    console.log('✅ Game loaded successfully');

    // Capture initial state
    await page.waitForTimeout(1000);
    await helpers.captureGameScreen(page, `${label}-initial`);
    console.log(`📸 Captured initial state: ${label}-initial.png`);

    // Extract initial game stats
    const initialStats = await helpers.extractGameStats(page);
    console.log('📊 Initial Game Stats:', initialStats);

    // Test 1: Character Display
    console.log('\n🧪 Test 1: Character Display');
    const canvasVisible = await page.isVisible('#gameCanvas');
    console.log(`   Canvas visible: ${canvasVisible ? '✅' : '❌'}`);

    // Test 2: Right Movement
    console.log('\n🧪 Test 2: Right Movement (500ms)');
    await helpers.movePlayer(page, 'right', 500);
    await page.waitForTimeout(200);
    await helpers.captureGameScreen(page, `${label}-move-right`);

    const statsAfterRight = await helpers.extractGameStats(page);
    console.log(`   Position changed: ${JSON.stringify(statsAfterRight.position) !== JSON.stringify(initialStats.position) ? '✅' : '❌'}`);

    // Test 3: Jump
    console.log('\n🧪 Test 3: Jump');
    await helpers.movePlayer(page, 'jump', 200);
    await page.waitForTimeout(300);
    await helpers.captureGameScreen(page, `${label}-jump`);
    console.log('   Jump executed: ✅');

    // Test 4: Left Movement
    console.log('\n🧪 Test 4: Left Movement (500ms)');
    await helpers.movePlayer(page, 'left', 500);
    await page.waitForTimeout(200);
    await helpers.captureGameScreen(page, `${label}-move-left`);
    console.log('   Left movement executed: ✅');

    // Test 5: Combined Movement Sequence
    console.log('\n🧪 Test 5: Movement Sequence (Right + Jump + Right)');
    await helpers.executeActionSequence(page, [
      { direction: 'right', duration: 300 },
      { direction: 'jump', duration: 150, wait: 100 },
      { direction: 'right', duration: 300 }
    ]);
    await page.waitForTimeout(500);
    await helpers.captureGameScreen(page, `${label}-sequence`);
    console.log('   Sequence completed: ✅');

    // Test 6: Performance Check
    console.log('\n🧪 Test 6: Performance Monitoring (5s)');
    const performancePromise = helpers.monitorPerformance(page, 5000);

    // Simulate active gameplay during monitoring
    await helpers.movePlayer(page, 'right', 1000);
    await helpers.movePlayer(page, 'jump', 200);
    await helpers.movePlayer(page, 'left', 1000);
    await helpers.movePlayer(page, 'jump', 200);

    const metrics = await performancePromise;
    console.log(`   Average FPS: ${metrics.averageFPS.toFixed(1)}`);
    console.log(`   Min FPS: ${metrics.minFPS.toFixed(1)}`);
    console.log(`   Max FPS: ${metrics.maxFPS.toFixed(1)}`);
    console.log(`   Performance: ${metrics.averageFPS >= 55 ? '✅ Good' : metrics.averageFPS >= 30 ? '⚠️  Acceptable' : '❌ Poor'}`);

    // Test 7: Final State
    console.log('\n🧪 Test 7: Final Game State');
    const finalStats = await helpers.extractGameStats(page);
    console.log('   Final Stats:', finalStats);
    await helpers.captureGameScreen(page, `${label}-final`);

    // Test 8: Player Controls Verification
    console.log('\n🧪 Test 8: All Player Controls');
    const controlTests = await helpers.testPlayerControls(page);
    console.log('   Control Tests:', controlTests);

    console.log(`\n✅ ${label} testing complete!`);

    return {
      label,
      url,
      initialStats,
      finalStats,
      metrics,
      controlTests,
      success: true
    };

  } catch (error) {
    console.error(`\n❌ Error testing ${label}:`, error.message);
    await helpers.captureGameScreen(page, `${label}-error`);
    return {
      label,
      url,
      error: error.message,
      success: false
    };
  } finally {
    await context.close();
  }
}

(async () => {
  console.log('🎭 BMad Party Mode: Visual & Functional Parity Test');
  console.log('📋 Comparing Modular vs Monolithic Baseline\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100 // Slow down for visibility
  });

  try {
    // Test both versions
    const modularResults = await testGame(browser, MODULAR_URL, 'Modular');
    const monolithicResults = await testGame(browser, MONOLITHIC_URL, 'Monolithic-Baseline');

    // Comparison Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPARISON REPORT');
    console.log('='.repeat(60));

    if (modularResults.success && monolithicResults.success) {
      console.log('\n✅ Both versions loaded successfully!');

      console.log('\n🎮 Performance Comparison:');
      console.log(`   Modular FPS:     ${modularResults.metrics.averageFPS.toFixed(1)}`);
      console.log(`   Monolithic FPS:  ${monolithicResults.metrics.averageFPS.toFixed(1)}`);
      console.log(`   Difference:      ${Math.abs(modularResults.metrics.averageFPS - monolithicResults.metrics.averageFPS).toFixed(1)} FPS`);

      console.log('\n🎯 Controls Comparison:');
      console.log('   Modular:', modularResults.controlTests);
      console.log('   Monolithic:', monolithicResults.controlTests);

      console.log('\n📸 Screenshots saved to:');
      console.log('   D:\\Github\\Bowie-Buttercup\\.claude\\skills\\playwright-skill\\screenshots\\');

      console.log('\n🔍 Next Steps:');
      console.log('   1. Compare screenshots visually');
      console.log('   2. Check for rendering differences');
      console.log('   3. Verify character movement appears identical');
      console.log('   4. Validate game mechanics match baseline');

    } else {
      console.log('\n❌ One or both versions failed to load');
      console.log('   Modular:', modularResults.success ? '✅' : '❌');
      console.log('   Monolithic:', monolithicResults.success ? '✅' : '❌');
    }

    console.log('\n🎉 Testing session complete!');

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await browser.close();
  }
})();
