# US-010: Entity Factory and Management

**Story ID**: US-010  
**Epic**: [Epic 2: Entity System Modularization](../epics/epic-2-entity-system.md)  
**Story Points**: 3  
**Priority**: Medium  
**Sprint**: Week 2, Day 5  

## User Story

**As a** developer  
**I want** a centralized entity factory and management system  
**So that** entity creation, updates, and cleanup are handled consistently across all levels and game states  

## Business Value

Provides a clean, maintainable system for managing entity lifecycles, making it easy to add new entity types and ensuring proper memory management and performance.

## Acceptance Criteria

### AC-001: Entity Creation Management
- **Given** a level needs to create entities
- **When** it requests entity creation through the factory
- **Then** entities are created with proper initialization
- **And** entity registration with game systems is handled automatically
- **And** entity configuration and positioning work correctly

### AC-002: Entity Lifecycle Management
- **Given** entities exist in the game
- **When** the game updates each frame
- **Then** all active entities are updated in correct order
- **And** destroyed entities are properly cleaned up
- **And** entity removal doesn't cause memory leaks or performance issues

### AC-003: Entity Collection Management  
- **Given** multiple entities of different types exist
- **When** systems need to access or filter entities
- **Then** efficient entity queries are available by type
- **And** entity collections are maintained correctly
- **And** iteration over entities is performant

### AC-004: Integration with Game Systems
- **Given** the EntityManager is operational
- **When** it integrates with Physics, Renderer, and other systems
- **Then** entity management doesn't interfere with existing functionality
- **And** entity operations maintain original performance characteristics
- **And** system interactions are clean and well-defined

## Technical Tasks

### Task 1: Entity Factory Design
- [ ] Create EntityFactory class for entity instantiation
- [ ] Implement factory methods for each entity type
- [ ] Add entity configuration and initialization handling
- [ ] Create entity registration system

### Task 2: Entity Manager Implementation
- [ ] Design EntityManager for entity lifecycle management
- [ ] Implement entity collection management by type
- [ ] Add efficient entity update/render coordination
- [ ] Create entity cleanup and destruction handling

### Task 3: Entity Registration System
- [ ] Create entity type registration mechanism
- [ ] Implement entity ID management for tracking
- [ ] Add entity query and filtering capabilities
- [ ] Support entity grouping and tagging

### Task 4: Performance Optimization
- [ ] Optimize entity collection data structures
- [ ] Implement efficient entity iteration patterns
- [ ] Add entity pooling for frequently created/destroyed entities
- [ ] Minimize memory allocation during gameplay

### Task 5: Integration and Testing
- [ ] Integrate EntityManager with Game class
- [ ] Connect with Physics system for collision management  
- [ ] Test entity management across all levels
- [ ] Validate memory usage and performance characteristics

## Definition of Done

- [ ] EntityFactory creates all entity types correctly
- [ ] EntityManager handles entity lifecycle without issues
- [ ] Entity performance equals or exceeds original implementation
- [ ] Entity queries and filtering work efficiently
- [ ] Integration with all game systems is seamless
- [ ] Unit tests cover entity factory and manager functionality
- [ ] Memory usage is optimized with no leaks
- [ ] Entity management supports future entity types easily

## Dependencies

- [US-006: Entity Base Class Architecture](epic-2.1-entity-base-class.md)
- [US-007: Player Entity Module](epic-2.2-player-entity.md)
- [US-008: Secondary Entities Extraction](epic-2.3-secondary-entities.md)
- [US-009: Physics System Module](epic-2.4-physics-system.md)

## Story Points Breakdown

- Entity Factory implementation: 1 point
- Entity Manager and lifecycle handling: 1.5 points
- Integration and performance optimization: 0.5 points

## Testing Strategy

- Unit tests for EntityFactory creation methods
- EntityManager lifecycle tests (create, update, destroy)
- Performance tests for entity collection operations
- Memory leak tests for entity cleanup
- Integration tests with Physics and Rendering systems
- Load testing with maximum expected entity counts

## Technical Notes

### EntityFactory Interface
```javascript
class EntityFactory {
  constructor(physics, stateManager) {
    this.physics = physics
    this.stateManager = stateManager
  }
  
  createPlayer(x, y, config = {}) {
    return new Player(x, y, { ...config, physics: this.physics })
  }
  
  createDog(x, y, config = {}) {
    return new Dog(x, y, config)
  }
  
  createMouse(x, y, config = {}) {
    return new Mouse(x, y, config)
  }
  
  createFireball(x, y, direction, config = {}) {
    return new Fireball(x, y, direction, config)
  }
  
  createParticle(x, y, type, config = {}) {
    return new Particle(x, y, type, config)
  }
}
```

### EntityManager Interface
```javascript
class EntityManager {
  constructor(entityFactory, physics) {
    this.entities = new Map() // id -> entity
    this.entitiesByType = new Map() // type -> Set<entity>
    this.factory = entityFactory
    this.physics = physics
  }
  
  // Entity lifecycle
  add(entity)
  remove(entityId)
  removeAll()
  
  // Entity access
  get(entityId)
  getByType(entityType)
  getAllActive()
  
  // Frame updates
  update(deltaTime)
  render(ctx, camera)
  
  // Queries
  findEntitiesInArea(x, y, width, height)
  findEntitiesOfType(type, predicate = null)
}
```

### Entity Management Patterns

**Entity Creation Flow**:
1. Level requests entity through EntityFactory
2. EntityFactory creates and configures entity
3. EntityManager registers entity and assigns ID
4. Entity is added to appropriate collections
5. Entity becomes active in game loop

**Entity Destruction Flow**:
1. Entity marked for destruction (entity.destroy())
2. EntityManager processes destruction requests
3. Entity removed from all collections
4. Entity cleanup methods called
5. Memory released and references cleared

### Performance Considerations
- Use efficient data structures for entity collections (Set, Map)
- Minimize entity creation/destruction during gameplay
- Implement entity pooling for particles and frequently spawned entities  
- Batch entity operations where possible
- Avoid linear searches through entity collections
- Profile entity management overhead regularly