const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🐱 PET SELECTOR AUTO-DISMISS TEST\n');

  const page = await browser.newPage();

  console.log('Loading modular version...');
  await page.goto('http://localhost:3000/src/index.html');

  // Wait for game to load
  await page.waitForTimeout(1000);

  console.log('\n📸 Taking screenshot at T+1s (should be VISIBLE)...');
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  await page.screenshot({
    path: path.join(tmpDir, `pet-selector-visible-${timestamp}.png`)
  });

  const initialState = await page.evaluate(() => {
    const container = document.getElementById('petSelectorContainer');
    return {
      exists: !!container,
      display: container?.style.display || 'default',
      offsetWidth: container?.offsetWidth || 0,
      visible: container?.offsetWidth > 0
    };
  });

  console.log('\nInitial state (T+1s):');
  console.log(`  Container exists: ${initialState.exists ? '✅' : '❌'}`);
  console.log(`  Display style: ${initialState.display}`);
  console.log(`  Visible: ${initialState.visible ? '✅ YES' : '❌ NO'}`);

  // Wait for auto-dismiss (2 seconds after sprites load)
  console.log('\n⏳ Waiting 4 seconds for auto-dismiss...');
  await page.waitForTimeout(4000);

  console.log('\n📸 Taking screenshot at T+5s (should be HIDDEN)...');
  await page.screenshot({
    path: path.join(tmpDir, `pet-selector-hidden-${timestamp}.png`)
  });

  const finalState = await page.evaluate(() => {
    const container = document.getElementById('petSelectorContainer');
    return {
      exists: !!container,
      display: container?.style.display || 'default',
      offsetWidth: container?.offsetWidth || 0,
      visible: container?.offsetWidth > 0
    };
  });

  console.log('\nFinal state (T+5s):');
  console.log(`  Container exists: ${finalState.exists ? '✅' : '❌'}`);
  console.log(`  Display style: ${finalState.display}`);
  console.log(`  Visible: ${finalState.visible ? '❌ STILL VISIBLE' : '✅ HIDDEN'}`);

  // Check console logs for hide message
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  console.log('\n📊 TEST RESULT:');
  if (!initialState.visible) {
    console.log('  ❌ FAIL: Panel was not visible initially!');
  } else if (finalState.visible) {
    console.log('  ❌ FAIL: Panel did not auto-dismiss!');
  } else {
    console.log('  ✅ PASS: Panel auto-dismissed successfully!');
  }

  console.log(`\n📸 Screenshots saved to tmp/`);
  console.log('\n⏸️  Keeping browser open for 10 seconds for inspection...');

  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
