const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('\n🔗 QUERY PARAMETER PET SELECTION TEST\n');

  // Test 1: Default (no parameter) should load Bowie Cat
  console.log('Test 1: Default URL (should load Bowie Cat)');
  await page.goto('http://localhost:3000/src/index.html');
  await page.waitForTimeout(2000);

  let result = await page.evaluate(() => {
    const radio = document.querySelector('input[name="petSelection"]:checked');
    return {
      selectedPet: radio ? radio.value : 'none',
      petName: radio ? radio.parentElement.querySelector('.pet-name')?.textContent : 'none'
    };
  });

  console.log(`  Selected: ${result.selectedPet} (${result.petName})`);
  if (result.selectedPet === 'A') {
    console.log('  ✅ SUCCESS');
  } else {
    console.log('  ❌ FAIL');
  }

  // Test 2: ?pet=bowie should load Bowie Cat
  console.log('\nTest 2: ?pet=bowie (should load Bowie Cat)');
  await page.goto('http://localhost:3000/src/index.html?pet=bowie');
  await page.waitForTimeout(2000);

  result = await page.evaluate(() => {
    const radio = document.querySelector('input[name="petSelection"]:checked');
    return {
      selectedPet: radio ? radio.value : 'none',
      petName: radio ? radio.parentElement.querySelector('.pet-name')?.textContent : 'none'
    };
  });

  console.log(`  Selected: ${result.selectedPet} (${result.petName})`);
  if (result.selectedPet === 'A') {
    console.log('  ✅ SUCCESS');
  } else {
    console.log('  ❌ FAIL');
  }

  // Test 3: ?pet=buttercup should load Buttercup Cat
  console.log('\nTest 3: ?pet=buttercup (should load Buttercup Cat)');
  await page.goto('http://localhost:3000/src/index.html?pet=buttercup');
  await page.waitForTimeout(2000);

  result = await page.evaluate(() => {
    const radio = document.querySelector('input[name="petSelection"]:checked');
    return {
      selectedPet: radio ? radio.value : 'none',
      petName: radio ? radio.parentElement.querySelector('.pet-name')?.textContent : 'none'
    };
  });

  console.log(`  Selected: ${result.selectedPet} (${result.petName})`);
  if (result.selectedPet === 'B') {
    console.log('  ✅ SUCCESS');
  } else {
    console.log('  ❌ FAIL');
  }

  console.log('\n⏸️  Keeping browser open for 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ Test complete!');
})();
