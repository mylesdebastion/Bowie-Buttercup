# Cat Platformer - Feature Todo List

## Visual Improvements
- [x] **Goldfish Crackers** - Make yellow treats look like goldfish crackers instead of simple squares
  - Orange/golden color gradient
  - Fish shape with smile and eye
  - Slight rotation animation when floating

## Level Design
- [ ] **Level 3 - Challenge Arena**
  - More complex platform layout
  - Bottomless pits with respawn mechanic
  - When cat falls in pit, respawn at last safe platform position
  - Mix of moving platforms and static ones
  - Tighter jumps required

- [ ] **Rain Level**
  - Outdoor level with falling raindrops
  - Raindrops fall from top of screen at varying speeds
  - Cat automatically jumps away when hit by raindrop
  - Puddles form where drops land (visual effect)
  - Thunder and lightning background effects
  - Wet cat particle effects when hit multiple times
  - Umbrella platforms that provide shelter and rain can't pass through.

- [ ] **Indoor Cozy Level**
  - Interior house setting with warm atmosphere
  - Climbable stairs (step-by-step jumping)
  - Cat trees positioned near windows
  - Sunshine beams through windows (volumetric light effect)
  - Cat heals/gains energy when sitting in sunbeams
  - Purr animation when basking in sun
  - Furniture obstacles (sofas, tables, shelves)
  - Books and plants on windowsills
  - Carpeted floors with paw print trails

## Sprite Integration
- [ ] **Default Sprite Sheets**
  - Load `bowie_cat_3x3.png` automatically on startup
  - Load second PNG file if available
  - Ensure proper default mappings for all animations
  - Auto-detect fireball sprite between cells

- [ ] **Sprite Cropping Guide**
  - Document how to properly crop sprite sheets
  - Test cropping with different sprite dimensions
  - Create visual guide showing grid overlay
  - Include common pitfalls (border pixels, transparency)
  - Provide example crops for 3x3, 4x4, and custom grids
  - Add debugging mode to show crop boundaries in-game
  - Test with various image formats (PNG, GIF)
  - Validate proper alignment after cropping

## Environmental Objects
- [ ] **Cozy Bed Goal**
  - Replace green flag with pixel art cat bed
  - Add Z's floating animation when reached
  - Warm color palette (browns, creams, soft pink pillow)
  - Size: ~40x30 pixels

- [ ] **Red Couch Trampolines**
  - Replace some platforms with red couches
  - Bounce player higher when landed on (1.5x jump force)
  - Squash animation on impact
  - Pixel art style with visible cushions

- [ ] **Climbable Cat Trees**
  - Procedurally generated heights (3-6 segments tall)
  - Different platform configurations at top
  - Hold up near tree to climb
  - Climbing animation state
  - Can jump from any height while climbing
  - Carpeted texture in beige/brown

## NPCs & Interactions
- [ ] **Cute Dog NPC**
  - Friendly dog that roams around certain levels
  - Pathfinding AI to wander and search for treats
  - Eats treats if it gets to them first
  - Cat gets scared sprite when dog is nearby
  - Cat automatically jumps away from dog (fear response)
  - Dog has happy tail wag animation
  - Different dog breeds for variety

## Additional Features (Future)
- [ ] **Power-ups**
  - Catnip - temporary invincibility
  - Yarn ball - projectile to stun mice
  - Feather toy - double jump

- [ ] **Sound Effects**
  - Meow on jump
  - Purr when collecting treats
  - Hiss when hurt
  - Victory purr at bed

- [ ] **Particle Effects**  
  - Fish bones when eating treats
  - Fur puffs when landing
  - Hearts when reaching bed

## Bug Fixes & Polish
- [ ] Ensure all animations properly mirror when facing left
- [ ] Add coyote time to platform edges
- [ ] Smooth camera transitions between levels
- [ ] Save high scores to localStorage
- [ ] Add level select menu after beating game once

## Performance
- [ ] Optimize collision detection for multiple mice
- [ ] Add sprite batching for particles
- [ ] Implement view culling for off-screen objects

## Accessibility
- [ ] Add colorblind mode for treats/hazards
- [ ] Larger UI text option
- [ ] Sound cue alternatives for visual effects
- [ ] Speed run timer with splits

---
*Priority: Focus on visual improvements and Level 3 first, then environmental objects*