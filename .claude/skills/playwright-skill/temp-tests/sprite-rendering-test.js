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
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('PAGE ERROR:', error.message);
  });

  console.log('\n🎨 Loading Sprite Test View...\n');
  await page.goto('http://localhost:3000/src/sprite-test-view.html');

  console.log('⏳ Waiting 3 seconds for sprites to load...\n');
  await page.waitForTimeout(3000);

  // Get sprite loading results
  const spriteStatus = await page.evaluate(() => {
    const bowieStatus = document.getElementById('bowieStatus')?.textContent || 'Unknown';
    const buttercupStatus = document.getElementById('buttercupStatus')?.textContent || 'Unknown';
    const dogStatus = document.getElementById('dogStatus')?.textContent || 'Unknown';

    // Check if thumbnails were created
    const bowieThumb = document.getElementById('bowieThumb')?.querySelector('canvas');
    const buttercupThumb = document.getElementById('buttercupThumb')?.querySelector('canvas');
    const dogThumb = document.getElementById('dogThumb')?.querySelector('canvas');

    // Check if animations are running
    const animContainer = document.getElementById('animationContainer');
    const animCount = animContainer?.querySelectorAll('canvas').length || 0;

    // Check sprite grid
    const gridContainer = document.getElementById('gridContainer');
    const gridCells = gridContainer?.querySelectorAll('.grid-cell').length || 0;

    return {
      bowie: {
        status: bowieStatus,
        thumbExists: !!bowieThumb,
        thumbSize: bowieThumb ? `${bowieThumb.width}x${bowieThumb.height}` : null
      },
      buttercup: {
        status: buttercupStatus,
        thumbExists: !!buttercupThumb,
        thumbSize: buttercupThumb ? `${buttercupThumb.width}x${buttercupThumb.height}` : null
      },
      dog: {
        status: dogStatus,
        thumbExists: !!dogThumb,
        thumbSize: dogThumb ? `${dogThumb.width}x${dogThumb.height}` : null
      },
      animations: {
        count: animCount,
        expected: 3
      },
      grid: {
        cells: gridCells,
        expected: 9
      }
    };
  });

  console.log('\n📊 SPRITE LOADING RESULTS:\n');
  console.log('Bowie Cat (Sheet A):');
  console.log('  Status:', spriteStatus.bowie.status);
  console.log('  Thumbnail:', spriteStatus.bowie.thumbExists ? `✅ ${spriteStatus.bowie.thumbSize}` : '❌ Missing');

  console.log('\nButtercup Cat (Sheet B):');
  console.log('  Status:', spriteStatus.buttercup.status);
  console.log('  Thumbnail:', spriteStatus.buttercup.thumbExists ? `✅ ${spriteStatus.buttercup.thumbSize}` : '❌ Missing');

  console.log('\nBonbon Dog (NPC):');
  console.log('  Status:', spriteStatus.dog.status);
  console.log('  Thumbnail:', spriteStatus.dog.thumbExists ? `✅ ${spriteStatus.dog.thumbSize}` : '❌ Missing');

  console.log('\nAnimations:');
  console.log('  Count:', spriteStatus.animations.count, '/', spriteStatus.animations.expected);
  console.log('  Status:', spriteStatus.animations.count === spriteStatus.animations.expected ? '✅ OK' : '❌ Missing');

  console.log('\nSprite Grid (3x3):');
  console.log('  Cells:', spriteStatus.grid.cells, '/', spriteStatus.grid.expected);
  console.log('  Status:', spriteStatus.grid.cells === spriteStatus.grid.expected ? '✅ OK' : '❌ Missing');

  console.log('\n❌ Console Errors:');
  const errors = consoleMessages.filter(m => m.type === 'error');
  if (errors.length === 0) {
    console.log('  None!');
  } else {
    errors.slice(0, 10).forEach(err => console.log('  -', err.text));
  }

  console.log('\n❌ Page Errors:');
  if (pageErrors.length === 0) {
    console.log('  None!');
  } else {
    pageErrors.forEach(err => console.log('  -', err));
  }

  // Capture screenshot
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const screenshotPath = path.join(tmpDir, `sprite-test-view-${new Date().toISOString().replace(/:/g, '-')}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

  // Keep browser open for inspection
  console.log('\n⏸️  Keeping browser open for 10 seconds to inspect...');
  await page.waitForTimeout(10000);

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Sprite Test Complete!');

  const allSpritesLoaded = spriteStatus.bowie.thumbExists &&
                           spriteStatus.buttercup.thumbExists &&
                           spriteStatus.dog.thumbExists;

  if (allSpritesLoaded && spriteStatus.animations.count === 3 && spriteStatus.grid.cells === 9) {
    console.log('🎉 ALL SPRITES LOADED SUCCESSFULLY!');
  } else {
    console.log('⚠️  SOME SPRITES FAILED TO LOAD - See details above');
  }
  console.log('='.repeat(60));
})();
