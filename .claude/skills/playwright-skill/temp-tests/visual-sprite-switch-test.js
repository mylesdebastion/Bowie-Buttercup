const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🎨 VISUAL SPRITE SWITCHING TEST\n');

  const page = await browser.newPage();

  console.log('Loading modular version with Bowie Cat (default)...');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(3000);

  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();

  // Take screenshot of Bowie Cat
  console.log('📸 Screenshot 1: Bowie Cat (gray tabby)');
  await page.screenshot({
    path: path.join(tmpDir, `sprite-bowie-${timestamp}.png`)
  });

  // Click Buttercup Cat
  console.log('\n🖱️  Switching to Buttercup Cat...');
  await page.click('input[value="B"]');
  await page.waitForTimeout(2000);

  // Take screenshot of Buttercup Cat
  console.log('📸 Screenshot 2: Buttercup Cat (cream cat)');
  await page.screenshot({
    path: path.join(tmpDir, `sprite-buttercup-${timestamp}.png`)
  });

  // Test URL-based selection: /calmbowie
  console.log('\n🌐 Testing URL: /calmbowie');
  await page.goto('http://localhost:3000/src/calmbowie');
  await page.waitForTimeout(3000);

  console.log('📸 Screenshot 3: /calmbowie (should be Bowie)');
  await page.screenshot({
    path: path.join(tmpDir, `sprite-url-bowie-${timestamp}.png`)
  });

  // Test URL-based selection: /curiousbuttercup
  console.log('\n🌐 Testing URL: /curiousbuttercup');
  await page.goto('http://localhost:3000/src/curiousbuttercup');
  await page.waitForTimeout(3000);

  console.log('📸 Screenshot 4: /curiousbuttercup (should be Buttercup)');
  await page.screenshot({
    path: path.join(tmpDir, `sprite-url-buttercup-${timestamp}.png`)
  });

  console.log(`\n✅ All screenshots saved to tmp/`);
  console.log('📝 Compare screenshots visually to verify:');
  console.log(`   - sprite-bowie-${timestamp}.png (gray tabby)`);
  console.log(`   - sprite-buttercup-${timestamp}.png (cream cat)`);
  console.log(`   - sprite-url-bowie-${timestamp}.png (gray tabby from URL)`);
  console.log(`   - sprite-url-buttercup-${timestamp}.png (cream cat from URL)`);

  console.log('\n⏸️  Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
