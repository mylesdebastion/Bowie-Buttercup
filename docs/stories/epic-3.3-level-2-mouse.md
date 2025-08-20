# US-013: Level 2 Mouse Catching Arena

**Story ID**: US-013  
**Epic**: [Epic 3: Level System Architecture](../epics/epic-3-level-system.md)  
**Story Points**: 3  
**Priority**: High  
**Sprint**: Week 3, Day 1  

## User Story

**As a** developer  
**I want** Level 2 (Mouse Catching Arena) extracted to its own module  
**So that** the mouse spawning mechanics and arena gameplay can be maintained and enhanced independently  

## Business Value

Level 2 introduces the mouse catching mechanic which is unique to this level. Proper extraction ensures this gameplay mechanic remains precise while enabling future enhancements.

## Acceptance Criteria

### AC-001: Arena Layout Preservation
- **Given** Level 2 is loaded
- **When** the player enters the arena
- **Then** arena boundaries and layout match original exactly
- **And** collision detection with arena walls works identically
- **And** visual appearance of the arena is preserved

### AC-002: Mouse Spawning Behavior
- **Given** Level 2 is active
- **When** mice spawn in the arena
- **Then** mouse spawning timing, locations, and frequency match original
- **And** mouse movement patterns are identical
- **And** mouse collision and catching mechanics work exactly

### AC-003: Win Condition Implementation
- **Given** the player is catching mice in Level 2
- **When** the win condition is met
- **Then** level completion is detected correctly
- **And** level transition to Level 3 works smoothly
- **And** score/progress tracking works identically

### AC-004: Level Performance
- **Given** Level 2 is running with multiple mice
- **When** performance is measured
- **Then** frame rate equals or exceeds original with many mice active
- **And** mouse spawning doesn't cause performance drops
- **And** memory management is efficient for mouse entities

## Technical Tasks

### Task 1: Level2 Class Implementation
- [ ] Create Level2 class inheriting from Level base class
- [ ] Extract arena layout from original code
- [ ] Define arena boundaries and spawn point
- [ ] Implement mouse spawning configuration

### Task 2: Arena System Setup
- [ ] Implement arena boundary collision
- [ ] Add arena visual elements and rendering
- [ ] Ensure proper player movement within arena
- [ ] Test arena collision detection accuracy

### Task 3: Mouse Management System
- [ ] Configure mouse spawning patterns and timing
- [ ] Implement mouse movement AI within arena bounds
- [ ] Add mouse-player collision detection for catching
- [ ] Implement mouse cleanup and respawning logic

### Task 4: Win Condition Implementation
- [ ] Define mouse catching requirements for victory
- [ ] Implement score/catch tracking system
- [ ] Add level completion state management
- [ ] Test level progression to Level 3

### Task 5: Testing and Validation
- [ ] Test complete Level 2 gameplay flow
- [ ] Verify mouse behavior matches original exactly
- [ ] Performance testing with maximum mouse count
- [ ] Integration testing with mouse entities

## Definition of Done

- [ ] Level 2 functions identically to original implementation
- [ ] Mouse spawning and movement behavior matches exactly
- [ ] Mouse catching mechanics work precisely as before
- [ ] Win condition and level progression work correctly
- [ ] Performance handles multiple mice efficiently
- [ ] Unit tests cover Level 2 specific logic
- [ ] Integration tests verify complete gameplay flow
- [ ] Level 2 integrates seamlessly with level management system

## Dependencies

- [US-011: Level Base Class and Interface](epic-3.1-level-base-class.md) must be completed
- [US-008: Secondary Entities Extraction](../stories/epic-2.3-secondary-entities.md) for Mouse entity
- [US-007: Player Entity Module](../stories/epic-2.2-player-entity.md) for player-mouse interaction

## Story Points Breakdown

- Level2 class and arena setup: 1.5 points
- Mouse management and behavior: 1 point
- Win condition and testing: 0.5 points

## Testing Strategy

- Unit tests for mouse spawning and catching logic
- Integration tests for arena gameplay
- Performance tests with multiple mice active
- Mouse AI behavior verification tests
- Win condition accuracy tests

## Technical Notes

### Level 2 Configuration
```javascript
const LEVEL2_CONFIG = {
  name: 'Mouse Catching Arena',
  
  boundaries: { width: 800, height: 600 },
  spawnPoint: { x: 400, y: 300 },
  
  // Arena boundaries
  platforms: [
    { x: 0, y: 0, width: 800, height: 20, type: 'wall' },      // top
    { x: 0, y: 580, width: 800, height: 20, type: 'wall' },    // bottom  
    { x: 0, y: 0, width: 20, height: 600, type: 'wall' },      // left
    { x: 780, y: 0, width: 20, height: 600, type: 'wall' }     // right
  ],
  
  // Mouse spawning configuration
  mouseSpawning: {
    maxMice: 5,
    spawnInterval: 180, // frames
    spawnAreas: [
      { x: 50, y: 50, width: 700, height: 500 }
    ]
  },
  
  winCondition: {
    type: 'catch_mice',
    target: { count: 10, timeLimit: 60 } // catch 10 mice in 60 seconds
  }
}
```