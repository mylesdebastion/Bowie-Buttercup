# Story E002.1-003: Player - Seamless Pet Switching

**Story ID**: E002.1-003
**Epic**: E002.1 - Sprite System Port & Pet Switching
**Type**: Feature
**Priority**: High
**Story Points**: 2
**Status**: Blocked (Waiting for E002.1-001, E002.1-002)
**Assigned To**: James (Dev Agent)

## User Story
**As a player**, I want to switch pets during gameplay  
**So that** I can experiment with different cat personalities

## Acceptance Criteria

### Runtime Pet Switching
- [ ] **AC1**: Pet switching works during active gameplay
  - Player can change pets while game is running (not paused)
  - Switch works during any gameplay state (moving, jumping, falling, etc.)
  - No need to pause or stop the game to change pets
  - Works across all game levels (1-5)

- [ ] **AC2**: Animation state preserves correctly during switch
  - Current animation frame position maintained across switch
  - Animation timing continues seamlessly (no restart)
  - If player is mid-jump, new pet continues the jump animation
  - Running animation maintains pace and rhythm

- [ ] **AC3**: No visual glitches or rendering artifacts during transition
  - Sprite change happens within single frame (<16ms)
  - No flicker, pop, or visual discontinuity
  - Player position remains exactly the same
  - Transform state (facing direction, scale) preserved

- [ ] **AC4**: Physics and collision detection unaffected by pet switch
  - Player velocity, position, and momentum maintained
  - Collision boundaries remain consistent
  - Grounded state, climbing state, dodging state preserved
  - Jump buffer, coyote time, and other physics timers unaffected

## Technical Implementation Details

### Seamless Switch Architecture

#### State Preservation System
```javascript
// src/core/sprites/PetSwitcher.js
class PetSwitcher {
    switchPet(player, newPetId) {
        // 1. Capture current state
        const currentState = this.capturePlayerState(player);
        
        // 2. Load new pet configuration
        const newConfig = SpriteConfig.loadPet(newPetId);
        
        // 3. Apply new sprites while preserving state
        this.applyNewPetPreservingState(player, newConfig, currentState);
        
        // 4. Validate state integrity
        this.validateStateIntegrity(player, currentState);
    }
    
    capturePlayerState(player) {
        return {
            // Animation state
            animationState: player.state,
            animFrame: player.animFrame,
            animTimer: player.animTimer,
            
            // Physics state
            x: player.x,
            y: player.y,
            vx: player.vx,
            vy: player.vy,
            facing: player.facing,
            
            // Game state
            grounded: player.grounded,
            climbing: player.climbing,
            dodging: player.dodging,
            sitting: player.sitting,
            crouching: player.crouching,
            
            // Timers and buffers
            lastGroundedTime: player.lastGroundedTime,
            jumpBufferTime: player.jumpBufferTime,
            dodgeTimer: player.dodgeTimer,
            invulnTimer: player.invulnTimer
        };
    }
}
```

#### Animation State Mapping
```javascript
// Ensure both pets support identical animation states
const REQUIRED_ANIMATIONS = [
    'idle_sit',
    'run_1', 'run_2', 'run_3',
    'jump_up',
    'fall_down', 
    'crouch',
    'dodge_roll',
    'idle_sit_front'
];

// Validate pet configurations have all required animations
function validatePetAnimations(petConfig) {
    const missingAnimations = REQUIRED_ANIMATIONS.filter(
        anim => !petConfig.cells.find(cell => cell.assign === anim)
    );
    if (missingAnimations.length > 0) {
        throw new Error(`Pet missing animations: ${missingAnimations.join(', ')}`);
    }
}
```

#### Integration with Player Class
```javascript
// Modify Player class to support runtime pet switching
class Player {
    // Add method to change pet configuration
    switchPet(newPetConfig) {
        // Update sprite configuration without affecting game state
        this.currentPetConfig = newPetConfig;
        
        // Trigger re-validation of current sprite mapping
        this.validateCurrentSprite();
    }
    
    validateCurrentSprite() {
        // Ensure current animation state exists in new pet config
        const mapping = this.getMappingForState();
        if (!mapping) {
            console.warn(`No mapping found for state ${this.state}, falling back to idle_sit`);
            this.state = 'idle_sit';
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }
}
```

### Performance Optimization

#### Sprite Pre-loading
```javascript
// Pre-load both pet configurations to avoid loading delays
class SpritePreloader {
    async preloadAllPets() {
        const petConfigs = ['pet-a', 'pet-b'];
        await Promise.all(
            petConfigs.map(petId => this.preloadPet(petId))
        );
    }
    
    async preloadPet(petId) {
        const config = await SpriteConfig.loadPet(petId);
        const sheet = await SpriteSheetManager.loadSheet(config.sheet);
        this.cachedPets[petId] = { config, sheet };
    }
}
```

#### Switch Time Optimization
```javascript
// Target: <16ms switch time (single frame)
// Measure and optimize critical path
function measureSwitchPerformance(switchFunction) {
    const startTime = performance.now();
    switchFunction();
    const endTime = performance.now();
    const switchDuration = endTime - startTime;
    
    if (switchDuration > 16) {
        console.warn(`Pet switch took ${switchDuration}ms, target is <16ms`);
    }
    
    return switchDuration;
}
```

## User Experience Flow

### Switch During Gameplay
1. **Trigger**: Player clicks different pet option while game active
2. **State Capture**: Current player state saved in <1ms
3. **Configuration Switch**: New pet config loaded from cache in <5ms
4. **Sprite Update**: Player sprite references updated in <2ms
5. **State Restoration**: All game state restored in <3ms
6. **Visual Update**: Next frame renders with new pet (<16ms total)

### Visual Continuity
- **Same Frame Switch**: Pet change completes within single render frame
- **Position Lock**: Player pixel position identical before/after switch
- **Animation Sync**: Frame timing continues uninterrupted
- **Physics Continuity**: No velocity or momentum changes

## Error Handling & Edge Cases

### Error Scenarios
```javascript
// Handle missing animations gracefully
function handleMissingAnimation(petId, animationState) {
    console.warn(`Pet ${petId} missing animation: ${animationState}`);
    // Fallback to idle_sit or use placeholder sprite
    return getFallbackAnimation(animationState);
}

// Handle corrupted pet configurations
function handleCorruptedConfig(petId) {
    console.error(`Pet ${petId} configuration corrupted, reverting to Pet A`);
    return SpriteConfig.loadPet('pet-a');
}
```

### Edge Cases
- **Mid-Animation Switch**: During frame 2 of 3-frame run cycle
- **State Transition Switch**: While transitioning from jump to fall
- **Special State Switch**: During dodge roll or climbing
- **Physics Event Switch**: During collision or landing

## Dependencies
- **Requires**: Story E002.1-001 (Modular Sprite System) - Core architecture
- **Requires**: Story E002.1-002 (Pet Selection) - UI and selection logic
- **Related**: Player physics system, animation controller

## Definition of Done
- [ ] Pet switching works during active gameplay
- [ ] Animation state preservation verified across all states
- [ ] Visual continuity confirmed (no glitches or artifacts)
- [ ] Physics state unaffected by pet switches
- [ ] Performance target achieved (<200ms total, <16ms visual)
- [ ] Error handling covers all edge cases
- [ ] Unit tests cover switching logic and state preservation
- [ ] Integration tests verify gameplay continuity

## Testing Strategy

### Functional Tests
```javascript
// Test switching during each animation state
const animationStates = ['idle_sit', 'run', 'jump_up', 'fall_down', 'crouch', 'dodge_roll'];
animationStates.forEach(state => {
    test(`Pet switch during ${state} preserves animation`, () => {
        // Setup player in specific animation state
        // Trigger pet switch
        // Verify state preservation
    });
});
```

### Performance Tests
```javascript
// Measure switch timing across multiple switches
test('Pet switch performance under load', () => {
    const measurements = [];
    for (let i = 0; i < 100; i++) {
        const duration = measureSwitchTime();
        measurements.push(duration);
    }
    const avgDuration = measurements.reduce((a, b) => a + b) / measurements.length;
    expect(avgDuration).toBeLessThan(200); // 200ms target
});
```

### Visual Tests
```javascript
// Capture screenshots before/after switch for visual comparison
test('Visual continuity during pet switch', async () => {
    const beforeScreenshot = await captureGameScreenshot();
    await switchPet('pet-b');
    const afterScreenshot = await captureGameScreenshot();
    
    // Compare player position (should be identical)
    expect(getPlayerPosition(beforeScreenshot)).toEqual(getPlayerPosition(afterScreenshot));
});
```

## Success Metrics
- **Switch Time**: <200ms total user-perceived delay
- **Visual Continuity**: 0 visual artifacts in 1000 test switches
- **State Preservation**: 100% accuracy in physics/animation state
- **Performance Impact**: 0% frame rate decrease during switching

---

**Created**: 2025-01-27  
**Last Updated**: 2025-01-27  
**Estimated Hours**: 6-8 hours  
**Developer**: TBD  
**Dependencies**: Requires completion of Stories E002.1-001 and E002.1-002