const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console logs from the page
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleLogs.push(`[ERROR] ${error.message}`);
  });

  console.log('\n🔗 URL ROUTING TEST\n');

  // Test 1: /calmbowie should load Bowie Cat
  console.log('Test 1: Navigating to http://localhost:3000/calmbowie');
  try {
    await page.goto('http://localhost:3000/calmbowie', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Shorter wait to check before auto-dismiss

    // Check if page loaded
    const pathname = await page.evaluate(() => window.location.pathname);
    console.log(`  ✓ Page loaded, pathname: ${pathname}`);

    // Check pet selector state and all radio buttons
    const debugInfo = await page.evaluate(() => {
      const radio = document.querySelector('input[name="petSelection"]:checked');
      const container = document.getElementById('petSelectorContainer');
      const isVisible = container && container.style.display !== 'none';

      // Get all radio buttons and their state
      const allRadios = Array.from(document.querySelectorAll('input[name="petSelection"]')).map(r => ({
        value: r.value,
        checked: r.checked
      }));

      return {
        selectedPet: radio ? radio.value : 'none',
        selectorVisible: isVisible,
        allRadios: allRadios,
        radioCount: allRadios.length
      };
    });

    console.log(`  • Pet selector visible: ${debugInfo.selectorVisible}`);
    console.log(`  • Radio buttons found: ${debugInfo.radioCount}`);
    console.log(`  • All radios:`, JSON.stringify(debugInfo.allRadios));
    console.log(`  • Selected pet: ${debugInfo.selectedPet}`);

    if (debugInfo.selectedPet === 'A') {
      console.log('  ✅ SUCCESS: Bowie Cat (A) is selected');
    } else {
      console.log(`  ❌ FAIL: Expected Pet A, got ${debugInfo.selectedPet}`);
    }

    // Print console logs
    console.log('\n  📋 Console logs:');
    consoleLogs.slice(-10).forEach(log => console.log(`    ${log}`));
    consoleLogs.length = 0; // Clear for next test
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }

  await page.waitForTimeout(2000);

  // Test 2: /curiousbuttercup should load Buttercup Cat
  console.log('\nTest 2: Navigating to http://localhost:3000/curiousbuttercup');
  try {
    await page.goto('http://localhost:3000/curiousbuttercup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Shorter wait to check before auto-dismiss

    // Check if page loaded
    const pathname = await page.evaluate(() => window.location.pathname);
    console.log(`  ✓ Page loaded, pathname: ${pathname}`);

    // Check pet selector state and all radio buttons
    const debugInfo = await page.evaluate(() => {
      const radio = document.querySelector('input[name="petSelection"]:checked');
      const container = document.getElementById('petSelectorContainer');
      const isVisible = container && container.style.display !== 'none';

      // Get all radio buttons and their state
      const allRadios = Array.from(document.querySelectorAll('input[name="petSelection"]')).map(r => ({
        value: r.value,
        checked: r.checked
      }));

      return {
        selectedPet: radio ? radio.value : 'none',
        selectorVisible: isVisible,
        allRadios: allRadios,
        radioCount: allRadios.length
      };
    });

    console.log(`  • Pet selector visible: ${debugInfo.selectorVisible}`);
    console.log(`  • Radio buttons found: ${debugInfo.radioCount}`);
    console.log(`  • All radios:`, JSON.stringify(debugInfo.allRadios));
    console.log(`  • Selected pet: ${debugInfo.selectedPet}`);

    if (debugInfo.selectedPet === 'B') {
      console.log('  ✅ SUCCESS: Buttercup Cat (B) is selected');
    } else {
      console.log(`  ❌ FAIL: Expected Pet B, got ${debugInfo.selectedPet}`);
    }

    // Print console logs
    console.log('\n  📋 Console logs:');
    consoleLogs.slice(-10).forEach(log => console.log(`    ${log}`));
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
  }

  console.log('\n⏸️  Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
