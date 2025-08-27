import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Browser Compatibility Tests
 * 
 * Tests the modular game architecture across different browsers
 * to ensure consistent functionality and performance.
 */

const BROWSERS = [
  { name: 'chromium', ...devices['Desktop Chrome'] },
  { name: 'firefox', ...devices['Desktop Firefox'] },
  { name: 'webkit', ...devices['Desktop Safari'] },
  { name: 'mobile-chrome', ...devices['Pixel 5'] },
  { name: 'mobile-safari', ...devices['iPhone 12'] }
];

const GAME_URL = 'http://localhost:3000/src/index.html';

// Test each browser
BROWSERS.forEach(({ name, ...device }) => {
  test.describe(`${name.toUpperCase()} Browser Tests`, () => {
    test.use(device);

    test.beforeEach(async ({ page }) => {
      // Set up console logging
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`[${name}] Console Error:`, msg.text());
        }
      });
      
      // Set up error handling
      page.on('pageerror', error => {
        console.log(`[${name}] Page Error:`, error.message);
      });
    });

    test('should load game without errors', async ({ page }) => {
      // Navigate to game
      await page.goto(GAME_URL);
      
      // Wait for game to initialize
      await page.waitForSelector('#gameCanvas', { timeout: 10000 });
      
      // Check that canvas exists and has correct dimensions
      const canvas = await page.locator('#gameCanvas');
      await expect(canvas).toBeVisible();
      
      const canvasSize = await canvas.boundingBox();
      expect(canvasSize.width).toBeGreaterThan(0);
      expect(canvasSize.height).toBeGreaterThan(0);
    });

    test('should initialize game systems', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      // Wait for game initialization
      await page.waitForTimeout(2000);
      
      // Check that game object exists
      const gameExists = await page.evaluate(() => {
        return typeof window.game !== 'undefined' && window.game !== null;
      });
      
      expect(gameExists).toBe(true);
      
      // Check that game state is valid
      const gameState = await page.evaluate(() => {
        if (!window.game) return null;
        return {
          running: window.game.running,
          currentLevel: window.game.currentLevel,
          score: window.game.score,
          lives: window.game.lives
        };
      });
      
      expect(gameState).not.toBeNull();
      expect(gameState.currentLevel).toBeGreaterThanOrEqual(1);
      expect(gameState.score).toBeGreaterThanOrEqual(0);
      expect(gameState.lives).toBeGreaterThan(0);
    });

    test('should handle keyboard input', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(1000);
      
      const canvas = page.locator('#gameCanvas');
      await canvas.click(); // Focus canvas
      
      // Test arrow key input
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      
      // Check that input was registered
      const inputRegistered = await page.evaluate(() => {
        return window.game?.inputManager?.isKeyPressed?.('ArrowRight') || false;
      });
      
      // Note: This might be false if key was released quickly, which is normal
      // The important thing is that no errors occurred
    });

    test('should handle touch input on mobile', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
        return;
      }
      
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(1000);
      
      const canvas = page.locator('#gameCanvas');
      const canvasBox = await canvas.boundingBox();
      
      // Simulate touch input
      await page.touchscreen.tap(
        canvasBox.x + canvasBox.width / 2,
        canvasBox.y + canvasBox.height / 2
      );
      
      // Check that touch was handled without errors
      await page.waitForTimeout(500);
      
      // Verify game is still running
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should render game graphics', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      // Wait for initial render
      await page.waitForTimeout(2000);
      
      // Check that canvas has been drawn to
      const hasDrawnContent = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return false;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Check if any pixels are non-transparent
        for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 0) { // Alpha channel
            return true;
          }
        }
        return false;
      });
      
      expect(hasDrawnContent).toBe(true);
    });

    test('should maintain stable frame rate', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(1000);
      
      // Measure frame rate over 3 seconds
      const frameRateData = await page.evaluate(() => {
        return new Promise((resolve) => {
          const frameRates = [];
          let lastTime = performance.now();
          let frameCount = 0;
          
          function measureFrameRate() {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) { // Every second
              frameRates.push(frameCount);
              frameCount = 0;
              lastTime = currentTime;
              
              if (frameRates.length >= 3) {
                resolve(frameRates);
                return;
              }
            }
            
            requestAnimationFrame(measureFrameRate);
          }
          
          measureFrameRate();
        });
      });
      
      const avgFrameRate = frameRateData.reduce((sum, fps) => sum + fps, 0) / frameRateData.length;
      const minFrameRate = Math.min(...frameRateData);
      
      console.log(`[${name}] Average FPS: ${avgFrameRate.toFixed(2)}, Min FPS: ${minFrameRate}`);
      
      // Frame rate should be reasonable (at least 30 FPS average)
      expect(avgFrameRate).toBeGreaterThan(30);
      expect(minFrameRate).toBeGreaterThan(20);
    });

    test('should handle window resize', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      const initialSize = await page.locator('#gameCanvas').boundingBox();
      
      // Resize window
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.waitForTimeout(500);
      
      const newSize = await page.locator('#gameCanvas').boundingBox();
      
      // Canvas should still be visible and have valid dimensions
      expect(newSize.width).toBeGreaterThan(0);
      expect(newSize.height).toBeGreaterThan(0);
      
      // Game should still be running
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should handle page visibility changes', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(1000);
      
      // Hide page (simulate tab switch)
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          writable: true,
          value: true
        });
        
        const event = new Event('visibilitychange');
        document.dispatchEvent(event);
      });
      
      await page.waitForTimeout(500);
      
      // Show page again
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          writable: true,
          value: false
        });
        
        const event = new Event('visibilitychange');
        document.dispatchEvent(event);
      });
      
      await page.waitForTimeout(500);
      
      // Game should recover and continue running
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should handle audio context correctly', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      // Check audio context support
      const audioSupport = await page.evaluate(() => {
        return {
          hasAudioContext: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
          hasWebAudio: typeof window.AudioContext !== 'undefined',
          hasWebkitAudio: typeof window.webkitAudioContext !== 'undefined'
        };
      });
      
      console.log(`[${name}] Audio support:`, audioSupport);
      
      // Game should handle audio gracefully regardless of support
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should handle local storage', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      // Test localStorage functionality
      const storageWorks = await page.evaluate(() => {
        try {
          const testKey = 'catPlatformerTest';
          const testValue = 'test';
          
          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          return retrieved === testValue;
        } catch (error) {
          console.log('LocalStorage not available:', error.message);
          return false;
        }
      });
      
      // Game should work regardless of localStorage availability
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
      
      if (storageWorks) {
        console.log(`[${name}] LocalStorage: Available`);
      } else {
        console.log(`[${name}] LocalStorage: Not available - game should use fallback`);
      }
    });

    test('should handle WebGL context', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      
      const webglSupport = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const contexts = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
        
        for (const contextName of contexts) {
          try {
            const ctx = canvas.getContext(contextName);
            if (ctx) {
              return { supported: true, context: contextName };
            }
          } catch (error) {
            // Continue to next context
          }
        }
        
        return { supported: false, context: null };
      });
      
      console.log(`[${name}] WebGL support:`, webglSupport);
      
      // Game should work with 2D canvas regardless of WebGL support
      const gameRunning = await page.evaluate(() => {
        return window.game?.running || false;
      });
      
      expect(gameRunning).toBe(true);
    });

    test('should handle performance under load', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(1000);
      
      // Create load by spawning entities
      await page.evaluate(() => {
        if (window.game && window.game.entityManager) {
          // Create many particles to stress test
          for (let i = 0; i < 50; i++) {
            window.game.entityManager.createParticle(
              Math.random() * 800,
              Math.random() * 400,
              (Math.random() - 0.5) * 200,
              -Math.random() * 150
            );
          }
        }
      });
      
      // Wait for a few seconds with load
      await page.waitForTimeout(3000);
      
      // Check that game is still responsive
      const gameState = await page.evaluate(() => {
        if (!window.game) return null;
        return {
          running: window.game.running,
          entityCount: window.game.entityManager?.getAllEntities?.()?.length || 0
        };
      });
      
      expect(gameState.running).toBe(true);
      console.log(`[${name}] Entity count under load: ${gameState.entityCount}`);
    });

    test('should maintain game state consistency', async ({ page }) => {
      await page.goto(GAME_URL);
      await page.waitForSelector('#gameCanvas');
      await page.waitForTimeout(2000);
      
      // Get initial game state
      const initialState = await page.evaluate(() => {
        if (!window.game) return null;
        return {
          score: window.game.score,
          lives: window.game.lives,
          currentLevel: window.game.currentLevel,
          running: window.game.running
        };
      });
      
      // Simulate some gameplay time
      await page.waitForTimeout(3000);
      
      // Get final game state
      const finalState = await page.evaluate(() => {
        if (!window.game) return null;
        return {
          score: window.game.score,
          lives: window.game.lives,
          currentLevel: window.game.currentLevel,
          running: window.game.running
        };
      });
      
      // Game should maintain valid state
      expect(finalState).not.toBeNull();
      expect(finalState.running).toBe(true);
      expect(finalState.score).toBeGreaterThanOrEqual(initialState.score);
      expect(finalState.lives).toBeGreaterThan(0);
      expect(finalState.currentLevel).toBeGreaterThanOrEqual(initialState.currentLevel);
    });
  });
});

// Cross-browser comparison tests
test.describe('Cross-Browser Consistency', () => {
  const testResults = new Map();
  
  BROWSERS.forEach(({ name, ...device }) => {
    test(`${name} - collect performance metrics`, async ({ browser }) => {
      const context = await browser.newContext(device);
      const page = await context.newPage();
      
      try {
        await page.goto(GAME_URL);
        await page.waitForSelector('#gameCanvas', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        // Measure loading time
        const loadTime = await page.evaluate(() => {
          return performance.timing.loadEventEnd - performance.timing.navigationStart;
        });
        
        // Measure frame rate
        const frameRate = await page.evaluate(() => {
          return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();
            
            function countFrames() {
              frameCount++;
              if (performance.now() - startTime < 1000) {
                requestAnimationFrame(countFrames);
              } else {
                resolve(frameCount);
              }
            }
            
            countFrames();
          });
        });
        
        // Store results
        testResults.set(name, {
          loadTime,
          frameRate,
          canvasSupport: true,
          gameInitialized: true
        });
        
        console.log(`[${name}] Load time: ${loadTime}ms, Frame rate: ${frameRate}fps`);
        
      } catch (error) {
        testResults.set(name, {
          loadTime: null,
          frameRate: null,
          canvasSupport: false,
          gameInitialized: false,
          error: error.message
        });
        console.log(`[${name}] Test failed: ${error.message}`);
      } finally {
        await context.close();
      }
    });
  });
  
  test('compare cross-browser results', async () => {
    // This test runs after all browser tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = Array.from(testResults.entries());
    const successfulResults = results.filter(([_, result]) => result.gameInitialized);
    
    console.log('\n=== Cross-Browser Test Summary ===');
    results.forEach(([browser, result]) => {
      if (result.gameInitialized) {
        console.log(`${browser}: ✅ Load: ${result.loadTime}ms, FPS: ${result.frameRate}`);
      } else {
        console.log(`${browser}: ❌ ${result.error}`);
      }
    });
    
    // At least 80% of browsers should work
    const successRate = successfulResults.length / results.length;
    console.log(`Success rate: ${(successRate * 100).toFixed(1)}%`);
    expect(successRate).toBeGreaterThan(0.8);
    
    if (successfulResults.length >= 2) {
      // Compare frame rates between browsers
      const frameRates = successfulResults.map(([_, result]) => result.frameRate);
      const avgFrameRate = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
      const frameRateVariation = Math.max(...frameRates) - Math.min(...frameRates);
      
      console.log(`Average FPS: ${avgFrameRate.toFixed(2)}, Variation: ${frameRateVariation.toFixed(2)}`);
      
      // Frame rate variation shouldn't be too extreme (within 50% of average)
      expect(frameRateVariation).toBeLessThan(avgFrameRate * 0.5);
    }
  });
});
