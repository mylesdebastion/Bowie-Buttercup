# Component Architecture: Cat Platformer Game

**Owner**: Technical Lead  
**Last Updated**: 2025-01-18  
**Version**: 1.0  
**Related Docs**: 
- [Architecture Overview](./overview.md)
- [Module Interfaces](./module-interfaces.md)
- [Entity System](./entity-system.md)
- [Data Flow](./data-flow.md)

---

## 1. Core Game Engine Components

### 1.1 Game Loop (`src/core/Game.js`)

**Responsibility**: Main game orchestrator and lifecycle management

**Key Features**:
- requestAnimationFrame-based game loop
- Delta time calculation for frame-independent movement
- Game state management (playing, paused, menu)
- System coordination and update sequencing

**Dependencies**:
- Canvas management (Canvas.js)
- Input handling (InputManager.js)
- State persistence (StateManager.js)
- Level management (LevelManager.js)

**Public Interface**:
```javascript
class Game {
  constructor(canvasId)
  init()
  start()
  pause()
  resume()
  stop()
  update(deltaTime)
  render()
  getCurrentLevel()
  setLevel(levelId)
}
```

### 1.2 Canvas Management (`src/core/Canvas.js`)

**Responsibility**: Canvas setup, resizing, and rendering context management

**Key Features**:
- Canvas element lifecycle management
- Responsive scaling and device pixel ratio handling
- High contrast and accessibility mode support
- Rendering context optimization and caching

**Dependencies**:
- DOM manipulation (browser APIs)
- Local storage for settings persistence

**Public Interface**:
```javascript
class Canvas {
  constructor(canvasId, options = {})
  getContext()
  resize(width, height)
  setHighContrast(enabled)
  clear()
  getScaleFactor()
  screenToWorld(screenX, screenY)
  worldToScreen(worldX, worldY)
}
```

### 1.3 Input Manager (`src/core/InputManager.js`)

**Responsibility**: Unified input handling for keyboard, mouse, and touch

**Key Features**:
- Cross-platform input normalization
- Key state tracking and edge detection
- Touch gesture recognition
- Input mapping and customization

**Dependencies**:
- Event listeners (browser APIs)
- Mobile controls integration

**Public Interface**:
```javascript
class InputManager {
  constructor()
  init()
  update()
  isKeyDown(key)
  isKeyPressed(key)
  isKeyReleased(key)
  getMousePosition()
  getTouchPositions()
  addKeyMapping(action, key)
}
```

### 1.4 State Manager (`src/core/StateManager.js`)

**Responsibility**: Game state persistence and management

**Key Features**:
- localStorage integration with versioning
- State validation and corruption recovery
- Settings management (audio, graphics, controls)
- Save/load game progress

**Dependencies**:
- Browser localStorage API
- JSON serialization/deserialization

**Public Interface**:
```javascript
class StateManager {
  constructor()
  save(key, data)
  load(key, defaultValue = null)
  clear(key)
  exists(key)
  getSettings()
  updateSettings(settings)
  exportSave()
  importSave(saveData)
}
```

## 2. Entity System Components

### 2.1 Entity Base Class (`src/entities/Entity.js`)

**Responsibility**: Common entity behavior and interface definition

**Key Features**:
- Position, velocity, and physics properties
- Rendering and animation state management
- Collision detection integration
- Lifecycle management (spawn, update, destroy)

**Dependencies**:
- Physics system for collision detection
- Rendering system for drawing

**Public Interface**:
```javascript
class Entity {
  constructor(x, y, options = {})
  update(deltaTime, gameState)
  render(ctx, camera)
  onCollision(other, collisionData)
  destroy()
  getBoundingBox()
  setPosition(x, y)
  setVelocity(vx, vy)
}
```

### 2.2 Player Entity (`src/entities/Player.js`)

**Responsibility**: Player character implementation with physics and controls

**Key Features**:
- Physics-based movement (gravity, jumping, acceleration)
- Animation state machine (idle, running, jumping, falling)
- Input processing and response
- Health and lives management

**Dependencies**:
- Entity base class inheritance
- Input manager for controls
- Physics system for movement

**Public Interface**:
```javascript
class Player extends Entity {
  constructor(x, y)
  handleInput(inputManager)
  jump()
  takeDamage(amount)
  respawn()
  getState()
  setState(newState)
  canJump()
}
```

### 2.3 Enemy Entities

#### Dog Entity (`src/entities/Dog.js`)

**Responsibility**: Bouncing enemy with predictable movement patterns

**Key Features**:
- Periodic bouncing behavior
- Collision damage to player
- Level-specific movement boundaries
- Visual feedback for bounce timing

#### Mouse Entity (`src/entities/Mouse.js`)

**Responsibility**: Collectible entity with scoring mechanics

**Key Features**:
- Scoring system integration
- Spawn animation and effects
- Collection sound and visual feedback
- Random spawn positioning

#### Fireball Entity (`src/entities/Fireball.js`)

**Responsibility**: Projectile hazard with directional movement

**Key Features**:
- Linear movement with gravity
- Trail particle effects
- Collision detection with player and terrain
- Respawn timing and patterns

### 2.4 Particle System (`src/entities/Particle.js`)

**Responsibility**: Visual effects and animation particles

**Key Features**:
- Object pooling for performance
- Various particle types (explosion, trail, sparkle)
- Physics-based particle movement
- Automatic cleanup and recycling

**Public Interface**:
```javascript
class Particle {
  constructor()
  emit(type, x, y, options = {})
  update(deltaTime)
  render(ctx, camera)
  clear()
  getPoolSize()
  setPoolSize(size)
}
```

## 3. System Components

### 3.1 Physics System (`src/systems/Physics.js`)

**Responsibility**: Physics simulation and collision detection

**Key Features**:
- AABB (Axis-Aligned Bounding Box) collision detection
- Gravity and velocity integration
- Collision resolution and response
- Spatial partitioning for performance

**Dependencies**:
- Entity system for collision subjects
- Math utilities for calculations

**Public Interface**:
```javascript
class Physics {
  constructor()
  update(deltaTime, entities)
  checkCollision(entityA, entityB)
  resolveCollision(entityA, entityB, collisionData)
  applyGravity(entity, deltaTime)
  integrate(entity, deltaTime)
}
```

### 3.2 Rendering System (`src/systems/Renderer.js`)

**Responsibility**: Drawing and animation pipeline

**Key Features**:
- Layered rendering (background, entities, UI)
- Sprite animation management
- Camera transform handling
- Performance optimization (dirty rectangles, culling)

**Dependencies**:
- Canvas context for drawing
- Sprite manager for assets
- Camera system for transforms

**Public Interface**:
```javascript
class Renderer {
  constructor(canvas)
  render(gameState, camera)
  drawEntity(entity, camera)
  drawBackground(level, camera)
  drawUI(uiComponents)
  setCamera(camera)
}
```

### 3.3 Level Manager (`src/systems/LevelManager.js`)

**Responsibility**: Level loading, transitions, and progression

**Key Features**:
- Dynamic level instantiation
- Level transition animations
- Progress tracking and persistence
- Asset preloading for smooth transitions

**Dependencies**:
- Individual level classes
- State manager for progress
- Asset loader for resources

**Public Interface**:
```javascript
class LevelManager {
  constructor()
  loadLevel(levelId)
  getCurrentLevel()
  nextLevel()
  previousLevel()
  resetLevel()
  getProgress()
  unlockLevel(levelId)
}
```

### 3.4 Sprite Manager (`src/systems/SpriteManager.js`)

**Responsibility**: Sprite loading, caching, and animation

**Key Features**:
- Sprite sheet parsing and caching
- Animation sequence management
- Runtime sprite modification support
- Memory-efficient asset storage

**Dependencies**:
- Asset loading utilities
- Canvas for sprite processing

**Public Interface**:
```javascript
class SpriteManager {
  constructor()
  loadSprite(id, source, config)
  getSprite(id, frame = 0)
  getAnimation(id, animationName)
  updateAnimation(id, deltaTime)
  cropSprite(id, x, y, width, height)
}
```

## 4. User Interface Components

### 4.1 Sprite Editor (`src/ui/SpriteEditor.js`)

**Responsibility**: In-game sprite editing and customization tools

**Key Features**:
- Interactive sprite cropping interface
- Real-time preview and editing
- Import/export functionality
- Animation frame management

**Dependencies**:
- Canvas for drawing interface
- File API for import/export
- Sprite manager for asset integration

**Public Interface**:
```javascript
class SpriteEditor {
  constructor(container)
  show()
  hide()
  loadSprite(imageSource)
  cropSprite(x, y, width, height)
  exportSprite()
  importSprite(spriteData)
}
```

### 4.2 Mobile Controls (`src/ui/Controls.js`)

**Responsibility**: Touch-based game controls for mobile devices

**Key Features**:
- Virtual D-pad implementation
- Touch gesture recognition
- Responsive layout adaptation
- Accessibility support

**Dependencies**:
- Touch event handling
- Input manager integration
- CSS for styling

**Public Interface**:
```javascript
class Controls {
  constructor(container)
  init()
  show()
  hide()
  isPressed(button)
  getDirection()
  setPosition(x, y)
}
```

### 4.3 Settings Panel (`src/ui/SettingsPanel.js`)

**Responsibility**: Game configuration and options management

**Key Features**:
- Audio settings (mute, volume)
- Visual settings (high contrast, reduced motion)
- Control configuration
- Data management (clear saves, export/import)

**Dependencies**:
- State manager for persistence
- Audio system for sound control
- Canvas for visual settings

**Public Interface**:
```javascript
class SettingsPanel {
  constructor(container)
  show()
  hide()
  getSetting(key)
  setSetting(key, value)
  resetToDefaults()
  exportSettings()
  importSettings(data)
}
```

### 4.4 HUD (Heads-Up Display) (`src/ui/HUD.js`)

**Responsibility**: Game status display and player feedback

**Key Features**:
- Score and lives display
- Level progress indicators
- Performance metrics (optional)
- Status messages and notifications

**Dependencies**:
- Game state for data
- Canvas for rendering
- Font and text rendering utilities

**Public Interface**:
```javascript
class HUD {
  constructor()
  update(gameState)
  render(ctx)
  showMessage(text, duration)
  setVisible(visible)
  updateScore(score)
  updateLives(lives)
}
```

## 5. Level Components

### 5.1 Level Base Class (`src/levels/Level.js`)

**Responsibility**: Common level structure and interface

**Key Features**:
- Entity spawn and management
- Win/lose condition checking
- Level-specific configuration
- Background and environment rendering

**Dependencies**:
- Entity system for spawning
- Physics system for world setup
- Rendering system for drawing

**Public Interface**:
```javascript
class Level {
  constructor(config)
  load()
  unload()
  update(deltaTime, gameState)
  render(ctx, camera)
  spawnEntity(type, x, y, options)
  checkWinCondition(gameState)
  checkLoseCondition(gameState)
  getSpawnPoint()
}
```

### 5.2 Individual Level Implementations

#### Level 1: Fireball Platformer (`src/levels/Level1.js`)
- Fireball hazards with predictable patterns
- Basic platforming mechanics introduction
- Tutorial-level difficulty curve

#### Level 2: Mouse Catching Arena (`src/levels/Level2.js`)
- Mouse collection objectives
- Scoring system integration
- Time-based challenges

#### Level 3: Challenge Arena with Pits (`src/levels/Level3.js`)
- Environmental hazards (pits, spikes)
- Advanced platforming challenges
- Multiple path solutions

#### Level 4: Dog Bouncing Level (`src/levels/Level4.js`)
- Dog enemy interaction mechanics
- Timing-based obstacle avoidance
- Rhythm and pattern recognition

#### Level 5: Victory Feast (`src/levels/Level5.js`)
- Celebration and completion mechanics
- Final challenge combination
- Story conclusion and rewards

## 6. Utility Components

### 6.1 Event Emitter (`src/utils/EventEmitter.js`)

**Responsibility**: Decoupled communication between modules

**Key Features**:
- Observer pattern implementation
- Type-safe event handling
- Performance-optimized listener management
- Debug and logging capabilities

**Public Interface**:
```javascript
class EventEmitter {
  constructor()
  on(event, callback)
  off(event, callback)
  emit(event, data)
  once(event, callback)
  listenerCount(event)
}
```

### 6.2 Asset Loader (`src/utils/AssetLoader.js`)

**Responsibility**: Dynamic asset loading and caching

**Key Features**:
- Asynchronous asset loading
- Progress tracking and callbacks
- Error handling and retry logic
- Memory management and cleanup

**Public Interface**:
```javascript
class AssetLoader {
  constructor()
  loadImage(url, id)
  loadAudio(url, id)
  loadJSON(url, id)
  getAsset(id)
  preload(assetList, onProgress, onComplete)
}
```

### 6.3 Math Utilities (`src/utils/MathUtils.js`)

**Responsibility**: Mathematical helper functions and calculations

**Key Features**:
- Vector mathematics
- Collision detection helpers
- Interpolation and easing functions
- Random number generation utilities

**Public Interface**:
```javascript
class MathUtils {
  static distance(x1, y1, x2, y2)
  static clamp(value, min, max)
  static lerp(start, end, factor)
  static randomRange(min, max)
  static rectIntersect(rect1, rect2)
}
```

### 6.4 Constants (`src/utils/Constants.js`)

**Responsibility**: Centralized configuration and constants

**Key Features**:
- Game configuration values
- Physics constants (gravity, friction)
- UI layout and styling constants
- Performance and optimization settings

**Structure**:
```javascript
export const PHYSICS = {
  GRAVITY: 980,
  FRICTION: 0.8,
  MAX_VELOCITY: 500
};

export const GAME = {
  FPS_TARGET: 60,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600
};

export const LEVELS = {
  TOTAL_LEVELS: 5,
  UNLOCK_PROGRESSION: true
};
```

## 7. Component Dependencies

### Dependency Graph

```
Game (Core)
├── Canvas
├── InputManager
├── StateManager
├── LevelManager
│   ├── Level1-5 (Individual Levels)
│   └── Entity Spawning
├── Renderer
│   ├── SpriteManager
│   └── Camera System
└── Physics
    └── Entity System
        ├── Player
        ├── Dog, Mouse, Fireball
        └── Particle System

UI Components
├── SpriteEditor
├── Controls (Mobile)
├── SettingsPanel
└── HUD

Utilities
├── EventEmitter
├── AssetLoader
├── MathUtils
└── Constants
```

### Integration Points

**Core to Systems**: Game loop coordinates all system updates
**Systems to Entities**: Physics and rendering systems operate on entities
**Entities to UI**: HUD displays entity states and game progress
**UI to Core**: Settings and controls modify core game behavior
**Utilities to All**: Shared utilities used throughout the architecture

---

**Document Control**:
- **Component Ownership**: Each component has designated primary developer
- **Interface Stability**: Public interfaces require architecture review for changes
- **Testing Requirements**: Each component must have comprehensive unit tests
- **Documentation**: All public interfaces documented with JSDoc