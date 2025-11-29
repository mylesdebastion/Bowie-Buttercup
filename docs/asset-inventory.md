# Asset Inventory - SparkleClassic

**Generated:** 2025-11-29
**Type:** Game Assets
**Total Files:** 20+ image assets

## Sprite Sheets

### Cat Sprites (3x3 Grid Format)

**Bowie Cat (Gray Tabby)**
- File: `bowie_cat_3x3.png`
- Location: `/public/` and root
- Format: 3x3 sprite grid (1024x1024, each sprite ~341px)
- States: Sitting, standing, walking animations
- Color: Gray tabby pattern

**Buttercup Cat (Cream Cat)**
- File: `happy_buttercup_cat_3x3.png`
- File: `sad_buttercup_cat_3x3.png`
- Location: `/public/` and root
- Format: 3x3 sprite grid
- States: Happy/sad emotional variants
- Color: Cream/beige

### Dog Sprites

**Bonbon Dog**
- File: `bonbon_dog_3x3.png`
- Format: 3x3 sprite grid
- Animations:
  - `bonbon_dog_running_aligned.gif`
  - `dog_running_1.gif`
  - `dog_running_2.gif`

## Game Objects

### Interactive Items

**Pet Food Bowl**
- File: `pet_food_bowl.png`
- Purpose: Collectible item in Level 5
- Interaction: Player collision detection

**Pet Water Bowl**
- File: `pet_water_bowl.png`
- Purpose: Collectible item in Level 5
- Interaction: Player collision detection

### Environment

**Cat Tree**
- File: `cat-tree.png`
- Purpose: Background decoration/platform
- Usage: Level 5 indoor setting

## Debug Assets

**Game State Screenshot**
- File: `debug-game-state.png`
- Purpose: Visual regression testing baseline

## Asset Organization

### Directory Structure

```
/
├── public/              # Production assets (deployed)
│   ├── *.png           # All game sprites
│   └── *.gif           # Animations
├── *.png               # Development copies (root)
├── *.gif               # Animation development files
└── test-visual/
    └── screenshots/
        └── baseline/    # Visual test baselines
```

## Asset Loading

**Asset Loader:** `src/core/asset-loader.js`

### Loading Strategy

```javascript
const assetLoader = getAssetLoader();
await assetLoader.loadGameAssets();

// Access loaded assets
const catSprite = assetLoader.get('/bowie_cat_3x3.png');
```

### Preloading

All critical assets preloaded before game start:
- Cat sprites (both variants)
- Dog sprites
- Pet bowls
- Environmental objects

## Sprite Configuration

**Config Location:** `src/configs/sprites/`

### Pet Sprite Configs

Configurable sprite mappings for personalization:
- Sprite sheet layout
- Animation frame sequences
- Timing and frame rates
- Collision boxes

## Asset Specifications

### Technical Requirements

- **Format:** PNG (transparency support)
- **Color Depth:** 32-bit RGBA
- **Sprite Size:** 3x3 grid @ 1024x1024px
- **Individual Sprite:** ~341x341px
- **Pixel Art Style:** Clean, crisp edges
- **Rendering:** `image-rendering: pixelated`

### Performance Considerations

- Total asset size: ~8-10MB uncompressed
- Lazy loading for non-critical assets
- Sprite sheet batching for efficiency
- Canvas rendering optimization

## Animation System

**Controller:** `src/core/sprites/AnimationController.js`

### Animation Types

- **Idle:** Sitting/standing still
- **Walk:** Left/right movement
- **Jump:** Mid-air frames
- **Land:** Impact frames
- **Run:** Fast movement

### Frame Timing

- Default: 100ms per frame
- Configurable per animation
- Smooth transitions between states

## Asset Pipeline

### Development

1. **Creation:** Pixel art tools (Aseprite, Pixelorama)
2. **Export:** 3x3 sprite sheets
3. **Placement:** `/public/` for production
4. **Configuration:** Sprite config files

### Production

1. **Optimization:** PNG compression (minimal)
2. **Bundling:** Vite asset pipeline
3. **Inline:** Small assets (<4KB) inlined
4. **CDN Ready:** Cloudflare compatibility

## Future Assets

- Additional pet variants (planned)
- More environmental objects
- Particle effects (stars, sparkles)
- UI icons and badges
- Sound effects (planned)
- Background music (planned)

## Asset Attribution

- Cat sprites: Custom pixel art for SparkleClassic
- Generated from user-uploaded photos (planned AI pipeline)
