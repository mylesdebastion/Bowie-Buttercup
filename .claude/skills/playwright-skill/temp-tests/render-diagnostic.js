const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🔍 RENDER DIAGNOSTIC - Tracking sprite rendering calls\n');

  // Inject console log capture
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('mapping') || text.includes('Sheet') || text.includes('sprite')) {
      console.log(`🌐 Browser: ${text}`);
    }
  });

  await page.goto('http://localhost:3000/src/index.html');

  // Wait for initialization
  await page.waitForTimeout(2000);

  // Get detailed render diagnostic
  const diagnostic = await page.evaluate(() => {
    const game = window.game;
    const player = game?.player;
    const spriteSystem = player?.spriteSystem;
    const config = spriteSystem?.config;
    const animController = spriteSystem?.animationController;

    // Try to get sprite manually
    const currentState = animController?.getCurrentState();
    const currentFrame = animController?.getCurrentFrame();
    const currentSheet = config?.getCurrentSheet();

    let mapping = null;
    let testSprite = null;
    try {
      mapping = config?.getMappingForPlayerState(currentState, currentFrame);
      testSprite = spriteSystem?.getSpriteForState(currentState, currentFrame);
    } catch (e) {
      console.log(`Error getting sprite: ${e.message}`);
    }

    return {
      playerState: player?.state,
      animationState: currentState,
      animationFrame: currentFrame,
      currentSheet: currentSheet,
      mappingExists: !!mapping,
      mappingDetails: mapping ? {
        cellIndex: mapping.cellIndex,
        sheetId: mapping.sheetId
      } : null,
      spriteExists: !!testSprite,
      spriteDetails: testSprite ? {
        hasImg: !!testSprite.img,
        hasCrop: !!testSprite.crop,
        cropValue: testSprite.crop
      } : null,
      configStats: {
        availableConfigs: config?.getAvailableConfigs(),
        defaultSheet: config?.getCurrentSheet()
      }
    };
  });

  console.log('\n📊 RENDER DIAGNOSTIC:');
  console.log(JSON.stringify(diagnostic, null, 2));

  // Analyze results
  console.log('\n✅ ANALYSIS:');

  if (!diagnostic.currentSheet) {
    console.log('  ❌ PROBLEM: No current sheet selected!');
    console.log('     The sprite config needs a default sheet');
  } else {
    console.log(`  ✅ Current sheet: ${diagnostic.currentSheet}`);
  }

  if (!diagnostic.mappingExists) {
    console.log(`  ❌ PROBLEM: No mapping for state "${diagnostic.animationState}" frame ${diagnostic.animationFrame}`);
  } else {
    console.log(`  ✅ Mapping found: ${JSON.stringify(diagnostic.mappingDetails)}`);
  }

  if (!diagnostic.spriteExists) {
    console.log('  ❌ PROBLEM: getSpriteForState() returned null');
  } else {
    console.log(`  ✅ Sprite object created`);
    console.log(`     - Has image: ${diagnostic.spriteDetails.hasImg}`);
    console.log(`     - Has crop: ${diagnostic.spriteDetails.hasCrop}`);
    console.log(`     - Crop: [${diagnostic.spriteDetails.cropValue}]`);
  }

  console.log('\n⏸️  Browser staying open for 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ Diagnostic complete!');
})();
