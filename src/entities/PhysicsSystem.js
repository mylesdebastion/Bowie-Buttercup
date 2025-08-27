/**
 * Physics System Module - US-009: Physics System Module
 * 
 * Centralized physics system for collision detection and response
 * Extracted from monolithic Game.js collision logic
 * 
 * Critical Requirements:
 * - Collision detection accuracy matches original within 1 pixel tolerance
 * - Collision responses produce identical gameplay behavior
 * - Edge cases (corner collisions, simultaneous collisions) work correctly
 * - Performance meets or exceeds original collision processing speed
 * - Entity interactions preserve exact game mechanics
 */

export class PhysicsSystem {
    constructor(tileSize = 16) {
        this.tileSize = tileSize;
        this.level = null;
        this.levelWidth = 0;
        this.levelHeight = 0;
        
        // Collision callbacks for entity-entity interactions
        this.collisionCallbacks = new Map();
        
        // Physics constants matching original Game.js
        this.GRAVITY = 700;
        this.MAX_FALL_SPEED = 500;
        
        // Debug visualization
        this.debugMode = false;
        this.collisionDebugData = [];
    }
    
    /**
     * Set the current level for collision detection
     */
    setLevel(level) {
        this.level = level;
        if (level && level.length > 0) {
            this.levelHeight = level.length;
            this.levelWidth = level[0].length;
        }
    }
    
    /**
     * Register collision callback between entity types
     */
    registerCollisionCallback(entityTypeA, entityTypeB, callback) {
        const key = `${entityTypeA}-${entityTypeB}`;
        this.collisionCallbacks.set(key, callback);
        
        // Register reverse callback for bidirectional collision
        const reverseKey = `${entityTypeB}-${entityTypeA}`;
        this.collisionCallbacks.set(reverseKey, (entityB, entityA, collisionData) => {
            return callback(entityA, entityB, collisionData);
        });
    }
    
    /**
     * Core collision detection between two entities
     */
    checkEntityCollision(entityA, entityB) {
        if (!entityA.collidable || !entityB.collidable || 
            entityA.destroyed || entityB.destroyed ||
            !entityA.active || !entityB.active ||
            entityA === entityB) {
            return null;
        }
        
        const boundsA = entityA.getBounds();
        const boundsB = entityB.getBounds();
        
        // AABB collision detection - exactly matching original precision
        if (boundsA.left < boundsB.right &&
            boundsA.right > boundsB.left &&
            boundsA.top < boundsB.bottom &&
            boundsA.bottom > boundsB.top) {
            
            // Calculate collision details
            const overlapX = Math.min(boundsA.right - boundsB.left, boundsB.right - boundsA.left);
            const overlapY = Math.min(boundsA.bottom - boundsB.top, boundsB.bottom - boundsA.top);
            
            const collisionData = {
                entityA,
                entityB,
                overlapX,
                overlapY,
                contactPoint: {
                    x: Math.max(boundsA.left, boundsB.left) + Math.min(boundsA.right, boundsB.right),
                    y: Math.max(boundsA.top, boundsB.top) + Math.min(boundsA.bottom, boundsB.bottom)
                }
            };
            
            // Store for debug visualization
            if (this.debugMode) {
                this.collisionDebugData.push(collisionData);
            }
            
            return collisionData;
        }
        
        return null;
    }
    
    /**
     * Check platform collision for entity - extracted from original Game.js logic
     */
    checkPlatformCollision(entity, deltaTime) {
        if (!this.level || !entity.active || entity.destroyed) return null;
        
        const bounds = entity.getBounds();
        const collisions = {
            ground: false,
            ceiling: false,
            leftWall: false,
            rightWall: false,
            pit: false,
            climbable: false,
            tiles: []
        };
        
        // Ground collision (falling) - exactly matching Game.js Player.checkCollisions()
        if (entity.vy >= 0) {
            const feetY = bounds.bottom + entity.vy * deltaTime / 1000;
            const centerX = entity.x;
            const leftX = bounds.left;
            const rightX = bounds.right;
            
            const gridYFeet = Math.floor(feetY / this.tileSize);
            const gridXCenter = Math.floor(centerX / this.tileSize);
            const gridXLeft = Math.floor(leftX / this.tileSize);
            const gridXRight = Math.floor(rightX / this.tileSize);
            
            if (gridYFeet >= 0 && gridYFeet < this.levelHeight) {
                const groundHit = (
                    (gridXCenter >= 0 && gridXCenter < this.levelWidth && 
                     this.level[gridYFeet] && this.level[gridYFeet][gridXCenter] > 0) ||
                    (gridXLeft >= 0 && gridXLeft < this.levelWidth && 
                     this.level[gridYFeet] && this.level[gridYFeet][gridXLeft] > 0) ||
                    (gridXRight >= 0 && gridXRight < this.levelWidth && 
                     this.level[gridYFeet] && this.level[gridYFeet][gridXRight] > 0)
                );
                
                if (groundHit) {
                    collisions.ground = true;
                    collisions.tiles.push({
                        type: 'ground',
                        tileY: gridYFeet,
                        worldY: gridYFeet * this.tileSize
                    });
                    
                    // Apply ground collision response - exactly matching Game.js
                    entity.y = gridYFeet * this.tileSize - entity.height / 2;
                    entity.vy = 0;
                    if (entity.grounded !== undefined) entity.grounded = true;
                }
            }
        }
        
        // Ceiling collision (jumping) - exactly matching collision logic
        if (entity.vy < 0) {
            const headY = bounds.top + entity.vy * deltaTime / 1000;
            const centerX = entity.x;
            
            const gridYHead = Math.floor(headY / this.tileSize);
            const gridXCenter = Math.floor(centerX / this.tileSize);
            
            if (gridYHead >= 0 && gridYHead < this.levelHeight &&
                gridXCenter >= 0 && gridXCenter < this.levelWidth &&
                this.level[gridYHead] && this.level[gridYHead][gridXCenter] > 0) {
                
                collisions.ceiling = true;
                collisions.tiles.push({
                    type: 'ceiling',
                    tileY: gridYHead,
                    worldY: (gridYHead + 1) * this.tileSize
                });
                
                // Apply ceiling collision response
                entity.y = (gridYHead + 1) * this.tileSize + entity.height / 2;
                entity.vy = 0;
            }
        }
        
        // Left wall collision - exactly matching collision logic
        if (entity.vx < 0) {
            const leftX = bounds.left + entity.vx * deltaTime / 1000;
            const centerY = entity.y;
            
            const gridXLeft = Math.floor(leftX / this.tileSize);
            const gridYCenter = Math.floor(centerY / this.tileSize);
            
            if (gridXLeft >= 0 && gridXLeft < this.levelWidth &&
                gridYCenter >= 0 && gridYCenter < this.levelHeight &&
                this.level[gridYCenter] && this.level[gridYCenter][gridXLeft] > 0) {
                
                collisions.leftWall = true;
                collisions.tiles.push({
                    type: 'leftWall',
                    tileX: gridXLeft,
                    worldX: (gridXLeft + 1) * this.tileSize
                });
                
                // Apply wall collision response
                entity.x = (gridXLeft + 1) * this.tileSize + entity.width / 2;
                entity.vx = 0;
            }
        }
        
        // Right wall collision - exactly matching collision logic
        if (entity.vx > 0) {
            const rightX = bounds.right + entity.vx * deltaTime / 1000;
            const centerY = entity.y;
            
            const gridXRight = Math.floor(rightX / this.tileSize);
            const gridYCenter = Math.floor(centerY / this.tileSize);
            
            if (gridXRight >= 0 && gridXRight < this.levelWidth &&
                gridYCenter >= 0 && gridYCenter < this.levelHeight &&
                this.level[gridYCenter] && this.level[gridYCenter][gridXRight] > 0) {
                
                collisions.rightWall = true;
                collisions.tiles.push({
                    type: 'rightWall',
                    tileX: gridXRight,
                    worldX: gridXRight * this.tileSize
                });
                
                // Apply wall collision response
                entity.x = gridXRight * this.tileSize - entity.width / 2;
                entity.vx = 0;
            }
        }
        
        return collisions.tiles.length > 0 ? collisions : null;
    }
    
    /**
     * Check world boundaries collision
     */
    checkWorldBoundaries(entity, worldBounds = { x: 0, y: 0, width: 800, height: 480 }) {
        const bounds = entity.getBounds();
        let collision = null;
        
        // Left boundary
        if (bounds.left < worldBounds.x) {
            entity.x = worldBounds.x + entity.width / 2;
            if (entity.vx < 0) entity.vx = 0;
            collision = { type: 'leftBoundary' };
        }
        
        // Right boundary  
        if (bounds.right > worldBounds.x + worldBounds.width) {
            entity.x = worldBounds.x + worldBounds.width - entity.width / 2;
            if (entity.vx > 0) entity.vx = 0;
            collision = { type: 'rightBoundary' };
        }
        
        // Top boundary
        if (bounds.top < worldBounds.y) {
            entity.y = worldBounds.y + entity.height / 2;
            if (entity.vy < 0) entity.vy = 0;
            collision = { type: 'topBoundary' };
        }
        
        // Bottom boundary (death/respawn)
        if (bounds.bottom > worldBounds.y + worldBounds.height) {
            collision = { type: 'bottomBoundary', fatal: true };
        }
        
        return collision;
    }
    
    /**
     * Resolve collision between two entities
     */
    resolveEntityCollision(entityA, entityB, collisionData) {
        // Call registered callbacks
        const key = `${entityA.type}-${entityB.type}`;
        const callback = this.collisionCallbacks.get(key);
        
        if (callback) {
            callback(entityA, entityB, collisionData);
        }
        
        // Call entity-specific collision handlers
        if (entityA.onCollision) {
            entityA.onCollision(entityB, collisionData);
        }
        
        if (entityB.onCollision) {
            entityB.onCollision(entityA, collisionData);
        }
    }
    
    /**
     * Process all collisions for a list of entities
     */
    processCollisions(entities, deltaTime, worldBounds) {
        this.collisionDebugData = []; // Clear debug data
        
        // Check platform collisions for each entity
        entities.forEach(entity => {
            if (entity.solid) {
                this.checkPlatformCollision(entity, deltaTime);
            }
            
            // Check world boundaries
            const boundaryCollision = this.checkWorldBoundaries(entity, worldBounds);
            if (boundaryCollision && boundaryCollision.fatal) {
                // Handle death/respawn
                if (entity.type === 'player' && entity.die) {
                    entity.die();
                } else if (entity.type !== 'player') {
                    entity.destroy();
                }
            }
        });
        
        // Check entity-entity collisions
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const collisionData = this.checkEntityCollision(entities[i], entities[j]);
                if (collisionData) {
                    this.resolveEntityCollision(entities[i], entities[j], collisionData);
                }
            }
        }
    }
    
    /**
     * Ray cast for line of sight / projectile collision
     */
    rayCast(startX, startY, endX, endY, checkSolid = true) {
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const sx = startX < endX ? 1 : -1;
        const sy = startY < endY ? 1 : -1;
        let err = dx - dy;
        
        let x = startX;
        let y = startY;
        
        while (true) {
            const tileX = Math.floor(x / this.tileSize);
            const tileY = Math.floor(y / this.tileSize);
            
            if (tileY >= 0 && tileY < this.levelHeight &&
                tileX >= 0 && tileX < this.levelWidth) {
                
                const tile = this.level[tileY][tileX];
                
                if (checkSolid && tile > 0) {
                    return { 
                        hit: true, 
                        x, 
                        y, 
                        tileX, 
                        tileY, 
                        tile 
                    };
                }
            }
            
            if (Math.abs(x - endX) < 1 && Math.abs(y - endY) < 1) {
                break;
            }
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        
        return { hit: false };
    }
    
    /**
     * Debug rendering for collision bounds
     */
    renderDebug(ctx, camera = { x: 0, y: 0 }) {
        if (!this.debugMode) return;
        
        ctx.save();
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        
        // Render collision debug data
        this.collisionDebugData.forEach(collision => {
            const { entityA, entityB, contactPoint } = collision;
            
            // Draw entity bounds
            const boundsA = entityA.getBounds();
            const boundsB = entityB.getBounds();
            
            ctx.strokeRect(
                boundsA.left - camera.x,
                boundsA.top - camera.y,
                boundsA.width,
                boundsA.height
            );
            
            ctx.strokeRect(
                boundsB.left - camera.x,
                boundsB.top - camera.y,
                boundsB.width,
                boundsB.height
            );
            
            // Draw contact point
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(
                contactPoint.x - camera.x - 2,
                contactPoint.y - camera.y - 2,
                4,
                4
            );
        });
        
        ctx.restore();
    }
    
    /**
     * Enable/disable debug visualization
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * Get collision statistics for performance monitoring
     */
    getCollisionStats() {
        return {
            debugCollisions: this.collisionDebugData.length,
            callbacks: this.collisionCallbacks.size,
            levelSize: this.levelWidth * this.levelHeight
        };
    }
}

// Singleton instance for global access
let instance = null;

export function getPhysicsSystem() {
    if (!instance) {
        instance = new PhysicsSystem();
    }
    return instance;
}

export default PhysicsSystem;