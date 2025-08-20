# Puppeteer Visual Testing Architecture

## Overview
A comprehensive visual regression testing system using Puppeteer for the Cat Platformer game, with automated screenshot capture, issue tracking, and visual diff capabilities.

## Directory Structure

```
test-visual/
├── screenshots/              # All captured screenshots
│   ├── baseline/            # Reference screenshots
│   │   ├── level-1/
│   │   ├── level-2/
│   │   ├── level-3/
│   │   ├── level-4/
│   │   └── level-5/
│   ├── issues/              # Issue-specific screenshots
│   │   ├── issue-1/         # Pit collision bug
│   │   │   ├── 2024-01-20_143022_before-fix.png
│   │   │   ├── 2024-01-20_145533_after-fix.png
│   │   │   └── metadata.json
│   │   └── issue-{n}/
│   ├── regression/          # Failed test screenshots
│   │   └── 2024-01-20/
│   └── archive/             # Historical screenshots
│       └── 2024/
│           └── 01/
├── reports/                 # Test reports
│   ├── html/
│   └── json/
├── config/                  # Configuration files
│   ├── viewports.json
│   ├── test-scenarios.json
│   └── issue-templates.json
└── scripts/                 # Test scripts
    ├── capture-baseline.js
    ├── run-regression.js
    ├── capture-issue.js
    └── generate-report.js
```

## Screenshot Naming Convention

### Format
`{YYYY-MM-DD}_{HHMMSS}_{issue-number}_{description}_{status}.png`

### Examples
- `2024-01-20_143022_issue-1_pit-collision-bug_before.png`
- `2024-01-20_145533_issue-1_pit-collision-bug_fixed.png`
- `2024-01-20_150000_issue-2_player-stuck-wall_investigating.png`
- `2024-01-20_160000_baseline_level-3_initial.png`

### Status Codes
- `before` - Issue reproduction
- `investigating` - During debugging
- `attempted` - Fix attempted
- `fixed` - Issue resolved
- `verified` - Fix verified
- `regression` - Issue returned

## Core Components

### 1. Visual Test Runner (`visual-test-runner.js`)

```javascript
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

class VisualTestRunner {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080';
    this.screenshotDir = config.screenshotDir || './test-visual/screenshots';
    this.viewports = config.viewports || [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    this.browser = null;
    this.page = null;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.setupErrorHandling();
  }

  async captureScreenshot(options = {}) {
    const {
      issueNumber,
      description,
      status = 'investigating',
      viewport = 'desktop',
      fullPage = false,
      level = null,
      scenario = null
    } = options;

    // Set viewport
    const vp = this.viewports.find(v => v.name === viewport);
    await this.page.setViewport(vp);

    // Generate filename
    const timestamp = new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .slice(0, 15);
    
    const filename = this.generateFilename({
      timestamp,
      issueNumber,
      description,
      status
    });

    // Determine path
    const screenshotPath = this.getScreenshotPath({
      issueNumber,
      level,
      scenario,
      filename
    });

    // Capture screenshot
    await this.page.screenshot({
      path: screenshotPath,
      fullPage,
      type: 'png'
    });

    // Save metadata
    await this.saveMetadata({
      path: screenshotPath,
      issueNumber,
      description,
      status,
      viewport,
      level,
      scenario,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      gameState: await this.captureGameState()
    });

    return screenshotPath;
  }

  generateFilename({ timestamp, issueNumber, description, status }) {
    const parts = [timestamp];
    
    if (issueNumber) {
      parts.push(`issue-${issueNumber}`);
    }
    
    if (description) {
      parts.push(description.toLowerCase().replace(/\s+/g, '-'));
    }
    
    parts.push(status);
    
    return `${parts.join('_')}.png`;
  }

  getScreenshotPath({ issueNumber, level, scenario, filename }) {
    let dir = this.screenshotDir;
    
    if (issueNumber) {
      dir = path.join(dir, 'issues', `issue-${issueNumber}`);
    } else if (level) {
      dir = path.join(dir, 'baseline', `level-${level}`);
    } else if (scenario) {
      dir = path.join(dir, 'regression', 
        new Date().toISOString().split('T')[0]);
    }

    // Ensure directory exists
    fs.mkdir(dir, { recursive: true });
    
    return path.join(dir, filename);
  }

  async captureGameState() {
    return await this.page.evaluate(() => {
      if (typeof game !== 'undefined' && game) {
        return {
          level: game.currentLevel,
          playerX: game.player?.x,
          playerY: game.player?.y,
          score: game.score,
          lives: game.lives,
          time: game.time
        };
      }
      return null;
    });
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

    const hash = createHash('md5')
      .update(path.basename(metadata.path))
      .digest('hex');
    
    existingMeta[hash] = metadata;
    
    await fs.writeFile(
      metaPath, 
      JSON.stringify(existingMeta, null, 2)
    );
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default VisualTestRunner;
```

### 2. Issue Capture Script (`capture-issue.js`)

```javascript
import VisualTestRunner from './visual-test-runner.js';
import prompts from 'prompts';

async function captureIssue() {
  const runner = new VisualTestRunner();
  
  // Get issue details
  const response = await prompts([
    {
      type: 'number',
      name: 'issueNumber',
      message: 'GitHub Issue Number:',
      validate: value => value > 0
    },
    {
      type: 'text',
      name: 'description',
      message: 'Short description (e.g., "pit-collision-bug"):'
    },
    {
      type: 'select',
      name: 'status',
      message: 'Current status:',
      choices: [
        { title: 'Before Fix', value: 'before' },
        { title: 'Investigating', value: 'investigating' },
        { title: 'Fix Attempted', value: 'attempted' },
        { title: 'Fixed', value: 'fixed' },
        { title: 'Verified', value: 'verified' }
      ]
    },
    {
      type: 'select',
      name: 'level',
      message: 'Which level?',
      choices: [
        { title: 'Level 1', value: 1 },
        { title: 'Level 2', value: 2 },
        { title: 'Level 3', value: 3 },
        { title: 'Level 4', value: 4 },
        { title: 'Level 5', value: 5 },
        { title: 'N/A', value: null }
      ]
    }
  ]);

  await runner.init();
  
  try {
    // Navigate to game
    await runner.page.goto(`${runner.baseUrl}/index.html`);
    await runner.page.waitForTimeout(2000);
    
    // Navigate to specific level if needed
    if (response.level) {
      await runner.page.evaluate((level) => {
        if (game) {
          game.currentLevel = level;
          game.initLevel();
        }
      }, response.level);
      await runner.page.waitForTimeout(1000);
    }
    
    // Capture screenshots for different viewports
    const screenshots = [];
    for (const viewport of ['desktop', 'tablet', 'mobile']) {
      const path = await runner.captureScreenshot({
        ...response,
        viewport,
        fullPage: true
      });
      screenshots.push(path);
      console.log(`✅ Captured ${viewport}: ${path}`);
    }
    
    // Generate summary
    console.log('\n📸 Screenshots captured successfully!');
    console.log(`Issue #${response.issueNumber}: ${response.description}`);
    console.log(`Status: ${response.status}`);
    console.log(`Files saved to: test-visual/screenshots/issues/issue-${response.issueNumber}/`);
    
  } finally {
    await runner.cleanup();
  }
}

captureIssue().catch(console.error);
```

### 3. Automated Test Scenarios (`test-scenarios.json`)

```json
{
  "scenarios": [
    {
      "id": "pit-collision",
      "description": "Test pit collision in Level 3",
      "level": 3,
      "steps": [
        {
          "action": "navigate",
          "x": 144,
          "y": 380
        },
        {
          "action": "wait",
          "ms": 500
        },
        {
          "action": "screenshot",
          "description": "player-over-pit"
        },
        {
          "action": "wait",
          "ms": 1000
        },
        {
          "action": "screenshot",
          "description": "player-fell-through"
        }
      ]
    },
    {
      "id": "platform-jump",
      "description": "Test platform jumping mechanics",
      "level": 1,
      "steps": [
        {
          "action": "keypress",
          "key": "Space"
        },
        {
          "action": "screenshot",
          "description": "mid-jump"
        }
      ]
    }
  ]
}
```

### 4. Visual Regression Runner (`run-regression.js`)

```javascript
import VisualTestRunner from './visual-test-runner.js';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs/promises';

class RegressionRunner extends VisualTestRunner {
  async compareScreenshots(baseline, current) {
    const img1 = PNG.sync.read(await fs.readFile(baseline));
    const img2 = PNG.sync.read(await fs.readFile(current));
    
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    
    const diffPercent = (numDiffPixels / (width * height)) * 100;
    
    return {
      match: diffPercent < 0.1,
      diffPercent,
      diffImage: diff
    };
  }
  
  async runRegressionTest(scenario) {
    // Implementation for running regression tests
  }
}
```

## Integration with GitHub Issues

### Automated Issue Comments

```javascript
async function postScreenshotToIssue(issueNumber, screenshotPath) {
  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  
  // Upload image to GitHub
  const imageData = await fs.readFile(screenshotPath);
  const base64 = imageData.toString('base64');
  
  await octokit.issues.createComment({
    owner: 'mylesdebastion',
    repo: 'Bowie-Buttercup',
    issue_number: issueNumber,
    body: `## Visual Test Result\n\n![Screenshot](data:image/png;base64,${base64})\n\nCaptured: ${new Date().toISOString()}`
  });
}
```

## NPM Scripts

```json
{
  "scripts": {
    "test:visual": "node test-visual/scripts/run-regression.js",
    "test:capture-baseline": "node test-visual/scripts/capture-baseline.js",
    "test:capture-issue": "node test-visual/scripts/capture-issue.js",
    "test:report": "node test-visual/scripts/generate-report.js",
    "test:clean": "rm -rf test-visual/screenshots/regression/*"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [ main, develop ]
  issue_comment:
    types: [created]

jobs:
  visual-test:
    if: contains(github.event.comment.body, '/test visual')
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start game server
      run: npm run dev &
      
    - name: Wait for server
      run: npx wait-on http://localhost:8080
    
    - name: Run visual tests
      run: npm run test:visual
    
    - name: Upload screenshots
      if: failure()
      uses: actions/upload-artifact@v3
      with:
        name: visual-regression-failures
        path: test-visual/screenshots/regression/
    
    - name: Comment on issue
      if: github.event_name == 'issue_comment'
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '✅ Visual tests completed! Check artifacts for results.'
          })
```

## Benefits

1. **Traceable History**: Every screenshot is timestamped and linked to issues
2. **Visual Regression Detection**: Automatic comparison with baselines
3. **Multi-viewport Testing**: Desktop, tablet, and mobile views
4. **Issue Documentation**: Visual proof of bugs and fixes
5. **Automated Workflow**: CI/CD integration for continuous testing
6. **Searchable Metadata**: JSON metadata for each screenshot
7. **Clean Organization**: Structured directory hierarchy

## Usage Examples

### Capture issue screenshot
```bash
npm run test:capture-issue
# Prompts for issue number, description, and status
```

### Run regression tests
```bash
npm run test:visual
# Compares current state against baselines
```

### Generate report
```bash
npm run test:report
# Creates HTML report with all screenshots
```

## Next Steps

1. Implement the core VisualTestRunner class
2. Create capture scripts for different scenarios
3. Set up GitHub Actions workflow
4. Create baseline screenshots for all levels
5. Implement visual diff reporting
6. Add screenshot compression for storage optimization