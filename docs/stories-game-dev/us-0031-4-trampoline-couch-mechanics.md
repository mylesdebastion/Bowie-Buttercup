# User Story US-0031.4: Trampoline Couch Mechanics

**Story ID**: US-0031.4  
**Epic**: E0031 - Port Level 1 to Modular Architecture  
**Story Points**: 2  
**Priority**: Medium  
**Status**: Ready  
**Sprint**: 7  

## Story Description

**As a** player  
**I want** the red couch to bounce me higher as in the original  
**So that** I can reach higher platforms and shortcuts  

## Acceptance Criteria

### AC1: Couch Positioning & Visual
- [ ] Red couch positioned at y=23, x=12-13 (2 tiles wide)
- [ ] Couch visual matches monolithic version (red upholstered texture)
- [ ] Couch rendered above regular platform tiles
- [ ] Couch collision area matches visual bounds exactly

### AC2: Bounce Physics
- [ ] Bounce force = -physics.jumpForce * 1.5 (stronger than normal jump)
- [ ] Player must be falling (vy > 0) to trigger bounce
- [ ] Player must contact couch from above (collision from top only)
- [ ] Bounce immediately sets player.vy to bounce force value

### AC3: Bounce Effects
- [ ] 10 bounce particles spawn on contact (white/gold particles)
- [ ] Jump sound effect plays on successful bounce
- [ ] Brief visual feedback (couch compression animation optional)
- [ ] Player state briefly shows "bouncing" animation

### AC4: Strategic Gameplay
- [ ] Couch enables reaching Platform 2 (y=18) more easily
- [ ] Bounce height allows access to Higher Platform (y=15)
- [ ] Positioned strategically near puddle hazard for risk/reward
- [ ] Multiple bounces possible (no cooldown restriction)

### AC5: Edge Cases & Polish
- [ ] Side collision with couch acts like normal platform
- [ ] No bounce if player jumps onto couch (vy ≤ 0)
- [ ] Bounce works consistently from all valid approach angles
- [ ] Smooth integration with existing platform collision system

## Technical Requirements

### Couch Tile Implementation
```javascript
// Level tile values
const COUCH_TILE = 3; // Red couch trampoline tile

// Collision detection in PhysicsSystem
checkPlatformCollision(player, level) {
  const tileX = Math.floor((player.x + player.width/2) / 16);
  const tileY = Math.floor((player.y + player.height) / 16);
  const tile = level[tileY] && level[tileY][tileX];
  
  if (tile === COUCH_TILE && player.vy > 0) {
    // Trampoline bounce
    player.y = tileY * 16 - player.height;
    player.vy = -physics.jumpForce * 1.5;
    this.createBounceEffect(player);
    this.playSound('bounce');
  }
}
```

### Bounce Effect System
```javascript
createBounceEffect(player) {
  // Create 10 bounce particles
  for (let i = 0; i < 10; i++) {
    const particle = new Particle({
      x: player.x + player.width/2,
      y: player.y + player.height,
      vx: (Math.random() - 0.5) * 100,
      vy: -Math.random() * 150 - 50,
      color: '#FFD700', // Gold color
      life: 800
    });
    this.particleSystem.add(particle);
  }
}
```

## Development Tasks

### Task 1: Couch Tile Rendering (30 min)
- [ ] Create red couch sprite/texture (32x16 for 2 tiles)
- [ ] Implement couch tile rendering in level system
- [ ] Position couch at y=23, x=12-13 in Level1
- [ ] Test visual appearance matches monolithic version

### Task 2: Bounce Collision Detection (45 min)
- [ ] Modify PhysicsSystem to detect couch tiles (value = 3)
- [ ] Implement bounce condition (vy > 0, contact from above)
- [ ] Calculate bounce force (-physics.jumpForce * 1.5)
- [ ] Ensure bounce replaces normal platform collision

### Task 3: Bounce Effects Implementation (45 min)
- [ ] Create bounce particle effect (10 gold particles)
- [ ] Add bounce sound effect trigger
- [ ] Implement brief couch compression visual (optional)
- [ ] Add bouncing animation state to player

### Task 4: Strategic Balance Testing (30 min)
- [ ] Test couch enables reaching higher platforms
- [ ] Verify positioning creates interesting risk/reward with puddle
- [ ] Ensure multiple bounces work smoothly
- [ ] Test bounce feels responsive and fun

### Task 5: Edge Case Handling (30 min)
- [ ] Handle side collisions (treat as normal platform)
- [ ] Prevent bounce when player jumps onto couch (vy ≤ 0)
- [ ] Test corner cases and approach angles
- [ ] Integration testing with existing collision system

## Testing Strategy

### Unit Tests
- Couch collision detection accuracy
- Bounce force calculations
- Particle effect generation
- Sound effect triggering

### Integration Tests
- Level1 couch placement and rendering
- PhysicsSystem bounce integration
- Player state during bounce sequence
- Performance with bounce effects

### Gameplay Tests
- Strategic value for reaching platforms
- Bounce timing and responsiveness
- Risk/reward balance near puddle hazard
- Player satisfaction with bounce feel

## Definition of Done

- [ ] Red couch positioned exactly as in monolithic version
- [ ] Bounce mechanics work identically to original
- [ ] Bounce effects enhance player feedback
- [ ] Strategic gameplay value maintained
- [ ] Edge cases handled gracefully
- [ ] Performance maintains 60 FPS
- [ ] Unit and integration tests pass
- [ ] Code reviewed and merged

## Dependencies

- **Platform System**: US-0031.1 for base collision system
- **Physics System**: Existing collision and gravity mechanics
- **Particle System**: For bounce effect particles
- **Asset Pipeline**: Couch sprite and bounce sound
- **Player Entity**: Existing animation states

## Risk Assessment

- **Low Risk**: Couch mechanics are well-understood from monolithic
- **Low Risk**: Simple tile-based collision with modified response
- **Medium Risk**: Bounce timing must feel responsive and fun

## Notes

- Couch provides strategic shortcuts and interesting navigation options
- Positioning near puddle creates risk/reward decision making
- Bounce effects should feel satisfying and responsive
- Implementation should be extensible for other bounce surfaces

---

**Created**: 2025-08-27  
**Assigned**: Development Team  
**Reviewer**: Game Design Team