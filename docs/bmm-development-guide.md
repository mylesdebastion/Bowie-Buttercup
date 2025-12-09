# Development Guide - SparkleClassic

**Generated:** 2025-11-29

## Prerequisites

### Required Software
- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **Git:** Latest version

### Recommended Tools
- VS Code or similar code editor
- Modern browser (Chrome, Firefox, Edge)
- DevTools for debugging

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/mylesdebastion/Bowie-Buttercup.git
cd Bowie-Buttercup
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Installation
```bash
npm run dev
# Should open browser to http://localhost:3000
```

## Development Commands

### Start Development Server
```bash
npm run dev
```
- Opens `http://localhost:3000`
- Hot module replacement enabled
- Access game at `/src/index.html`

### Build for Production
```bash
npm run build
```
- Output: `dist/` directory
- Minified and optimized
- Single HTML file output

### Preview Production Build
```bash
npm run preview
```
- Serves production build
- Port: 3001

### Run Tests
```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:unit   # Unit tests only
npm run test:e2e    # E2E tests only
```

### Linting
```bash
npm run lint         # Check code style
npm run lint:fix     # Auto-fix issues
```

### Visual Testing
```bash
npm run visual:capture-baseline  # Capture baseline
npm run visual:regression        # Run regression test
```

## Project Structure

### Source Code (`src/`)

```
src/
├── core/          # Core game engine
├── entities/      # Game objects
├── levels/        # Level definitions
├── ui/            # UI components
├── systems/       # Game systems
├── performance/   # Monitoring
├── configs/       # Configuration
└── styles/        # CSS
```

### Entry Points

**Main Entry (`src/main.js`):**
- Vanity URL support
- Configuration loading
- Full initialization

**Pet Selector (`src/index.js`):**
- Pet selection UI
- URL parameter support
- Quick start

## Common Development Tasks

### Adding a New Entity

1. Create entity class in `src/entities/`:
```javascript
import { Entity } from './Entity.js';

export class MyEntity extends Entity {
  constructor(x, y) {
    super(x, y, width, height);
  }

  update(dt) { /* logic */ }
  render(ctx) { /* drawing */ }
}
```

2. Add to EntityFactory:
```javascript
// src/entities/EntityFactory.js
create(type, config) {
  if (type === 'myentity') return new MyEntity(config.x, config.y);
}
```

3. Spawn in level:
```javascript
// src/levels/Level1.js
this.entities.push(entityFactory.create('myentity', { x: 100, y: 200 }));
```

### Adding a New Level

1. Create level file in `src/levels/`:
```javascript
import { Level } from './Level.js';

export class Level6 extends Level {
  constructor() {
    super(6, 'Level 6 Name');
  }

  init() {
    // Setup platforms, enemies, collectibles
  }
}
```

2. Register in LevelManager:
```javascript
// src/levels/LevelManager.js
import { Level6 } from './Level6.js';
this.levels.set(6, new Level6());
```

### Modifying State Schema

1. Update StateManager schema:
```javascript
// src/core/StateManager.js
this.defaultState = {
  game: {
    // Add new field
    newField: defaultValue
  }
}
```

2. Add validation:
```javascript
createValidationSchema() {
  return {
    game: {
      newField: (v) => typeof v === 'expectedType'
    }
  };
}
```

3. Update localStorage keys if needed

### Adding UI Component

1. Create component in `src/ui/`:
```javascript
export class MyComponent {
  constructor(container, stateManager) {
    this.container = container;
    this.stateManager = stateManager;
  }

  render() {
    // Create DOM elements
  }

  show() { /* visibility logic */ }
  hide() { /* visibility logic */ }
  destroy() { /* cleanup */ }
}
```

2. Register in UIManager:
```javascript
// src/ui/UIManager.js
this.components.set('mycomponent', new MyComponent(...));
```

## Build Configuration

### Vite Configuration (`vite.config.js`)

**Key Settings:**
- Entry: `src/index.html`
- Output: Single file build
- Target: ES2020
- Minifier: Terser

**Development:**
- Port: 3000
- HMR: Enabled
- Vanity URL middleware

**Production:**
- Source maps: Disabled
- Console removal: Enabled
- Bundle size warning: 200KB

## Testing

### Unit Tests (Vitest)

```javascript
// *.test.js files co-located with source
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

**Run:** `npm test`

### E2E Tests (Playwright)

```javascript
// tests/e2e/*.test.js
test('game loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('#gameCanvas')).toBeVisible();
});
```

**Run:** `npm run test:e2e`

## Debugging

### Browser DevTools

**Console Logging:**
- Game events logged with emoji prefixes
- State changes traceable
- Performance metrics visible

**Breakpoints:**
- Set in DevTools Sources tab
- Works with source maps

### Game Debug Mode

```javascript
// Enable debug overlay
window.game.debug = true;
```

Shows:
- FPS counter
- Player position/velocity
- Grounded state

## Code Style

### ESLint Rules

- **Style:** Standard
- **Indentation:** 2 spaces
- **Quotes:** Single
- **Semicolons:** Required

### Naming Conventions

- **Classes:** PascalCase (`StateManager`)
- **Functions:** camelCase (`getStateManager`)
- **Constants:** UPPER_CASE (`MAX_LEVEL`)
- **Files:** PascalCase for classes, camelCase for utilities

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `migration/*` - Migration work

### Commit Messages

```
feat: Add new pet sprite system
fix: Resolve collision detection bug
docs: Update API documentation
refactor: Extract state management
```

### File Lock (Migration)

**Locked:** `/index.html` (monolithic version)
**Active:** `/src/` (modular structure)

Override only in emergencies:
```bash
git commit --no-verify
```

## Environment Setup

### Development

```env
NODE_ENV=development
VITE_DEV_SERVER_PORT=3000
```

### Production

```env
NODE_ENV=production
```

## Performance Optimization

### Best Practices

1. **Asset Loading:** Preload critical assets
2. **Sprite Batching:** Group similar sprites
3. **State Updates:** Batch state changes
4. **Canvas Rendering:** Clear only dirty regions
5. **Memory:** Use object pools for frequently created objects

### Profiling

```bash
npm run build:analyze  # Bundle analysis
```

Chrome DevTools Performance tab for runtime profiling

## Deployment

### Build Process

```bash
npm run build:prod
```

Creates optimized single-file game in `dist/`

### Static Hosting

Compatible with:
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

### Asset Optimization

- PNGs automatically optimized
- Assets <4KB inlined
- Lazy loading for non-critical assets

## Troubleshooting

### Common Issues

**Game not loading:**
- Check console for errors
- Verify all assets loaded
- Check StateManager initialization

**Input not working:**
- Verify InputManager initialized
- Check key mappings in settings
- Test with different browsers

**Performance issues:**
- Enable performance monitor
- Check FPS in debug mode
- Profile with DevTools

## Resources

- **Documentation:** `docs/`
- **Architecture:** `docs/architecture/`
- **Planning:** `docs/planning/`
- **Examples:** Existing levels and entities

## Getting Help

- Check documentation first
- Review existing code patterns
- Use BMad Method workflows for guided development
