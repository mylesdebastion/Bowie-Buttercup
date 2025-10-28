# User Story US-0031.2: Raindrop Enemy System

**Story ID**: US-0031.2  
**Epic**: E0031 - Port Level 1 to Modular Architecture  
**Story Points**: 3  
**Priority**: High  
**Status**: Ready  
**Sprint**: 7  

## Story Description

**As a** player  
**I want** to avoid falling raindrops that splash when they hit surfaces  
**So that** I have dynamic obstacles to navigate around  

## Acceptance Criteria

### AC1: Raindrop Spawning
- [ ] 3 raindrops spawn at positions (200,100), (400,100), (600,100)
- [ ] Raindrops initialize with random horizontal velocity (-50 to +50 px/s)
- [ ] Initial vertical velocity is 0 (starts stationary, then falls)
- [ ] Raindrops are active and visible immediately on level start

### AC2: Raindrop Physics
- [ ] Raindrops fall with gravity acceleration (200 * dt/1000)
- [ ] Horizontal velocity remains constant during fall
- [ ] Raindrops reset to spawn position when hitting platforms (tile value = 1)
- [ ] Raindrops reset when falling below y > 450 (off-screen)

### AC3: Player Collision Effects
- [ ] Contact with player creates splash particle effect (5-10 particles)
- [ ] Player experiences brief slowdown (speed * 0.7 for 1 second)
- [ ] Collision plays gentle splash sound effect
- [ ] Raindrop resets position after player collision

### AC4: Visual Design
- [ ] Raindrop sprites are blue/cyan water droplets
- [ ] Droplet size approximately 12x12 pixels
- [ ] Splash particles are small blue/white dots
- [ ] Smooth animation as raindrops fall (no stuttering)

### AC5: Performance Requirements
- [ ] 3 concurrent raindrops maintain 60 FPS
- [ ] Smooth collision detection with no lag
- [ ] Efficient particle system for splash effects
- [ ] Memory usage remains stable during gameplay

## Technical Requirements

### RaindropEntity Class Structure
```javascript
class RaindropEntity extends Entity {
  constructor(x, y) {
    super(x, y, 12, 12); // 12x12 size
    this.vx = (Math.random() - 0.5) * 100; // -50 to +50
    this.vy = 0; // Starts stationary
    this.gravity = 200;
    this.spawnX = x;
    this.spawnY = y;
  }
  
  update(dt) {
    // Apply gravity
    this.vy += this.gravity * dt / 1000;
    
    // Update position
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;
    
    // Check platform collision
    this.checkPlatformCollision();
    
    // Reset if off-screen
    if (this.y > 450) this.reset();
  }
  
  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = (Math.random() - 0.5) * 100;
    this.vy = 0;
  }
}
```

### Integration Points
- **EntityManager**: Register and update raindrops
- **EntityFactory**: Create raindrop instances
- **PhysicsSystem**: Handle collision detection
- **ParticleSystem**: Generate splash effects
- **SoundSystem**: Play splash audio

## Development Tasks

### Task 1: Create RaindropEntity Class (60 min)
- [ ] Implement RaindropEntity extending Entity base class
- [ ] Add gravity physics and position updates
- [ ] Implement reset mechanism for collision/off-screen
- [ ] Add platform collision detection

### Task 2: Visual Assets & Rendering (45 min)
- [ ] Create blue/cyan raindrop sprite (12x12px)
- [ ] Implement raindrop rendering with proper scaling
- [ ] Add splash particle effect creation
- [ ] Test visual appearance matches design

### Task 3: Player Interaction System (60 min)
- [ ] Implement collision detection with player entity
- [ ] Add temporary speed reduction effect (0.7x for 1s)
- [ ] Create splash particle burst on collision
- [ ] Add splash sound effect trigger

### Task 4: Entity System Integration (45 min)
- [ ] Register RaindropEntity in EntityFactory
- [ ] Add raindrops to Level1 initialization
- [ ] Integrate with EntityManager update loop
- [ ] Test entity lifecycle (spawn, update, collision, reset)

### Task 5: Performance & Polish (30 min)
- [ ] Optimize rendering for 3 concurrent raindrops
- [ ] Ensure consistent 60 FPS performance
- [ ] Fine-tune collision detection accuracy
- [ ] Add any missing visual polish

## Testing Strategy

### Unit Tests
- RaindropEntity physics calculations
- Collision detection accuracy
- Reset mechanism functionality
- Particle effect generation

### Integration Tests
- EntityManager integration
- Level1 raindrop spawning
- Player collision effects
- Performance under load

### Visual & Gameplay Tests
- Raindrop visual appearance
- Splash effects quality
- Player slowdown feels natural
- Sound effect timing

## Definition of Done

- [ ] 3 raindrops spawn and behave according to physics
- [ ] Player collision creates appropriate splash effects
- [ ] Visual design matches blue/cyan water theme
- [ ] Performance maintains 60 FPS with all effects
- [ ] Sound effects enhance the experience
- [ ] Unit and integration tests pass
- [ ] Code reviewed and merged

## Dependencies

- **Entity System**: Entity base class and EntityManager
- **Physics System**: Collision detection framework
- **Particle System**: Splash effect generation
- **Asset Pipeline**: Raindrop sprite and sound assets
- **Platform System**: US-0031.1 must be complete for collision

## Risk Assessment

- **Medium Risk**: Collision detection timing critical for gameplay feel
- **Low Risk**: Visual effects should be straightforward to implement
- **Low Risk**: Physics are well-understood from monolithic version

## Notes

- Raindrops replace fireballs but maintain equivalent gameplay challenge
- Splash theme should feel cohesive with overall cat/water design
- Performance is critical with 3 entities + particles + collision detection

---

**Created**: 2025-08-27  
**Assigned**: Development Team  
**Reviewer**: Game Design Team