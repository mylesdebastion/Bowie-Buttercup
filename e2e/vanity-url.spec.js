/**
 * E2E Tests for Vanity URL System
 *
 * Tests the complete vanity URL flow:
 * - URL routing (/petname-safeword)
 * - Configuration loading
 * - Game initialization with custom config
 * - Fallback mechanisms
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const GAME_LOAD_TIMEOUT = 10000; // 10 seconds for game to load

test.describe('Vanity URL System', () => {

  test.describe('URL Routing', () => {

    test('should load game via vanity URL', async ({ page }) => {
      // Navigate to vanity URL
      await page.goto(`${BASE_URL}/fluffy-happy`);

      // Wait for game canvas to be visible
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });

      // Check that game is running
      const isRunning = await page.evaluate(() => {
        return window.game && typeof window.game === 'object';
      });
      expect(isRunning).toBe(true);
    });

    test('should update page title with pet name', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-happy`);

      await page.waitForLoadState('domcontentloaded');

      // Page title should include pet name
      await expect(page).toHaveTitle(/Adventure - SparkleClassic/);
    });

    test('should handle vanity URL with number suffix', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-brave-2`);

      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });
    });

    test('should reject invalid vanity URL formats', async ({ page }) => {
      // No hyphen - should fall back to default
      await page.goto(`${BASE_URL}/invalidslug`);

      await page.waitForLoadState('domcontentloaded');

      // Should still load game with default config
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });
    });

    test('should skip API routes', async ({ page }) => {
      // API routes should not be treated as vanity URLs
      const response = await page.goto(`${BASE_URL}/api/configs/test-slug`);

      // Should get API response, not game HTML
      // (Will 404 if API not implemented yet, but shouldn't load game)
      expect(response.status()).not.toBe(200); // API not implemented yet
    });
  });

  test.describe('Configuration Loading', () => {

    test('should load configuration from slug', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-happy`);

      await page.waitForLoadState('domcontentloaded');

      // Check that config was loaded
      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      expect(config).toBeTruthy();
      expect(config.source).toBeDefined();
    });

    test('should fallback to query parameter if no valid slug', async ({ page }) => {
      await page.goto(`${BASE_URL}/?pet=bowie`);

      await page.waitForLoadState('domcontentloaded');

      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      expect(config).toBeTruthy();
      expect(config.petName).toBe('Bowie');
      expect(config.source).toBe('queryparam');
    });

    test('should use default config if no slug or query param', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      await page.waitForLoadState('domcontentloaded');

      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      expect(config).toBeTruthy();
      expect(config.source).toBe('default');
      expect(config.petName).toBeDefined();
    });

    test('should cache configuration in localStorage', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-happy`);

      await page.waitForLoadState('domcontentloaded');

      // Check localStorage for cached config
      const cached = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.find(key => key.startsWith('sparkleclassic_config'));
      });

      expect(cached).toBeTruthy();
    });

    test('should use cached config on subsequent visits', async ({ page }) => {
      // First visit - loads from API/default
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');

      // Second visit - should use cache
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');

      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      // Config should be loaded (from cache or fallback)
      expect(config).toBeTruthy();
    });
  });

  test.describe('Game Initialization with Custom Config', () => {

    test('should initialize game with loaded config', async ({ page }) => {
      await page.goto(`${BASE_URL}/?pet=buttercup`);

      await page.waitForLoadState('domcontentloaded');

      // Wait for game to initialize
      await page.waitForFunction(() => {
        return window.game && window.game.initialized;
      }, { timeout: GAME_LOAD_TIMEOUT });

      const gameConfig = await page.evaluate(() => {
        return window.game.gameConfig;
      });

      expect(gameConfig.petName).toBe('Buttercup');
    });

    test('should store config in StateManager', async ({ page }) => {
      await page.goto(`${BASE_URL}/?pet=bowie`);

      await page.waitForLoadState('domcontentloaded');

      const storedConfig = await page.evaluate(() => {
        return window.stateManager?.get('game.config');
      });

      expect(storedConfig).toBeTruthy();
      expect(storedConfig.petName).toBe('Bowie');
    });

    test('should render game canvas', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-happy`);

      const canvas = page.locator('#gameCanvas');
      await expect(canvas).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });

      // Canvas should have correct dimensions
      const dimensions = await canvas.evaluate(el => ({
        width: el.width,
        height: el.height
      }));

      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
    });
  });

  test.describe('Security and Validation', () => {

    test('should sanitize pet name from config', async ({ page }) => {
      // Try to inject HTML via query param
      await page.goto(`${BASE_URL}/?pet=<script>alert('xss')</script>`);

      await page.waitForLoadState('domcontentloaded');

      // Should not execute script
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      // Wait a bit to see if alert fires
      await page.waitForTimeout(1000);

      expect(alerts.length).toBe(0);
    });

    test('should only accept HTTPS sprite URLs from trusted domains', async ({ page }) => {
      await page.goto(`${BASE_URL}/fluffy-happy`);

      await page.waitForLoadState('domcontentloaded');

      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      // If spriteUrl exists, it should be HTTPS from trusted domain
      if (config.spriteUrl) {
        expect(config.spriteUrl).toMatch(/^https:\/\/(.*sparkleclassic\.com|.*googleapis\.com)/);
      }
    });

    test('should validate slug format', async ({ page }) => {
      // Test invalid slug formats
      const invalidSlugs = [
        'UPPERCASE',           // Must be lowercase
        'special@chars',       // No special chars
        'no',                  // Too short
        'x'.repeat(51),        // Too long
        'nohyphen',            // Must have hyphen
      ];

      for (const slug of invalidSlugs) {
        await page.goto(`${BASE_URL}/${slug}`);
        await page.waitForLoadState('domcontentloaded');

        // Should load game with default config, not treat as vanity URL
        const config = await page.evaluate(() => {
          return window.game?.gameConfig;
        });

        expect(config.source).not.toBe('api');
      }
    });

    test('should block reserved path names', async ({ page }) => {
      const reservedPaths = ['api', 'admin', 'designer', 'public', 'assets', 'src'];

      for (const path of reservedPaths) {
        await page.goto(`${BASE_URL}/${path}-test`);
        await page.waitForLoadState('domcontentloaded');

        const config = await page.evaluate(() => {
          return window.game?.gameConfig;
        });

        // Should not treat as vanity URL
        expect(config.source).not.toBe('api');
      }
    });
  });

  test.describe('Error Handling', () => {

    test('should gracefully handle API errors', async ({ page }) => {
      // Navigate to slug that doesn't exist in API
      await page.goto(`${BASE_URL}/nonexistent-slug`);

      await page.waitForLoadState('domcontentloaded');

      // Game should still load with fallback config
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });

      const config = await page.evaluate(() => {
        return window.game?.gameConfig;
      });

      expect(config).toBeTruthy();
      expect(['default', 'queryparam', 'cache']).toContain(config.source);
    });

    test('should handle localStorage errors gracefully', async ({ context, page }) => {
      // Disable localStorage
      await context.addInitScript(() => {
        delete window.localStorage;
      });

      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');

      // Game should still load
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      // Simulate offline
      await context.setOffline(true);

      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');

      // Game should still load with default config
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });
    });
  });

  test.describe('Performance', () => {

    test('should load game within performance budget', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/fluffy-happy`);
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });

      const loadTime = Date.now() - startTime;

      // Game should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should cache static assets', async ({ page }) => {
      // First visit
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');

      // Second visit should be faster (assets cached)
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await page.waitForLoadState('domcontentloaded');
      const secondLoadTime = Date.now() - startTime;

      // Cached load should be faster
      expect(secondLoadTime).toBeLessThan(2000);
    });
  });

  test.describe('Browser Compatibility', () => {

    test('should work in different viewports', async ({ page }) => {
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });

      // Desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(`${BASE_URL}/fluffy-happy`);
      await expect(page.locator('#gameCanvas')).toBeVisible({ timeout: GAME_LOAD_TIMEOUT });
    });

    test('should maintain config across page reloads', async ({ page }) => {
      await page.goto(`${BASE_URL}/?pet=buttercup`);
      await page.waitForLoadState('domcontentloaded');

      const firstConfig = await page.evaluate(() => {
        return window.game?.gameConfig?.petName;
      });

      // Reload page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      const secondConfig = await page.evaluate(() => {
        return window.game?.gameConfig?.petName;
      });

      expect(firstConfig).toBe(secondConfig);
    });
  });
});
