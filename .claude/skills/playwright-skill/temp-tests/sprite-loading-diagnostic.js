const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[${msg.type().toUpperCase()}]`, text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  console.log('\n🔍 SPRITE LOADING DIAGNOSTIC TEST\n');
  console.log('Loading modular game...');
  await page.goto('http://localhost:3000/src/index.html');

  console.log('Waiting 5 seconds for game initialization...\n');
  await page.waitForTimeout(5000);

  // Get detailed sprite system state
  const spriteState = await page.evaluate(() => {
    const game = window.game;
    if (!game) return { error: 'Game not found' };

    // Check sprite system
    const player = game.player;
    const spriteSystem = player?.spriteSystem;
    const sheetManager = spriteSystem?.sheetManager;

    return {
      gameExists: !!game,
      playerExists: !!player,
      spriteSystemExists: !!spriteSystem,
      sheetManagerExists: !!sheetManager,

      player: {
        useSpriteRendering: player?.useSpriteRendering,
        currentAnimation: player?.currentAnimation,
        facing: player?.facing
      },

      spriteSystem: {
        areSheetsLoaded: spriteSystem?.areSheetsLoaded?.(),
        stats: spriteSystem?.sheetManager?.getStats?.()
      },

      sheets: {
        A: {
          loaded: !!sheetManager?.sheets?.A?.img,
          width: sheetManager?.sheets?.A?.img?.width,
          height: sheetManager?.sheets?.A?.img?.height
        },
        B: {
          loaded: !!sheetManager?.sheets?.B?.img,
          width: sheetManager?.sheets?.B?.img?.width,
          height: sheetManager?.sheets?.B?.img?.height
        },
        dog: {
          loaded: !!sheetManager?.sheets?.dog?.img,
          width: sheetManager?.sheets?.dog?.img?.width,
          height: sheetManager?.sheets?.dog?.img?.height
        }
      },

      consoleErrorCount: consoleMessages.filter(m => m.type === 'error').length
    };
  });

  console.log('📊 SPRITE SYSTEM STATE:\n');
  console.log('Game Components:');
  console.log('  Game exists:', spriteState.gameExists ? '✅' : '❌');
  console.log('  Player exists:', spriteState.playerExists ? '✅' : '❌');
  console.log('  Sprite system exists:', spriteState.spriteSystemExists ? '✅' : '❌');
  console.log('  Sheet manager exists:', spriteState.sheetManagerExists ? '✅' : '❌');

  console.log('\nPlayer Config:');
  console.log('  useSpriteRendering:', spriteState.player.useSpriteRendering);
  console.log('  currentAnimation:', spriteState.player.currentAnimation);
  console.log('  facing:', spriteState.player.facing);

  console.log('\nSprite System:');
  console.log('  areSheetsLoaded():', spriteState.spriteSystem.areSheetsLoaded);
  console.log('  Stats:', JSON.stringify(spriteState.spriteSystem.stats, null, 2));

  console.log('\nLoaded Sheets:');
  console.log('  Sheet A (Bowie):', spriteState.sheets.A.loaded ? `✅ ${spriteState.sheets.A.width}x${spriteState.sheets.A.height}` : '❌ NOT LOADED');
  console.log('  Sheet B (Buttercup):', spriteState.sheets.B.loaded ? `✅ ${spriteState.sheets.B.width}x${spriteState.sheets.B.height}` : '❌ NOT LOADED');
  console.log('  Sheet dog:', spriteState.sheets.dog.loaded ? `✅ ${spriteState.sheets.dog.width}x${spriteState.sheets.dog.height}` : '❌ NOT LOADED');

  console.log('\nConsole Messages Related to Sprites:');
  const spriteMessages = consoleMessages.filter(m =>
    m.text.toLowerCase().includes('sprite') ||
    m.text.toLowerCase().includes('sheet') ||
    m.text.toLowerCase().includes('load')
  );
  spriteMessages.forEach(m => console.log(`  [${m.type}]`, m.text));

  console.log('\nAll Console Errors:');
  const errors = consoleMessages.filter(m => m.type === 'error');
  if (errors.length === 0) {
    console.log('  None!');
  } else {
    errors.forEach(err => console.log('  -', err.text));
  }

  // Capture screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const screenshotPath = path.join(tmpDir, `sprite-diagnostic-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`\n📸 Screenshot: ${screenshotPath}`);

  console.log('\n⏸️  Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSIS SUMMARY:');
  if (spriteState.spriteSystem.areSheetsLoaded) {
    console.log('✅ Sprites are loaded and should be rendering!');
    console.log('   If you see rectangles, check SpriteRenderer logic.');
  } else {
    console.log('❌ Sprites NOT loaded!');
    console.log('   Reason: loadingProgress =', spriteState.spriteSystem.stats?.loadingProgress);
    console.log('   Check console messages above for loading errors.');
  }
  console.log('='.repeat(60));
})();
