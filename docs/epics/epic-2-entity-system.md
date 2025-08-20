# Epic 2: Entity System Modularization

**Epic ID**: EPIC-002  
**Epic Goal**: Extract all game entities into independent, testable modules  
**Business Value**: Enable independent entity development and testing while preserving exact game behavior  
**Story Points**: 29  
**Duration**: Week 2 (5 days)  

## Epic Overview

This epic transforms the monolithic entity system into a modular, extensible architecture. All game entities (Player, Dog, Mouse, Fireball, Particle) will be extracted into individual modules with a shared base class, while the physics system becomes a separate, testable module.

## Success Criteria

- All entities extracted to independent modules with shared interfaces
- Physics system separated and fully testable
- Entity behaviors identical to original implementation
- Collision detection accuracy preserved
- Performance equal or better than original
- Foundation ready for easy addition of new entity types

## User Stories

1. [US-006: Entity Base Class Architecture](../stories/epic-2.1-entity-base-class.md)
2. [US-007: Player Entity Module](../stories/epic-2.2-player-entity.md)
3. [US-008: Secondary Entities Extraction](../stories/epic-2.3-secondary-entities.md)
4. [US-009: Physics System Module](../stories/epic-2.4-physics-system.md)
5. [US-010: Entity Factory and Management](../stories/epic-2.5-entity-factory.md)
6. [US-029: Fix Pit Collision Detection](../stories/epic-2.6-pit-collision-fix.md) - Bug Fix

## Dependencies

- **Epic 1**: Core Architecture Setup must be completed
- All foundation modules (Game, Canvas, InputManager) must be operational

## Risks

- Physics behavior changes affecting game feel
- Performance degradation from modularization overhead
- Entity interaction complexity during extraction
- Animation timing precision requirements

## Definition of Epic Done

- All entities function identically to original implementation
- Physics system maintains collision accuracy within 1px tolerance
- Entity interaction tests pass for all combinations
- Performance benchmarks meet or exceed original metrics
- Entity system ready for Level System integration (Epic 3)