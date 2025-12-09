# SparkleClassic - Claude Development Guide

## Project Overview
Personalized pet platformer games delivered via vanity URLs. Customers purchase on Etsy → receive custom game at `sparkleclassic.com/<petname>/`.

## Current Status: MVP Live
✅ **MVP Deployed**: Dynamic config loading on Vercel
✅ **3 Pets Live**: Bowie, Buttercup, BonBon at sparkleclassic.com
✅ **Workflow Validated**: Add sprite + config + git push = live game
📋 **Next**: Validate with paying customer on Etsy

---

## Quick Reference

### Add a New Pet Game (5 minutes)
```bash
# 1. Add pet sprite
mkdir assets/pets/<petname>
# Copy sprite_3x3.png to assets/pets/<petname>/

# 2. Create config
# Copy configs/bowie.json → configs/<petname>.json
# Update petName, petDisplayName, sprite path, theme color

# 3. Deploy
git add -A && git commit -m "Add <petname> game" && git push

# 4. Verify (wait 1-2 min for Vercel)
# Visit: https://sparkleclassic.com/<petname>/
```

### Development
```bash
npm run dev              # Start Vite dev server
# Visit: http://localhost:3000/<petname>/
```

---

## How It Works

**Dynamic Config Loading** (implemented in index.html):
1. Single `index.html` serves ALL pet games
2. URL path determines which pet: `/bowie/` loads `configs/bowie.json`
3. `normalizeConfig()` handles backwards compatibility
4. No generation step - just add config and deploy

**Asset Organization**:
```
Bowie-Buttercup/
├── index.html                    # Single game file (serves all pets)
├── configs/                      # Pet configuration files
│   ├── bowie.json
│   ├── buttercup.json
│   └── bonbon.json
├── assets/
│   ├── pets/                     # Per-pet assets
│   │   ├── bowie/sprite_3x3.png
│   │   ├── buttercup/sprite_3x3.png
│   │   └── bonbon/sprite_3x3.png
│   └── shared/                   # Shared across all pets
│       ├── bowls/
│       └── furniture/
└── docs/
    └── deployment-guide.md       # Step-by-step for Aurelia
```

---

## Config Schema

```json
{
  "petName": "fluffy",           // URL slug (lowercase)
  "petDisplayName": "Fluffy",    // Display name
  "petType": "cat",              // cat or dog
  "sprite": "/assets/pets/fluffy/sprite_3x3.png",
  "items": {
    "foodBowl": "/assets/shared/bowls/food_bowl.png",
    "waterBowl": "/assets/shared/bowls/water_bowl.png",
    "furniture": ["/assets/shared/furniture/cat_tree.png"]
  },
  "gameTitle": "Fluffy's Adventure",
  "theme": {
    "primaryColor": "#FF6B6B"
  }
}
```

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/deployment-guide.md` | Step-by-step guide for Aurelia to deploy new pet games |
| `docs/tech-spec.md` | Technical specification for MVP vanity URL feature |
| `docs/bmm-workflow-status.yaml` | BMad workflow tracking |
| `docs/bmm-brainstorming-session-2025-11-29.md` | Strategic pivot decision |

---

## Architecture Decisions

### Why Dynamic Config (not Generation Script)?
Original tech-spec proposed `generate-game.js` to create per-customer HTML files.

**Implemented instead**: Single `index.html` that reads config at runtime.

**Benefits**:
- Simpler deployment (no build step)
- Single codebase to maintain
- Instant updates to all games
- Easier debugging

### Why Vercel (not manual static hosting)?
- Auto-deploys on git push
- Free tier sufficient for MVP
- CDN for fast global delivery
- Easy rollback if needed

---

## Game Features

### Current Features (index.html)
- 5-level platformer with cat/dog player
- Food/water bowl collection mechanics
- Mouse chase (Level 2) and dog boss (Level 4-5)
- Red couch trampoline (2x2 tiles)
- Mystery block (hit 3x to release bonus mouse)
- Mobile touch controls
- Settings panel and sprite editor
- Particle effects and animations

### Sprite Requirements
- 3x3 grid PNG (sprite_3x3.png)
- Row 1: Idle poses
- Row 2: Walk animation frames
- Row 3: Jump/fall frames

---

## Development Commands

```bash
# Local development
npm run dev                    # Vite dev server at localhost:3000

# Testing specific pets
http://localhost:3000/bowie/
http://localhost:3000/buttercup/
http://localhost:3000/bonbon/

# Deployment (auto via Vercel on push)
git add -A && git commit -m "message" && git push
```

---

## Troubleshooting

### Game shows wrong sprite
- Check config `sprite` path starts with `/assets/pets/`
- Verify sprite file exists
- Check browser console for 404 errors

### Config not loading
- URL must match config filename: `/fluffy/` needs `configs/fluffy.json`
- Validate JSON syntax (no trailing commas)
- Check browser console for fetch errors

### Deployment not updating
- Verify git push completed
- Check Vercel dashboard for build errors
- Wait 2-5 minutes for CDN propagation

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production - deployed to Vercel |
| `feature/bmad-modularization` | FROZEN - full platform vision (post-MVP) |

**Current workflow**: All development on `main`, features via PRs.

---

## MVP Validation Checklist

- [x] Dynamic config loading works
- [x] Multiple pets (Bowie, Buttercup, BonBon) deployed
- [x] Vanity URLs resolve correctly
- [x] Deployment guide for Aurelia
- [ ] First paying customer on Etsy
- [ ] AI sprite workflow timed (<20 min per game)

---

## Support

If issues occur:
1. Check browser console (F12) for errors
2. Verify config JSON is valid
3. Test at root URL first: `http://localhost:3000/`
4. Contact Myles for technical support

---

*Last Updated: 2025-12-08*
*MVP Phase - Dynamic Config Loading Deployed*
