const { chromium } = require('playwright');
const helpers = require('../lib/helpers');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Loading game...');
  await page.goto('http://localhost:3000/src/index.html');
  await helpers.waitForGameReady(page, { canvasSelector: '#gameCanvas' });
  await page.waitForTimeout(2000);

  console.log('Capturing screenshot...');
  const screenshot = await helpers.captureGameScreen(page, 'quick-test');
  console.log(`Screenshot saved: ${screenshot}`);

  await browser.close();
})();
