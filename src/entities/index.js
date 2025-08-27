/**
 * Entity System Index - Centralized exports for all entity modules
 * 
 * Epic E002: Entity System Implementation - Complete Module Structure
 * 
 * This index provides easy access to all entity system components:
 * - Base Entity class
 * - All entity implementations (Player, Fireball, Mouse, Dog, Particle)
 * - Physics System for collision detection and response
 * - Entity Factory for creating entities
 * - Entity Manager for lifecycle management
 * 
 * Usage:
 * import { EntityManager, PlayerEntity, PhysicsSystem } from './entities';
 */

// Core Entity System
export { Entity } from './Entity.js';
export { PhysicsSystem, getPhysicsSystem } from './PhysicsSystem.js';
export { EntityFactory } from './EntityFactory.js';
export { EntityManager } from './EntityManager.js';

// Entity Implementations
export { PlayerEntity } from './PlayerEntity.js';
export { FireballEntity } from './FireballEntity.js';
export { MouseEntity } from './MouseEntity.js';
export { DogEntity } from './DogEntity.js';
export { ParticleEntity, ParticleSystem } from './ParticleEntity.js';

// Legacy compatibility exports (from existing files)
export { Player } from './player.js';
export { ItemSystem } from './items.js';

// Default export for convenience
export default {
    // Core system
    Entity,
    PhysicsSystem,
    EntityFactory,
    EntityManager,
    
    // Entities
    PlayerEntity,
    FireballEntity,
    MouseEntity,
    DogEntity,
    ParticleEntity,
    ParticleSystem,
    
    // Legacy
    Player,
    ItemSystem
};