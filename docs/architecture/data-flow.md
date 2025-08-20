# Data Flow and State Management: Cat Platformer Game

**Owner**: Technical Lead  
**Last Updated**: 2025-01-18  
**Version**: 1.0  
**Related Docs**: 
- [Architecture Overview](./overview.md)
- [Component Architecture](./component-architecture.md)
- [Module Interfaces](./module-interfaces.md)

---

## 1. Game Loop Data Flow

### 1.1 Main Game Loop

The game follows a standard update-render loop with clear data flow between systems:

```
requestAnimationFrame
    ├── InputManager.poll()
    │   ├── Keyboard state collection
    │   ├── Mouse/Touch event processing
    │   └── Input state updates
    ├── Game.update(deltaTime)
    │   ├── Player.update(deltaTime, gameState)
    │   │   ├── Input processing
    │   │   ├── Physics integration
    │   │   └── Animation updates
    │   ├── Entities.update(deltaTime, gameState)
    │   │   ├── AI behavior processing
    │   │   ├── Movement calculations
    │   │   └── State transitions
    │   ├── Physics.simulate(deltaTime, entities)
    │   │   ├── Collision detection
    │   │   ├── Collision resolution
    │   │   └── Physics integration
    │   ├── LevelManager.update(deltaTime, gameState)
    │   │   ├── Win/lose condition checking
    │   │   ├── Level progression logic
    │   │   └── Entity spawning/cleanup
    │   └── Camera.follow(player)
    │       ├── Position calculation
    │       └── Boundary constraints
    └── Renderer.draw(gameState, camera)
        ├── Background.render(ctx, camera)
        ├── Level.render(ctx, camera)
        ├── Entities.render(ctx, camera)
        └── UI.render(ctx, gameState)
```

### 1.2 Delta Time Propagation

Delta time flows through the system to ensure frame-independent movement:

```javascript
// Main game loop
const currentTime = performance.now();
const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds

// Propagation chain
Game.update(deltaTime)
  ├── Player.update(deltaTime, gameState)
  ├── Entities.forEach(entity => entity.update(deltaTime, gameState))
  ├── Physics.simulate(deltaTime, allEntities)
  └── ParticleSystem.update(deltaTime)
```

## 2. State Management Architecture

### 2.1 Centralized Game State

The game maintains a centralized state object that flows through all systems:

```javascript
const GameState = {
  // Core game state
  mode: 'playing', // 'menu', 'playing', 'paused', 'editor', 'settings'
  isPaused: false,
  currentTime: 0,
  
  // Player state
  player: {
    position: { x: 0, y: 0 },
    velocity: { vx: 0, vy: 0 },
    state: 'idle', // 'idle', 'running', 'jumping', 'falling'
    health: 100,
    lives: 3,
    score: 0,
    powerups: []
  },
  
  // Level state
  level: {
    id: 1,
    isComplete: false,
    startTime: 0,
    elapsedTime: 0,
    entities: [],
    spawnPoints: [],
    objectives: {
      miceCollected: 0,
      miceRequired: 3,
      timeLimit: 60000
    }
  },
  
  // Camera state
  camera: {
    x: 0,
    y: 0,
    scale: 1,
    target: null,
    bounds: { left: 0, right: 800, top: 0, bottom: 600 }
  },
  
  // UI state
  ui: {
    showEditor: false,
    showSettings: false,
    showHUD: true,
    highContrast: false,
    reducedMotion: false,
    muted: false
  },
  
  // Performance state
  debug: {
    fps: 60,
    frameTime: 16.67,
    entityCount: 0,
    renderCalls: 0
  }
};
```

### 2.2 State Update Patterns

**Immutable Updates**: State changes create new objects rather than mutating existing ones:

```javascript
// Correct: Immutable update
const newGameState = {
  ...gameState,
  player: {
    ...gameState.player,
    score: gameState.player.score + 10
  }
};

// Incorrect: Direct mutation
gameState.player.score += 10; // Avoid this pattern
```

**State Validation**: All state updates include validation:

```javascript
function updatePlayerScore(gameState, points) {
  if (typeof points !== 'number' || points < 0) {
    console.warn('Invalid score update:', points);
    return gameState;
  }
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      score: Math.max(0, gameState.player.score + points)
    }
  };
}
```

## 3. Event-Driven Communication

### 3.1 Event System Architecture

The game uses a centralized event system for loose coupling between components:

```javascript
// Event flow example
Player.onCollision(entity) → 
  EventEmitter.emit('player:collision', { player, entity }) →
    ├── ScoreSystem.onPlayerCollision() // Update score
    ├── AudioSystem.onPlayerCollision() // Play sound
    ├── ParticleSystem.onPlayerCollision() // Show effects
    └── HUD.onPlayerCollision() // Update display
```

### 3.2 Standard Event Categories

**Player Events**:
- `player:spawn` - Player spawns at level start
- `player:move` - Player position/velocity changes
- `player:jump` - Player initiates jump
- `player:land` - Player lands after jumping/falling
- `player:collision` - Player collides with entity/terrain
- `player:damage` - Player takes damage
- `player:death` - Player dies/loses life

**Game Events**:
- `game:start` - Game begins
- `game:pause` - Game paused
- `game:resume` - Game resumed
- `game:over` - Game ends (win/lose)
- `level:start` - Level begins loading
- `level:complete` - Level objectives met
- `level:transition` - Moving between levels

**UI Events**:
- `ui:show` - UI component becomes visible
- `ui:hide` - UI component becomes hidden
- `ui:setting:change` - Game setting modified
- `ui:button:click` - UI interaction

**System Events**:
- `asset:loaded` - Asset finished loading
- `asset:error` - Asset failed to load
- `performance:warning` - Performance threshold exceeded
- `error:critical` - Critical system error

### 3.3 Event Payload Standards

Events include standardized payload structures:

```javascript
// Event payload template
const eventPayload = {
  type: 'player:collision',
  timestamp: performance.now(),
  source: 'Player',
  data: {
    player: playerInstance,
    entity: entityInstance,
    collisionPoint: { x: 100, y: 200 },
    collisionNormal: { x: 0, y: -1 }
  }
};
```

## 4. Persistence and Storage

### 4.1 Data Storage Layers

**Session Storage** (temporary):
- Current game state
- Performance metrics
- Debug information

**Local Storage** (persistent):
- Player progress and saves
- Game settings and preferences
- Sprite customizations
- High scores and statistics

**Memory Storage** (runtime):
- Asset cache
- Entity pools
- Animation frames
- Collision maps

### 4.2 Save Data Structure

```javascript
const SaveData = {
  version: '1.0.0',
  timestamp: Date.now(),
  player: {
    name: 'Player',
    totalScore: 12500,
    highScore: 5000,
    totalPlayTime: 3600000, // milliseconds
    statistics: {
      totalJumps: 1250,
      totalMiceCollected: 45,
      totalDeaths: 23
    }
  },
  progress: {
    levelsUnlocked: 3,
    levelsCompleted: 2,
    levelScores: {
      1: 2500,
      2: 3200,
      3: 0
    },
    levelTimes: {
      1: 45000,
      2: 62000,
      3: null
    }
  },
  settings: {
    volume: 0.8,
    muted: false,
    highContrast: false,
    reducedMotion: false,
    controls: {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      jump: 'Space'
    }
  },
  customSprites: {
    player: 'base64EncodedImageData...',
    dog: 'base64EncodedImageData...'
  }
};
```

### 4.3 Data Synchronization

**Save Triggers**:
- Level completion
- Settings changes
- Sprite modifications
- Game exit/pause

**Load Triggers**:
- Game initialization
- Level transitions
- Settings panel opening

**Validation and Recovery**:
```javascript
function validateSaveData(saveData) {
  const schema = {
    version: 'string',
    timestamp: 'number',
    player: 'object',
    progress: 'object',
    settings: 'object'
  };
  
  return Object.keys(schema).every(key => 
    typeof saveData[key] === schema[key]
  );
}

function recoverCorruptedSave(saveData) {
  const defaultSave = createDefaultSaveData();
  return {
    ...defaultSave,
    ...saveData, // Overlay valid portions
    version: defaultSave.version // Always use current version
  };
}
```

## 5. Asset Loading and Management

### 5.1 Asset Loading Pipeline

```
Asset Request →
  AssetLoader.load(url, type) →
    ├── Cache Check
    │   ├── Cache Hit → Return cached asset
    │   └── Cache Miss → Continue loading
    ├── Network Request
    │   ├── Success → Process asset
    │   └── Error → Retry or fallback
    ├── Asset Processing
    │   ├── Image → Create texture
    │   ├── Audio → Create audio buffer
    │   └── JSON → Parse and validate
    ├── Cache Storage
    └── Callback/Promise Resolution
```

### 5.2 Asset Categories and Flow

**Sprites and Images**:
```javascript
// Loading flow
AssetLoader.loadImage('player.png') →
  SpriteManager.processSprite(imageData) →
    SpriteManager.cache.set('player', processedSprite) →
      Entity.render() → SpriteManager.getSprite('player')
```

**Audio Assets**:
```javascript
// Loading and playback flow
AssetLoader.loadAudio('jump.mp3') →
  AudioManager.createSource(audioBuffer) →
    GameEvent.emit('player:jump') →
      AudioManager.play('jump')
```

**Level Data**:
```javascript
// Level loading flow
LevelManager.loadLevel(1) →
  AssetLoader.loadJSON('level1.json') →
    Level1.constructor(levelData) →
      Level1.spawnEntities() →
        EntityFactory.create(type, x, y)
```

## 6. Performance Optimization Data Flow

### 6.1 Object Pooling

Reusable objects (particles, projectiles) use pooling to reduce garbage collection:

```javascript
// Pool management flow
ParticleSystem.emit() →
  ObjectPool.acquire() →
    ├── Pool has available → Return existing object
    └── Pool empty → Create new object
  
// Cleanup flow
Particle.destroy() →
  ObjectPool.release(particle) →
    particle.reset() →
      Pool.available.push(particle)
```

### 6.2 Render Optimization

Rendering optimizations reduce draw calls and improve performance:

```javascript
// Culling flow
Renderer.render(entities, camera) →
  entities.filter(entity => camera.contains(entity.bounds)) →
    visibleEntities.forEach(entity → entity.render(ctx, camera))

// Batching flow
SpriteRenderer.batchRender(sprites) →
  sprites.groupBy(texture) →
    textureGroups.forEach(group → drawBatch(group))
```

### 6.3 Memory Management

Memory usage is managed through careful cleanup and monitoring:

```javascript
// Cleanup flow
LevelManager.unloadLevel() →
  entities.forEach(entity → entity.destroy()) →
    AssetLoader.cleanup(unusedAssets) →
      GarbageCollector.hint()
```

## 7. Error Handling and Recovery

### 7.1 Error Propagation

Errors bubble up through the system with context preservation:

```javascript
// Error flow
Entity.update() throws Error →
  EntityManager.handleEntityError(entity, error) →
    ErrorLogger.log(error, context) →
      ErrorRecovery.attemptRecovery(entity) →
        ├── Success → Continue execution
        └── Failure → Remove entity, notify user
```

### 7.2 State Recovery

Critical state corruption triggers recovery mechanisms:

```javascript
// Recovery flow
StateValidator.validate(gameState) →
  ├── Valid → Continue
  └── Invalid → 
      StateRecovery.restore() →
        ├── Load from backup
        ├── Reset to safe state
        └── Notify user of recovery
```

---

**Document Control**:
- **Data Flow Validation**: Regular architecture reviews ensure clean data flow
- **Performance Monitoring**: Data flow performance measured and optimized
- **State Consistency**: Automated testing validates state management patterns
- **Error Recovery**: Recovery mechanisms tested through fault injection