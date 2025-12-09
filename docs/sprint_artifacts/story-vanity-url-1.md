# Story 1.1: Config Injection and Vanity URL Deployment

**Status:** Review
**Epic:** vanity-url
**Priority:** P0 (MVP Critical)

---

## User Story

As a **business owner (Myles/Aurelia)**,
I want **to deliver personalized games at unique URLs**,
So that **customers receive their custom pet game and we can validate the business model on Etsy**.

---

## Acceptance Criteria

**AC1: Config Injection**
**Given** a GAME_CONFIG object defined at the top of index.html
**When** the game loads
**Then** sprites load from GAME_CONFIG.sprites paths instead of hardcoded values

**AC2: Game Generation**
**Given** a pet name "fluffy" and config file
**When** running `node scripts/generate-game.js fluffy`
**Then** `games/fluffy/index.html` is created with Fluffy's config injected

**AC3: Vanity URL Access**
**Given** games deployed to Vercel
**When** visiting `sparkleclassic.com/bowie/`
**Then** Bowie's personalized game loads and plays correctly

**AC4: Deployment Speed**
**Given** a new customer order with sprites ready
**When** Aurelia follows the deployment guide
**Then** the game is live at vanity URL within 15 minutes

**AC5: Offline Capability**
**Given** a deployed game has been loaded once
**When** the user goes offline
**Then** the game continues to work (no external dependencies)

---

## Implementation Details

### Tasks / Subtasks

- [x] **Task 1: Add GAME_CONFIG to index.html**
  - [x] Insert config object after `<head>` tag (line 10)
  - [x] Define schema: petName, petDisplayName, sprites, gameTitle, primaryColor
  - [x] Add fallback for missing config

- [x] **Task 2: Modify Sprite Loading**
  - [x] Update loadDefaultSheets() function (lines 3414-3498) to read from GAME_CONFIG
  - [x] Replace all hardcoded sprite paths with GAME_CONFIG.sprites references
  - [x] Test that Bowie sprites still load with default config

- [x] **Task 3: Create Game Template**
  - [x] Copy modified index.html to `templates/game-template.html`
  - [x] Replace config values with `/* GAME_CONFIG_PLACEHOLDER */`
  - [x] Verify template renders with placeholder

- [x] **Task 4: Create Generation Script**
  - [x] Create `scripts/generate-game.js`
  - [x] Accept petName and optional config path as CLI arguments
  - [x] Inject config into template, replacing placeholder
  - [x] Output to `games/{petName}/index.html`

- [x] **Task 5: Generate Example Games**
  - [x] Create `configs/bowie.json` with Bowie's config
  - [x] Create `configs/buttercup.json` with Buttercup's config (yellow color #FFD93D)
  - [x] Generate both example games
  - [x] Verify both games created in games/ directory

- [x] **Task 6: Deploy to Vercel**
  - [x] Update vercel.json with rewrites for vanity URLs (/:petName -> /games/:petName/index.html)
  - [x] Configure games/ caching headers
  - Note: Manual deployment required via git push or Vercel dashboard

- [x] **Task 7: Create Deployment Guide**
  - [x] Write `docs/deployment-guide.md`
  - [x] Step-by-step for Aurelia with time estimates (~10 min total)
  - [x] Includes troubleshooting section
  - [x] Covers: prepare sprites, create config, generate, test, deploy, verify

### Technical Summary

This story implements the core MVP functionality: config-driven game delivery. The monolithic game already works; we're adding a config layer on top to enable per-customer customization without modifying game logic.

**Key Changes:**
1. ~10 lines added (GAME_CONFIG object)
2. ~10 lines modified (sprite loading section)
3. New script for generation
4. Static deployment to CDN

### Project Structure Notes

- **Files to modify:**
  - `index.html` (add config, modify sprite loading)

- **Files to create:**
  - `templates/game-template.html`
  - `scripts/generate-game.js`
  - `configs/bowie.json`
  - `configs/buttercup.json`
  - `docs/deployment-guide.md`
  - `games/bowie/index.html` (generated)
  - `games/buttercup/index.html` (generated)

- **Expected test locations:** Manual browser testing (per project testing philosophy)

- **Prerequisites:** None

### Key Code References

**Sprite Loading (target for modification):**
```
index.html lines 3375-3411
```

**Game Initialization:**
```
index.html ~line 100 (window.onload)
```

**Config Schema:**
```javascript
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
```

---

## Context References

**Tech-Spec:** [tech-spec.md](../tech-spec.md) - Primary context document containing:
- Brownfield codebase analysis
- Exact line numbers for modifications
- Config schema definition
- Deployment architecture
- Complete implementation guidance

**Brainstorming Session:** [bmm-brainstorming-session-2025-11-29.md](../bmm-brainstorming-session-2025-11-29.md)
- Priority #2: Ship Monolithic + Vanity URL MVP
- Business context and validation goals

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

**Implementation Plan:**
1. Added GAME_CONFIG at line 10 of index.html with sprite paths, petName, gameTitle, primaryColor
2. Modified loadDefaultSheets() function to read paths from GAME_CONFIG instead of hardcoded values
3. Created templates/game-template.html with GAME_CONFIG_PLACEHOLDER marker
4. Implemented generate-game.js with ES modules, config loading, and template injection
5. Created config files for Bowie and Buttercup with appropriate sprite paths
6. Updated vercel.json with URL rewrites for vanity URL routing

### Completion Notes

- Config schema simplified to match actual game structure (cat, foodBowl, waterBowl, dog, catTree)
- Sprite paths in configs use `../` prefix since games are nested in games/<petname>/
- Document title is set dynamically from GAME_CONFIG.gameTitle
- Generation script supports both explicit config path and auto-discovery from configs/ folder
- Vercel rewrites allow both `/petname` and `/petname/` to resolve correctly

### Files Modified

**Modified:**
- `index.html` - Added GAME_CONFIG block (lines 10-48), modified loadDefaultSheets() to use config
- `package.json` - Added "generate-game" script
- `.gitignore` - Added games/ to exclusions
- `vercel.json` - Added rewrites for vanity URL routing

**Created:**
- `templates/game-template.html` - Template with placeholder
- `scripts/generate-game.js` - Game generation script (ES modules)
- `configs/bowie.json` - Bowie's configuration
- `configs/buttercup.json` - Buttercup's configuration
- `docs/deployment-guide.md` - Step-by-step deployment guide for Aurelia
- `games/bowie/index.html` - Generated (gitignored)
- `games/buttercup/index.html` - Generated (gitignored)

### Test Results

**Local Testing:**
- [x] index.html loads correctly with GAME_CONFIG defaults (Bowie)
- [x] Generated games/bowie/index.html has correct Bowie config injected
- [x] Generated games/buttercup/index.html has correct Buttercup config with different sprite and color
- [x] Generation script outputs success messages with correct paths

**Pending (requires deployment):**
- [ ] Vanity URLs work on Vercel (sparkleclassic.com/bowie/, sparkleclassic.com/buttercup/)
- [ ] Games work offline after initial load
- [ ] Deployment guide review by Aurelia

---

## Review Notes

<!-- Will be populated during code review -->

---

## Definition of Done

- [ ] All acceptance criteria pass manual testing
- [ ] Bowie game accessible at sparkleclassic.com/bowie/
- [ ] Buttercup game accessible at sparkleclassic.com/buttercup/
- [ ] Deployment guide reviewed by Aurelia
- [ ] Games work offline
- [ ] No console errors in browser
