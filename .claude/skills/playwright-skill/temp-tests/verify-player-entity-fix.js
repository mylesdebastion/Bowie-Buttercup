const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🎮 PLAYER ENTITY FIX VERIFICATION\n');

  await page.goto('http://localhost:3000/src/index.html');

  // Wait for game initialization
  await page.waitForTimeout(3000);

  // Get diagnostic info
  const diagnostics = await page.evaluate(() => {
    const game = window.game;
    const player = game?.player;

    return {
      // Player entity type check
      playerConstructorName: player?.constructor?.name,
      playerHasSpriteSystem: !!player?.spriteSystem,
      playerUsingSpriteRendering: player?.useSpriteRendering,

      // Sprite loading status
      gameSpriteLoadedFlag: game?.spritesLoaded,
      sheetManagerStats: game?.spriteSystem?.sheetManager?.getStats(),
      areSheetsLoaded: game?.spriteSystem?.areSheetsLoaded(),

      // Player sprite system reference
      playerSpriteSystemExists: !!player?.spriteSystem,
      playerCanCheckSheets: typeof player?.spriteSystem?.areSheetsLoaded === 'function',
      playerSheetsLoaded: player?.spriteSystem?.areSheetsLoaded?.(),

      // Player state
      playerX: player?.x,
      playerY: player?.y,
      playerState: player?.state || player?.currentAnimation,
      playerFacing: player?.facing
    };
  });

  console.log('📊 DIAGNOSTICS AFTER PLAYER ENTITY FIX:');
  console.log(JSON.stringify(diagnostics, null, 2));

  // Capture screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  const screenshotPath = path.join(tmpDir, `player-entity-fix-${timestamp}.png`);

  await page.screenshot({ path: screenshotPath });
  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

  // Evaluate results
  console.log('\n✅ VERIFICATION RESULTS:');

  if (diagnostics.playerConstructorName === 'PlayerEntity') {
    console.log('  ✅ Using PlayerEntity (not legacy Player)');
  } else {
    console.log(`  ❌ Still using: ${diagnostics.playerConstructorName}`);
  }

  if (diagnostics.playerHasSpriteSystem) {
    console.log('  ✅ Player has spriteSystem reference');
  } else {
    console.log('  ❌ Player missing spriteSystem');
  }

  if (diagnostics.playerSheetsLoaded) {
    console.log('  ✅ Player can see loaded sprite sheets');
  } else {
    console.log('  ❌ Player cannot see loaded sheets');
  }

  if (diagnostics.gameSpriteLoadedFlag && diagnostics.areSheetsLoaded) {
    console.log('  ✅ Sprites fully loaded');
  } else {
    console.log('  ⚠️ Sprite loading incomplete');
  }

  console.log('\n⏸️  Keeping browser open for 10 seconds for visual inspection...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Verification complete!');
})();
