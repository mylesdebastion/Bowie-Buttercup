const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🛋️  COUCH VISUAL COMPARISON TEST\n');

  const modularPage = await browser.newPage();
  const monolithicPage = await browser.newPage();

  // Load both versions
  console.log('Loading modular version...');
  await modularPage.goto('http://localhost:3000/src/index.html');
  await modularPage.waitForTimeout(3000);

  console.log('Loading monolithic version...');
  await monolithicPage.goto('http://localhost:3000/index.html.monolithic-backup');
  await monolithicPage.waitForTimeout(3000);

  // Get couch tile positions from both
  const modularCouch = await modularPage.evaluate(() => {
    const game = window.game;
    const level = game?.level;

    const couchTiles = [];
    if (level && Array.isArray(level)) {
      for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
          if (level[y][x] === 3) {
            couchTiles.push({ gridX: x, gridY: y, pixelX: x * 16, pixelY: y * 16 });
          }
        }
      }
    }

    return {
      couchTilesFound: couchTiles.length,
      positions: couchTiles,
      hasDrawCouch: typeof game?.drawCouch === 'function'
    };
  });

  const monolithicCouch = await monolithicPage.evaluate(() => {
    const game = window.game;
    const level = game?.level;

    const couchTiles = [];
    if (level && Array.isArray(level)) {
      for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
          if (level[y][x] === 3) {
            couchTiles.push({ gridX: x, gridY: y, pixelX: x * 16, pixelY: y * 16 });
          }
        }
      }
    }

    return {
      couchTilesFound: couchTiles.length,
      positions: couchTiles,
      hasDrawCouch: typeof game?.drawCouch === 'function'
    };
  });

  // Take screenshots
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();

  await modularPage.screenshot({
    path: path.join(tmpDir, `couch-modular-${timestamp}.png`)
  });
  await monolithicPage.screenshot({
    path: path.join(tmpDir, `couch-monolithic-${timestamp}.png`)
  });

  console.log('\n📊 COUCH COMPARISON:\n');
  console.log('MODULAR VERSION:');
  console.log(`  Couch tiles found: ${modularCouch.couchTilesFound}`);
  console.log(`  Has drawCouch method: ${modularCouch.hasDrawCouch ? '✅' : '❌'}`);
  if (modularCouch.positions.length > 0) {
    console.log('  Positions:');
    modularCouch.positions.forEach((pos, i) => {
      console.log(`    ${i + 1}. Grid (${pos.gridX}, ${pos.gridY}) -> Pixel (${pos.pixelX}, ${pos.pixelY})`);
    });
  }

  console.log('\nMONOLITHIC VERSION:');
  console.log(`  Couch tiles found: ${monolithicCouch.couchTilesFound}`);
  console.log(`  Has drawCouch method: ${monolithicCouch.hasDrawCouch ? '✅' : '❌'}`);
  if (monolithicCouch.positions.length > 0) {
    console.log('  Positions:');
    monolithicCouch.positions.forEach((pos, i) => {
      console.log(`    ${i + 1}. Grid (${pos.gridX}, ${pos.gridY}) -> Pixel (${pos.pixelX}, ${pos.pixelY})`);
    });
  }

  console.log(`\n📸 Screenshots saved to tmp/`);
  console.log(`\n⏸️  Keeping browsers open for 20 seconds for visual inspection...`);

  await modularPage.waitForTimeout(20000);

  await browser.close();
  console.log('\n✅ Comparison complete!');
})();
