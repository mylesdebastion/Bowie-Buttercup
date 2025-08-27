/**
 * Entity Factory Module - Part of US-010: Entity Factory and Management
 * 
 * Centralized factory for creating all game entities
 * Handles entity configuration, initialization, and registration
 * 
 * Critical Requirements:
 * - Entities are created with proper initialization
 * - Entity registration with game systems is handled automatically
 * - Entity configuration and positioning work correctly
 * - Integration with Physics and StateManager systems
 */

import { PlayerEntity } from './PlayerEntity.js';
import { FireballEntity } from './FireballEntity.js';
import { MouseEntity } from './MouseEntity.js';
import { DogEntity } from './DogEntity.js';
import { ParticleEntity, ParticleSystem } from './ParticleEntity.js';
import { getPhysicsSystem } from './PhysicsSystem.js';

export class EntityFactory {
    constructor(gameInstance, stateManager = null) {
        this.gameInstance = gameInstance;
        this.stateManager = stateManager;
        this.physics = getPhysicsSystem();
        
        // Entity ID counter for unique identification
        this.nextEntityId = 1;
        
        // Entity type registry
        this.entityTypes = new Map([
            ['player', PlayerEntity],
            ['fireball', FireballEntity],
            ['mouse', MouseEntity],
            ['dog', DogEntity],
            ['particle', ParticleEntity]
        ]);
        
        // Default configurations for entity types
        this.defaultConfigs = {
            player: {
                width: 30,
                height: 30,
                health: 3,
                respawnX: 100,
                respawnY: 300
            },
            fireball: {
                width: 12,
                height: 12,
                color: '#FF0000'
            },
            mouse: {
                width: 16,
                height: 12,
                color: '#808080'
            },
            dog: {
                width: 40,
                height: 30,
                color: '#8B4513'
            },
            particle: {
                width: 4,
                height: 4,
                life: 500,
                color: '#ff6b35'
            }
        };
    }
    
    /**
     * Create a Player entity - exactly matching Game.js Player constructor
     */
    createPlayer(x = 100, y = 300, config = {}) {
        const playerConfig = { ...this.defaultConfigs.player, ...config };
        const player = new PlayerEntity(x, y, playerConfig);
        
        // Initialize with game instance
        player.initialize(this.gameInstance);
        
        // Assign unique ID
        player.id = this.nextEntityId++;
        
        // Set spawn point
        player.setSpawnPoint(x, y);
        
        return player;
    }
    
    /**
     * Create a Fireball entity - exactly matching Game.js Fireball constructor
     */
    createFireball(x, y, vx = 0, vy = 0, config = {}) {
        const fireballConfig = { ...this.defaultConfigs.fireball, ...config };
        const fireball = new FireballEntity(x, y, vx, vy, fireballConfig);
        
        // Initialize with game instance
        fireball.initialize(this.gameInstance);
        
        // Assign unique ID
        fireball.id = this.nextEntityId++;
        
        return fireball;
    }
    
    /**
     * Create multiple fireballs for Level 1 - exactly matching Game.js initFireballs()
     */
    createFireballs(count = 3, config = {}) {
        const fireballs = [];
        
        for (let i = 0; i < count; i++) {
            const fireball = this.createFireball(
                200 + i * 200,
                100,
                (Math.random() - 0.5) * 100,
                0,
                config
            );
            fireballs.push(fireball);
        }
        
        return fireballs;
    }
    
    /**
     * Create a Mouse entity - exactly matching Game.js Mouse constructor
     */
    createMouse(x, y, config = {}) {
        const mouseConfig = { ...this.defaultConfigs.mouse, ...config };
        const mouse = new MouseEntity(x, y, mouseConfig);
        
        // Initialize with game instance
        mouse.initialize(this.gameInstance);
        
        // Assign unique ID
        mouse.id = this.nextEntityId++;
        
        return mouse;
    }
    
    /**
     * Create multiple mice for Level 2 - exactly matching Game.js initMice()
     */
    createMice(config = {}) {
        const mice = [];
        const mousePositions = [
            {x: 200, y: 350}, {x: 350, y: 350}, {x: 500, y: 350},
            {x: 180, y: 300}, {x: 320, y: 280}, {x: 450, y: 250},
            {x: 600, y: 350}, {x: 700, y: 350}
        ];
        
        mousePositions.forEach(pos => {
            const mouse = this.createMouse(pos.x, pos.y, config);
            mice.push(mouse);
        });
        
        return mice;
    }
    
    /**
     * Create a Dog entity - exactly matching Game.js Dog constructor
     */
    createDog(x, y, config = {}) {
        const dogConfig = { ...this.defaultConfigs.dog, ...config };
        const dog = new DogEntity(x, y, dogConfig);
        
        // Initialize with game instance
        dog.initialize(this.gameInstance);
        
        // Assign unique ID
        dog.id = this.nextEntityId++;
        
        return dog;
    }
    
    /**
     * Create a Particle entity - exactly matching Game.js Particle constructor
     */
    createParticle(x, y, vx = null, vy = null, config = {}) {
        const particleConfig = { ...this.defaultConfigs.particle, ...config };
        
        // Set random velocity if not provided - matching Game.js logic
        if (vx === null) vx = (Math.random() - 0.5) * 200;
        if (vy === null) vy = -Math.random() * 100 - 50;
        
        const particle = new ParticleEntity(x, y, vx, vy, particleConfig);
        
        // Assign unique ID
        particle.id = this.nextEntityId++;
        
        return particle;
    }
    
    /**
     * Create explosion particles - helper method
     */
    createExplosion(x, y, count = 8, config = {}) {
        return ParticleEntity.createExplosion(x, y, count, config);
    }
    
    /**
     * Create particle spray - helper method
     */
    createSpray(x, y, direction, count = 5, config = {}) {
        return ParticleEntity.createSpray(x, y, direction, count, config);
    }
    
    /**
     * Generic entity creation method
     */
    createEntity(type, x, y, ...args) {
        const EntityClass = this.entityTypes.get(type.toLowerCase());
        
        if (!EntityClass) {
            throw new Error(`Unknown entity type: ${type}`);
        }
        
        let entity;
        
        switch (type.toLowerCase()) {
            case 'player':
                entity = this.createPlayer(x, y, args[0] || {});
                break;
            case 'fireball':
                entity = this.createFireball(x, y, args[0] || 0, args[1] || 0, args[2] || {});
                break;
            case 'mouse':
                entity = this.createMouse(x, y, args[0] || {});
                break;
            case 'dog':
                entity = this.createDog(x, y, args[0] || {});
                break;
            case 'particle':
                entity = this.createParticle(x, y, args[0] || null, args[1] || null, args[2] || {});
                break;
            default:
                entity = new EntityClass(x, y, ...args);
                entity.id = this.nextEntityId++;
        }
        
        return entity;
    }
    
    /**
     * Register custom entity type
     */
    registerEntityType(type, EntityClass, defaultConfig = {}) {
        this.entityTypes.set(type.toLowerCase(), EntityClass);
        this.defaultConfigs[type.toLowerCase()] = defaultConfig;
    }
    
    /**
     * Get default configuration for entity type
     */
    getDefaultConfig(type) {
        return this.defaultConfigs[type.toLowerCase()] || {};
    }
    
    /**
     * Set default configuration for entity type
     */
    setDefaultConfig(type, config) {
        this.defaultConfigs[type.toLowerCase()] = { 
            ...this.defaultConfigs[type.toLowerCase()], 
            ...config 
        };
    }
    
    /**
     * Get next entity ID
     */
    getNextId() {
        return this.nextEntityId++;
    }
    
    /**
     * Reset entity ID counter
     */
    resetIdCounter() {
        this.nextEntityId = 1;
    }
    
    /**
     * Get factory statistics
     */
    getStats() {
        return {
            nextEntityId: this.nextEntityId,
            registeredTypes: Array.from(this.entityTypes.keys()),
            totalTypesRegistered: this.entityTypes.size
        };
    }
}

export default EntityFactory;