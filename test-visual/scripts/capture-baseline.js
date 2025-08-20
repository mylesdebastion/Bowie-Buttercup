#!/usr/bin/env node

import VisualTestRunner from './visual-test-runner.js';
import chalk from 'chalk';
import ora from 'ora';

async function captureBaselines() {
  console.log(chalk.cyan('\n📸 Baseline Screenshot Capture\n'));
  console.log(chalk.gray('This will capture baseline screenshots for all game levels.'));
  console.log(chalk.gray('These baselines will be used for visual regression testing.\n'));
  
  const runner = new VisualTestRunner();
  const spinner = ora();
  
  try {
    spinner.start('Initializing browser...');
    await runner.init({ headless: true });
    spinner.succeed('Browser initialized');
    
    spinner.start('Loading game...');
    await runner.navigateToGame();
    spinner.succeed('Game loaded');
    
    const levels = [1, 2, 3, 4, 5];
    const viewports = ['desktop', 'tablet', 'mobile'];
    const screenshots = [];
    
    for (const level of levels) {
      console.log(chalk.blue(`\n📍 Level ${level}`));
      
      spinner.start(`Navigating to Level ${level}...`);
      await runner.navigateToLevel(level);
      spinner.succeed(`Level ${level} loaded`);
      
      // Capture initial spawn position
      for (const viewport of viewports) {
        spinner.start(`Capturing ${viewport} - spawn position...`);
        const spawnPath = await runner.captureScreenshot({
          description: 'spawn-position',
          status: 'baseline',
          viewport,
          level,
          fullPage: false
        });
        screenshots.push(spawnPath);
        spinner.succeed(`${viewport} spawn position captured`);
      }
      
      // Level-specific captures
      if (level === 3) {
        // Special captures for pit level
        spinner.start('Setting up pit scenario...');
        await runner.simulatePlayerAction('move', { x: 144, y: 380 });
        await runner.page.waitForTimeout(500);
        
        const pitPath = await runner.captureScreenshot({
          description: 'pit-area',
          status: 'baseline',
          viewport: 'desktop',
          level,
          fullPage: false
        });
        screenshots.push(pitPath);
        spinner.succeed('Pit area captured');
      }
      
      if (level === 5) {
        // Victory screen
        spinner.start('Simulating victory...');
        await runner.page.evaluate(() => {
          if (game) {
            game.goalReached = true;
          }
        });
        await runner.page.waitForTimeout(1000);
        
        const victoryPath = await runner.captureScreenshot({
          description: 'victory-screen',
          status: 'baseline',
          viewport: 'desktop',
          level,
          fullPage: false
        });
        screenshots.push(victoryPath);
        spinner.succeed('Victory screen captured');
      }
    }
    
    // Capture UI elements
    console.log(chalk.blue('\n🎮 UI Elements'));
    
    spinner.start('Capturing pause menu...');
    await runner.page.evaluate(() => {
      if (game) game.paused = true;
    });
    await runner.page.waitForTimeout(500);
    
    const pausePath = await runner.captureScreenshot({
      description: 'pause-menu',
      status: 'baseline',
      viewport: 'desktop',
      fullPage: false
    });
    screenshots.push(pausePath);
    spinner.succeed('Pause menu captured');
    
    // Summary
    console.log(chalk.green('\n✅ Baseline capture complete!\n'));
    console.log(chalk.white('Summary:'));
    console.log(chalk.white(`  Total screenshots: ${screenshots.length}`));
    console.log(chalk.white(`  Levels captured: ${levels.join(', ')}`));
    console.log(chalk.white(`  Viewports: ${viewports.join(', ')}`));
    console.log(chalk.white(`  Location: test-visual/screenshots/baseline/\n`));
    
    // Generate baseline report
    spinner.start('Generating baseline report...');
    await generateBaselineReport(screenshots);
    spinner.succeed('Baseline report generated');
    
  } catch (error) {
    spinner.fail('Error occurred');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

async function generateBaselineReport(screenshots) {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    screenshots: screenshots.map(s => ({
      path: s,
      filename: path.basename(s),
      level: s.includes('level-') ? parseInt(s.match(/level-(\d)/)[1]) : null
    })),
    stats: {
      total: screenshots.length,
      byLevel: {},
      byViewport: {
        desktop: screenshots.filter(s => s.includes('desktop')).length,
        tablet: screenshots.filter(s => s.includes('tablet')).length,
        mobile: screenshots.filter(s => s.includes('mobile')).length
      }
    }
  };
  
  // Count by level
  for (let i = 1; i <= 5; i++) {
    report.stats.byLevel[`level${i}`] = screenshots.filter(s => s.includes(`level-${i}`)).length;
  }
  
  const reportPath = path.join(
    path.dirname(screenshots[0]),
    '..',
    '..',
    'reports',
    `baseline_${new Date().toISOString().split('T')[0]}.json`
  );
  
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(chalk.gray(`\nReport saved to: ${path.relative(process.cwd(), reportPath)}`));
}

// Run the capture
captureBaselines().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});