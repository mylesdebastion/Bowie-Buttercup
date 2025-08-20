#!/usr/bin/env node

import VisualTestRunner from './visual-test-runner.js';
import readline from 'readline';
import chalk from 'chalk';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function captureIssue() {
  console.log(chalk.cyan('\n📸 Visual Issue Capture Tool\n'));
  
  // Get issue details
  const issueNumber = await question(chalk.yellow('GitHub Issue Number: '));
  const description = await question(chalk.yellow('Short description (e.g., "pit-collision-bug"): '));
  
  console.log(chalk.yellow('\nStatus options:'));
  console.log('1. before - Issue reproduction');
  console.log('2. investigating - During debugging');
  console.log('3. attempted - Fix attempted');
  console.log('4. fixed - Issue resolved');
  console.log('5. verified - Fix verified');
  console.log('6. regression - Issue returned');
  
  const statusChoice = await question(chalk.yellow('\nSelect status (1-6): '));
  const statusMap = {
    '1': 'before',
    '2': 'investigating',
    '3': 'attempted',
    '4': 'fixed',
    '5': 'verified',
    '6': 'regression'
  };
  const status = statusMap[statusChoice] || 'investigating';
  
  const level = await question(chalk.yellow('Which level? (1-5, or press Enter for N/A): '));
  const levelNum = level ? parseInt(level) : null;
  
  const captureMode = await question(chalk.yellow('\nCapture mode?\n1. Current state only\n2. All viewports\n3. Specific scenario\nSelect (1-3): '));
  
  const runner = new VisualTestRunner();
  
  try {
    console.log(chalk.green('\n🚀 Initializing browser...'));
    await runner.init({ headless: false });
    
    console.log(chalk.green('🌐 Loading game...'));
    await runner.navigateToGame();
    
    // Navigate to specific level if needed
    if (levelNum) {
      console.log(chalk.green(`📍 Navigating to Level ${levelNum}...`));
      await runner.navigateToLevel(levelNum);
    }
    
    const screenshots = [];
    
    if (captureMode === '2') {
      // Capture all viewports
      for (const viewport of ['desktop', 'tablet', 'mobile']) {
        console.log(chalk.blue(`\n📱 Capturing ${viewport} view...`));
        const path = await runner.captureScreenshot({
          issueNumber: parseInt(issueNumber),
          description,
          status,
          viewport,
          fullPage: true,
          level: levelNum
        });
        screenshots.push(path);
      }
    } else if (captureMode === '3') {
      // Specific scenario
      console.log(chalk.yellow('\nPosition the game to the exact state you want to capture.'));
      console.log(chalk.yellow('You have 10 seconds to set up the scenario...'));
      
      await new Promise(resolve => {
        let countdown = 10;
        const timer = setInterval(() => {
          process.stdout.write(`\r${chalk.gray(`Countdown: ${countdown}s `)}}`);
          countdown--;
          if (countdown < 0) {
            clearInterval(timer);
            console.log('\n');
            resolve();
          }
        }, 1000);
      });
      
      const path = await runner.captureScreenshot({
        issueNumber: parseInt(issueNumber),
        description,
        status,
        fullPage: false,
        level: levelNum
      });
      screenshots.push(path);
    } else {
      // Current state only
      const path = await runner.captureScreenshot({
        issueNumber: parseInt(issueNumber),
        description,
        status,
        fullPage: true,
        level: levelNum
      });
      screenshots.push(path);
    }
    
    // Check for errors
    const errors = await runner.getErrors();
    if (errors.length > 0) {
      console.log(chalk.red('\n⚠️ Errors detected during capture:'));
      errors.forEach(err => {
        console.log(chalk.red(`  - ${err.type}: ${err.message}`));
      });
    }
    
    // Generate summary
    console.log(chalk.green('\n✅ Screenshots captured successfully!\n'));
    console.log(chalk.white('Summary:'));
    console.log(chalk.white(`  Issue #${issueNumber}: ${description}`));
    console.log(chalk.white(`  Status: ${status}`));
    if (levelNum) {
      console.log(chalk.white(`  Level: ${levelNum}`));
    }
    console.log(chalk.white(`  Files: ${screenshots.length} screenshot(s)`));
    console.log(chalk.white(`  Location: test-visual/screenshots/issues/issue-${issueNumber}/\n`));
    
    // Ask if user wants to add notes
    const addNotes = await question(chalk.yellow('Add notes about this capture? (y/n): '));
    if (addNotes.toLowerCase() === 'y') {
      const notes = await question(chalk.yellow('Notes: '));
      
      // Save notes to a text file
      const fs = await import('fs/promises');
      const path = await import('path');
      const notesPath = path.join(
        runner.screenshotDir,
        'issues',
        `issue-${issueNumber}`,
        `notes_${runner.getTimestamp()}.txt`
      );
      
      await fs.writeFile(notesPath, `Issue #${issueNumber}
Description: ${description}
Status: ${status}
Level: ${levelNum || 'N/A'}
Timestamp: ${new Date().toISOString()}

Notes:
${notes}

Screenshots captured:
${screenshots.map(s => '- ' + path.basename(s)).join('\n')}
`);
      console.log(chalk.green(`📝 Notes saved to ${path.basename(notesPath)}`));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
  } finally {
    await runner.cleanup();
    rl.close();
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Capture cancelled by user'));
  process.exit(0);
});

// Run the capture
captureIssue().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});