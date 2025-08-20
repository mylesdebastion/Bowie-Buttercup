# Project Structure: Cat Platformer Game

**Owner**: Technical Lead  
**Last Updated**: 2025-01-18  
**Version**: 1.0  
**Related Docs**: 
- [Component Architecture](./component-architecture.md)
- [Module Interfaces](./module-interfaces.md)
- [Tech Stack](./tech-stack.md)

---

## 1. Overall Project Structure

### 1.1 Root Directory Layout

```
cat-platformer/
├── src/                     # Source code modules
├── tests/                   # Test files and utilities
├── docs/                    # Project documentation
├── dist/                    # Production build output
├── assets/                  # Development assets
├── tools/                   # Development scripts and utilities
├── .vscode/                 # VS Code configuration
├── .github/                 # GitHub workflows and templates
├── package.json             # Project dependencies and scripts
├── vite.config.js          # Build configuration
├── jest.config.js          # Testing configuration
├── .eslintrc.js            # Linting configuration
├── .gitignore              # Git ignore patterns
└── README.md               # Project overview and setup
```

### 1.2 Source Code Organization (`src/`)

The source code follows a modular architecture with clear separation of concerns:

```
src/
├── main.js                  # Application entry point
├── core/                    # Core game systems
│   ├── Game.js             # Main game orchestrator
│   ├── Canvas.js           # Canvas management and utilities
│   ├── InputManager.js     # Keyboard/touch input handling
│   └── StateManager.js     # Game state and persistence
├── entities/               # Game entities and objects
│   ├── Entity.js           # Base entity class
│   ├── Player.js           # Player character implementation
│   ├── Dog.js              # Dog entity logic
│   ├── Mouse.js            # Mouse entity logic
│   ├── Fireball.js         # Fireball entity logic
│   └── Particle.js         # Particle system
├── systems/                # Game systems and managers
│   ├── Physics.js          # Physics calculations and collision
│   ├── Renderer.js         # Drawing and animation system
│   ├── LevelManager.js     # Level loading and management
│   └── SpriteManager.js    # Sprite loading and caching
├── ui/                     # User interface components
│   ├── SpriteEditor.js     # Sprite editing interface
│   ├── Controls.js         # Mobile controls and D-pad
│   ├── SettingsPanel.js    # Game settings UI
│   └── HUD.js              # Heads-up display elements
├── levels/                 # Level implementations
│   ├── Level.js            # Base level class
│   ├── Level1.js           # Fireball platformer level
│   ├── Level2.js           # Mouse catching arena
│   ├── Level3.js           # Challenge arena with pits
│   ├── Level4.js           # Dog bouncing level
│   └── Level5.js           # Victory feast level
└── utils/                  # Utility modules and helpers
    ├── EventEmitter.js     # Event system for decoupled communication
    ├── AssetLoader.js      # Asset loading utilities
    ├── MathUtils.js        # Mathematical helper functions
    └── Constants.js        # Game constants and configuration
```

## 2. Module Organization Principles

### 2.1 Directory Purpose and Scope

**`core/`** - Fundamental Infrastructure
- Game loop and lifecycle management
- Canvas setup and rendering context
- Input handling and state management
- Essential systems required by all other modules

**`entities/`** - Game Objects
- All interactive game objects (player, enemies, collectibles)
- Entity behavior implementations
- Animation and rendering logic specific to entities
- Collision and interaction handling

**`systems/`** - Cross-Cutting Services
- Systems that operate on multiple entities or provide shared services
- Physics simulation and collision detection
- Asset management and loading
- Rendering pipeline and camera management

**`ui/`** - User Interface
- All user interface components and panels
- Editor tools and development interfaces
- Mobile controls and accessibility features
- HUD and game status display

**`levels/`** - Game Content
- Individual level implementations
- Level-specific game logic and objectives
- Environment and background management
- Win/lose condition handling

**`utils/`** - Shared Utilities
- Reusable utility functions and classes
- Mathematical helpers and algorithms
- Event communication system
- Configuration and constants

### 2.2 Import/Export Conventions

**ES6 Module Pattern**:
```javascript
// Default exports for primary classes
export default class Player extends Entity {
  // Implementation
}

// Named exports for utilities and constants
export { PHYSICS_CONSTANTS, MathUtils };

// Import patterns
import Player from './entities/Player.js';
import { EventEmitter } from './utils/EventEmitter.js';
import * as MathUtils from './utils/MathUtils.js';
```

**Circular Dependency Prevention**:
- Use interfaces and base classes to break circular dependencies
- Event system for loose coupling between modules
- Dependency injection where direct references are needed

## 3. Testing Structure (`tests/`)

### 3.1 Test Organization

```
tests/
├── setup.js                # Jest configuration and global test setup
├── mocks/                  # Mock implementations and test doubles
│   ├── MockCanvas.js       # Canvas API mock for testing
│   ├── MockLocalStorage.js # localStorage mock
│   └── MockEventTarget.js  # Event handling mock
├── fixtures/               # Test data and sample assets
│   ├── testSprites/        # Sample sprite images
│   ├── testLevels/         # Sample level data
│   └── testSaveData/       # Sample save game data
├── unit/                   # Unit tests (mirrors src/ structure)
│   ├── core/
│   │   ├── Game.test.js
│   │   ├── Canvas.test.js
│   │   └── InputManager.test.js
│   ├── entities/
│   │   ├── Player.test.js
│   │   ├── Dog.test.js
│   │   └── Entity.test.js
│   ├── systems/
│   │   ├── Physics.test.js
│   │   └── Renderer.test.js
│   └── utils/
│       ├── MathUtils.test.js
│       └── EventEmitter.test.js
├── integration/            # Integration tests
│   ├── gameLoop.test.js    # Full game loop testing
│   ├── levelCompletion.test.js # End-to-end level tests
│   └── saveLoad.test.js    # Save/load functionality
└── performance/            # Performance benchmarks
    ├── renderingBench.js   # Rendering performance tests
    └── memoryBench.js      # Memory usage benchmarks
```

### 3.2 Test Naming Conventions

**File Naming**:
- Unit tests: `ModuleName.test.js`
- Integration tests: `featureName.test.js`
- Performance tests: `systemName.bench.js`

**Test Function Naming**:
```javascript
describe('Player', () => {
  describe('constructor', () => {
    it('should initialize with default position', () => {});
    it('should accept custom starting position', () => {});
  });
  
  describe('update', () => {
    it('should apply gravity when falling', () => {});
    it('should handle ground collision', () => {});
  });
});
```

## 4. Documentation Structure (`docs/`)

### 4.1 Documentation Organization

```
docs/
├── prd/                    # Product Requirements Documents
│   ├── README.md           # PRD index and navigation
│   ├── overview.md         # Executive summary and vision
│   ├── functional-requirements.md
│   ├── non-functional-requirements.md
│   ├── success-metrics.md
│   ├── timeline.md
│   └── risks.md
├── architecture/           # Technical Architecture Documents
│   ├── README.md           # Architecture index
│   ├── overview.md         # System overview and principles
│   ├── component-architecture.md
│   ├── data-flow.md
│   ├── module-interfaces.md
│   ├── tech-stack.md
│   ├── deployment.md
│   ├── testing-strategy.md
│   └── project-structure.md
├── epics/                  # Epic-level feature documentation
├── stories/                # User story documentation
├── qa/                     # Quality assurance documentation
└── migration-plan.md       # Step-by-step migration guide
```

## 5. Build and Configuration Files

### 5.1 Configuration File Purposes

**`package.json`** - Project Metadata and Dependencies
```json
{
  "name": "cat-platformer-modular",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/ --ext .js",
    "lint:fix": "eslint src/ --ext .js --fix"
  }
}
```

**`vite.config.js`** - Build System Configuration
```javascript
export default {
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
  }
}
```

**`jest.config.js`** - Testing Framework Configuration
```javascript
export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js']
}
```

**`.eslintrc.js`** - Code Quality Configuration
```javascript
module.exports = {
  env: { browser: true, es2017: true, jest: true },
  extends: ['standard'],
  rules: {
    'complexity': ['warn', 10],
    'max-lines': ['warn', 200]
  }
}
```

## 6. Asset Organization

### 6.1 Development Assets (`assets/`)

```
assets/
├── sprites/                # Source sprite images
│   ├── player/            # Player character sprites
│   ├── enemies/           # Enemy entity sprites
│   ├── effects/           # Particle and effect sprites
│   └── ui/                # User interface graphics
├── levels/                # Level design assets
│   ├── backgrounds/       # Level background images
│   ├── tilesets/          # Tileset graphics
│   └── data/              # Level configuration JSON files
├── audio/                 # Sound effects and music
│   ├── sfx/               # Sound effects
│   └── music/             # Background music
└── fonts/                 # Custom fonts (if any)
```

### 6.2 Production Assets

In production, assets are embedded or inlined in the final build:
- Sprites: Base64 encoded in JavaScript
- Level data: Embedded as JSON objects
- Audio: DataURL encoded or external references

## 7. Development Tools (`tools/`)

### 7.1 Development Scripts

```
tools/
├── build-scripts/         # Custom build utilities
│   ├── inline-assets.js   # Asset inlining for production
│   ├── sprite-optimizer.js # Sprite compression and optimization
│   └── bundle-analyzer.js # Bundle size analysis
├── dev-scripts/           # Development helpers
│   ├── level-validator.js # Level data validation
│   ├── sprite-generator.js # Sprite sheet generation
│   └── perf-monitor.js    # Performance monitoring tools
└── deployment/            # Deployment utilities
    ├── deploy.js          # Deployment automation
    └── health-check.js    # Post-deployment validation
```

## 8. IDE and Editor Configuration

### 8.1 VS Code Configuration (`.vscode/`)

```
.vscode/
├── settings.json          # Project-specific VS Code settings
├── launch.json            # Debugging configuration
├── tasks.json             # Build and test tasks
└── extensions.json        # Recommended extensions
```

**Recommended VS Code Settings**:
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "eslint.autoFixOnSave": true,
  "files.eol": "\n"
}
```

## 9. File Naming Conventions

### 9.1 Naming Standards

**JavaScript Files**:
- Classes: PascalCase (e.g., `Player.js`, `LevelManager.js`)
- Utilities: camelCase (e.g., `mathUtils.js`, `assetLoader.js`)
- Constants: UPPER_CASE (e.g., `PHYSICS_CONSTANTS.js`)

**Test Files**:
- Unit tests: `ClassName.test.js`
- Integration tests: `featureName.integration.test.js`
- Performance tests: `systemName.bench.js`

**Documentation**:
- Lowercase with hyphens: `component-architecture.md`
- README files: `README.md` (uppercase)

**Configuration Files**:
- Standard naming: `package.json`, `vite.config.js`
- Dot files: `.eslintrc.js`, `.gitignore`

### 9.2 Import Path Conventions

**Absolute Imports**: All imports use relative paths from current file
```javascript
// From src/entities/Player.js
import Entity from './Entity.js';
import { PHYSICS_CONSTANTS } from '../utils/Constants.js';
import EventEmitter from '../utils/EventEmitter.js';
```

**Consistent Extensions**: Always include `.js` extension for clarity
```javascript
// Correct
import Player from './Player.js';

// Avoid (even though valid)
import Player from './Player';
```

## 10. Git and Version Control

### 10.1 Git Configuration

**`.gitignore`** - Version Control Exclusions
```
# Build outputs
dist/
build/

# Dependencies
node_modules/

# IDE files
.vscode/settings.json
.DS_Store

# Temporary files
*.tmp
*.log

# Environment files
.env*
```

### 10.2 Branch Structure

**Main Branches**:
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature development
- `hotfix/*` - Critical bug fixes

**File Organization by Branch**:
- Feature branches modify specific modules
- Integration testing validates module interactions
- Main branch maintains stable, tested code

---

**Document Control**:
- **Structure Evolution**: Project structure may evolve during development
- **Path Consistency**: All documentation and imports must reflect current structure
- **Tool Integration**: Build tools and IDE configuration aligned with structure
- **Team Alignment**: All team members follow consistent organization patterns