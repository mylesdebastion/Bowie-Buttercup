# User Story US-0031.3: Puddle Hazard System

**Story ID**: US-0031.3  
**Epic**: E0031 - Port Level 1 to Modular Architecture  
**Story Points**: 2  
**Priority**: High  
**Status**: Ready  
**Sprint**: 7  

## Story Description

**As a** player  
**I want** puddles to slow me down temporarily instead of causing damage  
**So that** the hazard feels appropriate for a cat character  

## Acceptance Criteria

### AC1: Puddle Location & Size
- [ ] Puddle located at y>26, x=15-19 (same position as original lava pit)
- [ ] Puddle rendered below ground level (y=27-29 visible)
- [ ] 5 tiles wide (x=15,16,17,18,19) matching original hazard size
- [ ] Blue water texture instead of red lava texture

### AC2: Wet Cat Mechanics
- [ ] Contact triggers "wet cat" animation state
- [ ] Player movement speed reduced by 50% for 2 seconds
- [ ] Cat sprite shows wet/shivering animation during effect
- [ ] Effect timer displayed or visually indicated to player

### AC3: Water Splash Effects
- [ ] Water splash particles appear on contact (8-12 blue particles)
- [ ] Splash particles have realistic water physics (arc and fall)
- [ ] Gentle splash sound effect plays on contact
- [ ] No splash if player already wet (prevents spam)

### AC4: Recovery Animation
- [ ] Cat shakes off water with brief animation after 2-second effect
- [ ] Shake animation lasts 0.5 seconds
- [ ] Player returns to normal speed after shake animation
- [ ] Visual indicator that effect has ended

### AC5: Gameplay Balance
- [ ] Speed reduction feels fair (challenging but not frustrating)
- [ ] Multiple puddle contacts don't stack effects
- [ ] Player can still jump normally while wet
- [ ] Wet state doesn't affect other mechanics (climbing, dodging)

## Technical Requirements

### Puddle System Integration
```javascript
// Level tile definition
const PUDDLE_TILE = 2; // Replace lava tile value

// Player state management
class PlayerEntity extends Entity {
  constructor() {
    super();
    this.isWet = false;
    this.wetTimer = 0;
    this.wetSpeedMultiplier = 0.5;
    this.wetDuration = 2000; // 2 seconds
  }
  
  handlePuddleContact() {
    if (!this.isWet) {
      this.isWet = true;
      this.wetTimer = this.wetDuration;
      this.createSplashParticles();
      this.playSound('splash');
    }
  }
  
  update(dt) {
    // Handle wet state
    if (this.isWet) {
      this.wetTimer -= dt;
      if (this.wetTimer <= 0) {
        this.shakeOffWater();
      }
    }
    
    // Apply speed reduction
    const speedMultiplier = this.isWet ? this.wetSpeedMultiplier : 1.0;
    // Apply to movement calculations...
  }
}
```

### Visual & Audio Assets
- **Puddle Texture**: Blue water with subtle animation/ripples
- **Wet Cat Sprite**: Modified player sprite with water droplets
- **Splash Particles**: Small blue/white water droplets
- **Splash Sound**: Gentle water splash effect
- **Shake Animation**: Brief side-to-side shake motion

## Development Tasks

### Task 1: Puddle Rendering System (45 min)
- [ ] Replace lava texture with blue water puddle texture
- [ ] Implement puddle tile rendering at correct position (y>26, x=15-19)
- [ ] Add subtle water animation/ripple effect (optional)
- [ ] Test visual appearance matches water theme

### Task 2: Wet Cat State Management (60 min)
- [ ] Add wet state properties to PlayerEntity
- [ ] Implement wetTimer countdown system
- [ ] Add speed reduction during wet state
- [ ] Create wet cat sprite/animation state

### Task 3: Collision & Effects System (60 min)
- [ ] Implement puddle collision detection (tile value = 2)
- [ ] Create splash particle effect generation
- [ ] Add splash sound effect trigger
- [ ] Prevent effect stacking with multiple contacts

### Task 4: Recovery & Shake Animation (45 min)
- [ ] Implement shake-off animation sequence
- [ ] Add visual transition from wet to dry state
- [ ] Restore normal movement speed after recovery
- [ ] Test complete wet->recovery->normal cycle

### Task 5: Integration & Polish (30 min)
- [ ] Integrate with Level1 tile system
- [ ] Test gameplay feel and balance
- [ ] Fine-tune timing and visual effects
- [ ] Ensure consistent 60 FPS performance

## Testing Strategy

### Unit Tests
- Wet state timer functionality
- Speed reduction calculations
- Collision detection with puddle tiles
- Animation state transitions

### Integration Tests
- Level1 puddle integration
- Player state management
- Particle and sound effects
- Performance with all effects active

### Gameplay Tests
- Speed reduction feels balanced
- Visual feedback is clear
- Recovery timing is appropriate
- Multiple contact handling

## Definition of Done

- [ ] Puddle hazard replaces lava pit at exact same location
- [ ] Wet cat mechanics work smoothly with proper timing
- [ ] Water splash effects enhance the experience
- [ ] Recovery animation provides clear feedback
- [ ] Gameplay balance feels fair and engaging
- [ ] Performance maintains 60 FPS
- [ ] Unit and integration tests pass
- [ ] Code reviewed and merged

## Dependencies

- **Platform System**: US-0031.1 for tile collision system
- **Player Entity**: Existing player state management
- **Particle System**: For splash effects
- **Asset Pipeline**: Water textures and sound effects
- **Animation System**: For wet cat and shake animations

## Risk Assessment

- **Medium Risk**: Animation timing critical for good player experience
- **Low Risk**: Water theme is well-established and straightforward
- **Low Risk**: Speed reduction mechanic is simple to implement

## Notes

- This conversion makes the hazard more thematically appropriate for cats
- Speed reduction provides challenge without frustration
- Water theme creates cohesive experience with raindrop enemies
- Multiple puddle contacts should be handled gracefully

---

**Created**: 2025-08-27  
**Assigned**: Development Team  
**Reviewer**: Game Design Team