# Visual Testing System

## Overview
Automated visual regression testing system using Puppeteer for capturing and comparing screenshots of the Cat Platformer game.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Capture Baseline Screenshots
```bash
npm run visual:capture-baseline
```

### Capture Issue Screenshot
```bash
npm run visual:capture-issue
```
Follow the prompts to enter issue number, description, and status.

### Run Visual Regression Tests
```bash
npm run test:visual
```

## Directory Structure

```
test-visual/
├── screenshots/
│   ├── baseline/        # Reference screenshots for each level
│   ├── issues/          # Issue-specific screenshots
│   │   └── issue-{n}/   # Organized by issue number
│   ├── regression/      # Failed test comparisons
│   └── archive/         # Historical screenshots
├── reports/             # Test execution reports
├── scripts/             # Test automation scripts
└── README.md           # This file
```

## Screenshot Naming Convention

Format: `{YYYY-MM-DD}_{HHMMSS}_{issue-number}_{description}_{status}.png`

### Status Codes
- `before` - Issue reproduction
- `investigating` - During debugging  
- `attempted` - Fix attempted
- `fixed` - Issue resolved
- `verified` - Fix verified
- `regression` - Issue returned
- `baseline` - Reference screenshot

### Examples
- `2024-01-20_143022_issue-1_pit-collision-bug_before.png`
- `2024-01-20_145533_issue-1_pit-collision-bug_fixed.png`
- `2024-01-20_150000_baseline_level-3_spawn.png`

## Usage

### 1. Capturing Issue Screenshots

#### Interactive Mode
```bash
npm run visual:capture-issue
```
This will prompt you for:
- Issue number
- Description
- Current status
- Level (optional)
- Capture mode (current/all viewports/scenario)

#### Example Session
```
📸 Visual Issue Capture Tool

GitHub Issue Number: 1
Short description: pit-collision-bug
Status: investigating
Level: 3
Capture mode: 2 (all viewports)
```

### 2. Baseline Management

#### Capture New Baselines
```bash
npm run visual:capture-baseline
```
This captures baseline screenshots for:
- All 5 levels
- 3 viewports (desktop, tablet, mobile)
- Key game states (spawn, victory, pause)

#### Update Specific Baseline
```javascript
const runner = new VisualTestRunner();
await runner.init();
await runner.navigateToGame();
await runner.navigateToLevel(3);
await runner.captureScreenshot({
  description: 'pit-area',
  status: 'baseline',
  level: 3
});
```

### 3. Visual Regression Testing

#### Run All Tests
```bash
npm run test:visual
```

#### Run Specific Scenario
```bash
node test-visual/scripts/run-regression.js --scenario pit-collision
```

### 4. GitHub Integration

#### Trigger via PR Comment
Add a comment with `/test visual` to any pull request.

#### Manual Workflow Trigger
1. Go to Actions tab
2. Select "Visual Regression Tests"
3. Click "Run workflow"
4. Optional: Enter issue number or check "Capture baseline"

## Metadata

Each screenshot directory contains a `metadata.json` file with:
- Timestamp
- Game state (level, score, player position)
- Viewport dimensions
- Browser errors captured
- File hash and size

### Example Metadata
```json
{
  "2024-01-20_143022_issue-1_pit-collision_before.png": {
    "path": "test-visual/screenshots/issues/issue-1/...",
    "issueNumber": 1,
    "description": "pit-collision",
    "status": "before",
    "viewport": "desktop",
    "level": 3,
    "timestamp": "2024-01-20T14:30:22.000Z",
    "gameState": {
      "level": 3,
      "player": {
        "x": 144,
        "y": 380,
        "grounded": false
      }
    },
    "errors": [],
    "hash": "a1b2c3d4...",
    "fileSize": 45678
  }
}
```

## CI/CD Integration

### Automatic Testing
- Runs on all pull requests
- Triggered by `/test visual` comment
- Manual workflow dispatch available

### Artifacts
- Screenshots saved for 30 days
- Accessible via GitHub Actions UI
- Downloadable as ZIP archive

## Best Practices

### 1. Before Fixing a Bug
```bash
# Capture the issue state
npm run visual:capture-issue
# Select "before" status
```

### 2. After Applying Fix
```bash
# Capture the fixed state
npm run visual:capture-issue
# Select "fixed" status
# Use same issue number
```

### 3. Verification
```bash
# Run regression to ensure no side effects
npm run test:visual
```

### 4. Documentation
- Add notes when capturing (prompted)
- Include screenshots in PR descriptions
- Reference issue numbers in commits

## Troubleshooting

### Server Not Running
```bash
# Start dev server first
npm run dev

# In another terminal
npm run visual:capture-issue
```

### Timeout Errors
Increase timeout in `visual-test-runner.js`:
```javascript
await this.page.goto(url, {
  timeout: 60000  // Increase from 30000
});
```

### Screenshot Differences
- Check viewport settings match
- Verify game state is consistent
- Consider animation frames

## Advanced Usage

### Custom Scenarios
Create `test-visual/scenarios/custom.js`:
```javascript
export async function customScenario(runner) {
  await runner.navigateToLevel(3);
  await runner.simulatePlayerAction('move', { x: 144, y: 380 });
  await runner.captureScreenshot({
    description: 'custom-test',
    status: 'investigating'
  });
}
```

### Batch Processing
```javascript
const issues = [1, 2, 3];
for (const issue of issues) {
  await captureIssueScreenshots(issue);
}
```

## Contributing

1. Add new scenarios to `test-scenarios.json`
2. Update status codes if needed
3. Ensure metadata is captured
4. Document special cases

## License
Part of the Cat Platformer project