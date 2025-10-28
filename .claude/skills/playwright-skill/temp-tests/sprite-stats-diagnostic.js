const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🔍 SPRITE STATS DIAGNOSTIC\n');

  await page.goto('http://localhost:3000/src/index.html');

  // Wait for game initialization
  await page.waitForTimeout(3000);

  // Get detailed sprite stats
  const diagnostics = await page.evaluate(() => {
    const game = window.game;
    const spriteSystem = game?.spriteSystem;
    const sheetManager = spriteSystem?.sheetManager;

    if (!sheetManager) {
      return { error: 'SheetManager not found' };
    }

    // Get stats
    const stats = sheetManager.getStats();

    // Get areSheetsLoaded result
    const areSheetsLoaded = spriteSystem.areSheetsLoaded();

    // Get individual sheet status
    const sheets = {};
    ['A', 'B', 'dog'].forEach(id => {
      const sheet = sheetManager.sheets[id];
      sheets[id] = {
        exists: !!sheet,
        hasImg: sheet && sheet.img !== null,
        imgWidth: sheet?.img?.width,
        imgHeight: sheet?.img?.height
      };
    });

    return {
      gameSpriteLoadedFlag: game.spritesLoaded,
      areSheetsLoadedResult: areSheetsLoaded,
      stats: stats,
      individualSheets: sheets,
      playerUsingSpriteRendering: game.player?.useSpriteRendering,
      playerSpriteSystemExists: !!game.player?.spriteSystem
    };
  });

  console.log('📊 DIAGNOSTIC RESULTS:');
  console.log(JSON.stringify(diagnostics, null, 2));

  console.log('\n✅ Analysis complete. Check the output above.');

  await page.waitForTimeout(5000);
  await browser.close();
})();
