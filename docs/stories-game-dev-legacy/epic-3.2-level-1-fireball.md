# US-012: Level 1 Fireball Platformer

**Story ID**: US-012  
**Epic**: [Epic 3: Level System Architecture](../epics/epic-3-level-system.md)  
**Story Points**: 3  
**Priority**: High  
**Sprint**: Week 3, Day 1  

## User Story

**As a** developer  
**I want** Level 1 (Fireball Platformer) extracted to its own module  
**So that** the platforming mechanics and fireball behavior can be maintained and enhanced independently  

## Business Value

Level 1 is the introduction level that teaches basic platforming mechanics. Extracting it properly ensures the core gameplay tutorial experience is preserved while enabling future enhancements.

## Acceptance Criteria

### AC-001: Platform Layout Preservation
- **Given** Level 1 is loaded
- **When** the player navigates the level
- **Then** all platform positions and sizes match original exactly
- **And** collision detection with platforms works identically
- **And** visual appearance of platforms is preserved

### AC-002: Fireball Behavior Preservation
- **Given** fireballs are active in Level 1
- **When** they move across the screen  
- **Then** fireball speed, trajectory, and collision match original
- **And** fireball spawning timing and positions are identical
- **And** player-fireball collision responses work exactly as before

### AC-003: Win Condition Implementation
- **Given** the player is playing Level 1
- **When** they reach the victory area
- **Then** level completion is detected correctly
- **And** level transition to Level 2 works smoothly
- **And** completion status is saved properly

### AC-004: Level Performance
- **Given** Level 1 is running with modular architecture
- **When** performance is measured
- **Then** frame rate equals or exceeds original implementation
- **And** level loading time is comparable or better
- **And** memory usage is efficient

## Technical Tasks

### Task 1: Level1 Class Implementation
- [ ] Create Level1 class inheriting from Level base class
- [ ] Extract platform definitions from original code
- [ ] Define level boundaries and spawn point
- [ ] Implement level-specific configuration

### Task 2: Platform System Integration
- [ ] Implement platform collision geometry
- [ ] Add platform rendering and visual appearance
- [ ] Ensure pixel-perfect platform collision detection
- [ ] Test platform edge cases and corner collisions

### Task 3: Fireball Integration
- [ ] Configure fireball spawning for Level 1
- [ ] Set up fireball movement patterns and timing
- [ ] Implement fireball-platform collision behavior
- [ ] Test fireball-player interaction accuracy

### Task 4: Win Condition Implementation
- [ ] Define victory area location and size
- [ ] Implement win condition detection logic
- [ ] Add level completion state management
- [ ] Test level progression to Level 2

### Task 5: Testing and Validation
- [ ] Test complete Level 1 gameplay flow
- [ ] Verify visual and behavioral consistency with original
- [ ] Performance testing for Level 1 operations
- [ ] Integration testing with entity and game systems

## Definition of Done

- [ ] Level 1 functions identically to original implementation
- [ ] All platforms and collision work exactly as before
- [ ] Fireball behavior matches original precisely  
- [ ] Win condition and level progression work correctly
- [ ] Performance metrics equal or exceed original
- [ ] Unit tests cover Level 1 specific logic
- [ ] Integration tests verify complete gameplay flow
- [ ] Level 1 integrates seamlessly with level management system

## Dependencies

- [US-011: Level Base Class and Interface](epic-3.1-level-base-class.md) must be completed
- [US-008: Secondary Entities Extraction](../stories/epic-2.3-secondary-entities.md) for Fireball entity
- [US-007: Player Entity Module](../stories/epic-2.2-player-entity.md) for player interaction

## Story Points Breakdown

- Level1 class implementation and platform setup: 1.5 points
- Fireball integration and behavior: 1 point  
- Win condition and testing: 0.5 points

## Testing Strategy

- Unit tests for Level 1 specific methods and win condition
- Integration tests for complete level gameplay
- Visual regression tests for platform appearance
- Performance benchmarks comparing to original
- Player interaction testing with all level elements

## Technical Notes

### Level 1 Configuration
```javascript
const LEVEL1_CONFIG = {
  name: 'Fireball Platformer',
  
  boundaries: { width: 800, height: 600 },
  spawnPoint: { x: 50, y: 450 },
  
  platforms: [
    // Ground platform
    { x: 0, y: 550, width: 800, height: 50, type: 'ground' },
    
    // Platforming obstacles
    { x: 200, y: 450, width: 100, height: 20, type: 'platform' },
    { x: 400, y: 350, width: 100, height: 20, type: 'platform' },
    { x: 600, y: 250, width: 100, height: 20, type: 'platform' },
    
    // Victory platform  
    { x: 700, y: 500, width: 80, height: 50, type: 'victory' }
  ],
  
  entities: [
    { type: 'fireball', x: 300, y: 400, config: { direction: 1, speed: 5 } },
    { type: 'fireball', x: 500, y: 300, config: { direction: -1, speed: 5 } },
    { type: 'fireball', x: 650, y: 200, config: { direction: 1, speed: 5 } }
  ],
  
  winCondition: {
    type: 'reach_area',
    target: { x: 700, y: 450, width: 80, height: 100 }
  }
}
```

### Level 1 Class Structure
```javascript
class Level1 extends Level {
  constructor() {
    super(LEVEL1_CONFIG)
    this.fireballs = []
  }
  
  load() {
    // Initialize platforms and spawn entities
    this.setupPlatforms()
    this.spawnFireballs()
  }
  
  update(deltaTime) {
    // Update fireball positions and check collisions
    this.updateFireballs(deltaTime)
    this.checkWinCondition()
  }
  
  render(ctx, camera) {
    // Render platforms and level-specific elements
    this.renderPlatforms(ctx)
    this.renderFireballs(ctx)
  }
  
  checkWinCondition() {
    // Check if player reached victory area
    return this.isPlayerInVictoryArea()
  }
  
  cleanup() {
    // Clean up level-specific resources
    this.fireballs = []
  }
}
```

### Critical Behaviors to Preserve
- Exact fireball movement speed and trajectory
- Platform collision precision for jumping mechanics
- Victory area detection sensitivity
- Level transition smoothness
- Visual consistency with original design