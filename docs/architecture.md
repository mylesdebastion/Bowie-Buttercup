# Cat Platformer Game - Architecture Document

## System Overview
A browser-based 2D platformer game built with vanilla JavaScript and Canvas 2D API, featuring modular architecture for game mechanics, sprite management, and level design.

## Architecture Principles
- **Separation of Concerns**: Clear boundaries between game logic, rendering, and UI
- **State Management**: Centralized game state with predictable updates
- **Performance First**: Optimized rendering pipeline with requestAnimationFrame
- **Progressive Enhancement**: Core gameplay works first, editor features layer on top

## Component Architecture

### 1. Core Game Engine
```
src/
├── engine/
│   ├── Game.js          # Main game loop and state management
│   ├── Player.js         # Player entity with physics and animations
│   ├── Physics.js        # Physics system (gravity, collisions)
│   ├── Camera.js         # Viewport and following logic
│   └── InputManager.js   # Keyboard and touch input handling
```

### 2. Entity System
```
src/
├── entities/
│   ├── Entity.js         # Base entity class
│   ├── Fireball.js       # Projectile hazard
│   ├── Dog.js            # NPC with AI behavior
│   ├── Mouse.js          # Collectible NPC
│   └── Particle.js       # Visual effects
```

### 3. Level System
```
src/
├── levels/
│   ├── LevelManager.js   # Level loading and transitions
│   ├── TileMap.js        # Tile-based world representation
│   ├── Collision.js      # AABB collision detection
│   └── levels/           # Level data files
│       ├── level1.js
│       ├── level2.js
│       └── ...
```

### 4. Sprite System
```
src/
├── sprites/
│   ├── SpriteSheet.js    # Sprite sheet loading and parsing
│   ├── Animation.js      # Frame-based animation system
│   ├── SpriteEditor.js   # In-game sprite cropping tools
│   └── SpriteRenderer.js # Optimized sprite drawing
```

### 5. UI Components
```
src/
├── ui/
│   ├── HUD.js            # Game overlay (score, lives, time)
│   ├── EditorPanel.js    # Sprite editor interface
│   ├── ControlsPanel.js  # Physics tuning and settings
│   └── ModalManager.js   # Win/lose screens
```

## Data Flow

### Game Loop
```
requestAnimationFrame
    ├── InputManager.poll()
    ├── Game.update(deltaTime)
    │   ├── Player.update()
    │   ├── Entities.update()
    │   ├── Physics.simulate()
    │   └── Camera.follow()
    └── Renderer.draw()
        ├── Background.render()
        ├── TileMap.render()
        ├── Entities.render()
        └── UI.render()
```

### State Management
```javascript
GameState = {
    mode: 'play' | 'editor',
    level: {
        current: 1,
        tiles: [...],
        entities: [...]
    },
    player: {
        position: {x, y},
        velocity: {vx, vy},
        state: 'idle' | 'run' | 'jump' | ...,
        stats: {lives, score}
    },
    camera: {
        x, y, scale
    }
}
```

## Technical Stack

### Core Technologies
- **Rendering**: Canvas 2D API with pixel-perfect rendering
- **Physics**: Custom 2D physics engine with AABB collisions
- **Storage**: LocalStorage for settings and sprite configurations
- **Audio**: Web Audio API for sound effects

### Performance Optimizations
- **Object Pooling**: Reuse particle and projectile instances
- **Spatial Indexing**: Grid-based collision detection
- **Dirty Rectangle**: Only redraw changed screen regions
- **Asset Caching**: Pre-render sprite frames to offscreen canvases

## Module Interfaces

### Player Module
```javascript
class Player {
    constructor(x, y)
    update(deltaTime)
    handleInput(keys)
    checkCollisions(tilemap)
    draw(context, camera)
    getState()
    hurt()
    respawn()
}
```

### Level Module
```javascript
class Level {
    constructor(levelData)
    getTile(x, y)
    checkCollision(entity)
    spawnEntity(type, x, y)
    checkWinCondition(player)
    reset()
}
```

### Sprite Module
```javascript
class SpriteSheet {
    constructor(image, cellConfig)
    getSprite(state, frame)
    crop(x, y, width, height)
    assignAnimation(cellIndex, state)
    export()
    import(config)
}
```

## Deployment Architecture

### Build Output
```
dist/
└── index.html       # Single file with embedded CSS/JS
```

### Asset Pipeline
- Sprites: Base64 encoded or user-uploaded
- Levels: Embedded as JavaScript objects
- Sounds: Generated programmatically

## Testing Strategy

### Unit Tests
- Physics calculations
- Collision detection
- Animation state machines

### Integration Tests
- Level progression
- Save/load functionality
- Input handling

### Performance Tests
- Frame rate monitoring
- Memory usage tracking
- Input latency measurement

## Security Considerations
- Input sanitization for sprite editor
- LocalStorage quota management
- Safe JSON parsing for import/export

## Future Extensibility
- Plugin system for custom entities
- Level editor mode
- Multiplayer support hooks
- Mod loading capability