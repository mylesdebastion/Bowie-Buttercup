# Story 1.1: Config Injection and Vanity URL Deployment

**Status:** Draft
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

- [ ] **Task 1: Add GAME_CONFIG to index.html**
  - Insert config object after `<head>` tag (~line 15)
  - Define schema: petName, sprites, gameTitle, primaryColor
  - Add fallback for missing config

- [ ] **Task 2: Modify Sprite Loading**
  - Update lines 3375-3411 to read from GAME_CONFIG
  - Replace all hardcoded sprite paths
  - Test that Bowie sprites still load with default config

- [ ] **Task 3: Create Game Template**
  - Copy modified index.html to `templates/game-template.html`
  - Replace config values with `/* GAME_CONFIG_PLACEHOLDER */`
  - Verify template renders with placeholder

- [ ] **Task 4: Create Generation Script**
  - Create `scripts/generate-game.js`
  - Accept petName and config as CLI arguments
  - Inject config into template
  - Output to `games/{petName}/index.html`

- [ ] **Task 5: Generate Example Games**
  - Create `configs/bowie.json` with Bowie's config
  - Create `configs/buttercup.json` with Buttercup's config
  - Generate both example games
  - Verify both play correctly

- [ ] **Task 6: Deploy to Vercel**
  - Connect GitHub repo to Vercel
  - Configure `games/` as publish directory
  - Deploy and verify vanity URLs work
  - Test with both Bowie and Buttercup

- [ ] **Task 7: Create Deployment Guide**
  - Write `docs/deployment-guide.md`
  - Step-by-step for Aurelia
  - Include screenshots
  - Cover: generate, deploy, verify

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

<!-- Will be populated during dev-story execution -->

### Debug Log References

<!-- Will be populated during dev-story execution -->

### Completion Notes

<!-- Will be populated during dev-story execution -->

### Files Modified

<!-- Will be populated during dev-story execution -->

### Test Results

<!-- Will be populated during dev-story execution -->

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
