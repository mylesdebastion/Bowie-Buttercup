const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });

  console.log('\n🎮 LEVEL 1 COMPARISON: Monolithic vs Modular\n');

  // Create two pages side by side
  const modularPage = await browser.newPage();
  const monolithicPage = await browser.newPage();

  // Load both versions
  console.log('Loading modular version...');
  await modularPage.goto('http://localhost:3000/src/index.html');
  await modularPage.waitForTimeout(3000);

  console.log('Loading monolithic version...');
  await monolithicPage.goto('http://localhost:3000/index.html.monolithic-backup');
  await monolithicPage.waitForTimeout(3000);

  // Get comprehensive game state from both
  const modularState = await modularPage.evaluate(() => {
    const game = window.game;
    const level = game?.level;

    return {
      // Level data
      currentLevel: game?.currentLevel,
      levelExists: !!level,
      platforms: level?.platforms?.length || 0,
      platformDetails: level?.platforms?.map(p => ({
        x: Math.floor(p.x),
        y: Math.floor(p.y),
        width: Math.floor(p.width),
        height: Math.floor(p.height),
        type: p.type
      })) || [],

      // Entities
      fishTreats: game?.fishTreats?.length || 0,
      fishTreatPositions: game?.fishTreats?.map(f => ({
        x: Math.floor(f.x),
        y: Math.floor(f.y)
      })) || [],
      mice: game?.mice?.length || 0,
      micePositions: game?.mice?.map(m => ({
        x: Math.floor(m.x),
        y: Math.floor(m.y)
      })) || [],

      // Special objects
      couch: game?.couch ? {
        x: Math.floor(game.couch.x),
        y: Math.floor(game.couch.y),
        width: Math.floor(game.couch.width),
        height: Math.floor(game.couch.height),
        active: game.couch.active
      } : null,
      dog: game?.dog ? {
        x: Math.floor(game.dog.x),
        y: Math.floor(game.dog.y),
        active: game.dog.active
      } : null,

      // Player
      player: {
        x: Math.floor(game?.player?.x),
        y: Math.floor(game?.player?.y),
        health: game?.player?.health,
        lives: game?.lives
      },

      // Game state
      score: game?.score,
      time: Math.floor(game?.time || 0),
      paused: game?.paused
    };
  });

  const monolithicState = await monolithicPage.evaluate(() => {
    const game = window.game;

    return {
      // Level data
      currentLevel: game?.currentLevel,
      levelExists: !!game?.level,
      platforms: game?.level?.platforms?.length || 0,
      platformDetails: game?.level?.platforms?.map(p => ({
        x: Math.floor(p.x),
        y: Math.floor(p.y),
        width: Math.floor(p.width),
        height: Math.floor(p.height),
        type: p.type
      })) || [],

      // Entities
      fishTreats: game?.fishTreats?.length || 0,
      fishTreatPositions: game?.fishTreats?.map(f => ({
        x: Math.floor(f.x),
        y: Math.floor(f.y)
      })) || [],
      mice: game?.mice?.length || 0,
      micePositions: game?.mice?.map(m => ({
        x: Math.floor(m.x),
        y: Math.floor(m.y)
      })) || [],

      // Special objects
      couch: game?.couch ? {
        x: Math.floor(game.couch.x),
        y: Math.floor(game.couch.y),
        width: Math.floor(game.couch.width),
        height: Math.floor(game.couch.height),
        active: game.couch.active
      } : null,
      dog: game?.dog ? {
        x: Math.floor(game.dog.x),
        y: Math.floor(game.dog.y),
        active: game.dog.active
      } : null,

      // Player
      player: {
        x: Math.floor(game?.player?.x),
        y: Math.floor(game?.player?.y),
        health: game?.player?.health,
        lives: game?.lives
      },

      // Game state
      score: game?.score,
      time: Math.floor(game?.time || 0),
      paused: game?.paused
    };
  });

  // Capture screenshots
  const tmpDir = path.join(__dirname, '..', '..', '..', 'tmp');
  const timestamp = Date.now();

  await modularPage.screenshot({ path: path.join(tmpDir, `level1-modular-${timestamp}.png`) });
  await monolithicPage.screenshot({ path: path.join(tmpDir, `level1-monolithic-${timestamp}.png`) });

  console.log('\n📊 COMPARISON RESULTS:\n');

  // Compare platforms
  console.log('🟦 PLATFORMS:');
  console.log(`  Monolithic: ${monolithicState.platforms} platforms`);
  console.log(`  Modular:    ${modularState.platforms} platforms`);
  if (modularState.platforms !== monolithicState.platforms) {
    console.log('  ❌ MISMATCH: Platform count differs!');
  } else {
    console.log('  ✅ Match');
  }

  // Compare fish treats
  console.log('\n🐟 FISH TREATS:');
  console.log(`  Monolithic: ${monolithicState.fishTreats} treats`);
  console.log(`  Modular:    ${modularState.fishTreats} treats`);
  if (modularState.fishTreats !== monolithicState.fishTreats) {
    console.log('  ❌ MISMATCH: Fish treat count differs!');
  } else {
    console.log('  ✅ Match');
  }

  // Compare mice
  console.log('\n🐭 MICE:');
  console.log(`  Monolithic: ${monolithicState.mice} mice`);
  console.log(`  Modular:    ${modularState.mice} mice`);
  if (modularState.mice !== monolithicState.mice) {
    console.log('  ❌ MISMATCH: Mice count differs!');
  } else {
    console.log('  ✅ Match');
  }

  // Compare couch
  console.log('\n🛋️  COUCH:');
  console.log(`  Monolithic: ${monolithicState.couch ? 'Present' : 'Missing'}`);
  console.log(`  Modular:    ${modularState.couch ? 'Present' : 'Missing'}`);
  if (!!monolithicState.couch !== !!modularState.couch) {
    console.log('  ❌ MISMATCH: Couch presence differs!');
  } else if (monolithicState.couch && modularState.couch) {
    console.log(`  Monolithic position: (${monolithicState.couch.x}, ${monolithicState.couch.y})`);
    console.log(`  Modular position:    (${modularState.couch.x}, ${modularState.couch.y})`);
  }

  // Compare dog
  console.log('\n🐕 DOG:');
  console.log(`  Monolithic: ${monolithicState.dog ? 'Present' : 'Missing'}`);
  console.log(`  Modular:    ${modularState.dog ? 'Present' : 'Missing'}`);
  if (!!monolithicState.dog !== !!modularState.dog) {
    console.log('  ❌ MISMATCH: Dog presence differs!');
  } else if (monolithicState.dog && modularState.dog) {
    console.log(`  Monolithic position: (${monolithicState.dog.x}, ${monolithicState.dog.y})`);
    console.log(`  Modular position:    (${modularState.dog.x}, ${modularState.dog.y})`);
  }

  // Summary of missing components
  console.log('\n📋 MISSING COMPONENTS IN MODULAR VERSION:');
  const missing = [];

  if (monolithicState.platforms > modularState.platforms) {
    missing.push(`- ${monolithicState.platforms - modularState.platforms} platforms`);
  }
  if (monolithicState.fishTreats > modularState.fishTreats) {
    missing.push(`- ${monolithicState.fishTreats - modularState.fishTreats} fish treats`);
  }
  if (monolithicState.mice > modularState.mice) {
    missing.push(`- ${monolithicState.mice - modularState.mice} mice`);
  }
  if (monolithicState.couch && !modularState.couch) {
    missing.push('- Couch (trampoline)');
  }
  if (monolithicState.dog && !modularState.dog) {
    missing.push('- Dog NPC');
  }

  if (missing.length === 0) {
    console.log('  ✅ No missing components detected!');
  } else {
    missing.forEach(item => console.log(item));
  }

  console.log('\n📸 Screenshots saved to tmp/');
  console.log(`\n⏸️  Keeping browsers open for 20 seconds for visual inspection...`);

  await modularPage.waitForTimeout(20000);

  await browser.close();
  console.log('\n✅ Comparison complete!');
})();
