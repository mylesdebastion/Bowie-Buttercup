# Epic 002.1: Sprite System Port & Pet Switching

**Epic ID**: E002.1  
**Type**: Migration & Feature Enhancement  
**Priority**: High  
**Status**: Not Started  
**Parent Epic**: E002-Game-Template (Game Engine Foundation)

## Overview
Port the comprehensive sprite system from the monolithic `index.html` to the modular `src/` structure while adding enhanced pet switching functionality between **Bowie Cat** (gray tabby) and **Buttercup Cat** (cream with turquoise collar) using existing 3x3 sprite sheets.

## Business Value
- **User Personalization**: Users can choose between Bowie Cat (calm gray tabby) and Buttercup Cat (cheerful cream cat)
- **Technical Foundation**: Clean, modular sprite system enables future multi-pet support
- **Migration Progress**: Critical step in moving from monolithic to modular architecture
- **Reusability**: Sprite system becomes reusable across different game templates

## Scope

### In Scope
- Complete sprite system architecture port from monolithic to modular
- Enhanced Pet A/Pet B switching with visual preview
- Animation state management system
- Sprite sheet loading and management
- Fallback rendering system
- Configuration import/export for sprite mappings
- Dog NPC sprite system integration

### Out of Scope
- Custom sprite upload functionality (future epic)
- Sprite editing tools
- Animation timeline editor
- Multi-game template support

## Technical Requirements

### Core Sprite System Components
1. **Sprite Sheet Manager** (`src/core/sprites/SpriteSheetManager.js`)
   - Load and manage multiple sprite sheets (bowie_cat_3x3.png, happy_buttercup_cat_3x3.png, Dog)
   - Handle 3x3 grid sprite processing and preview generation
   - Provide sheet switching API

2. **Animation Controller** (`src/core/sprites/AnimationController.js`)
   - State-based animation management
   - Frame timing and cycling
   - Animation preview generation

3. **Sprite Renderer** (`src/core/sprites/SpriteRenderer.js`)
   - Canvas rendering pipeline
   - Transform handling (flipping, scaling, pivoting)
   - Fallback rendering for missing sprites

4. **Sprite Configuration** (`src/core/sprites/SpriteConfig.js`)
   - Default sprite mappings for Bowie Cat and Buttercup Cat
   - 3x3 grid coordinate mapping system
   - Configuration validation and import/export
   - Mapping transformation utilities

### Pet Switching Enhancement
1. **Pet Selection UI**
   - Radio buttons for Bowie Cat/Buttercup Cat selection
   - Live preview of selected pet in idle state from 3x3 sprite sheet
   - Smooth transition when switching pets mid-game

2. **Configuration Management**
   - Separate sprite mappings for Bowie Cat and Buttercup Cat
   - 3x3 grid-based coordinate system for both cats
   - Runtime switching without game restart
   - Persistent user preference storage

## User Stories

### Story 1: Developer - Modular Sprite System
**As a developer**, I want the sprite system ported to modular architecture  
**So that** I can maintain and extend the sprite functionality independently

**Acceptance Criteria:**
- [ ] All sprite functionality from monolithic version works in modular version
- [ ] Code is organized in logical modules under `src/core/sprites/`
- [ ] No regression in sprite rendering quality or performance
- [ ] Unit tests cover sprite loading, animation, and rendering

### Story 2: Player - Pet Selection
**As a player**, I want to choose between different cat sprites (Bowie Cat/Buttercup Cat)  
**So that** I can personalize my gaming experience

**Acceptance Criteria:**
- [ ] Pet selection UI is accessible from game controls panel
- [ ] Visual preview shows selected pet in idle animation from 3x3 sprite sheet
- [ ] Pet change applies immediately without game restart
- [ ] Selected pet persists across game sessions
- [ ] Both Bowie Cat and Buttercup Cat have complete animation sets mapped to 3x3 grid

### Story 3: Player - Seamless Pet Switching
**As a player**, I want to switch pets during gameplay  
**So that** I can experiment with different cat personalities

**Acceptance Criteria:**
- [ ] Pet switching works during active gameplay
- [ ] Animation state preserves correctly during switch
- [ ] No visual glitches or rendering artifacts during transition
- [ ] Physics and collision detection unaffected by pet switch

### Story 4: Developer - Configuration System
**As a developer**, I want flexible sprite configuration management  
**So that** I can easily add new pets or modify existing ones

**Acceptance Criteria:**
- [ ] JSON-based configuration for sprite mappings
- [ ] Import/export functionality for sprite configurations
- [ ] Validation for sprite mapping integrity
- [ ] Clear documentation for adding new pet configurations

## Technical Architecture

### File Structure
```
src/
├── core/
│   └── sprites/
│       ├── SpriteSheetManager.js
│       ├── AnimationController.js
│       ├── SpriteRenderer.js
│       ├── SpriteConfig.js
│       └── index.js
├── configs/
│   ├── sprites/
│   │   ├── bowie-cat-config.json
│   │   ├── buttercup-cat-config.json
│   │   └── dog-config.json
├── assets/
│   ├── sprites/
│   │   ├── bowie_cat_3x3.png
│   │   ├── happy_buttercup_cat_3x3.png
│   │   └── bonbon_dog_3x3.png
├── ui/
│   └── PetSelector.js
└── game/
    └── Player.js (updated to use modular sprite system)
```

### Data Flow
1. **Initialization**: SpriteSheetManager loads default configurations
2. **User Selection**: PetSelector UI triggers pet change
3. **Configuration Switch**: SpriteConfig loads new pet mapping
4. **Render Update**: SpriteRenderer uses new configuration
5. **Animation Continuity**: AnimationController maintains state across switch

## Dependencies
- **Upstream**: Epic E002 (Game Template Foundation)
- **Parallel**: Migration workflow and file lock system
- **Downstream**: Epic E003 (Platform Integration) will use this sprite system

## Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Animation state corruption during pet switch | High | Medium | Implement state validation and recovery |
| Performance impact from sprite switching | Medium | Low | Lazy loading and sprite caching |
| Configuration file corruption | Medium | Low | Schema validation and fallback configs |
| Memory leaks from sprite loading | High | Low | Proper cleanup and garbage collection |

## Definition of Done
- [ ] All sprite system functionality ported to modular structure
- [ ] Pet A/Pet B switching works seamlessly in game
- [ ] Visual testing confirms parity with monolithic version
- [ ] Unit tests achieve 80%+ coverage for sprite modules
- [ ] Performance benchmarks meet or exceed monolithic version
- [ ] Documentation updated for new sprite architecture
- [ ] Code review completed and approved
- [ ] QA testing completed with zero critical bugs

## Success Metrics
- **Functional Parity**: 100% of monolithic sprite features working in modular version
- **Performance**: Frame rate maintained at 60fps during sprite operations
- **User Experience**: Pet switching completes in <200ms
- **Code Quality**: ESLint passes with zero errors, 80%+ test coverage
- **Visual Fidelity**: Pixel-perfect rendering matches monolithic version

## Timeline
**Estimated Effort**: 8-12 story points (4-6 days)
- Sprint Planning: 0.5 day
- Core System Port: 2-3 days  
- Pet Switching Feature: 1-2 days
- Testing & QA: 1-2 days
- Documentation: 0.5 day

---

**Created**: 2025-01-27  
**Last Updated**: 2025-01-27  
**Created By**: AI Scrum Master  
**Epic Owner**: Game Development Team