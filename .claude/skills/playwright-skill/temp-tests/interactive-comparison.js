// Interactive Visual Comparison Test
// Pauses after each screenshot for analysis
const { chromium } = require('playwright');
const helpers = require('./lib/helpers');
const fs = require('fs');
const path = require('path');

// Game URLs
const MODULAR_URL = 'http://localhost:3000/src/index.html';
const MONOLITHIC_URL = 'http://localhost:3000/index.html.monolithic-backup';

// Report file
const reportPath = path.join(__dirname, '..', '..', '..', 'tmp', 'visual-comparison-report.md');

function writeReport(content, append = true) {
  if (append && fs.existsSync(reportPath)) {
    fs.appendFileSync(reportPath, content + '\n');
  } else {
    fs.writeFileSync(reportPath, content + '\n');
  }
  console.log(content);
}

async function captureAndReport(page, testName, description) {
  console.log(`\n📸 Capturing: ${testName}`);
  const screenshot = await helpers.captureGameScreen(page, testName);

  // Wait a moment for screenshot to be written
  await page.waitForTimeout(500);

  writeReport(`\n### ${testName}`);
  writeReport(`**Test**: ${description}`);
  writeReport(`**Screenshot**: \`${path.basename(screenshot)}\``);
  writeReport(`**Timestamp**: ${new Date().toISOString()}`);

  return screenshot;
}

(async () => {
  writeReport('# Visual Comparison Test Report', false);
  writeReport(`**Date**: ${new Date().toLocaleString()}`);
  writeReport(`**Modular**: ${MODULAR_URL}`);
  writeReport(`**Monolithic**: ${MONOLITHIC_URL}`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50
  });

  try {
    // ============================================================
    // TEST MODULAR VERSION
    // ============================================================
    writeReport('\n## 🎮 MODULAR VERSION TESTS\n');

    const modularContext = await browser.newContext();
    const modularPage = await modularContext.newPage();

    console.log('\n' + '='.repeat(60));
    console.log('🎮 MODULAR VERSION');
    console.log('='.repeat(60));

    // Test 1: Initial Load
    writeReport('---');
    console.log('\n📋 Test 1: Initial Game Load');
    await modularPage.goto(MODULAR_URL, { waitUntil: 'networkidle' });
    await helpers.waitForGameReady(modularPage, { canvasSelector: '#gameCanvas' });
    await modularPage.waitForTimeout(1000);

    const modularInitial = await captureAndReport(
      modularPage,
      'modular-01-initial',
      'Initial game state after load'
    );

    const stats1 = await helpers.extractGameStats(modularPage);
    writeReport(`**Stats**: Score=${stats1.score}, Lives=${stats1.lives}`);
    writeReport(`**Expected**: Character visible, standing on ground, Score=0, Lives=3`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 2: Right Movement
    writeReport('---');
    console.log('\n📋 Test 2: Right Movement');
    await modularPage.waitForTimeout(1000);
    console.log('🎮 Pressing RIGHT for 500ms...');
    await helpers.movePlayer(modularPage, 'right', 500);
    await modularPage.waitForTimeout(300);

    await captureAndReport(
      modularPage,
      'modular-02-move-right',
      'Character after moving right for 500ms'
    );
    writeReport(`**Expected**: Character moved to the right, run animation visible`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 3: Jump
    writeReport('---');
    console.log('\n📋 Test 3: Jump');
    await modularPage.waitForTimeout(1000);
    console.log('🎮 Pressing JUMP...');
    await helpers.movePlayer(modularPage, 'jump', 200);
    await modularPage.waitForTimeout(400);

    await captureAndReport(
      modularPage,
      'modular-03-jump',
      'Character in mid-air after jump'
    );
    writeReport(`**Expected**: Character in air, jump animation visible`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 4: Left Movement
    writeReport('---');
    console.log('\n📋 Test 4: Left Movement');
    await modularPage.waitForTimeout(1000);
    console.log('🎮 Pressing LEFT for 500ms...');
    await helpers.movePlayer(modularPage, 'left', 500);
    await modularPage.waitForTimeout(300);

    await captureAndReport(
      modularPage,
      'modular-04-move-left',
      'Character after moving left'
    );
    writeReport(`**Expected**: Character moved left, facing left, run animation`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 5: Idle State
    writeReport('---');
    console.log('\n📋 Test 5: Idle/Sit State');
    await modularPage.waitForTimeout(2000);

    await captureAndReport(
      modularPage,
      'modular-05-idle',
      'Character idle after waiting 2 seconds'
    );
    writeReport(`**Expected**: Character in idle/sitting position`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    await modularContext.close();

    // ============================================================
    // TEST MONOLITHIC VERSION
    // ============================================================
    writeReport('\n## 🎮 MONOLITHIC BASELINE TESTS\n');

    const monoContext = await browser.newContext();
    const monoPage = await monoContext.newPage();

    console.log('\n' + '='.repeat(60));
    console.log('🎮 MONOLITHIC BASELINE');
    console.log('='.repeat(60));

    // Test 1: Initial Load
    writeReport('---');
    console.log('\n📋 Test 1: Initial Game Load');
    await monoPage.goto(MONOLITHIC_URL, { waitUntil: 'networkidle' });
    await helpers.waitForGameReady(monoPage, { canvasSelector: '#gameCanvas' });
    await monoPage.waitForTimeout(1000);

    const monoInitial = await captureAndReport(
      monoPage,
      'monolithic-01-initial',
      'Initial game state after load'
    );

    const stats2 = await helpers.extractGameStats(monoPage);
    writeReport(`**Stats**: Score=${stats2.score}, Lives=${stats2.lives}`);
    writeReport(`**Expected**: Character visible, standing on ground, Score=0, Lives=3`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 2: Right Movement
    writeReport('---');
    console.log('\n📋 Test 2: Right Movement');
    await monoPage.waitForTimeout(1000);
    console.log('🎮 Pressing RIGHT for 500ms...');
    await helpers.movePlayer(monoPage, 'right', 500);
    await monoPage.waitForTimeout(300);

    await captureAndReport(
      monoPage,
      'monolithic-02-move-right',
      'Character after moving right for 500ms'
    );
    writeReport(`**Expected**: Character moved to the right, run animation visible`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 3: Jump
    writeReport('---');
    console.log('\n📋 Test 3: Jump');
    await monoPage.waitForTimeout(1000);
    console.log('🎮 Pressing JUMP...');
    await helpers.movePlayer(monoPage, 'jump', 200);
    await monoPage.waitForTimeout(400);

    await captureAndReport(
      monoPage,
      'monolithic-03-jump',
      'Character in mid-air after jump'
    );
    writeReport(`**Expected**: Character in air, jump animation visible`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 4: Left Movement
    writeReport('---');
    console.log('\n📋 Test 4: Left Movement');
    await monoPage.waitForTimeout(1000);
    console.log('🎮 Pressing LEFT for 500ms...');
    await helpers.movePlayer(monoPage, 'left', 500);
    await monoPage.waitForTimeout(300);

    await captureAndReport(
      monoPage,
      'monolithic-04-move-left',
      'Character after moving left'
    );
    writeReport(`**Expected**: Character moved left, facing left, run animation`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    // Test 5: Idle State
    writeReport('---');
    console.log('\n📋 Test 5: Idle/Sit State');
    await monoPage.waitForTimeout(2000);

    await captureAndReport(
      monoPage,
      'monolithic-05-idle',
      'Character idle after waiting 2 seconds'
    );
    writeReport(`**Expected**: Character in idle/sitting position`);
    writeReport(`**Status**: ⏸️  PAUSE FOR VISUAL INSPECTION`);

    await monoContext.close();

    // ============================================================
    // SUMMARY
    // ============================================================
    writeReport('\n## 📊 TEST SUMMARY\n');
    writeReport(`Total Screenshots: 10 (5 modular + 5 monolithic)`);
    writeReport(`Report Location: ${reportPath}`);
    writeReport(`Screenshots Location: D:\\Github\\Bowie-Buttercup\\tmp\\`);
    writeReport('\n---');
    writeReport('**Next Steps**: Review all screenshots and compare visually');
    writeReport('**Focus Areas**: Character rendering, animation states, UI elements, positioning');

    console.log('\n' + '='.repeat(60));
    console.log('✅ Interactive test complete!');
    console.log(`📄 Report saved: ${reportPath}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    writeReport(`\n## ❌ ERROR\n${error.message}`);
  } finally {
    await browser.close();
  }
})();
