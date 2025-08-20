import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VisualTestRunner {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080';
    this.screenshotDir = config.screenshotDir || path.join(__dirname, '..', 'screenshots');
    this.viewports = config.viewports || [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    this.browser = null;
    this.page = null;
    this.errors = [];
  }

  async init(options = {}) {
    this.browser = await puppeteer.launch({
      headless: options.headless !== false ? 'new' : false,
      devtools: options.devtools || false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.setupErrorHandling();
  }

  async setupErrorHandling() {
    // Capture console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Capture page errors
    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'page',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // Capture response errors
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.errors.push({
          type: 'network',
          message: `${response.status()} - ${response.url()}`,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async navigateToGame(url = null) {
    const targetUrl = url || `${this.baseUrl}/index.html`;
    await this.page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for game to initialize
    await this.page.waitForFunction(
      () => typeof game !== 'undefined' && game && game.player,
      { timeout: 5000 }
    ).catch(() => {
      console.warn('⚠️ Game may not be fully initialized');
    });
    
    // Additional wait for rendering
    await this.page.waitForTimeout(1000);
  }

  async navigateToLevel(level) {
    await this.page.evaluate((levelNum) => {
      if (typeof game !== 'undefined' && game) {
        game.currentLevel = levelNum;
        game.level = game.createLevel();
        game.initLevel();
      }
    }, level);
    await this.page.waitForTimeout(500);
  }

  async captureScreenshot(options = {}) {
    const {
      issueNumber,
      description,
      status = 'investigating',
      viewport = 'desktop',
      fullPage = false,
      level = null,
      scenario = null,
      clip = null
    } = options;

    // Set viewport
    const vp = this.viewports.find(v => v.name === viewport);
    if (vp) {
      await this.page.setViewport(vp);
      await this.page.waitForTimeout(100); // Allow viewport to settle
    }

    // Generate filename
    const timestamp = this.getTimestamp();
    const filename = this.generateFilename({
      timestamp,
      issueNumber,
      description,
      status
    });

    // Determine path
    const screenshotPath = await this.getScreenshotPath({
      issueNumber,
      level,
      scenario,
      filename
    });

    // Capture screenshot
    const screenshotOptions = {
      path: screenshotPath,
      type: 'png'
    };
    
    if (fullPage) {
      screenshotOptions.fullPage = true;
    } else if (clip) {
      screenshotOptions.clip = clip;
    }
    
    await this.page.screenshot(screenshotOptions);

    // Save metadata
    await this.saveMetadata({
      path: screenshotPath,
      issueNumber,
      description,
      status,
      viewport: vp?.name || 'custom',
      level,
      scenario,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      gameState: await this.captureGameState(),
      errors: this.errors.slice() // Copy current errors
    });

    console.log(`📸 Screenshot saved: ${path.relative(process.cwd(), screenshotPath)}`);
    return screenshotPath;
  }

  getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
  }

  generateFilename({ timestamp, issueNumber, description, status }) {
    const parts = [timestamp];
    
    if (issueNumber) {
      parts.push(`issue-${issueNumber}`);
    }
    
    if (description) {
      // Sanitize description for filename
      const sanitized = description
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      parts.push(sanitized);
    }
    
    parts.push(status);
    
    return `${parts.join('_')}.png`;
  }

  async getScreenshotPath({ issueNumber, level, scenario, filename }) {
    let dir = this.screenshotDir;
    
    if (issueNumber) {
      dir = path.join(dir, 'issues', `issue-${issueNumber}`);
    } else if (level) {
      dir = path.join(dir, 'baseline', `level-${level}`);
    } else if (scenario) {
      const date = new Date().toISOString().split('T')[0];
      dir = path.join(dir, 'regression', date);
    } else {
      dir = path.join(dir, 'misc');
    }

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    return path.join(dir, filename);
  }

  async captureGameState() {
    try {
      return await this.page.evaluate(() => {
        if (typeof game !== 'undefined' && game) {
          const state = {
            level: game.currentLevel,
            score: game.score || 0,
            lives: game.lives || 0,
            time: game.time || 0,
            paused: game.paused || false
          };
          
          if (game.player) {
            state.player = {
              x: Math.round(game.player.x),
              y: Math.round(game.player.y),
              vx: Math.round(game.player.vx),
              vy: Math.round(game.player.vy),
              grounded: game.player.grounded,
              state: game.player.state
            };
          }
          
          if (game.level) {
            state.levelData = {
              width: game.level[0] ? game.level[0].length : 0,
              height: game.level.length
            };
          }
          
          return state;
        }
        return null;
      });
    } catch (e) {
      console.warn('Failed to capture game state:', e.message);
      return null;
    }
  }

  async saveMetadata(metadata) {
    const dir = path.dirname(metadata.path);
    const metaPath = path.join(dir, 'metadata.json');
    
    let existingMeta = {};
    try {
      const data = await fs.readFile(metaPath, 'utf8');
      existingMeta = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet
    }

    const filename = path.basename(metadata.path);
    const hash = createHash('md5')
      .update(filename)
      .digest('hex');
    
    // Store by filename for easier lookup
    existingMeta[filename] = {
      ...metadata,
      hash,
      fileSize: await this.getFileSize(metadata.path)
    };
    
    await fs.writeFile(
      metaPath, 
      JSON.stringify(existingMeta, null, 2)
    );
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (e) {
      return 0;
    }
  }

  async simulatePlayerAction(action, params = {}) {
    await this.page.evaluate((act, p) => {
      if (typeof game !== 'undefined' && game && game.player) {
        switch(act) {
          case 'move':
            game.player.x = p.x;
            game.player.y = p.y;
            break;
          case 'jump':
            if (game.player.grounded) {
              game.player.vy = -game.physics.jumpForce;
              game.player.grounded = false;
            }
            break;
          case 'left':
            game.player.vx = -game.physics.moveSpeed;
            break;
          case 'right':
            game.player.vx = game.physics.moveSpeed;
            break;
          case 'stop':
            game.player.vx = 0;
            break;
        }
      }
    }, action, params);
  }

  async waitForCondition(condition, timeout = 5000) {
    return this.page.waitForFunction(condition, { timeout });
  }

  async getErrors() {
    return this.errors;
  }

  async clearErrors() {
    this.errors = [];
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

export default VisualTestRunner;