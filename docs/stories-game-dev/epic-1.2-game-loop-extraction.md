# US-002: Game Loop Extraction

**Story ID**: US-002  
**Epic**: [Epic 1: Core Architecture Setup](../epics-game-dev/epic-e001-foundation.md)  
**Story Points**: 5  
**Priority**: High  
**Sprint**: Week 1, Days 3-4  

## User Story

**As a** developer  
**I want** the main game loop extracted to a Game class  
**So that** I can understand the core architecture and have a clear entry point for game logic  

## Business Value

Creates the foundational architecture pattern that all other modules will follow, making the codebase more maintainable and extensible.

## Acceptance Criteria

### AC-001: Game Class Implementation
- **Given** I have the build system set up
- **When** I create the Game.js class
- **Then** it manages the complete game lifecycle (init, update, render, cleanup)
- **And** the game loop timing is identical to the original (60 FPS target)
- **And** all original game functionality is preserved

### AC-002: Lifecycle Management
- **Given** the Game class is implemented
- **When** the game starts
- **Then** initialization occurs in proper sequence
- **And** the update loop runs at consistent intervals
- **And** rendering happens after all updates complete
- **And** cleanup properly releases resources when game ends

### AC-003: Performance Preservation
- **Given** the modular Game class is running
- **When** I measure performance metrics
- **Then** frame rate matches or exceeds original (60 FPS)
- **And** memory usage is comparable to monolithic version
- **And** startup time is equal or faster

### AC-004: Integration with Build System
- **Given** the Game class is complete
- **When** I use hot module replacement
- **Then** game state is preserved during code changes where possible
- **And** changes to Game.js are reflected without full page reload
- **And** debugging is improved with modular architecture

## Technical Tasks

### Task 1: Game Class Architecture Design
- [ ] Design Game class interface and public API
- [ ] Define game lifecycle methods (init, start, pause, resume, stop)
- [ ] Plan integration points for future modules
- [ ] Create JSDoc documentation for all public methods

### Task 2: Game Loop Implementation  
- [ ] Extract main game loop from monolithic code
- [ ] Implement requestAnimationFrame-based update cycle
- [ ] Preserve exact timing and delta time calculations
- [ ] Handle frame rate limiting and performance monitoring

### Task 3: Initialization System
- [ ] Extract game initialization sequence
- [ ] Create proper startup order for all systems
- [ ] Implement error handling for initialization failures
- [ ] Add loading state management

### Task 4: State Management Integration
- [ ] Connect Game class to StateManager for persistence
- [ ] Implement game state transitions (menu, playing, paused)
- [ ] Handle browser lifecycle events (visibility, focus)
- [ ] Add proper cleanup on page unload

### Task 5: Testing and Validation
- [ ] Create unit tests for Game class methods
- [ ] Implement performance benchmarking
- [ ] Test game lifecycle edge cases
- [ ] Verify functionality across all target browsers

## Definition of Done

- [ ] Game.js class fully implements original game loop logic
- [ ] All lifecycle methods tested and documented
- [ ] Performance metrics equal or exceed original
- [ ] Unit tests achieve 95% coverage for Game class
- [ ] Integration with build system working perfectly
- [ ] Cross-browser compatibility verified
- [ ] Hot module replacement functional for game loop changes

## Dependencies

- [US-001: Modern Build System Setup](epic-1.1-build-system-setup.md) must be completed
- Original game timing behavior must be thoroughly understood

## Story Points Breakdown

- Architecture design and planning: 1 point
- Game loop extraction and implementation: 2 points
- Lifecycle management: 1.5 points
- Testing and performance validation: 0.5 points

## Testing Strategy

- Unit tests for all Game class methods
- Performance regression tests comparing to original
- Cross-browser functional testing
- Memory leak detection during long gameplay sessions
- Frame rate monitoring and alerting

## Technical Notes

### Original Game Loop Structure
The monolithic version uses a specific timing pattern that must be preserved:
- requestAnimationFrame for smooth rendering
- Delta time calculations for frame-independent movement
- Fixed update intervals for physics calculations
- Specific order of update/render operations

### Performance Considerations
- Avoid creating objects in update loop
- Maintain object pools for frequently created items
- Preserve original rendering order for visual consistency
- Monitor garbage collection impact on frame timing