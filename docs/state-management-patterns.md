# State Management Patterns - SparkleClassic

**Document Type:** Technical Documentation
**Generated:** 2025-11-29
**Project:** SparkleClassic Game
**Scan Type:** Exhaustive Source Analysis

## Overview

SparkleClassic implements a centralized state management system with localStorage persistence, validation, and event-driven updates.

## State Manager Architecture

### Singleton Pattern

```javascript
// Get global StateManager instance
import { getStateManager } from './core/StateManager.js';
const stateManager = getStateManager();
```

### State Schema

The state is organized into four main sections:

#### 1. Game Progress (`state.game`)
- `currentLevel`: Active level (1-5)
- `maxLevel`: Maximum unlocked level
- `lives`: Player lives remaining
- `score`: Current score
- `highScore`: All-time high score
- `coins`: Collected coins
- `levelsCompleted`: Array tracking completion status
- `playerStats`: Aggregate statistics (play time, enemies defeated, etc.)

#### 2. Settings (`state.settings`)
- **Accessibility**: High contrast, reduced motion
- **Audio**: Music/SFX mute, volumes
- **Display**: UI scale, fullscreen
- **Physics**: Gravity, jump power, move speed, friction
- **Controls**: Customizable key mappings

#### 3. Sprite Editor (`state.spriteEditor`)
- Custom sprite definitions
- Selected sprite
- Current sprite mapping
- Edit mode state

#### 4. Runtime State (`state.runtime`)
- **NOT persisted** - Reset each session
- Player position, velocity, animation
- Level state (time, coins, enemies)
- Camera position and smoothing
- Game modes (play, menu, editor, settings)

## Key Features

### Validation & Sanitization

```javascript
// All state changes are validated against schema
validateState(data, schema, path)
sanitizeState(data, defaults)
```

- Type checking for all values
- Range validation (e.g., level 1-5)
- Automatic sanitization of invalid data
- Graceful fallback to defaults

### Event System

```javascript
// Subscribe to state changes
stateManager.subscribe('change:game.score', ({ value, oldValue }) => {
  console.log(`Score changed from ${oldValue} to ${value}`);
});

// Subscribe to specific events
stateManager.subscribe('stateReset', () => {
  console.log('State was reset to defaults');
});
```

**Available Events:**
- `stateChanged` - Any state mutation
- `change:{keyPath}` - Specific property changes
- `multipleChanges` - Batch updates
- `stateReset` - Full reset
- `sectionReset` - Section reset
- `stateSaved` - Persistence saved
- `stateLoaded` - Persistence loaded
- `stateCleared` - All data cleared

### localStorage Persistence

Three separate storage keys:
- `catPlatformerSave` - Game progress (essential data)
- `catPlatformerSettings` - User preferences
- `catPlatformerEditor` - Sprite editor data

**Auto-save triggers:**
- Level completion
- Settings changes
- Manual save calls

**Load on startup:**
- Validates all loaded data
- Falls back to defaults on corruption
- Reports validation errors

### Helper Methods

```javascript
// Game progression
stateManager.nextLevel()
stateManager.previousLevel()
stateManager.markLevelCompleted(level)

// Scoring
stateManager.addScore(points)
stateManager.collectCoin() // +10 points, extra life every 100 coins

// Lives
stateManager.loseLife() // Triggers game over if lives <= 0

// Level reset
stateManager.resetLevel() // Reset player to spawn/checkpoint

// Settings
stateManager.getSetting(key)
stateManager.setSetting(key, value)
stateManager.updateSettings(settingsObject)
```

## Usage Patterns

### Getting State

```javascript
// Get single value
const currentLevel = stateManager.get('game.currentLevel');

// Get nested value
const gravity = stateManager.get('settings.physics.gravity');

// Get entire section
const gameState = stateManager.get('game');

// Get complete state (readonly clone)
const fullState = stateManager.getState();
```

### Setting State

```javascript
// Set single value
stateManager.set('game.score', 1000);

// Batch updates (more efficient)
stateManager.setState({
  'game.score': 1000,
  'game.coins': 50,
  'game.lives': 3
});
```

### State Reset

```javascript
// Reset everything
stateManager.reset();

// Reset specific section
stateManager.resetSection('game'); // Reset game progress only
stateManager.resetSection('settings'); // Reset settings only
```

## Integration Points

### Canvas & Rendering
- Camera follows player position from `runtime.player`
- HUD displays `game.lives`, `game.score`, `game.coins`
- Respects `settings.uiScale` for UI scaling

### Physics System
- Reads physics constants from `settings.physics`
- Updates `runtime.player` velocity and position
- Respects `settings.reducedMotion` for accessibility

### Input System
- Reads key mappings from `settings.keyMap`
- Respects coyote time and jump buffer settings
- Stores input state in runtime

### Accessibility
- `settings.highContrast` → CSS class on body
- `settings.reducedMotion` → CSS class on body
- Volume controls for music and SFX

## Storage Health Check

```javascript
const health = stateManager.checkStorageHealth();
/*
{
  available: true,
  quota: 10485760,
  usage: 3245,
  hasData: true,
  canWrite: true
}
*/
```

## Deep Clone Implementation

State Manager implements deep cloning to prevent mutations:

```javascript
deepClone(obj) {
  // Handles: null, primitives, Date, Array, Objects
  // Returns: New instance with no shared references
}
```

This ensures immutability - all state getters return clones, not references.

## Best Practices

1. **Use specific paths**: `get('game.score')` not `get('game').score`
2. **Batch updates**: Use `setState()` for multiple changes
3. **Subscribe to specific changes**: Use `change:{path}` not `stateChanged`
4. **Validate before set**: StateManager validates, but check input first
5. **Save after important events**: Call `save()` after level complete, settings change
6. **Handle load errors**: Check `load()` result for validation errors

## Testing Considerations

```javascript
// Reset singleton for testing
import { resetStateManager } from './core/StateManager.js';
const freshManager = resetStateManager();
```

## Performance Notes

- State updates are O(1) for shallow properties
- Deep path updates navigate object tree (O(depth))
- Subscribers notify in O(n) where n = subscriber count
- localStorage saves are synchronous (use sparingly)
- Clone operations are O(n) where n = object size

## Future Enhancements

- Undo/redo system (state history)
- Cloud save sync
- State compression for larger saves
- Migration system for version upgrades
- State diff/patch for network sync
