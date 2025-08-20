# CLAUDE.md - AI Assistant Context

## Project Overview
Cat Platformer game undergoing modularization from monolithic architecture using the BMad Method.

## Current State
- **Branch**: feature/bmad-modularization
- **Architecture**: Transitioning from monolithic (index.html) to modular (src/)
- **Game Engine**: Vanilla JavaScript with Canvas API
- **Build System**: Vite
- **Testing**: Vitest + Puppeteer

## Key Files and Locations

### Core Game Files
- `index.html` - Original monolithic game (3400+ lines)
- `src/` - New modular architecture
  - `src/core/game-loop.js` - Extracted game loop
  - `src/core/game-state.js` - State management
  - `src/entities/player.js` - Player entity
  - `src/systems/collision.js` - Collision system

### Documentation
- `docs/prd-modularization.md` - Product Requirements Document
- `docs/architecture/puppeteer-visual-testing-architecture.md` - Visual testing system
- `docs/stories/` - User stories organized by epic
- `docs/fixes/` - Bug fix documentation

### Testing
- `test-utils/` - Testing utilities
- `test-visual/` - Visual regression testing system
- `capture-baselines.html` - Baseline capture tool

## Visual Testing System (Puppeteer)

### Purpose
Automated visual regression testing with timestamped screenshots for issue tracking and debugging.

### Directory Structure
```
test-visual/
├── screenshots/
│   ├── baseline/        # Reference screenshots
│   ├── issues/          # Issue-specific screenshots
│   │   └── issue-{n}/   # Organized by issue number
│   ├── regression/      # Failed test comparisons
│   └── archive/         # Historical screenshots
├── reports/             # Test execution reports
└── scripts/             # Automation scripts
```

### Screenshot Naming Convention
Format: `{YYYY-MM-DD}_{HHMMSS}_{issue-number}_{description}_{status}.png`

Status codes:
- `before` - Issue reproduction
- `investigating` - During debugging
- `attempted` - Fix attempted
- `fixed` - Issue resolved
- `verified` - Fix verified
- `regression` - Issue returned
- `baseline` - Reference screenshot

### Commands
```bash
# Capture issue screenshot (interactive)
npm run visual:capture-issue

# Capture baseline screenshots
npm run visual:capture-baseline

# Run visual regression tests
npm run test:visual

# Generate visual test report
npm run visual:report
```

### Usage Example
When fixing a bug:
1. Capture "before" state: `npm run visual:capture-issue` (select "before")
2. Apply fix
3. Capture "fixed" state: `npm run visual:capture-issue` (select "fixed")
4. Run regression: `npm run test:visual`

### Metadata
Each screenshot includes metadata.json with:
- Timestamp
- Game state (level, player position, score)
- Viewport dimensions
- Browser errors captured
- File hash and size

### GitHub Integration
- PR comments: `/test visual` triggers tests
- Actions workflow: `.github/workflows/visual-regression.yml`
- Artifacts saved for 30 days

## Recent Fixes

### Pit Collision Bug (Issue #1)
**Problem**: Cat walked over pits instead of falling through
**Solution**: 
- Check player center position over pit tiles
- Skip floor collision for Level 3
- Increase respawn depth to Y=450
**Files Modified**: `index.html` lines 891-1031

### JavaScript Loading Error
**Problem**: Duplicate variable declaration preventing game load
**Solution**: Renamed `centerTileY` to `sideCenterTileY` in collision detection
**Files Modified**: `index.html` line 1020

## Game Levels
1. **Level 1**: Tutorial - basic platforms
2. **Level 2**: Moving platforms introduction
3. **Level 3**: Challenge arena with pits (X: 8-11, 19-22, 31-34)
4. **Level 4**: Dog bouncing mechanics
5. **Level 5**: Victory feast

## Testing Approach

### Baseline Capture
Before any code changes:
1. Physics baseline - frame-by-frame physics recording
2. Visual baseline - screenshots of all game states
3. Store in `test-utils/baselines/`

### Regression Testing
- Automated visual comparison using Puppeteer
- Pixel-by-pixel diff with pixelmatch
- Multi-viewport testing (desktop/tablet/mobile)

### Issue Documentation
- Screenshots timestamped and linked to GitHub issues
- Metadata tracking for reproducibility
- Visual proof of bugs and fixes

## Development Workflow

### Starting Development
```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (port 3000)
python -m http.server 8080  # Alternative server for original game
```

### Testing Changes
```bash
npm run lint       # Check code style
npm test          # Run unit tests
npm run visual:capture-issue  # Document visual changes
```

### Committing Changes
```bash
git add .
git commit -m "Fix: [description]

[Extended description]

Fixes #[issue-number]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin feature/bmad-modularization
```

## BMad Method Implementation

### Current Epics
1. **Core Infrastructure** (US-001 to US-006)
2. **Entity Modularization** (US-007 to US-012)
3. **Systems Extraction** (US-013 to US-018)
4. **Asset Management** (US-019 to US-021)
5. **Testing & Validation** (US-022 to US-027)
6. **Bug Fixes** (US-028 to US-029)

### Progress Tracking
Use TodoWrite tool to track implementation progress
Current focus: Modularization with 100% backward compatibility

## Common Commands

### Visual Testing
```bash
# Quick issue capture
npm run visual:capture-issue
# Enter: issue number, description, status

# Full baseline refresh
npm run visual:capture-baseline

# Check for regressions
npm run test:visual
```

### Debugging
```bash
# Visual debug with Puppeteer
node debug-screenshot.js

# Test game loads
open http://localhost:8080/test-game-loads.html

# Test pit collision
open http://localhost:8080/test-pit-collision.html
```

## Important Notes

### Code Style
- ES6 modules (type: "module" in package.json)
- No trailing spaces
- Single quotes for strings
- 2-space indentation
- Always use semicolons

### Git Workflow
- Branch: feature/bmad-modularization
- Main branch: main
- Always include issue number in commits
- Use Co-Authored-By for AI-assisted commits

### Testing Requirements
- Capture baselines before changes
- Document issues with screenshots
- Run regression tests after fixes
- Maintain 100% backward compatibility

## Contact & Repository
- Repository: https://github.com/mylesdebastion/Bowie-Buttercup
- Issues: Report via GitHub Issues
- Visual artifacts: Stored in test-visual/screenshots/

## Quick Reference

### File Locations
```
/                       # Root game files
├── index.html         # Original monolithic game
├── src/               # Modular architecture
├── test-visual/       # Visual testing system
├── docs/              # Documentation
└── CLAUDE.md          # This file
```

### Port Usage
- 3000: Vite dev server (modular version)
- 8080: Python HTTP server (original game)

### Browser Testing
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

---
*Last Updated: 2024-01-20*
*Version: 2.0.0*