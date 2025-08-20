# US-029: Fix Pit Collision Detection

**Story ID**: US-029  
**Epic**: [Epic 2: Entity System Modularization](../epics/epic-2-entity-system.md)  
**Story Points**: 3  
**Priority**: High  
**Sprint**: Week 2, Day 5  
**Issue**: [GitHub Issue #1](https://github.com/mylesdebastion/Bowie-Buttercup/issues/1)

## User Story

**As a** player  
**I want** the cat to fall into pits when walking over them  
**So that** the game has proper hazard mechanics and challenging gameplay  

## Business Value

Critical gameplay bug that breaks Level 3's intended difficulty and player experience. Pits are supposed to be hazards that require careful jumping, but currently provide no challenge.

## Acceptance Criteria

### AC-001: Pit Detection
- **Given** the player is walking on a platform in Level 3
- **When** the player moves over a gap in the ground (tile value 0)
- **Then** the player should immediately start falling
- **And** gravity should apply normally

### AC-002: Pit Collision Logic
- **Given** the collision detection system is checking ground contact
- **When** there is no platform tile (value 0 or undefined) beneath the player
- **Then** the `checkGrounded()` function returns false
- **And** the player enters falling state

### AC-003: Respawn Behavior
- **Given** the player falls into a pit in Level 3
- **When** the player's Y position exceeds 420 pixels
- **Then** the player respawns at the last checkpoint
- **And** a particle effect plays at respawn location

### AC-004: Visual Feedback
- **Given** the player is approaching a pit edge
- **When** the player is within 10 pixels of the edge
- **Then** the player's animation should reflect caution (optional)
- **And** the pit edge should be visually clear

## Technical Details

### Root Cause
The `checkGrounded()` function (lines 891-906) only returns `true` when on solid ground but doesn't explicitly handle when the player is over a pit. The function needs to return `false` when there's no tile below.

### Current Code Issue
```javascript
// Current code at line 901-903
if (game && game.level[tileY] && game.level[tileY][tileX] === 1) {
    return true;
}
// Problem: No explicit "return false" for pit tiles (value 0)
```

### Required Changes
1. Update `checkGrounded()` to explicitly check for pit tiles
2. Ensure falling state triggers when over empty space
3. Verify respawn checkpoint system works correctly
4. Test with Level 3's pit configuration

## Technical Tasks

### Task 1: Fix Collision Detection
- [ ] Modify `checkGrounded()` function to handle pit tiles
- [ ] Add explicit check for tile value 0 (empty/pit)
- [ ] Return false when no solid ground below
- [ ] Test with all platform edge cases

### Task 2: Verify Falling Behavior
- [ ] Confirm gravity applies when not grounded
- [ ] Ensure state transitions to 'fall_down' 
- [ ] Check animation updates correctly
- [ ] Validate physics feel remains unchanged

### Task 3: Test Respawn System
- [ ] Verify checkpoint saving on solid ground
- [ ] Test respawn trigger at Y > 420
- [ ] Confirm particle effects play
- [ ] Validate player position reset

### Task 4: Level 3 Validation
- [ ] Test all pit locations in Level 3
- [ ] Verify intended gaps function as hazards
- [ ] Check platform jumping still works
- [ ] Ensure no false positives on solid ground

### Task 5: Add Visual Indicators (Optional)
- [ ] Add subtle shadow at pit edges
- [ ] Consider danger indication near pits
- [ ] Ensure visual clarity for players

## Definition of Done

- [ ] Pit collision detection working correctly
- [ ] Player falls when walking over gaps
- [ ] Respawn system triggers properly
- [ ] Level 3 plays as intended with pit hazards
- [ ] No regression in platform collision
- [ ] Tests written for pit detection
- [ ] Code reviewed and approved
- [ ] No performance impact

## Dependencies

- **Depends on**: US-007 (Player Entity Module) - Player collision system
- **Depends on**: US-009 (Physics System Module) - Gravity and falling
- **Blocks**: US-014 (Level 3 Challenge Arena) - Level 3 must work correctly

## Testing Strategy

### Unit Tests
```javascript
describe('Pit Collision Detection', () => {
  test('Player falls when over pit tile', () => {
    // Position player over tile value 0
    // Verify checkGrounded() returns false
  });
  
  test('Player stays grounded on platform', () => {
    // Position player over tile value 1
    // Verify checkGrounded() returns true
  });
});
```

### Integration Tests
- Test pit falling in actual Level 3
- Verify respawn system integration
- Check physics system interaction

### Manual Testing
1. Load Level 3
2. Walk cat over each pit
3. Verify falling occurs
4. Confirm respawn works
5. Complete level with pit hazards active

## Notes

- Bug reported in GitHub Issue #1
- Currently cat walks over pits as if solid ground
- Critical for Level 3 gameplay experience
- Should maintain exact physics feel while fixing collision

## Risk Assessment

**Risk Level**: Low  
**Impact if Failed**: High - Level 3 unplayable as intended  
**Mitigation**: Comprehensive testing of all collision scenarios