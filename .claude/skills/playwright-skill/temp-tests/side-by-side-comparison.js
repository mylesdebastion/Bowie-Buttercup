const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Create two pages
  const modularPage = await browser.newPage();
  const monolithicPage = await browser.newPage();

  console.log('\n📊 SIDE-BY-SIDE SPRITE COMPARISON\n');

  // Load both versions
  console.log('Loading modular version...');
  await modularPage.goto('http://localhost:3000/src/index.html');
  await modularPage.waitForTimeout(3000);

  console.log('Loading monolithic version...');
  await monolithicPage.goto('http://localhost:3000/index.html.monolithic-backup');
  await monolithicPage.waitForTimeout(3000);

  // Capture screenshots
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();

  const modularPath = path.join(tmpDir, `comparison-modular-${timestamp}.png`);
  const monolithicPath = path.join(tmpDir, `comparison-monolithic-${timestamp}.png`);

  await modularPage.screenshot({ path: modularPath });
  await monolithicPage.screenshot({ path: monolithicPath });

  console.log(`\n📸 Screenshots captured:`);
  console.log(`  Modular:    ${modularPath}`);
  console.log(`  Monolithic: ${monolithicPath}`);

  // Get sprite state from both
  const modularState = await modularPage.evaluate(() => {
    const game = window.game;
    const player = game?.player;

    return {
      gameExists: !!game,
      playerExists: !!player,
      playerState: player?.state || player?.currentAnimation,
      playerX: player?.x,
      playerY: player?.y,
      spritesLoaded: game?.player?.spriteSystem?.areSheetsLoaded?.() || false,
      usingSpriteRendering: player?.useSpriteRendering,
      hasChosenPet: !!window.localStorage?.getItem?.('selectedPet')
    };
  });

  const monolithicState = await monolithicPage.evaluate(() => {
    const game = window.game;
    const player = game?.player;

    return {
      gameExists: !!game,
      playerExists: !!player,
      playerState: player?.state,
      playerX: player?.x,
      playerY: player?.y,
      currentSheet: window.currentMapping?.sheet
    };
  });

  console.log(`\n📊 MODULAR STATE:`);
  console.log(JSON.stringify(modularState, null, 2));

  console.log(`\n📊 MONOLITHIC STATE:`);
  console.log(JSON.stringify(monolithicState, null, 2));

  console.log(`\n⏸️  Keeping browsers open for 30 seconds for manual inspection...`);
  console.log(`   Compare the two browser windows side-by-side\n`);

  await modularPage.waitForTimeout(30000);

  await browser.close();

  console.log('\n✅ Comparison complete!');
})();
