# Migration Workflow Guide

**Date:** 2025-01-26  
**Status:** Active Implementation  

## Development Workflow During Migration

### File Lock Status
🔒 **`/index.html` is now locked** - All new development must use `/src/` structure

### Override Commands
```bash
# Emergency fixes only
git commit --no-verify -m "[EMERGENCY] Critical fix description"

# Migration work only  
MIGRATION=true git commit -m "Migrate feature X to modular structure"
```

## Daily Development Workflow

### 1. Feature Development
```bash
# ✅ Correct - Work in modular structure
edit src/entities/player.js
edit src/systems/physics.js
git add src/
git commit -m "Add new player ability"

# ❌ Blocked - Will fail pre-commit hook
edit index.html  # This will be blocked!
```

### 2. Bug Fixes
```bash
# For bugs in modular code
edit src/core/game-loop.js
git commit -m "Fix game loop timing issue"

# For critical bugs in monolithic code (emergency only)
edit index.html
git commit --no-verify -m "[EMERGENCY] Fix critical crash bug"
```

### 3. Migration Tasks
```bash
# When migrating features from index.html to src/
MIGRATION=true git commit -m "Migrate pet bowl system to src/entities/items.js"
```

## Migration Process

### Step-by-Step Feature Migration

#### 1. Feature Analysis
```bash
# Identify feature boundaries in index.html
grep -n "function drawFoodBowl" index.html
grep -n "foodBowlImg" index.html
```

#### 2. Extract to Module
```javascript
// Create src/entities/items.js
export class ItemSystem {
  constructor(assetLoader, renderer) {
    this.assetLoader = assetLoader;
    this.renderer = renderer;
    this.foodBowlImg = null;
    this.waterBowlImg = null;
  }
  
  async loadAssets() {
    this.foodBowlImg = await this.assetLoader.load('./pet_food_bowl.png');
    this.waterBowlImg = await this.assetLoader.load('./pet_water_bowl.png');
  }
  
  drawFoodBowl(x, y, isFull) {
    // Extracted logic here
  }
}
```

#### 3. Update Main Entry Point
```javascript
// Update src/main.js
import { ItemSystem } from './entities/items.js';

const itemSystem = new ItemSystem(assetLoader, renderer);
await itemSystem.loadAssets();
```

#### 4. Remove from Monolithic
```bash
# Comment out or remove from index.html (with migration override)
MIGRATION=true git commit -m "Remove pet bowl system from monolithic file"
```

### Testing Protocol

#### 1. Feature Parity Testing
```bash
# Test both versions
npm run test:monolithic
npm run test:modular
npm run test:compare
```

#### 2. Performance Testing
```bash
# Benchmark both versions
npm run benchmark:monolithic
npm run benchmark:modular
```

#### 3. Visual Regression Testing
```bash
# Compare visual output
npm run test:visual
```

## Module Structure Guidelines

### File Organization
```
/src/
├── core/           # Core engine systems
│   ├── game-loop.js
│   ├── game-state.js
│   ├── renderer.js
│   └── asset-loader.js
├── entities/       # Game entities
│   ├── player.js
│   ├── items.js
│   └── obstacles.js
├── systems/        # Game systems
│   ├── physics.js
│   ├── collision.js
│   └── input.js
├── levels/         # Level definitions
│   ├── level-1.js
│   └── level-manager.js
├── ui/            # User interface
│   ├── hud.js
│   └── menus.js
└── utils/         # Utilities
    └── helpers.js
```

### Module Best Practices

#### 1. Clear Dependencies
```javascript
// ✅ Explicit imports
import { Renderer } from '../core/renderer.js';
import { AssetLoader } from '../core/asset-loader.js';

// ❌ Avoid global dependencies
// Don't rely on global game object
```

#### 2. Single Responsibility
```javascript
// ✅ Focused module
export class ItemSystem {
  // Only handles items (bowls, collectibles, etc.)
}

// ❌ Mixed responsibilities  
export class ItemPhysicsUISystem {
  // Too many concerns
}
```

#### 3. Event-Driven Communication
```javascript
// ✅ Use events for loose coupling
this.eventBus.emit('item-collected', { type: 'food', value: 10 });

// ❌ Direct method calls across modules
otherSystem.updateScore(10);
```

## Quality Gates

### Before Each Commit
- [ ] Tests pass in target module
- [ ] No console errors
- [ ] Performance benchmark acceptable
- [ ] Code follows project style guide
- [ ] Dependencies properly declared

### Before Each Phase
- [ ] All phase features migrated
- [ ] Integration tests pass
- [ ] Visual regression tests pass
- [ ] Performance metrics maintained
- [ ] Documentation updated

## Troubleshooting

### Common Issues

#### 1. Import/Export Errors
```javascript
// Problem: Module not found
import { Player } from './player.js';  // ❌

// Solution: Use correct relative path
import { Player } from '../entities/player.js';  // ✅
```

#### 2. Circular Dependencies
```javascript
// Problem: A imports B, B imports A
// Solution: Extract shared code to utilities or use dependency injection
```

#### 3. Global State Issues
```javascript
// Problem: Modules accessing global variables
// Solution: Pass dependencies explicitly or use dependency injection
```

### Getting Help

#### 1. Check Migration Documentation
```bash
cat docs/migration/feature-audit.md
cat docs/migration/migration-workflow.md
```

#### 2. Review Module Examples
```bash
# Look at completed migrations
ls src/core/
cat src/core/game-loop.js
```

#### 3. Run Diagnostics
```bash
npm run migration:status
npm run migration:validate
```

## Commands Reference

### Development
```bash
npm run dev:modular     # Start modular development server
npm run dev:monolithic  # Start monolithic version (for comparison)
npm run test:all        # Run all tests
npm run lint           # Check code style
```

### Migration
```bash
npm run migration:status    # Show migration progress
npm run migration:validate  # Validate current state
npm run migration:extract   # Extract features (interactive)
npm run migration:compare   # Compare feature parity
```

### Emergency
```bash
git commit --no-verify     # Bypass file lock (use sparingly)
git reset --hard HEAD~1    # Undo last commit if needed
```