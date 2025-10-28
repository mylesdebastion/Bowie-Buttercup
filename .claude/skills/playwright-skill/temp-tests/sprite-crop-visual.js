const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🎨 SPRITE CROP VISUAL TEST\n');

  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(2000);

  // Draw the idle_sit sprite crop to a separate canvas for visual inspection
  await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    canvas.style.position = 'fixed';
    canvas.style.top = '10px';
    canvas.style.right = '10px';
    canvas.style.border = '3px solid #00ff00';
    canvas.style.zIndex = '10000';
    canvas.style.background = 'pink';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Get the sprite sheet
    const sheetManager = window.game?.spriteSystem?.sheetManager;
    const sheet = sheetManager?.getSheet('A');

    if (sheet && sheet.img) {
      // Draw the entire sprite sheet for reference (top half)
      ctx.drawImage(sheet.img, 0, 0, 200, 200);

      // Draw just the idle_sit crop (bottom half) - magnified
      const crop = [682, 0, 341, 341];
      ctx.fillStyle = 'yellow';
      ctx.fillRect(200, 0, 200, 200);

      ctx.drawImage(
        sheet.img,
        crop[0], crop[1], crop[2], crop[3],  // Source: idle_sit cell
        200, 0, 200, 200                      // Dest: magnified
      );

      // Label
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 200, 400, 30);
      ctx.fillStyle = 'black';
      ctx.font = '14px monospace';
      ctx.fillText('Left: Full sheet | Right: idle_sit crop', 10, 220);
      ctx.fillText(`Crop: [${crop}]`, 10, 240);

      console.log('✅ Sprite crop visualization added to top-right corner');
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = 'white';
      ctx.font = '20px monospace';
      ctx.fillText('Sheet not loaded!', 50, 200);
      console.log('❌ Sprite sheet not loaded');
    }
  });

  console.log('\n📸 Check top-right corner of browser for sprite visualization');
  console.log('⏸️  Browser staying open for 30 seconds...\n');

  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const screenshotPath = path.join(tmpDir, `sprite-crop-visual-${Date.now()}.png`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: screenshotPath });

  console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

  await page.waitForTimeout(28000);
  await browser.close();
  console.log('✅ Visual test complete!');
})();
