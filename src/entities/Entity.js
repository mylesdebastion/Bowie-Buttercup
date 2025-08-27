/**
 * Entity Base Class - US-006: Entity Base Class Architecture
 * 
 * Foundation class for all game entities with standardized interfaces
 * Provides common behavior for positioning, rendering, collision, and lifecycle
 * 
 * Design Principles:
 * - Keep base class minimal but complete
 * - Avoid deep inheritance hierarchies  
 * - Prefer composition over inheritance where appropriate
 * - Maintain compatibility with existing entity logic
 * - Optimize for performance in update/render loops
 */

export class Entity {
    constructor(x = 0, y = 0, options = {}) {
        // Position and transform
        this.x = x;
        this.y = y;
        this.width = options.width || 16;
        this.height = options.height || 16;
        
        // Velocity and physics
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.gravity = options.gravity !== undefined ? options.gravity : true;
        
        // Entity state
        this.active = true;
        this.destroyed = false;
        this.visible = true;
        
        // Collision and interaction
        this.solid = options.solid !== undefined ? options.solid : true;
        this.collidable = options.collidable !== undefined ? options.collidable : true;
        
        // Animation and rendering
        this.animFrame = 0;
        this.animTimer = 0;
        this.currentAnimation = 'idle';
        this.facing = options.facing || 1; // 1 = right, -1 = left
        
        // Lifecycle tracking
        this.age = 0;
        this.maxAge = options.maxAge || Infinity;
        
        // Entity ID for tracking (assigned by EntityManager)
        this.id = null;
        this.type = this.constructor.name.toLowerCase();
    }
    
    /**
     * Abstract methods - must be implemented by subclasses
     */
    update(deltaTime, gameState) {
        throw new Error(`${this.constructor.name} must implement update() method`);
    }
    
    render(ctx, camera = { x: 0, y: 0 }) {
        throw new Error(`${this.constructor.name} must implement render() method`);
    }
    
    /**
     * Optional override methods with default implementations
     */
    onCollision(other, collisionData) {
        // Override in subclasses for collision response
    }
    
    onDestroy() {
        // Override in subclasses for cleanup
    }
    
    onSpawn() {
        // Override in subclasses for initialization
    }
    
    /**
     * Shared utility methods
     */
    
    /**
     * Get entity bounding box for collision detection
     */
    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height,
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2,
            centerX: this.x,
            centerY: this.y
        };
    }
    
    /**
     * Set entity position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Set entity velocity
     */
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
    
    /**
     * Check if this entity collides with another entity
     */
    collidesWith(other) {
        if (!this.collidable || !other.collidable || this.destroyed || other.destroyed) {
            return false;
        }
        
        const thisBounds = this.getBounds();
        const otherBounds = other.getBounds();
        
        return thisBounds.left < otherBounds.right &&
               thisBounds.right > otherBounds.left &&
               thisBounds.top < otherBounds.bottom &&
               thisBounds.bottom > otherBounds.top;
    }
    
    /**
     * Check distance to another entity
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Check if entity is within screen bounds (for culling)
     */
    isOnScreen(camera, screenWidth, screenHeight, margin = 50) {
        const bounds = this.getBounds();
        return bounds.right > camera.x - margin &&
               bounds.left < camera.x + screenWidth + margin &&
               bounds.bottom > camera.y - margin &&
               bounds.top < camera.y + screenHeight + margin;
    }
    
    /**
     * Base physics update - can be overridden
     */
    updatePhysics(deltaTime) {
        if (!this.active || this.destroyed) return;
        
        // Apply gravity if enabled
        if (this.gravity) {
            this.vy += 700 * deltaTime / 1000; // Match Game.js gravity
            this.vy = Math.min(this.vy, 500); // Match Game.js max fall speed
        }
        
        // Update position based on velocity
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Update age
        this.age += deltaTime;
        
        // Check if entity should be destroyed by age
        if (this.age > this.maxAge) {
            this.destroy();
        }
    }
    
    /**
     * Base animation update - can be overridden
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        
        // Default animation timing (200ms per frame, matching Game.js)
        if (this.animTimer > 200) {
            this.animFrame = (this.animFrame + 1) % 4; // Default 4 frame animation
            this.animTimer = 0;
        }
    }
    
    /**
     * Mark entity for destruction
     */
    destroy() {
        if (!this.destroyed) {
            this.destroyed = true;
            this.active = false;
            this.onDestroy();
        }
    }
    
    /**
     * Spawn/activate entity
     */
    spawn() {
        this.destroyed = false;
        this.active = true;
        this.age = 0;
        this.onSpawn();
    }
    
    /**
     * Get entity state for debugging/serialization
     */
    getState() {
        return {
            id: this.id,
            type: this.type,
            position: { x: this.x, y: this.y },
            velocity: { x: this.vx, y: this.vy },
            bounds: this.getBounds(),
            active: this.active,
            destroyed: this.destroyed,
            visible: this.visible,
            age: this.age,
            animation: {
                current: this.currentAnimation,
                frame: this.animFrame,
                facing: this.facing
            }
        };
    }
    
    /**
     * Serialize entity data for save/load
     */
    serialize() {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            active: this.active,
            facing: this.facing,
            age: this.age
        };
    }
    
    /**
     * Restore entity from serialized data
     */
    deserialize(data) {
        this.x = data.x || this.x;
        this.y = data.y || this.y;
        this.vx = data.vx || this.vx;
        this.vy = data.vy || this.vy;
        this.active = data.active !== undefined ? data.active : this.active;
        this.facing = data.facing || this.facing;
        this.age = data.age || this.age;
    }
}

export default Entity;