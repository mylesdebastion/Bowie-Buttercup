#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, 'test-visual', 'screenshots', 'verification');

// Create screenshots directory
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshots() {
  const browser = await puppeteer.launch();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    // Capture Monolithic version
    console.log('📸 Capturing monolithic version...');
    const monoPage = await browser.newPage();
    await monoPage.setViewport({ width: 1280, height: 720 });
    await monoPage.goto('file://' + path.join(__dirname, 'index.html'));
    
    // Wait for game to load and navigate to level 5
    await monoPage.waitForTimeout(2000);
    
    // Navigate to level 5 (press 5 key)
    await monoPage.keyboard.press('5');
    await monoPage.waitForTimeout(1000);
    
    await monoPage.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_level-5-monolithic.png`)
    });
    
    console.log('📸 Capturing modular version...');
    const modularPage = await browser.newPage();
    
    // Capture console logs for debug tracing
    modularPage.on('console', msg => {
      console.log('🔍 MODULAR CONSOLE:', msg.type(), msg.text());
    });
    
    modularPage.on('pageerror', err => {
      console.error('❌ MODULAR ERROR:', err.message);
    });
    
    await modularPage.setViewport({ width: 1280, height: 720 });
    await modularPage.goto('http://localhost:3000/src/index.html');
    
    // Wait for game to load and navigate to level 5
    await modularPage.waitForTimeout(3000);
    
    // Navigate to level 5
    await modularPage.keyboard.press('5');
    await modularPage.waitForTimeout(1000);
    
    await modularPage.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_level-5-modular.png`)
    });
    
    console.log('✅ Screenshots captured successfully!');
    console.log(`Monolithic: ${timestamp}_level-5-monolithic.png`);
    console.log(`Modular: ${timestamp}_level-5-modular.png`);
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();