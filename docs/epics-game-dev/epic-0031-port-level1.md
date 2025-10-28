# Epic 0031: Port Level 1 to Modular Architecture

**Epic ID**: E0031  
**Epic Name**: Port Level 1 to Modular Architecture  
**Priority**: High  
**Status**: Planning  
**Sprint**: 7  
**Story Points**: 13  

## Epic Overview

Port the fully functional Level 1 from the monolithic `index.html` to our modular `src/` architecture, converting fireballs to raindrops and lava pits to puddles for a more cohesive cat-friendly theme.

## Business Value

- **Complete Level System**: Establishes Level 1 as the foundation for all subsequent levels
- **Theme Consistency**: Rain/puddle theme is more appropriate for a cat platformer  
- **Modular Validation**: Proves our architecture can handle complex level mechanics
- **User Experience**: Provides engaging gameplay with progressive difficulty

## Success Criteria

- [ ] Level 1 renders identically to monolithic version (platforms, layout, mechanics)
- [ ] Raindrops replace fireballs with equivalent physics and collision
- [ ] Puddles replace lava pits with splash effects instead of burning
- [ ] Player can complete level by reaching x > 750
- [ ] Trampoline couch mechanics preserved exactly
- [ ] Performance matches or exceeds monolithic version
- [ ] Visual regression testing passes

## Technical Requirements

### Current Monolithic Implementation Analysis
- **Grid System**: 50×30 tiles (16px each = 800×480 game area)
- **Platform Layout**: 6 distinct platforms at varying heights
- **Enemy System**: 3 fireballs with physics and collision
- **Hazard System**: Lava pit with damage mechanics
- **Interactive Elements**: Red couch trampoline with bounce
- **Victory Condition**: Reach x > 750 position

### Theme Conversion Specifications
- **Fireballs → Raindrops**:
  - Visual: Blue/cyan droplet sprite instead of orange flame
  - Physics: Same gravity (200 * dt/1000) and collision detection
  - Effect: "Splash" particle effect instead of fire particles
  - Sound: Gentle splash sound instead of fire sound

- **Lava Pit → Puddles**:
  - Visual: Blue water puddle texture instead of red lava
  - Mechanics: Cat gets wet/shivering animation instead of burning
  - Effect: Water splash particles, temporary speed reduction
  - Recovery: Shaking off water animation after 2 seconds

## User Stories

### US-0031.1: Platform Layout Implementation
**As a** player  
**I want** Level 1 to have the exact same platform layout as the monolithic version  
**So that** I can navigate the familiar level structure  

**Acceptance Criteria:**
- [ ] Main ground platform at y=25 (full width)
- [ ] Platform 1 at y=20, x=10-14 (5 tiles wide)
- [ ] Platform 2 at y=18, x=20-24 (5 tiles wide, higher)
- [ ] Platform 3 at y=22, x=30-34 (5 tiles wide, mid-height)
- [ ] Higher Platform at y=15, x=25-29 (5 tiles wide, highest)
- [ ] Final Platform at y=16, x=40-44 (5 tiles wide, high)
- [ ] All platforms have proper collision detection

### US-0031.2: Raindrop Enemy System
**As a** player  
**I want** to avoid falling raindrops that splash when they hit surfaces  
**So that** I have dynamic obstacles to navigate around  

**Acceptance Criteria:**
- [ ] 3 raindrops spawn at positions (200,100), (400,100), (600,100)
- [ ] Raindrops have random horizontal velocity (-50 to +50 px/s)
- [ ] Raindrops fall with gravity (200 * dt/1000 acceleration)
- [ ] Raindrops reset position when hitting platforms or y > 450
- [ ] Contact with player creates splash effect and brief slowdown
- [ ] Raindrop sprites are blue/cyan water droplets

### US-0031.3: Puddle Hazard System  
**As a** player  
**I want** puddles to slow me down temporarily instead of causing damage  
**So that** the hazard feels appropriate for a cat character  

**Acceptance Criteria:**
- [ ] Puddle located at y>26, x=15-19 (same position as lava pit)
- [ ] Contact triggers "wet cat" animation state
- [ ] Player movement speed reduced by 50% for 2 seconds
- [ ] Water splash particles appear on contact
- [ ] Cat shakes off water with brief animation after effect ends
- [ ] Blue water texture instead of red lava texture

### US-0031.4: Trampoline Couch Mechanics
**As a** player  
**I want** the red couch to bounce me higher as in the original  
**So that** I can reach higher platforms and shortcuts  

**Acceptance Criteria:**  
- [ ] Red couch at y=23, x=12-13 (2 tiles wide)
- [ ] Bounce force = -physics.jumpForce * 1.5 (higher than normal jump)
- [ ] Bounce particles spawn on contact (10 particles)
- [ ] Jump sound effect plays on bounce
- [ ] Player must be falling (vy > 0) to trigger bounce
- [ ] Couch visual matches monolithic version

### US-0031.5: Level Victory Condition
**As a** player  
**I want** to complete Level 1 by reaching the right side of the screen  
**So that** I can progress to Level 2  

**Acceptance Criteria:**
- [ ] Victory triggers when player.x > 750
- [ ] `goalReached` flag prevents multiple triggers
- [ ] Smooth transition to Level 2 
- [ ] Victory time and score recorded
- [ ] Level completion celebration effect
- [ ] Progress saved to state manager

### US-0031.6: Visual Regression Testing
**As a** developer  
**I want** automated visual comparison between monolithic and modular Level 1  
**So that** I can ensure pixel-perfect accuracy  

**Acceptance Criteria:**
- [ ] Screenshot comparison test for Level 1 layout
- [ ] Raindrop vs fireball visual comparison documented  
- [ ] Puddle vs lava visual comparison documented
- [ ] Performance benchmark comparison (FPS, memory)
- [ ] Collision detection accuracy verification
- [ ] All tests pass in CI/CD pipeline

## Technical Implementation Plan

### Phase 1: Level Structure Port (3 SP)
1. **Extract Level 1 Data**: Copy level generation logic from monolithic
2. **Integrate with LevelManager**: Ensure proper loading/initialization  
3. **Platform Collision**: Verify all platform collision detection works
4. **Camera System**: Ensure proper camera following for Level 1 bounds

### Phase 2: Raindrop Enemy System (4 SP)
1. **Create RaindropEntity**: Port fireball physics to raindrop mechanics
2. **Visual Assets**: Create blue raindrop sprite and splash animations
3. **Collision System**: Implement splash effect instead of damage
4. **Entity Integration**: Add to EntityManager and EntityFactory
5. **Performance Optimization**: Ensure smooth rendering of 3 concurrent raindrops

### Phase 3: Puddle Hazard System (3 SP)  
1. **Puddle Rendering**: Replace lava texture with water puddle texture
2. **Wet Cat Mechanics**: Implement temporary speed reduction effect
3. **Water Animations**: Add splash particles and shake-off animation
4. **State Management**: Track wet/dry state in StateManager
5. **Visual Polish**: Ensure water effects look natural and appealing

### Phase 4: Integration & Testing (3 SP)
1. **Level Completion Flow**: Implement victory condition and progression
2. **Visual Regression Testing**: Set up automated screenshot comparison
3. **Performance Testing**: Benchmark against monolithic version
4. **Bug Fixes**: Address any issues found during testing
5. **Documentation**: Update level design documentation

## Dependencies

- **Core Systems**: StateManager, EntityManager, LevelManager must be functional
- **Asset Pipeline**: Need raindrop sprites and water texture assets
- **Physics System**: Collision detection and particle systems required
- **Testing Infrastructure**: Visual regression testing setup needed

## Risk Assessment

- **Medium Risk**: Theme conversion may affect gameplay balance
- **Low Risk**: Level complexity is well-understood from monolithic version
- **Low Risk**: Modular architecture has been proven with basic functionality

## Definition of Done

- [ ] Level 1 functionally identical to monolithic version
- [ ] Raindrop and puddle themes fully implemented
- [ ] All user stories accepted by product owner
- [ ] Visual regression tests passing
- [ ] Performance benchmarks meet or exceed targets
- [ ] Code reviewed and merged to main branch
- [ ] Documentation updated

## Notes

- This epic establishes the pattern for porting remaining levels (2-5)
- Rain/water theme provides cohesive visual identity for the game
- Success here validates our modular architecture for complex gameplay

---

**Created**: 2025-08-27  
**Last Updated**: 2025-08-27  
**Epic Owner**: Game Development Team  
**Stakeholders**: Level Design, Art, QA, Platform Integration