# Source Tree Analysis - SparkleClassic

**Generated:** 2025-11-29
**Type:** Codebase Structure Documentation

## Project Root Structure

```
D:\Github\Bowie-Buttercup/
├── src/                    # 🎯 Core game source (MODULAR ARCHITECTURE)
│   ├── core/              # Core game engine
│   ├── entities/          # Game entities (player, enemies, items)
│   ├── levels/            # Level definitions (1-5)
│   ├── ui/                # User interface components
│   ├── systems/           # Game systems (collision, physics)
│   ├── performance/       # Performance monitoring
│   ├── configs/           # Configuration files
│   ├── styles/            # CSS styling
│   ├── legacy/            # Legacy compatibility layer
│   ├── index.js           # Entry point (Pet Selector variant)
│   └── main.js            # Entry point (Vanity URL variant)
│
├── docs/                   # 📚 Project documentation
│   ├── planning/          # PRD, architecture, frontend spec
│   ├── architecture/      # Architecture docs
│   ├── epics-game-dev/    # Game development epics
│   ├── epics-web-platform/# Web platform epics
│   ├── stories-game-dev/  # Game implementation stories
│   ├── stories-web-platform/ # Platform implementation stories
│   ├── migration/         # Migration workflow docs
│   ├── qa/                # QA assessments and test design
│   ├── bmad/              # BMad Method artifacts
│   └── sprite-configuration/ # Sprite config documentation
│
├── public/                 # 🎨 Static assets (production)
│   ├── *.png              # Game sprites
│   └── *.gif              # Animations
│
├── .bmad/                  # 🤖 BMad Method framework
│   ├── core/              # Core BMad workflows
│   ├── bmm/               # BMad Method Module (software)
│   ├── bmgd/              # BMad Game Development Module
│   ├── cis/               # Creative Innovation Strategies
│   └── bmb/               # BMad Module Builder
│
├── .claude/                # 🔧 Claude Code configuration
│   ├── commands/          # Slash commands
│   └── settings.json      # Settings
│
├── test-visual/            # 📸 Visual regression testing
│   ├── scripts/           # Test automation
│   └── screenshots/       # Baseline images
│
├── scripts/                # 🛠️ Build and utility scripts
│   └── migration/         # Migration tooling
│
├── v4-backup/              # 📦 Archived legacy code (excluded from scans)
├── tests/                  # 🧪 Test suites (excluded from exhaustive scan)
├── e2e/                    # 🎭 E2E tests (excluded)
└── patches/                # 🩹 Patches (excluded)
```

## Critical Directories

### `/src/core/` - Game Engine Core

**Purpose:** Foundation of the game architecture

```
src/core/
├── Canvas.js              # Canvas management and rendering context
├── Game.js                # Main game class, coordinates all systems
├── InputManager.js        # Unified input handling (keyboard, touch, gamepad)
├── StateManager.js        # Centralized state management + persistence
├── ConfigLoader.js        # Configuration loading (vanity URLs, defaults)
├── asset-loader.js        # Asset preloading and caching
├── game-loop.js           # Fixed timestep game loop
└── sprites/               # Sprite system
    ├── AnimationController.js  # Animation state machine
    ├── SpriteConfig.js        # Sprite configuration
    ├── SpriteRenderer.js      # Rendering pipeline
    └── SpriteSheetManager.js  # Sprite sheet management
```

**Entry Points:**
- `Game.js` - Primary game initialization
- `StateManager.js` - Singleton instance (`getStateManager()`)
- `game-loop.js` - Game loop (`GameLoop` class)

### `/src/entities/` - Game Entities

**Purpose:** All game objects (player, enemies, collectibles)

```
src/entities/
├── Entity.js              # Base entity class
├── PlayerEntity.js        # Main player character (new sprite system)
├── player.js              # Legacy player (DEPRECATED)
├── DogEntity.js           # Dog enemy entity
├── MouseEntity.js         # Mouse enemy entity
├── FireballEntity.js      # Fireball projectile entity
├── ParticleEntity.js      # Particle effects
├── EntityFactory.js       # Entity creation factory
├── EntityManager.js       # Entity lifecycle management
├── PhysicsSystem.js       # Physics engine
├── items.js               # Item system (pet bowls, collectibles)
└── index.js               # Entity module exports
```

**Patterns:**
- Entity-Component-like architecture
- Factory pattern for entity creation
- Shared physics system

### `/src/levels/` - Level System

**Purpose:** Level definitions and management

```
src/levels/
├── Level.js               # Base level class
├── Level1.js              # Level 1: Fireball Challenge
├── Level2.js              # Level 2: Mouse Encounter
├── Level3.js              # Level 3: Advanced Challenge
├── Level4.js              # Level 4: Dog Reunion Setup
├── Level5.js              # Level 5: Victory (Pet Bowls)
├── LevelManager.js        # Level transitions and state
└── index.js               # Level module exports
```

**Level Structure:**
- Platform layouts
- Enemy spawns
- Collectible placement
- Victory conditions

### `/src/ui/` - User Interface

**Purpose:** Game UI components

```
src/ui/
├── HUD.js                 # Heads-up display
├── MobileControls.js      # Touch controls for mobile
├── SettingsPanel.js       # Settings interface
├── SpriteEditor.js        # Sprite customization tool
├── PetSelector.js         # Pet selection UI
├── UIManager.js           # UI coordination
└── index.js               # UI module exports
```

**UI Pattern:**
- Component-based architecture
- State Manager integration
- Responsive design

### `/src/systems/` - Game Systems

**Purpose:** Cross-cutting game systems

```
src/systems/
└── collision.js           # Collision detection system
```

**Expandable:**
- Audio system (planned)
- Particle system (in progress)
- Networking (planned)

### `/src/performance/` - Performance Monitoring

**Purpose:** Performance tracking and optimization

```
src/performance/
├── PerformanceMonitor.js  # FPS, frame time tracking
└── MemoryManager.js       # Memory usage monitoring
```

**Features:**
- Real-time FPS display
- Memory leak detection
- Performance profiling

## Integration Points

### State Manager ↔ All Systems

```javascript
// Every system integrates with StateManager
import { getStateManager } from './core/StateManager.js';
const stateManager = getStateManager();
```

### Game Loop → Update Pipeline

```
GameLoop
  ├─→ update(dt)         # Variable timestep updates
  ├─→ fixedUpdate(dt)    # Fixed physics updates
  └─→ render(interp)     # Rendering with interpolation
```

### Input → State → Entities

```
InputManager
  └─→ StateManager (runtime.player input state)
      └─→ PlayerEntity (reads state, applies physics)
          └─→ Game (renders player)
```

## Module Dependencies

### Core Dependencies

```
Game.js
  ├─→ StateManager
  ├─→ Canvas
  ├─→ GameLoop
  ├─→ InputManager
  ├─→ LevelManager
  ├─→ UIManager
  ├─→ PerformanceMonitor
  └─→ SpriteSystem
```

### Circular Dependencies

**None** - Clean dependency hierarchy maintained

## Entry Points

### Primary Entry (`src/main.js`)

```javascript
// Vanity URL support + full game initialization
import CatPlatformerGame from './main.js';
```

**Features:**
- Vanity URL routing (e.g., `/bowie-cat-12345`)
- Configuration loading from URL
- Full game systems initialization

### Alternative Entry (`src/index.js`)

```javascript
// Pet Selector UI + game initialization
import { Game } from './core/Game.js';
import { PetSelector } from './ui/PetSelector.js';
```

**Features:**
- Pet selection interface
- URL parameter support (?pet=bowie)
- Game initialization

## Build Output

### Development

```
http://localhost:3000/src/index.html
```

### Production

```
dist/
├── index.html             # Single-file game
├── assets/
│   ├── [name].[hash].js   # Bundled JavaScript
│   ├── [name].[hash].css  # Bundled CSS
│   └── [name].[hash].png  # Optimized assets
```

**Target:** Single HTML file <200KB (excluding assets)

## Code Organization Patterns

### Module Exports

```javascript
// Standard export pattern
export class StateManager { ... }
export function getStateManager() { ... }
export default StateManager;
```

### Singleton Pattern

```javascript
// Used for: StateManager, AssetLoader, ConfigLoader
let instance = null;
export function getInstance() {
  if (!instance) instance = new Class();
  return instance;
}
```

### Factory Pattern

```javascript
// Used for: EntityFactory
export class EntityFactory {
  create(type, config) { ... }
}
```

## Testing Structure

```
src/
├── **/*.test.js           # Unit tests (co-located)
tests/
├── integration/           # Integration tests
├── performance/           # Performance benchmarks
└── e2e/                   # E2E tests (Playwright)
```

## Asset References

```
public/                    # Static assets
  └── *.png, *.gif        # Referenced in code via AssetLoader
```

## Configuration Files

```
/
├── vite.config.js         # Build configuration
├── .eslintrc.json         # Linting rules
├── package.json           # Dependencies
├── CLAUDE.md              # Development guide
└── src/configs/           # Game configurations
    └── sprites/           # Sprite configs
```

## Navigation Guide

- **Start here:** `src/index.js` or `src/main.js`
- **Core systems:** `src/core/`
- **Game logic:** `src/entities/`, `src/levels/`
- **User interface:** `src/ui/`
- **Documentation:** `docs/`
- **Planning:** `docs/planning/`, `docs/epics-*/`

## Excluded Directories

- `node_modules/` - Dependencies (not scanned)
- `dist/` - Build output (not scanned)
- `.git/` - Version control (not scanned)
- `v4-backup/` - Legacy backup (excluded per user request)
- `tests/` - Test directories (excluded per user request)
- `e2e/` - E2E tests (excluded per user request)
- `patches/` - Patches (excluded per user request)
