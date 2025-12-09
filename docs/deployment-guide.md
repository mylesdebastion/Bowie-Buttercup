# SparkleClassic Game Deployment Guide

**For: Aurelia and Team**
**Last Updated:** 2025-12-08

This guide explains how to create and deploy personalized pet games to sparkleclassic.com.

---

## Quick Reference

```bash
# 1. Add pet sprite to root folder
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

## Step-by-Step Guide

### Step 1: Prepare Pet Sprites

1. **Create sprite sheet** (3x3 grid, PNG format)
   - Row 1: Idle poses
   - Row 2: Walk animation frames
   - Row 3: Jump/fall frames

2. **Name the file**: `<petname>_cat_3x3.png` (e.g., `fluffy_cat_3x3.png`)

3. **Place in root directory**: Copy the sprite file to the main project folder

### Step 2: Create Pet Config File

Create a config file at `configs/<petname>.json`:

```json
{
  "petName": "fluffy",
  "petDisplayName": "Fluffy",
  "sprites": {
    "cat": "/fluffy_cat_3x3.png",
    "foodBowl": "/pet_food_bowl.png",
    "waterBowl": "/pet_water_bowl.png",
    "dog": "/bonbon_dog_3x3.png",
    "catTree": "/cat-tree.png"
  },
  "gameTitle": "Fluffy's Adventure",
  "primaryColor": "#FF6B6B"
}
```

**Config Fields:**
- `petName`: URL slug (lowercase, no spaces) - used in URL
- `petDisplayName`: Proper name shown in game
- `sprites.cat`: Path to pet's sprite sheet (start with `/`)
- `gameTitle`: Browser tab title and in-game display
- `primaryColor`: Accent color (hex format)

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
git add configs/fluffy.json fluffy_cat_3x3.png
git commit -m "Add Fluffy's game"
git push
```

Wait 1-2 minutes for Vercel to deploy automatically.

### Step 5: Verify Live

Visit: `https://sparkleclassic.com/fluffy/`

---

## Troubleshooting

### Game shows wrong sprite / default cat
- Check the config file path starts with `/`
- Verify sprite file exists in root directory
- Check browser console for 404 errors on sprite load

### Config not loading
- Check URL matches config filename: `/fluffy/` needs `configs/fluffy.json`
- Verify JSON is valid (no trailing commas, quotes around keys)
- Check browser console for fetch errors

### Game doesn't load at all
- Check browser console for errors (F12)
- Try loading root `index.html` directly to verify game works
- Ensure Vite dev server is running (`npm run dev`)

### Vercel deployment not updating
- Check GitHub push completed
- Check Vercel dashboard for build errors
- Wait 5 minutes and try again

---

## File Structure

```
Bowie-Buttercup/
├── index.html              # Single game file (serves all pets)
├── configs/
│   ├── bowie.json          # Bowie's config
│   ├── buttercup.json      # Buttercup's config
│   └── <petname>.json      # New pet configs
├── bowie_cat_3x3.png       # Sprite sheets in root
├── happy_buttercup_cat_3x3.png
└── <petname>_cat_3x3.png   # New sprites
```

---

## Adding a New Pet (Summary)

1. Add sprite: `<petname>_cat_3x3.png` to root
2. Create config: `configs/<petname>.json`
3. Test: `npm run dev` → `http://localhost:3000/<petname>/`
4. Deploy: `git add -A && git commit -m "Add <petname>" && git push`
5. Verify: `https://sparkleclassic.com/<petname>/`

**Total time: ~5 minutes**

---

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify config JSON is valid
3. Try the root URL first: `http://localhost:3000/`
4. Contact Myles for technical support

---

*Updated for dynamic config loading - 2025-12-08*
