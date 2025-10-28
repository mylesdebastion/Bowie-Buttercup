const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🔄 PET SWITCHING TEST\n');

  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  console.log('Loading modular version...');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(2000);

  // Get initial state
  const initialState = await page.evaluate(() => {
    const game = window.game;
    const petSelector = game?.petSelector;
    return {
      currentPet: petSelector?.currentPet || 'unknown',
      spriteSystemSheet: game?.spriteSystem?.currentSheet || 'unknown',
      playerSprite: game?.player?.sprite || 'none'
    };
  });

  console.log('\n📊 INITIAL STATE:');
  console.log(`  Selected Pet: ${initialState.currentPet}`);
  console.log(`  Sprite System Sheet: ${initialState.spriteSystemSheet}`);
  console.log(`  Player Sprite: ${initialState.playerSprite}`);

  // Take initial screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  await page.screenshot({
    path: path.join(tmpDir, `pet-before-${timestamp}.png`)
  });

  // Click on Buttercup Cat radio button
  console.log('\n🖱️  Clicking Buttercup Cat radio button...');
  await page.click('input[value="B"]');
  await page.waitForTimeout(1000);

  // Get state after clicking
  const afterClickState = await page.evaluate(() => {
    const game = window.game;
    const petSelector = game?.petSelector;
    return {
      currentPet: petSelector?.currentPet || 'unknown',
      spriteSystemSheet: game?.spriteSystem?.currentSheet || 'unknown',
      playerSprite: game?.player?.sprite || 'none',
      configLoaded: game?.spriteSystem?.config?.currentConfig?.name || 'none'
    };
  });

  console.log('\n📊 AFTER CLICK STATE:');
  console.log(`  Selected Pet: ${afterClickState.currentPet}`);
  console.log(`  Sprite System Sheet: ${afterClickState.spriteSystemSheet}`);
  console.log(`  Player Sprite: ${afterClickState.playerSprite}`);
  console.log(`  Config Loaded: ${afterClickState.configLoaded}`);

  // Take screenshot after switch
  await page.screenshot({
    path: path.join(tmpDir, `pet-after-${timestamp}.png`)
  });

  // Check console logs for changePet calls
  console.log('\n📝 RELEVANT CONSOLE LOGS:');
  logs.filter(log => log.includes('pet') || log.includes('Pet') || log.includes('Switching')).forEach(log => {
    console.log(`  ${log}`);
  });

  // Verify the switch worked
  console.log('\n📊 TEST RESULT:');
  if (initialState.currentPet === 'A' && afterClickState.currentPet === 'B') {
    console.log('  ✅ Pet selector state changed correctly (A → B)');
  } else {
    console.log(`  ❌ Pet selector state FAILED (${initialState.currentPet} → ${afterClickState.currentPet})`);
  }

  if (afterClickState.spriteSystemSheet === 'B') {
    console.log('  ✅ Sprite system sheet updated correctly');
  } else {
    console.log(`  ❌ Sprite system sheet NOT updated (expected B, got ${afterClickState.spriteSystemSheet})`);
  }

  if (afterClickState.configLoaded.includes('Buttercup')) {
    console.log('  ✅ Sprite config loaded correctly');
  } else {
    console.log(`  ❌ Sprite config NOT loaded (got: ${afterClickState.configLoaded})`);
  }

  console.log(`\n📸 Screenshots saved to tmp/`);
  console.log('\n⏸️  Keeping browser open for 10 seconds for inspection...');

  await page.waitForTimeout(10000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
