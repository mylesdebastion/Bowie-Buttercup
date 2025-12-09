# SparkleClassic Game Deployment Guide

**For: Aurelia and Team**
**Last Updated:** 2025-12-08

This guide explains how to create and deploy personalized pet games to sparkleclassic.com.

---

## Quick Reference (For Experienced Users)

```bash
# Generate a new game
node scripts/generate-game.js <petname>

# Deploy to Vercel
git add -A && git commit -m "Add <petname> game" && git push
```

Wait 1-2 minutes, then verify at: `https://sparkleclassic.com/<petname>/`

---

## Complete Step-by-Step Guide

### Step 1: Prepare Pet Sprites

Before generating a game, you need the pet's sprite sheet:

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
    "cat": "../fluffy_cat_3x3.png",
    "foodBowl": "../pet_food_bowl.png",
    "waterBowl": "../pet_water_bowl.png",
    "dog": "../bonbon_dog_3x3.png",
    "catTree": "../cat-tree.png"
  },
  "gameTitle": "Fluffy's Adventure",
  "primaryColor": "#FF6B6B"
}
```

**Config Fields:**
- `petName`: URL slug (lowercase, no spaces) - used in URL
- `petDisplayName`: Proper name shown in game
- `sprites.cat`: Path to pet's sprite sheet (relative to games/<petname>/)
- `gameTitle`: Browser tab title and in-game display
- `primaryColor`: Accent color (hex format)

### Step 3: Generate the Game

Open a terminal in the project folder and run:

```bash
node scripts/generate-game.js fluffy
```

You should see:
```
Using config from: D:\Github\Bowie-Buttercup\configs\fluffy.json

Generated game for Fluffy
   Output: D:\Github\Bowie-Buttercup\games\fluffy\index.html
   Title: Fluffy's Adventure
```

### Step 4: Test Locally

Open the generated game in a browser to verify it works:

**Windows:**
```bash
start games/fluffy/index.html
```

**Mac:**
```bash
open games/fluffy/index.html
```

**Check these items:**
- [ ] Correct pet sprite shows as the player character
- [ ] Game title matches pet name
- [ ] All animations work (walk, jump, idle)
- [ ] Food and water bowls appear correctly
- [ ] No console errors (press F12 to check)

### Step 5: Deploy to Vercel

1. **Commit the new game:**
   ```bash
   git add configs/fluffy.json fluffy_cat_3x3.png
   git add games/fluffy/
   git commit -m "Add Fluffy's game"
   git push
   ```

2. **Wait for deployment** (1-2 minutes)
   - Vercel automatically deploys when you push to GitHub
   - Check [Vercel Dashboard](https://vercel.com/dashboard) for status

3. **Verify deployment:**
   - Visit: `https://sparkleclassic.com/fluffy/`
   - Test gameplay on the live URL
   - Share with customer!

---

## Troubleshooting

### Game shows wrong sprite / default cat
- Check the config file path is correct
- Verify sprite file exists and is a valid PNG
- Ensure paths in config use `../` prefix (relative to games/<petname>/)

### Game doesn't load at all
- Check browser console for errors (F12)
- Verify games/<petname>/index.html exists
- Regenerate with: `node scripts/generate-game.js <petname>`

### Vercel deployment not updating
- Check GitHub push completed
- Check Vercel dashboard for build errors
- Wait 5 minutes and try again
- Force redeploy from Vercel dashboard if needed

### Sprites appear stretched or wrong size
- Sprite sheet must be exactly 3x3 grid
- Recommended size: 288x288 or 192x192 pixels
- Each cell should be square (96x96 or 64x64)

---

## File Structure Reference

```
Bowie-Buttercup/
├── configs/
│   ├── bowie.json           # Bowie's config
│   ├── buttercup.json       # Buttercup's config
│   └── <petname>.json       # New pet configs go here
├── games/
│   ├── bowie/
│   │   └── index.html       # Generated Bowie game
│   ├── buttercup/
│   │   └── index.html       # Generated Buttercup game
│   └── <petname>/
│       └── index.html       # Generated pet games
├── templates/
│   └── game-template.html   # Template for generation
├── scripts/
│   └── generate-game.js     # Game generation script
├── bowie_cat_3x3.png        # Sprite sheets in root
├── happy_buttercup_cat_3x3.png
└── <petname>_cat_3x3.png    # New sprites go here
```

---

## Delivery Checklist

Before sharing the game URL with a customer:

- [ ] Generated game locally
- [ ] Tested in browser - all sprites correct
- [ ] Committed and pushed to GitHub
- [ ] Verified live URL works
- [ ] Tested on mobile device
- [ ] Saved customer info in order system

---

## Time Estimate

| Step | Time |
|------|------|
| Prepare sprites | Already done by AI workflow |
| Create config | 2 minutes |
| Generate game | 30 seconds |
| Test locally | 2 minutes |
| Deploy | 5 minutes (including wait time) |
| **Total** | **~10 minutes** |

---

## Support

If you encounter issues not covered here:
1. Check the browser console (F12) for error messages
2. Verify all files exist in expected locations
3. Try regenerating the game
4. Contact Myles for technical support

---

*Generated by BMad Method - 2025-12-08*
