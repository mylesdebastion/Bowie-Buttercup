# Sparkle Classic - Technical Specification

**Author:** Myles
**Date:** 2025-12-08
**Project Level:** Quick Flow
**Change Type:** Feature Addition
**Development Context:** Brownfield - Monolithic HTML5 Game

---

## Context

### Available Documents

| Document | Status | Key Insights |
|----------|--------|--------------|
| `docs/bmm-index.md` | ✅ Loaded | Comprehensive brownfield codebase documentation |
| `docs/bmad/pet-game-platform-brief.md` | ✅ Loaded | Product vision: personalized pet games at $14.99-$28.99 |
| `docs/bmm-brainstorming-session-2025-11-29.md` | ✅ Loaded | Strategic pivot: ship monolithic + vanity URL fast |

**Key Strategic Context:**
- Full platform (15 epics) deferred to `feature/bmad-modularization` branch
- MVP validates business model with minimal code changes
- Etsy handles payments, no Stripe integration needed
- AI sprite workflow tested separately (Priority #1)

### Project Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Runtime | Node.js >=18.0.0 | For build tools only |
| Build Tool | Vite 5.0.0 | Dev server and bundling |
| Testing | Vitest 1.0.0 | Unit tests |
| E2E Testing | Playwright 1.55.0 | Visual regression |
| Language | Vanilla JavaScript ES2020 | No framework |
| Game Engine | Custom HTML5 Canvas | No Phaser/framework |

**Monolithic Game Stats:**
- `index.html`: 3,533 lines (complete working game)
- Sprite loading: Lines 3375-3411
- Self-contained, offline-capable

### Existing Codebase Structure

```
Bowie-Buttercup/
├── index.html              # WORKING MONOLITHIC GAME (target for this work)
├── src/                    # Modular refactor (NOT for MVP)
├── public/
│   └── sprites/            # Pet sprites, items, backgrounds
├── docs/                   # Documentation
└── package.json            # Build tools config
```

**Critical Files:**
- `index.html` - The complete working game, target for config injection
- `public/sprites/` - Pet sprite assets organized by pet name

---

## The Change

### Problem Statement

The monolithic game works perfectly but has hardcoded sprite paths, making it impossible to deliver personalized games to customers. Each customer needs their pet's sprites loaded at a unique URL like `sparkleclassic.com/petname`.

**Current State:**
```javascript
// Lines 3375-3411 in index.html - HARDCODED
const SPRITE_PATHS = {
  player: 'sprites/bowie/idle.png',
  playerWalk: 'sprites/bowie/walk.png',
  // ... more hardcoded paths
};
```

**Desired State:**
```javascript
// Injected at top of file per customer
const GAME_CONFIG = {
  petName: 'fluffy',
  sprites: {
    player: 'sprites/fluffy/idle.png',
    playerWalk: 'sprites/fluffy/walk.png',
    // ... configurable paths
  }
};
```

### Proposed Solution

**Config Injection Pattern:**
1. Add a `GAME_CONFIG` object placeholder at the top of `index.html`
2. Modify sprite loading code to read from `GAME_CONFIG` instead of hardcoded values
3. Create a template system to generate per-customer `index.html` files
4. Deploy as static files to Vercel/Netlify/Cloudflare Pages

**Deployment Architecture:**
```
sparkleclassic.com/
├── bowie/
│   └── index.html          # Bowie's customized game
├── buttercup/
│   └── index.html          # Buttercup's customized game
├── fluffy/
│   └── index.html          # Customer's customized game
└── sprites/
    ├── bowie/              # Shared sprite assets
    ├── buttercup/
    └── fluffy/
```

### Scope

**In Scope:**
- Add `GAME_CONFIG` object injection point to `index.html`
- Modify sprite loading (lines 3375-3411) to use config
- Create `generate-game.js` script to produce customer games
- Document deployment process for Aurelia
- Test with Bowie/Buttercup examples
- Deploy to Vercel/Netlify (free tier)

**Out of Scope:**
- Modular architecture refactor (stays on `feature/bmad-modularization`)
- Dynamic server-side routing
- Payment/checkout integration (Etsy handles)
- AI sprite generation automation (separate priority)
- User authentication or accounts
- Database or backend API

---

## Implementation Details

### Source Tree Changes

| File | Action | Description |
|------|--------|-------------|
| `index.html` | MODIFY | Add GAME_CONFIG injection point at line ~15, modify sprite loading at lines 3375-3411 |
| `scripts/generate-game.js` | CREATE | Node script to generate customer index.html from template |
| `templates/game-template.html` | CREATE | Template version of index.html with config placeholder |
| `games/bowie/index.html` | CREATE | Generated example game for Bowie |
| `games/buttercup/index.html` | CREATE | Generated example game for Buttercup |
| `docs/deployment-guide.md` | CREATE | Step-by-step guide for Aurelia |

### Technical Approach

**Step 1: Add Config Object**

Insert at line ~15 of `index.html` (after `<head>` opens):
```html
<script>
  // GAME_CONFIG - Injected per customer
  // This object is replaced by generate-game.js for each customer
  const GAME_CONFIG = {
    petName: "bowie",
    petDisplayName: "Bowie",
    sprites: {
      player: {
        idle: "sprites/bowie/idle.png",
        walk: "sprites/bowie/walk.png",
        jump: "sprites/bowie/jump.png",
        fall: "sprites/bowie/fall.png"
      },
      items: {
        food: "sprites/bowie/food.png",
        toy: "sprites/bowie/toy.png",
        bed: "sprites/bowie/bed.png"
      }
    },
    gameTitle: "Bowie's Adventure",
    primaryColor: "#FF6B6B"
  };
</script>
```

**Step 2: Modify Sprite Loading**

Change lines 3375-3411 from hardcoded paths to config references:
```javascript
// BEFORE (hardcoded)
const playerSprite = new Image();
playerSprite.src = 'sprites/bowie/idle.png';

// AFTER (config-driven)
const playerSprite = new Image();
playerSprite.src = GAME_CONFIG.sprites.player.idle;
```

**Step 3: Generate Customer Games**

`scripts/generate-game.js`:
```javascript
import fs from 'fs';
import path from 'path';

function generateGame(petName, config) {
  const template = fs.readFileSync('templates/game-template.html', 'utf8');
  const configScript = `const GAME_CONFIG = ${JSON.stringify(config, null, 2)};`;
  const output = template.replace('/* GAME_CONFIG_PLACEHOLDER */', configScript);

  const outputDir = `games/${petName}`;
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(`${outputDir}/index.html`, output);

  console.log(`Generated game for ${petName} at ${outputDir}/index.html`);
}
```

### Existing Patterns to Follow

**From monolithic index.html:**
- All JavaScript inline within `<script>` tags
- ES5/ES6 syntax (no modules in monolithic version)
- Canvas rendering with requestAnimationFrame
- Event-based input handling
- localStorage for game state persistence

**Naming Conventions:**
- camelCase for variables and functions
- UPPER_SNAKE_CASE for constants
- Descriptive function names (e.g., `loadSprites`, `updatePlayerPosition`)

### Integration Points

| Integration | Type | Details |
|-------------|------|---------|
| Sprite Loading | Internal | Lines 3375-3411, reads from GAME_CONFIG |
| Game Title | Internal | Document title and HUD display |
| Static Hosting | External | Vercel/Netlify/Cloudflare Pages |
| Sprite Assets | File System | `sprites/{petName}/` folders |

---

## Development Context

### Relevant Existing Code

**Sprite Loading Section (lines 3375-3411):**
```javascript
// Current hardcoded sprite definitions
// This is the PRIMARY modification target
const sprites = {
  player: { idle: null, walk: null, jump: null },
  items: { food: null, toy: null, bed: null },
  enemies: { dog: null, fireball: null }
};

function loadSprites() {
  sprites.player.idle = new Image();
  sprites.player.idle.src = 'sprites/bowie/idle.png';
  // ... more sprite loading
}
```

**Game Initialization (around line 100):**
```javascript
// Game starts here - GAME_CONFIG must be defined before this
window.onload = function() {
  initCanvas();
  loadSprites();
  startGameLoop();
};
```

### Dependencies

**Framework/Libraries:**
- None (Vanilla JavaScript)
- HTML5 Canvas API (browser native)

**Internal Modules:**
- None (monolithic file)

**Build Tools (dev only):**
- Node.js >=18.0.0 (for generate-game.js script)
- fs module (Node built-in)

### Configuration Changes

| File | Change |
|------|--------|
| `package.json` | Add script: `"generate-game": "node scripts/generate-game.js"` |
| `.gitignore` | Add: `games/` (generated output) |

### Existing Conventions (Brownfield)

**Code Style:**
- No semicolons (existing pattern)
- Single quotes for strings
- 2-space indentation
- No trailing commas

**Test Patterns:**
- Manual browser testing for monolithic game
- Playwright for visual regression (optional)

---

## Implementation Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Game Runtime | Vanilla JavaScript | ES2020 |
| Rendering | HTML5 Canvas | Native |
| Build Script | Node.js | >=18.0.0 |
| Hosting | Vercel/Netlify/Cloudflare | Free tier |
| Domain | sparkleclassic.com | Already owned |

---

## Technical Details

### Config Schema

```typescript
interface GameConfig {
  petName: string;           // URL slug (lowercase, no spaces)
  petDisplayName: string;    // Display name with proper casing
  sprites: {
    player: {
      idle: string;          // Path to idle sprite
      walk: string;          // Path to walk animation
      jump: string;          // Path to jump sprite
      fall: string;          // Path to falling sprite
    };
    items: {
      food: string;          // Pet food bowl sprite
      toy: string;           // Pet toy sprite
      bed: string;           // Pet bed sprite
    };
  };
  gameTitle: string;         // Browser tab and HUD title
  primaryColor: string;      // Hex color for UI accents
}
```

### Error Handling

**Missing Config:**
```javascript
if (typeof GAME_CONFIG === 'undefined') {
  console.error('GAME_CONFIG not defined. Using defaults.');
  window.GAME_CONFIG = DEFAULT_CONFIG;
}
```

**Missing Sprites:**
```javascript
sprite.onerror = function() {
  console.warn(`Failed to load sprite: ${this.src}`);
  this.src = 'sprites/default/placeholder.png';
};
```

### Performance Considerations

- No performance impact (config read once at startup)
- Static hosting = global CDN caching
- Games remain <2MB, offline-capable

---

## Development Setup

```bash
# 1. Ensure you're on MVP branch
git checkout feature/vanity-url-mvp

# 2. No npm install needed for monolithic game
# (package.json is for dev tools only)

# 3. Test monolithic game directly
open index.html
# Or use live server

# 4. After modifications, generate test games
node scripts/generate-game.js bowie
node scripts/generate-game.js buttercup

# 5. Test generated games
open games/bowie/index.html
open games/buttercup/index.html
```

---

## Implementation Guide

### Setup Steps

1. [ ] Create `scripts/` directory if not exists
2. [ ] Create `templates/` directory
3. [ ] Create `games/` directory (add to .gitignore)
4. [ ] Update package.json with generate-game script

### Implementation Steps

**Phase 1: Config Injection (Core Change)**
1. Copy `index.html` to `templates/game-template.html`
2. Add `GAME_CONFIG` placeholder at line ~15
3. Replace hardcoded sprite paths (lines 3375-3411) with `GAME_CONFIG.sprites.*` references
4. Update game title to use `GAME_CONFIG.gameTitle`
5. Test template still works with placeholder config

**Phase 2: Generation Script**
1. Create `scripts/generate-game.js`
2. Implement config injection logic
3. Add CLI interface: `node generate-game.js <petName> <configPath>`
4. Generate Bowie and Buttercup examples
5. Verify generated games work correctly

**Phase 3: Deployment**
1. Choose hosting: Vercel (recommended for simplicity)
2. Connect GitHub repo to Vercel
3. Configure: `games/` as publish directory
4. Deploy and test vanity URLs
5. Document process for Aurelia

### Testing Strategy

**Manual Testing:**
- [ ] Original `index.html` still works unchanged
- [ ] Template with placeholder config runs correctly
- [ ] Generated Bowie game loads Bowie sprites
- [ ] Generated Buttercup game loads Buttercup sprites
- [ ] Games work offline (no external dependencies)
- [ ] Vanity URLs resolve correctly on hosting platform

**Visual Verification:**
- [ ] Correct pet sprite displays as player
- [ ] All sprite animations work
- [ ] Game title shows pet name
- [ ] No console errors

### Acceptance Criteria

1. **Config Injection Works**
   - Given a `GAME_CONFIG` object at top of file
   - When game loads
   - Then sprites load from config paths, not hardcoded values

2. **Generation Script Works**
   - Given pet name "fluffy" and sprite config
   - When running `node scripts/generate-game.js fluffy config.json`
   - Then `games/fluffy/index.html` is created with injected config

3. **Vanity URL Works**
   - Given deployed game at `sparkleclassic.com/bowie/`
   - When user visits URL
   - Then Bowie's personalized game loads and plays

4. **Aurelia Can Deploy**
   - Given documentation and generate script
   - When Aurelia follows deployment guide
   - Then new customer game is live within 15 minutes

---

## Developer Resources

### File Paths Reference

| Purpose | Path |
|---------|------|
| Working game | `index.html` |
| Game template | `templates/game-template.html` |
| Generation script | `scripts/generate-game.js` |
| Generated games | `games/{petName}/index.html` |
| Sprite assets | `public/sprites/{petName}/` |
| Deployment guide | `docs/deployment-guide.md` |

### Key Code Locations

| Component | Location |
|-----------|----------|
| Sprite loading | `index.html` lines 3375-3411 |
| Game initialization | `index.html` ~line 100 |
| Canvas setup | `index.html` ~line 50 |
| Game loop | `index.html` ~line 200 |

### Testing Locations

| Test Type | Location |
|-----------|----------|
| Manual testing | Open `index.html` in browser |
| Generated games | Open `games/{petName}/index.html` |
| Visual regression | `npm run test:visual` (optional) |

### Documentation to Update

| Document | Update Needed |
|----------|---------------|
| `docs/deployment-guide.md` | CREATE - Step-by-step for Aurelia |
| `README.md` | Add MVP deployment section |
| `CLAUDE.md` | Note MVP branch workflow |

---

## UX/UI Considerations

**No UI changes required** - This is a backend/config change only.

The game UI remains identical; only the loaded sprites change based on config.

**User-facing changes:**
- Game title shows pet name (e.g., "Bowie's Adventure")
- URL is personalized (sparkleclassic.com/bowie)
- Correct pet sprites display throughout game

---

## Testing Approach

**Primary Testing:** Manual browser verification

**Test Checklist:**
- [ ] Load original index.html - still works
- [ ] Load template with default config - works
- [ ] Generate Bowie game - correct sprites load
- [ ] Generate Buttercup game - correct sprites load
- [ ] Deploy to Vercel - URLs resolve
- [ ] Test offline - games work without internet

**No automated tests required** for this MVP change (manual verification sufficient per project testing philosophy).

---

## Deployment Strategy

### Deployment Steps

1. **Generate customer game locally**
   ```bash
   node scripts/generate-game.js fluffy fluffy-config.json
   ```

2. **Copy to deployment folder**
   ```bash
   cp -r games/fluffy/ deploy/fluffy/
   cp -r public/sprites/fluffy/ deploy/sprites/fluffy/
   ```

3. **Deploy to Vercel**
   ```bash
   cd deploy
   vercel --prod
   ```

4. **Verify at URL**
   - Visit `sparkleclassic.com/fluffy/`
   - Confirm game loads with correct sprites

### Rollback Plan

**If issues detected:**
1. Vercel auto-keeps previous deployments
2. Click "Rollback" in Vercel dashboard
3. Or redeploy previous version from git

**Config issues:**
- Regenerate game with corrected config
- Redeploy single folder

### Monitoring

**Manual monitoring:**
- Check game loads at vanity URL
- Verify sprites display correctly
- Test on mobile and desktop

**No server monitoring needed** - static files, CDN handles availability.

---

*Generated by BMad Method tech-spec workflow (Quick Flow) - 2025-12-08*
