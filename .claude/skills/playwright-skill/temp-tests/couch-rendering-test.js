const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🛋️  COUCH RENDERING TEST\n');

  const modularPage = await browser.newPage();

  // Load modular version
  console.log('Loading modular version...');
  await modularPage.goto('http://localhost:3000/src/index.html');
  await modularPage.waitForTimeout(3000);

  // Take screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();
  await modularPage.screenshot({
    path: path.join(tmpDir, `couch-test-${timestamp}.png`)
  });

  // Inspect couch rendering
  const couchInfo = await modularPage.evaluate(() => {
    const game = window.game;
    const level = game?.level;

    // Find couch tiles (type 3) in level data
    const couchTiles = [];
    if (level?.levelData) {
      for (let y = 0; y < level.levelData.length; y++) {
        for (let x = 0; x < level.levelData[y].length; x++) {
          if (level.levelData[y][x] === 3) {
            couchTiles.push({
              x: x * 16,
              y: y * 16,
              gridX: x,
              gridY: y
            });
          }
        }
      }
    }

    return {
      currentLevel: game?.currentLevel,
      couchTilesFound: couchTiles.length,
      couchPositions: couchTiles,
      hasDrawCouchMethod: typeof level?.drawCouch === 'function'
    };
  });

  console.log('\n📊 COUCH RENDERING INFO:\n');
  console.log(`Current Level: ${couchInfo.currentLevel}`);
  console.log(`Couch Tiles Found: ${couchInfo.couchTilesFound}`);
  console.log(`Has drawCouch Method: ${couchInfo.hasDrawCouchMethod ? '✅' : '❌'}`);

  if (couchInfo.couchPositions.length > 0) {
    console.log('\nCouch tile positions:');
    couchInfo.couchPositions.forEach((pos, i) => {
      console.log(`  ${i + 1}. Grid (${pos.gridX}, ${pos.gridY}) -> Screen (${pos.x}, ${pos.y})`);
    });
  } else {
    console.log('  ❌ No couch tiles found!');
  }

  console.log(`\n📸 Screenshot saved: couch-test-${timestamp}.png`);
  console.log('\n⏸️  Keeping browser open for 20 seconds for visual inspection...');

  await modularPage.waitForTimeout(20000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
