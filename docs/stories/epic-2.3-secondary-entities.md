# US-008: Secondary Entities Extraction

**Story ID**: US-008  
**Epic**: [Epic 2: Entity System Modularization](../epics/epic-2-entity-system.md)  
**Story Points**: 10  
**Priority**: High  
**Sprint**: Week 2, Days 3-4  

## User Story

**As a** developer  
**I want** Dog, Mouse, Fireball, and Particle entities extracted to separate modules  
**So that** each entity type can be modified independently while preserving their unique behaviors and interactions  

## Business Value

These entities provide the core gameplay challenge and visual effects. Modularizing them enables independent development of new enemy types and effects while maintaining the carefully tuned gameplay balance.

## Acceptance Criteria

### AC-001: Dog Entity Module
- **Given** the Dog entity is extracted
- **When** it appears in Level 4
- **Then** bouncing behavior is identical to original (timing, height, collision)
- **And** collision with player produces exact same interaction
- **And** visual appearance and animation match original

### AC-002: Mouse Entity Module  
- **Given** the Mouse entity is extracted
- **When** it spawns and moves in Level 2
- **Then** movement patterns are identical (speed, direction changes)
- **And** player collision and catching mechanics work exactly
- **And** spawn timing and positioning match original

### AC-003: Fireball Entity Module
- **Given** the Fireball entity is extracted  
- **When** it moves through Level 1
- **Then** trajectory and physics match original precisely
- **And** collision detection with player and platforms works identically
- **And** visual effects (trail, glow) are preserved

### AC-004: Particle System Module
- **Given** the Particle system is extracted
- **When** effects are triggered in game
- **Then** all particle behaviors match original (movement, lifecycle, appearance)
- **And** performance impact is identical or better
- **And** particle pooling and memory management is efficient

## Technical Tasks

### Task 1: Dog Entity Implementation
- [ ] Extract Dog class inheriting from Entity base
- [ ] Implement bouncing physics and collision behavior  
- [ ] Preserve bounce timing and height characteristics
- [ ] Add collision interaction with Player and platforms
- [ ] Test Dog behavior in Level 4 context

### Task 2: Mouse Entity Implementation
- [ ] Extract Mouse class with movement AI
- [ ] Implement mouse spawning and despawning logic
- [ ] Preserve exact movement speed and direction patterns
- [ ] Add Player collision detection and catching mechanics
- [ ] Test Mouse behavior in Level 2 arena

### Task 3: Fireball Entity Implementation
- [ ] Extract Fireball class with projectile physics
- [ ] Implement straight-line movement with collision
- [ ] Preserve trajectory accuracy and collision detection
- [ ] Add visual effects (trail rendering if present)
- [ ] Test Fireball behavior in Level 1 platformer

### Task 4: Particle System Implementation
- [ ] Extract Particle class and ParticleSystem manager
- [ ] Implement particle lifecycle management
- [ ] Preserve particle physics and visual properties
- [ ] Create efficient particle pooling system
- [ ] Test all particle effects throughout game

### Task 5: Entity Integration Testing
- [ ] Test all entity interactions with Player
- [ ] Verify entity-to-entity collision scenarios
- [ ] Validate entity spawning and lifecycle management
- [ ] Test entity behavior across all levels
- [ ] Performance test entity update/render cycles

## Definition of Done

- [ ] All secondary entities behave identically to original
- [ ] Entity interactions preserve exact game mechanics
- [ ] Performance metrics equal or exceed original for all entities
- [ ] Visual appearance and effects match original exactly
- [ ] Unit tests cover all entity behaviors and edge cases
- [ ] Integration tests verify entity interactions work correctly
- [ ] Memory usage patterns are efficient (no leaks)
- [ ] Cross-browser compatibility confirmed for all entities

## Dependencies

- [US-006: Entity Base Class Architecture](epic-2.1-entity-base-class.md) must be completed
- [US-007: Player Entity Module](epic-2.2-player-entity.md) for interaction testing
- Understanding of original entity AI and physics behaviors

## Story Points Breakdown

- Dog entity extraction and testing: 2.5 points
- Mouse entity extraction and testing: 2.5 points  
- Fireball entity extraction and testing: 2 points
- Particle system extraction: 2 points
- Integration testing and validation: 1 point

## Testing Strategy

- Unit tests for each entity's update/render/collision methods
- Entity interaction testing (Dog-Player, Mouse-Player, etc.)
- Visual regression tests for entity appearance
- Performance benchmarks for entity operations
- Memory leak testing for particle systems
- Cross-level entity behavior consistency tests

## Technical Notes

### Dog Entity Specifications
```javascript
class Dog extends Entity {
  // Bouncing behavior constants
  BOUNCE_HEIGHT: 150,
  BOUNCE_SPEED: 8,
  BOUNCE_TIMING: 60 // frames
  
  // Collision affects player movement
  onCollision(player) {
    // Exact collision response preservation required
  }
}
```

### Mouse Entity Specifications  
```javascript
class Mouse extends Entity {
  // Movement AI constants
  SPEED: 2,
  DIRECTION_CHANGE_INTERVAL: 90, // frames
  SPAWN_FREQUENCY: 180, // frames
  
  // Catching mechanics
  onCaught(player) {
    // Player score/progress update logic
  }
}
```

### Fireball Entity Specifications
```javascript
class Fireball extends Entity {
  // Physics constants  
  SPEED: 5,
  GRAVITY_AFFECTED: false,
  
  // Collision with platforms and player
  checkCollisions(platforms, player) {
    // Precise collision detection required
  }
}
```

### Particle System Requirements
- Support multiple particle types (different effects)
- Efficient object pooling to prevent GC pressure  
- Flexible property system (position, velocity, life, color)
- Integration with main render loop
- Minimal performance overhead

### Critical Testing Scenarios
- Dog bouncing pattern consistency
- Mouse spawning randomization preservation
- Fireball collision accuracy with platforms
- Particle effect performance with many particles active
- Entity cleanup when levels change