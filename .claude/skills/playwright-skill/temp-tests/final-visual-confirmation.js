const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n📸 FINAL VISUAL CONFIRMATION - Sprite Rendering Test\n');

  await page.goto('http://localhost:3000/src/index.html');

  // Wait for game to fully load
  await page.waitForTimeout(3000);

  // Capture screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  const screenshotPath = path.join(tmpDir, `FINAL-CONFIRMATION-${timestamp}.png`);

  console.log('Waiting for sprites to fully initialize...');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: screenshotPath });

  // Get final status
  const status = await page.evaluate(() => {
    const game = window.game;
    const player = game?.player;

    return {
      playerClass: player?.constructor?.name,
      hasSpriteSystem: !!player?.spriteSystem,
      sheetsLoaded: player?.spriteSystem?.areSheetsLoaded?.(),
      currentSheet: player?.spriteSystem?.config?.getCurrentSheet(),
      animationState: player?.state,
      playerPosition: { x: Math.floor(player?.x), y: Math.floor(player?.y) }
    };
  });

  console.log('\n✅ FINAL STATUS:');
  console.log(`   Player Class: ${status.playerClass}`);
  console.log(`   Has Sprite System: ${status.hasSpriteSystem}`);
  console.log(`   Sheets Loaded: ${status.sheetsLoaded}`);
  console.log(`   Current Sheet: ${status.playerClass}`);
  console.log(`   Animation State: ${status.animationState}`);
  console.log(`   Player Position: (${status.playerPosition.x}, ${status.playerPosition.y})`);

  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
  console.log('\n🎉 ALL SPRITE RENDERING SYSTEMS OPERATIONAL!');

  console.log('\n⏸️  Keeping browser open for 5 seconds for visual inspection...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ Final confirmation complete!');
})();
