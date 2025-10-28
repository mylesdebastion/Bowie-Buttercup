const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🔍 RENDER CALL TRACE - Track actual rendering\n');

  // Capture all console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('RENDER') || text.includes('sprite') || text.includes('ERROR')) {
      console.log(`🌐 ${text}`);
    }
  });

  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(2000);

  // Inject logging into render pipeline
  await page.evaluate(() => {
    const player = window.game?.player;

    // Wrap player render
    if (player && player.render) {
      const originalRender = player.render.bind(player);
      player.render = function(ctx, camera) {
        console.log('🎨 RENDER: PlayerEntity.render() called');
        console.log(`  - useSpriteRendering: ${this.useSpriteRendering}`);
        console.log(`  - spriteSystem exists: ${!!this.spriteSystem}`);
        console.log(`  - areSheetsLoaded: ${this.spriteSystem?.areSheetsLoaded?.()}`);

        try {
          originalRender(ctx, camera);
          console.log('✅ RENDER: PlayerEntity.render() completed');
        } catch (e) {
          console.log(`❌ RENDER ERROR: ${e.message}`);
          console.log(e.stack);
        }
      };
    }

    // Wrap sprite system render
    const spriteSystem = player?.spriteSystem;
    if (spriteSystem && spriteSystem.render) {
      const originalSpriteRender = spriteSystem.render.bind(spriteSystem);
      spriteSystem.render = function(ctx, x, y, width, height, options) {
        const state = this.animationController?.getCurrentState();
        const frame = this.animationController?.getCurrentFrame();
        console.log(`🎨 RENDER: SpriteSystem.render() called`);
        console.log(`  - state: ${state}, frame: ${frame}`);
        console.log(`  - position: (${x}, ${y}), size: ${width}x${height}`);

        const sprite = this.getSpriteForState(state, frame);
        console.log(`  - sprite exists: ${!!sprite}`);
        if (sprite) {
          console.log(`  - sprite.img exists: ${!!sprite.img}`);
          console.log(`  - sprite.crop: [${sprite.crop}]`);
        }

        try {
          originalSpriteRender(ctx, x, y, width, height, options);
          console.log('✅ RENDER: SpriteSystem.render() completed');
        } catch (e) {
          console.log(`❌ SPRITE RENDER ERROR: ${e.message}`);
        }
      };
    }
  });

  console.log('Waiting for render calls...\n');
  await page.waitForTimeout(3000);

  console.log('\n✅ Trace complete! Check logs above.');

  await page.waitForTimeout(2000);
  await browser.close();
})();
