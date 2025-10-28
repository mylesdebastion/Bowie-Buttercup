const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  const consoleMessages = [];
  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
    console.log(`[${msg.type().toUpperCase()}]`, text);
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log('PAGE ERROR:', error.message);
  });

  console.log('\n🔍 Loading modular game and capturing diagnostics...\n');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(3000);

  console.log('\n📊 DIAGNOSTIC RESULTS:\n');

  // Get comprehensive game state
  const diagnostics = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');

    // Test if we can draw to canvas
    let canDrawTest = false;
    if (ctx) {
      ctx.save();
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(50, 50, 100, 100);
      const imageData = ctx.getImageData(75, 75, 1, 1);
      canDrawTest = imageData.data[0] === 255; // Check if red pixel exists
      ctx.restore();
    }

    return {
      canvas: {
        exists: !!canvas,
        width: canvas?.width,
        height: canvas?.height,
        styleWidth: canvas?.style.width,
        styleHeight: canvas?.style.height,
        contextExists: !!ctx,
        canDraw: canDrawTest
      },
      game: {
        exists: typeof window.game !== 'undefined',
        isRunning: window.game?.isRunning?.(),
        fps: window.game?.getFPS?.(),
        player: window.game?.player ? {
          exists: true,
          x: window.game.player.x,
          y: window.game.player.y,
          width: window.game.player.width,
          height: window.game.player.height,
          dead: window.game.player.dead
        } : null,
        level: window.game?.level ? {
          exists: true,
          rows: window.game.level.length,
          cols: window.game.level[0]?.length,
          firstRow: window.game.level[0]?.slice(0, 10),
          lastRow: window.game.level[window.game.level.length - 1]?.slice(0, 10)
        } : null,
        camera: window.game?.camera,
        canvasManager: window.game?.canvasManager ? {
          exists: true,
          width: window.game.canvasManager.width,
          height: window.game.canvasManager.height,
          enableBatching: window.game.canvasManager.enableBatching,
          batchedDrawCalls: window.game.canvasManager.batchedDrawCalls?.length
        } : null,
        levelManager: window.game?.levelManager ? {
          exists: true,
          currentLevelNumber: window.game.levelManager.getCurrentLevelNumber?.(),
          currentLevelId: window.game.levelManager.currentLevelId
        } : null
      },
      dom: {
        hud: !!document.getElementById('hud'),
        gameArea: !!document.getElementById('gameArea'),
        bodyClasses: Array.from(document.body.classList)
      }
    };
  });

  console.log('Canvas State:');
  console.log(JSON.stringify(diagnostics.canvas, null, 2));

  console.log('\nGame State:');
  console.log(JSON.stringify(diagnostics.game, null, 2));

  console.log('\nDOM State:');
  console.log(JSON.stringify(diagnostics.dom, null, 2));

  console.log('\n❌ Console Errors:');
  if (consoleErrors.length === 0) {
    console.log('  None!');
  } else {
    consoleErrors.slice(0, 10).forEach(err => console.log('  -', err));
  }

  console.log('\n❌ Page Errors:');
  if (pageErrors.length === 0) {
    console.log('  None!');
  } else {
    pageErrors.forEach(err => console.log('  -', err));
  }

  console.log('\n🎨 Testing Manual Canvas Draw...');
  const manualDrawTest = await page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return { success: false, error: 'No context' };

    // Clear and draw test pattern
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(100, 100, 100, 100);

    ctx.fillStyle = '#00FF00';
    ctx.fillRect(250, 100, 100, 100);

    ctx.fillStyle = '#0000FF';
    ctx.fillRect(400, 100, 100, 100);

    ctx.fillStyle = '#FFFF00';
    ctx.font = '20px monospace';
    ctx.fillText('MANUAL DRAW TEST', 100, 250);

    return { success: true };
  });

  console.log('Manual draw test:', manualDrawTest);

  console.log('\n⏸️  Pausing for 5 seconds to inspect browser...');
  await page.waitForTimeout(5000);

  await browser.close();

  console.log('\n✅ Diagnostic complete!');
})();
