/**
 * Mouse Entity Module - Part of US-008: Secondary Entities Extraction
 * 
 * Extracted from monolithic Game.js Mouse class
 * Preserves exact AI movement patterns, catching mechanics, and behavior
 * 
 * Critical Requirements:
 * - Movement patterns are identical (speed, direction changes)
 * - Player collision and catching mechanics work exactly
 * - Spawn timing and positioning match original
 * - AI behavior maintains exact randomization patterns
 */

import { Entity } from './Entity.js';

export class MouseEntity extends Entity {
    constructor(x, y, options = {}) {
        super(x, y, {
            width: 16,
            height: 12,
            solid: false,
            collidable: true,
            gravity: false, // Mouse handles simple ground collision
            ...options
        });
        
        // Movement AI constants - exactly matching Game.js Mouse
        this.SPEED_MIN = 30;
        this.SPEED_MAX = 70;
        this.DIRECTION_CHANGE_MIN = 2000; // 2 seconds
        this.DIRECTION_CHANGE_MAX = 5000; // 5 seconds (2000 + 3000)
        this.GROUND_Y = 350; // Simple ground level for mouse
        this.CATCH_DISTANCE = 25;
        this.CATCH_MIN_SPEED = 50; // Player must be moving to catch
        this.COLLISION_DISTANCE = 30;
        this.COLLISION_MAX_SPEED = 10; // Player must be slow for collision
        
        // Movement state - exactly matching Game.js Mouse
        this.vx = Math.random() > 0.5 ? 50 : -50;
        this.vy = 0;
        this.direction = this.vx > 0 ? 1 : -1;
        this.moveTimer = 0;
        this.caught = false;
        this.jumpCooldown = 0;
        
        // Visual properties
        this.color = '#808080';
        
        // Reference to game systems
        this.gameInstance = null;
        
        // Set entity type
        this.type = 'mouse';
    }
    
    /**
     * Initialize with game instance for system access
     */
    initialize(gameInstance) {
        this.gameInstance = gameInstance;
    }
    
    /**
     * Main update method - extracted exactly from Game.js Mouse.update()
     */
    update(deltaTime, gameState) {
        if (!this.active || this.destroyed || this.caught) return;
        
        // Update timers - exactly matching Game.js logic
        this.jumpCooldown -= deltaTime;
        this.moveTimer += deltaTime;
        
        // Direction change logic - exactly matching Game.js logic
        if (this.moveTimer > this.DIRECTION_CHANGE_MIN + Math.random() * (this.DIRECTION_CHANGE_MAX - this.DIRECTION_CHANGE_MIN)) {
            this.direction *= -1;
            this.vx = this.direction * (this.SPEED_MIN + Math.random() * (this.SPEED_MAX - this.SPEED_MIN));
            this.moveTimer = 0;
        }
        
        // Update position - exactly matching Game.js logic
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Simple ground collision - exactly matching Game.js logic
        if (this.y > this.GROUND_Y) {
            this.y = this.GROUND_Y;
            this.vy = 0;
        }
        
        // Keep mouse on screen
        if (this.x < 0) {
            this.x = 0;
            this.direction = 1;
            this.vx = Math.abs(this.vx);
        } else if (this.x > 800) {
            this.x = 800;
            this.direction = -1;
            this.vx = -Math.abs(this.vx);
        }
    }
    
    /**
     * Check if caught by player - extracted exactly from Game.js Mouse.checkCaught()
     */
    checkCaught(player) {
        if (this.caught) return false;
        
        // Distance check - exactly matching Game.js logic
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        
        // Exactly matching Game.js catching conditions
        if (dx < this.CATCH_DISTANCE && dy < this.CATCH_DISTANCE && Math.abs(player.vx) > this.CATCH_MIN_SPEED) {
            this.caught = true;
            return true;
        }
        return false;
    }
    
    /**
     * Check collision with static cat - extracted exactly from Game.js Mouse.checkCollisionWithStaticCat()
     */
    checkCollisionWithStaticCat(player) {
        // Distance check - exactly matching Game.js logic
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        
        // Exactly matching Game.js collision conditions
        return dx < this.COLLISION_DISTANCE && dy < this.COLLISION_DISTANCE && Math.abs(player.vx) < this.COLLISION_MAX_SPEED;
    }
    
    /**
     * Render mouse - matches Game.js drawing logic
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        if (!this.visible || this.destroyed || this.caught) return;
        
        // Calculate screen position
        const screenX = this.x - this.width / 2 - camera.x;
        const screenY = this.y - this.height / 2 - camera.y;
        
        // Draw mouse - exactly matching Game.js
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Add mouse features (ears, tail)
        ctx.fillStyle = '#666666';
        // Ears
        ctx.fillRect(screenX + 2, screenY - 2, 3, 3);
        ctx.fillRect(screenX + this.width - 5, screenY - 2, 3, 3);
        // Tail
        const tailX = this.direction > 0 ? screenX - 4 : screenX + this.width;
        ctx.fillRect(tailX, screenY + 4, 4, 2);
    }
    
    /**
     * Override Entity's onCollision for mouse-specific collision responses
     */
    onCollision(other, collisionData) {
        if (other.type === 'player') {
            // Check if mouse should be caught
            if (this.checkCaught(other)) {
                this.caught = true;
                // Add score to player
                if (this.gameInstance) {
                    this.gameInstance.score += 200;
                    this.gameInstance.playSound('collect');
                }
            }
            // Check for static collision (cat not moving fast enough)
            else if (this.checkCollisionWithStaticCat(other)) {
                // Eject treats if player has any
                if (this.gameInstance && this.gameInstance.treatsCollected > 0) {
                    this.gameInstance.ejectTreats();
                    this.direction *= -1;
                }
            }
        }
    }
    
    /**
     * Reset mouse to active state
     */
    reset() {
        this.caught = false;
        this.active = true;
        this.destroyed = false;
        this.moveTimer = 0;
        this.vx = Math.random() > 0.5 ? 50 : -50;
        this.direction = this.vx > 0 ? 1 : -1;
    }
    
    /**
     * Get mouse-specific state
     */
    getMouseState() {
        return {
            ...this.getState(),
            caught: this.caught,
            direction: this.direction,
            moveTimer: this.moveTimer,
            jumpCooldown: this.jumpCooldown,
            speed: Math.abs(this.vx)
        };
    }
    
    /**
     * Serialize mouse data
     */
    serialize() {
        return {
            ...super.serialize(),
            caught: this.caught,
            direction: this.direction,
            moveTimer: this.moveTimer
        };
    }
    
    /**
     * Deserialize mouse data
     */
    deserialize(data) {
        super.deserialize(data);
        this.caught = data.caught !== undefined ? data.caught : this.caught;
        this.direction = data.direction !== undefined ? data.direction : this.direction;
        this.moveTimer = data.moveTimer !== undefined ? data.moveTimer : this.moveTimer;
    }
}

export default MouseEntity;