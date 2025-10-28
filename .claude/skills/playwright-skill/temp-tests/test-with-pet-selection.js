const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🐱 TESTING WITH PET SELECTION\n');

  await page.goto('http://localhost:3000/src/index.html');

  // Wait for game initialization
  await page.waitForTimeout(2000);

  console.log('📸 Screenshot BEFORE pet selection...');
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  await page.screenshot({ path: path.join(tmpDir, `before-selection-${timestamp}.png`) });

  // Click on "Bowie Cat" radio button
  console.log('🖱️  Clicking "Bowie Cat" selection...');
  await page.click('input[value="bowie"]');

  await page.waitForTimeout(500);

  // Check if pet is selected
  const petSelected = await page.evaluate(() => {
    const spriteSystem = window.game?.spriteSystem;
    const config = spriteSystem?.config;
    return {
      currentSheet: config?.getCurrentSheet(),
      localStorage: window.localStorage?.getItem('selectedPet')
    };
  });

  console.log('✅ Pet selected:', petSelected);

  await page.waitForTimeout(1000);

  console.log('📸 Screenshot AFTER pet selection...');
  await page.screenshot({ path: path.join(tmpDir, `after-selection-${timestamp}.png`) });

  // Get sprite rendering status
  const renderStatus = await page.evaluate(() => {
    const game = window.game;
    const player = game?.player;
    const spriteSystem = player?.spriteSystem;

    return {
      playerSpriteSystem: !!player?.spriteSystem,
      sheetsLoaded: spriteSystem?.areSheetsLoaded?.(),
      currentSheet: spriteSystem?.config?.getCurrentSheet(),
      animationState: spriteSystem?.getAnimationState?.(),
      animationFrame: spriteSystem?.animationController?.getCurrentFrame?.(),
      usingSpriteRendering: player?.useSpriteRendering
    };
  });

  console.log('\n📊 RENDER STATUS AFTER SELECTION:');
  console.log(JSON.stringify(renderStatus, null, 2));

  console.log('\n⏸️  Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
