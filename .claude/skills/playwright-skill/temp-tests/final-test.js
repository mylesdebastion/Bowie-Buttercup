const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Loading fixed game...');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(2000);

  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const screenshotPath = path.join(tmpDir, `FINAL-TEST-${Date.now()}.png`);

  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✅ Screenshot saved: ${screenshotPath}`);

  await page.waitForTimeout(3000);
  await browser.close();
})();
