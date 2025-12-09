# SparkleClassic Game Deployment Guide

**For: Aurelia and Team**
**Last Updated:** 2025-12-08

This guide explains how to create and deploy personalized pet games to sparkleclassic.com.

---

## Quick Reference

```bash
# 1. Add pet sprite to assets/pets/<petname>/
# 2. Create config file
# 3. Deploy
git add -A && git commit -m "Add <petname> game" && git push
```

Wait 1-2 minutes, then verify at: `https://sparkleclassic.com/<petname>/`

---

## How It Works

The game uses **dynamic config loading**:
- Single `index.html` serves ALL pet games
- URL path determines which pet: `/bowie/` loads `configs/bowie.json`
- No generation step needed - just add config and deploy

---

## Asset Organization

```
Bowie-Buttercup/
├── assets/
│   ├── pets/                      # Per-pet assets
│   │   ├── bowie/
│   │   │   └── sprite_3x3.png     # Bowie's character sprite
│   │   ├── buttercup/
│   │   │   ├── sprite_3x3.png     # Main sprite
│   │   │   └── sprite_sad_3x3.png # Alternate sprite (optional)
│   │   └── bonbon/
│   │       └── sprite_3x3.png     # BonBon's dog sprite
│   │
│   └── shared/                    # Shared across all pets
│       ├── bowls/
│       │   ├── food_bowl.png
│       │   └── water_bowl.png
│       └── furniture/
│           └── cat_tree.png
│
├── configs/                       # Pet configuration files
│   ├── bowie.json
│   ├── buttercup.json
│   └── bonbon.json
│
└── index.html                     # Single game file (serves all pets)
```

---

## Step-by-Step Guide

### Step 1: Prepare Pet Sprites

1. **Create sprite sheet** (3x3 grid, PNG format)
   - Row 1: Idle poses
   - Row 2: Walk animation frames
   - Row 3: Jump/fall frames

2. **Name the file**: `sprite_3x3.png`

3. **Create pet folder**: `assets/pets/<petname>/`

4. **Place sprite**: Copy to `assets/pets/<petname>/sprite_3x3.png`

### Step 2: Create Pet Config File

Create a config file at `configs/<petname>.json`:

```json
{
  "petName": "fluffy",
  "petDisplayName": "Fluffy",
  "petType": "cat",
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

**Config Fields:**
- `petName`: URL slug (lowercase, no spaces) - used in URL
- `petDisplayName`: Proper name shown in game
- `petType`: `cat` or `dog` (for future features)
- `sprite`: Path to pet's sprite sheet (start with `/assets/pets/`)
- `items.foodBowl`: Path to food bowl sprite
- `items.waterBowl`: Path to water bowl sprite
- `items.furniture`: Array of furniture sprites (optional)
- `gameTitle`: Browser tab title and in-game display
- `theme.primaryColor`: Accent color (hex format)

### Step 3: Test Locally

```bash
npm run dev
```

Then visit: `http://localhost:3000/fluffy/`

**Check these items:**
- [ ] Correct pet sprite shows as the player character
- [ ] Game title matches pet name (check browser tab)
- [ ] All animations work (walk, jump, idle)
- [ ] No console errors (press F12 to check)

### Step 4: Deploy

```bash
git add assets/pets/fluffy/ configs/fluffy.json
git commit -m "Add Fluffy's game"
git push
```

Wait 1-2 minutes for Vercel to deploy automatically.

### Step 5: Verify Live

Visit: `https://sparkleclassic.com/fluffy/`

---

## Adding Custom Items

### Per-Pet Custom Items

Add custom items to a specific pet's folder:

```
assets/pets/fluffy/
├── sprite_3x3.png       # Main character
├── toys/
│   └── yarn_ball.png    # Custom toy
└── accessories/
    └── bow.png          # Future: accessories
```

Then reference in config:

```json
{
  "items": {
    "toys": ["/assets/pets/fluffy/toys/yarn_ball.png"],
    "companion": "/assets/pets/bonbon/sprite_3x3.png"
  }
}
```

### Shared Items

Add items that all pets can use to:

```
assets/shared/
├── bowls/
├── furniture/
├── toys/              # Shared toys
└── backgrounds/       # Future: custom backgrounds
```

---

## Troubleshooting

### Game shows wrong sprite / default cat
- Check the config `sprite` path starts with `/assets/pets/`
- Verify sprite file exists: `assets/pets/<petname>/sprite_3x3.png`
- Check browser console for 404 errors on sprite load

### Config not loading
- Check URL matches config filename: `/fluffy/` needs `configs/fluffy.json`
- Verify JSON is valid (no trailing commas, quotes around keys)
- Check browser console for fetch errors

### Game doesn't load at all
- Check browser console for errors (F12)
- Try loading root URL to verify game works
- Ensure Vite dev server is running (`npm run dev`)

### Vercel deployment not updating
- Check GitHub push completed
- Check Vercel dashboard for build errors
- Wait 5 minutes and try again

---

## Adding a New Pet (Summary)

1. Create folder: `assets/pets/<petname>/`
2. Add sprite: `assets/pets/<petname>/sprite_3x3.png`
3. Create config: `configs/<petname>.json`
4. Test: `npm run dev` → `http://localhost:3000/<petname>/`
5. Deploy: `git add -A && git commit -m "Add <petname>" && git push`
6. Verify: `https://sparkleclassic.com/<petname>/`

**Total time: ~5 minutes**

---

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify config JSON is valid
3. Try the root URL first: `http://localhost:3000/`
4. Contact Myles for technical support

---

*Updated for organized asset structure - 2025-12-08*
