/**
 * Entity Manager Module - Part of US-010: Entity Factory and Management
 * 
 * Centralized management system for entity lifecycle, updates, and queries
 * Handles entity registration, updates, rendering, and cleanup
 * 
 * Critical Requirements:
 * - All active entities are updated in correct order
 * - Destroyed entities are properly cleaned up
 * - Entity removal doesn't cause memory leaks or performance issues
 * - Efficient entity queries are available by type
 * - Entity collections are maintained correctly
 * - Integration with Physics and other systems is seamless
 */

import { EntityFactory } from './EntityFactory.js';
import { getPhysicsSystem } from './PhysicsSystem.js';

export class EntityManager {
    constructor(gameInstance, stateManager = null) {
        this.gameInstance = gameInstance;
        this.stateManager = stateManager;
        
        // Initialize entity factory
        this.factory = new EntityFactory(gameInstance, stateManager);
        
        // Initialize physics system
        this.physics = getPhysicsSystem();
        
        // Entity storage
        this.entities = new Map(); // id -> entity
        this.entitiesByType = new Map(); // type -> Set<entity>
        this.activeEntities = new Set();
        this.destroyedEntities = new Set();
        
        // Update order priorities (lower number = updated first)
        this.updateOrder = {
            'player': 0,
            'particle': 1,
            'fireball': 2,
            'mouse': 3,
            'dog': 4,
            'default': 5
        };
        
        // Performance tracking
        this.stats = {
            totalEntities: 0,
            activeEntities: 0,
            entitiesUpdated: 0,
            entitiesRendered: 0,
            lastUpdateTime: 0,
            lastRenderTime: 0
        };
    }
    
    /**
     * Add entity to management system
     */
    add(entity) {
        if (!entity || !entity.id) {
            console.warn('EntityManager: Cannot add entity without valid ID');
            return false;
        }
        
        // Check if entity already exists
        if (this.entities.has(entity.id)) {
            console.warn(`EntityManager: Entity with ID ${entity.id} already exists`);
            return false;
        }
        
        // Add to main collection
        this.entities.set(entity.id, entity);
        this.activeEntities.add(entity);
        
        // Add to type-based collection
        const type = entity.type.toLowerCase();
        if (!this.entitiesByType.has(type)) {
            this.entitiesByType.set(type, new Set());
        }
        this.entitiesByType.get(type).add(entity);
        
        // Update stats
        this.stats.totalEntities++;
        this.stats.activeEntities++;
        
        return true;
    }
    
    /**
     * Remove entity by ID
     */
    remove(entityId) {
        const entity = this.entities.get(entityId);
        if (!entity) {
            return false;
        }
        
        // Mark for destruction
        entity.destroy();
        this.destroyedEntities.add(entity);
        
        return true;
    }
    
    /**
     * Remove entity instance
     */
    removeEntity(entity) {
        if (!entity || !entity.id) {
            return false;
        }
        
        return this.remove(entity.id);
    }
    
    /**
     * Remove all entities
     */
    removeAll() {
        this.entities.forEach(entity => {
            entity.destroy();
        });
        this.destroyedEntities = new Set(this.entities.values());
        this.activeEntities.clear();
    }
    
    /**
     * Get entity by ID
     */
    get(entityId) {
        return this.entities.get(entityId);
    }
    
    /**
     * Get entities by type
     */
    getByType(entityType) {
        const type = entityType.toLowerCase();
        return this.entitiesByType.get(type) || new Set();
    }
    
    /**
     * Get all active entities
     */
    getAllActive() {
        return Array.from(this.activeEntities).filter(entity => !entity.destroyed && entity.active);
    }
    
    /**
     * Find entities in area
     */
    findEntitiesInArea(x, y, width, height) {
        const results = [];
        
        this.activeEntities.forEach(entity => {
            if (entity.destroyed || !entity.active) return;
            
            const bounds = entity.getBounds();
            if (bounds.left < x + width &&
                bounds.right > x &&
                bounds.top < y + height &&
                bounds.bottom > y) {
                results.push(entity);
            }
        });
        
        return results;
    }
    
    /**
     * Find entities of specific type with optional predicate
     */
    findEntitiesOfType(type, predicate = null) {
        const entities = this.getByType(type);
        if (!predicate) {
            return Array.from(entities).filter(entity => !entity.destroyed && entity.active);
        }
        
        return Array.from(entities).filter(entity => 
            !entity.destroyed && entity.active && predicate(entity)
        );
    }
    
    /**
     * Main update method - called each frame
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // Clean up destroyed entities first
        this.cleanupDestroyedEntities();
        
        // Get active entities sorted by update order
        const activeList = this.getAllActive().sort((a, b) => {
            const priorityA = this.updateOrder[a.type] || this.updateOrder.default;
            const priorityB = this.updateOrder[b.type] || this.updateOrder.default;
            return priorityA - priorityB;
        });
        
        // Update each entity
        let entitiesUpdated = 0;
        activeList.forEach(entity => {
            if (entity.active && !entity.destroyed) {
                entity.update(deltaTime, this.gameInstance);
                entitiesUpdated++;
            }
        });
        
        // Process physics collisions
        this.physics.processCollisions(activeList, deltaTime, { x: 0, y: 0, width: 800, height: 480 });
        
        // Update stats
        this.stats.entitiesUpdated = entitiesUpdated;
        this.stats.activeEntities = this.activeEntities.size;
        this.stats.lastUpdateTime = performance.now() - startTime;
    }
    
    /**
     * Main render method - called each frame
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        const startTime = performance.now();
        
        // Get visible entities (simple culling)
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        const visibleEntities = this.getAllActive().filter(entity => 
            entity.visible && entity.isOnScreen(camera, canvasWidth, canvasHeight)
        );
        
        // Sort entities for proper rendering order (background to foreground)
        const renderOrder = {
            'particle': 0,
            'fireball': 1,
            'mouse': 2,
            'dog': 3,
            'player': 4,
            'default': 2
        };
        
        visibleEntities.sort((a, b) => {
            const orderA = renderOrder[a.type] || renderOrder.default;
            const orderB = renderOrder[b.type] || renderOrder.default;
            return orderA - orderB;
        });
        
        // Render each visible entity
        let entitiesRendered = 0;
        visibleEntities.forEach(entity => {
            entity.render(ctx, camera);
            entitiesRendered++;
        });
        
        // Render physics debug if enabled
        this.physics.renderDebug(ctx, camera);
        
        // Update stats
        this.stats.entitiesRendered = entitiesRendered;
        this.stats.lastRenderTime = performance.now() - startTime;
    }
    
    /**
     * Clean up destroyed entities
     */
    cleanupDestroyedEntities() {
        this.destroyedEntities.forEach(entity => {
            // Remove from main collection
            this.entities.delete(entity.id);
            this.activeEntities.delete(entity);
            
            // Remove from type collection
            const typeSet = this.entitiesByType.get(entity.type.toLowerCase());
            if (typeSet) {
                typeSet.delete(entity);
                if (typeSet.size === 0) {
                    this.entitiesByType.delete(entity.type.toLowerCase());
                }
            }
            
            // Call entity cleanup
            entity.onDestroy();
        });
        
        // Update stats
        this.stats.totalEntities -= this.destroyedEntities.size;
        
        // Clear destroyed entities list
        this.destroyedEntities.clear();
    }
    
    /**
     * Create and add entity using factory
     */
    createEntity(type, x, y, ...args) {
        const entity = this.factory.createEntity(type, x, y, ...args);
        this.add(entity);
        return entity;
    }
    
    /**
     * Create and add player entity
     */
    createPlayer(x, y, config) {
        const player = this.factory.createPlayer(x, y, config);
        this.add(player);
        return player;
    }
    
    /**
     * Create and add multiple fireballs for Level 1
     */
    createFireballs(count, config) {
        const fireballs = this.factory.createFireballs(count, config);
        fireballs.forEach(fireball => this.add(fireball));
        return fireballs;
    }
    
    /**
     * Create and add multiple mice for Level 2
     */
    createMice(config) {
        const mice = this.factory.createMice(config);
        mice.forEach(mouse => this.add(mouse));
        return mice;
    }
    
    /**
     * Create and add dog entity
     */
    createDog(x, y, config) {
        const dog = this.factory.createDog(x, y, config);
        this.add(dog);
        return dog;
    }
    
    /**
     * Create and add particle
     */
    createParticle(x, y, vx, vy, config) {
        const particle = this.factory.createParticle(x, y, vx, vy, config);
        this.add(particle);
        return particle;
    }
    
    /**
     * Get entity count by type
     */
    getEntityCount(type = null) {
        if (type) {
            const typeSet = this.entitiesByType.get(type.toLowerCase());
            return typeSet ? typeSet.size : 0;
        }
        return this.entities.size;
    }
    
    /**
     * Get manager statistics
     */
    getStats() {
        return {
            ...this.stats,
            entityTypes: Array.from(this.entitiesByType.keys()),
            entitiesByType: Object.fromEntries(
                Array.from(this.entitiesByType.entries()).map(([type, set]) => [type, set.size])
            ),
            destroyedCount: this.destroyedEntities.size
        };
    }
    
    /**
     * Enable/disable physics debug mode
     */
    setPhysicsDebug(enabled) {
        this.physics.setDebugMode(enabled);
    }
    
    /**
     * Get factory instance for external use
     */
    getFactory() {
        return this.factory;
    }
    
    /**
     * Get physics system instance
     */
    getPhysics() {
        return this.physics;
    }
    
    /**
     * Reset manager state
     */
    reset() {
        this.removeAll();
        this.cleanupDestroyedEntities();
        this.factory.resetIdCounter();
        
        this.stats = {
            totalEntities: 0,
            activeEntities: 0,
            entitiesUpdated: 0,
            entitiesRendered: 0,
            lastUpdateTime: 0,
            lastRenderTime: 0
        };
    }
}

export default EntityManager;