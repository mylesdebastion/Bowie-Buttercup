const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Loading modular game...');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(3000);

  const diagnostics = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();

    return {
      canvas: {
        width: canvas.width,
        height: canvas.height,
        styleWidth: canvas.style.width,
        styleHeight: canvas.style.height,
        boundingRect: {
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y
        }
      },
      game: {
        exists: typeof window.game !== 'undefined',
        hasCanvasManager: window.game && window.game.canvasManager ? true : false,
        canvasManagerDimensions: window.game && window.game.canvasManager ?
          window.game.canvasManager.getDimensions() : null,
        isRunning: window.game && window.game.isRunning ? window.game.isRunning() : false
      }
    };
  });

  console.log('\n📊 Canvas Diagnostics:');
  console.log(JSON.stringify(diagnostics, null, 2));

  // Try to get console logs
  page.on('console', msg => console.log('🖥️  Browser:', msg.text()));

  await page.waitForTimeout(2000);
  await browser.close();
})();
