/**
 * Player Entity Module - US-007: Player Entity Module
 * 
 * Extracted from monolithic Game.js Player class
 * Preserves exact physics, animation, and input handling behavior
 * 
 * Critical Requirements:
 * - Maintain identical movement physics (acceleration, jump height, air control)
 * - Preserve collision responses pixel-perfect matches
 * - Keep physics constants producing the same gameplay experience
 * - Animation timing matches original exactly
 * - Input integration maintains original responsiveness
 */

import { Entity } from './Entity.js';

export class PlayerEntity extends Entity {
    constructor(x = 100, y = 300, options = {}) {
        super(x, y, {
            width: 30,
            height: 30,
            solid: true,
            collidable: true,
            gravity: false, // Player handles own gravity
            ...options
        });
        
        // Physics constants - MUST PRESERVE EXACTLY from Game.js
        this.WALK_SPEED = 200; // Matches Game.js vx max values
        this.ACCELERATION = 800; // Matches Game.js acceleration
        this.JUMP_POWER = 350; // Matches Game.js jump vy
        this.GRAVITY = 700; // Matches Game.js gravity
        this.FRICTION = 0.8; // Matches Game.js friction multiplier
        this.MAX_FALL_SPEED = 500; // Matches Game.js max fall speed
        
        // Player state - exactly matching Game.js Player class
        this.grounded = false;
        this.dead = false;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.health = 3;
        this.respawnX = x;
        this.respawnY = y;
        this.climbing = false;
        this.climbX = 0;
        
        // Animation state - exactly matching Game.js
        this.animFrame = 0;
        this.animTimer = 0;
        this.currentAnimation = 'idle';
        this.facing = 1; // 1 = right, -1 = left
        
        // Input state tracking
        this.inputState = {
            left: false,
            right: false,
            jump: false,
            wasJumpPressed: false
        };
        
        // Reference to game systems (will be injected)
        this.gameInstance = null;
    }
    
    /**
     * Initialize with game instance for system access
     */
    initialize(gameInstance) {
        this.gameInstance = gameInstance;
    }
    
    /**
     * Main update method - extracted from Game.js Player.update()
     */
    update(deltaTime, gameState) {
        if (this.dead) return;
        
        const wasGrounded = this.grounded;
        this.grounded = this.checkGrounded();
        
        // Handle input - exactly matching Game.js logic
        this.handleInput(deltaTime);
        
        // Apply physics - exactly matching Game.js logic
        this.applyPhysics(deltaTime);
        
        // Update invulnerability - exactly matching Game.js logic
        if (this.invulnerable) {
            this.invulnerabilityTimer -= deltaTime;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        // Update animation - exactly matching Game.js logic
        this.updateAnimation(deltaTime);
        
        // Check death conditions - exactly matching Game.js logic
        if (this.y > 500) {
            this.die();
        }
    }
    
    /**
     * Handle input - extracted exactly from Game.js Player.handleInput()
     */
    handleInput(deltaTime) {
        // Get InputManager from game instance
        if (!this.gameInstance || !this.gameInstance.inputManager) return;
        
        const inputManager = this.gameInstance.inputManager;
        
        // Horizontal movement - matches monolithic physics exactly
        if (inputManager.isKeyPressed('left')) {
            this.vx = Math.max(this.vx - 800 * deltaTime / 1000, -200);
            this.facing = -1;
        } else if (inputManager.isKeyPressed('right')) {
            this.vx = Math.min(this.vx + 800 * deltaTime / 1000, 200);
            this.facing = 1;
        } else {
            // Apply friction - matches monolithic behavior
            this.vx *= Math.pow(0.8, deltaTime / 16);
        }
        
        // Jumping with buffering - matches monolithic jump system
        if (inputManager.isKeyPressed('jump') && this.grounded) {
            this.vy = -350;
            this.grounded = false;
            inputManager.clearJumpBuffer();
        } else if (inputManager.isJumpBuffered() && this.grounded) {
            // Buffered jump for frame-perfect input
            this.vy = -350;
            this.grounded = false;
            inputManager.clearJumpBuffer();
        }
        
        // Variable jump height - matches monolithic behavior
        if (!inputManager.isKeyPressed('jump') && this.vy < 0) {
            this.vy *= 0.5;
        }
    }
    
    /**
     * Apply physics - extracted exactly from Game.js Player.applyPhysics()
     */
    applyPhysics(deltaTime) {
        // Gravity - exactly matching Game.js logic
        if (!this.grounded && !this.climbing) {
            this.vy += 700 * deltaTime / 1000;
            this.vy = Math.min(this.vy, 500);
        }
        
        // Update position - exactly matching Game.js logic
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Basic collision with level - exactly matching Game.js logic
        this.checkCollisions();
    }
    
    /**
     * Check if grounded - extracted exactly from Game.js Player.checkGrounded()
     */
    checkGrounded() {
        if (!this.gameInstance || !this.gameInstance.level) return false;
        
        const level = this.gameInstance.level;
        const feetY = this.y + this.height / 2;
        const centerX = this.x;
        const leftX = this.x - this.width / 2;
        const rightX = this.x + this.width / 2;
        
        const gridYFeet = Math.floor((feetY + 1) / 16); // +1 to check just below feet
        const gridXCenter = Math.floor(centerX / 16);
        const gridXLeft = Math.floor(leftX / 16);
        const gridXRight = Math.floor(rightX / 16);
        
        if (gridYFeet >= 0 && gridYFeet < level.length) {
            return (gridXCenter >= 0 && gridXCenter < level[0].length && level[gridYFeet] && level[gridYFeet][gridXCenter] > 0) ||
                   (gridXLeft >= 0 && gridXLeft < level[0].length && level[gridYFeet] && level[gridYFeet][gridXLeft] > 0) ||
                   (gridXRight >= 0 && gridXRight < level[0].length && level[gridYFeet] && level[gridYFeet][gridXRight] > 0);
        }
        return false;
    }
    
    /**
     * Check collisions - extracted exactly from Game.js Player.checkCollisions()
     */
    checkCollisions() {
        if (!this.gameInstance || !this.gameInstance.level) return;
        
        const level = this.gameInstance.level;
        
        // Check ground collision - exactly matching Game.js logic
        const feetY = this.y + this.height / 2;
        const centerX = this.x;
        const leftX = this.x - this.width / 2;
        const rightX = this.x + this.width / 2;
        
        // Check multiple points for ground collision
        const gridYFeet = Math.floor(feetY / 16);
        const gridXCenter = Math.floor(centerX / 16);
        const gridXLeft = Math.floor(leftX / 16);
        const gridXRight = Math.floor(rightX / 16);
        
        // Ground check - exactly matching Game.js logic
        if (gridYFeet >= 0 && gridYFeet < level.length) {
            const groundHit = (
                (gridXCenter >= 0 && gridXCenter < level[0].length && level[gridYFeet] && level[gridYFeet][gridXCenter] > 0) ||
                (gridXLeft >= 0 && gridXLeft < level[0].length && level[gridYFeet] && level[gridYFeet][gridXLeft] > 0) ||
                (gridXRight >= 0 && gridXRight < level[0].length && level[gridYFeet] && level[gridYFeet][gridXRight] > 0)
            );
            
            if (groundHit && this.vy >= 0) {
                this.y = gridYFeet * 16 - this.height / 2;
                this.vy = 0;
                this.grounded = true;
                return;
            }
        }
        
        this.grounded = false;
    }
    
    /**
     * Update animation - extracted exactly from Game.js Player.updateAnimation()
     */
    updateAnimation(deltaTime) {
        this.animTimer += deltaTime;
        
        // Exactly matching Game.js animation timing
        if (this.animTimer > 200) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }
        
        // Animation state logic - exactly matching Game.js
        if (!this.grounded) {
            this.currentAnimation = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 10) {
            this.currentAnimation = 'run';
        } else {
            this.currentAnimation = 'idle';
        }
    }
    
    /**
     * Hurt player - extracted exactly from Game.js Player.hurt()
     */
    hurt() {
        if (this.invulnerable) return;
        
        this.health--;
        this.invulnerable = true;
        this.invulnerabilityTimer = 2000;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Kill player - extracted exactly from Game.js Player.die()
     */
    die() {
        this.dead = true;
        // Respawn after delay - exactly matching Game.js
        setTimeout(() => {
            this.respawn();
        }, 1000);
    }
    
    /**
     * Respawn player - extracted exactly from Game.js Player.respawn()
     */
    respawn() {
        this.x = this.respawnX;
        this.y = this.respawnY;
        this.vx = 0;
        this.vy = 0;
        this.dead = false;
        this.health = 3;
        this.invulnerable = true;
        this.invulnerabilityTimer = 2000;
    }
    
    /**
     * Render player - matches Game.js drawing logic
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        if (!this.visible || this.destroyed) return;
        
        // Calculate screen position
        const screenX = this.x - this.width / 2 - camera.x;
        const screenY = this.y - this.height / 2 - camera.y;
        
        // Player color logic - exactly matching Game.js
        let playerColor = this.invulnerable ? '#FF8C00' : '#FF6B35';
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            playerColor = '#FFAAAA'; // Flashing when invulnerable
        }
        
        // Draw player rectangle - exactly matching Game.js
        ctx.fillStyle = playerColor;
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }
    
    /**
     * Set spawn point
     */
    setSpawnPoint(x, y) {
        this.respawnX = x;
        this.respawnY = y;
    }
    
    /**
     * Override Entity's onCollision for player-specific collision responses
     */
    onCollision(other, collisionData) {
        // Player-specific collision logic will be handled here
        // For now, delegate to hurt() method for damage sources
        if (other.type === 'fireball' || other.type === 'dog') {
            this.hurt();
        }
    }
    
    /**
     * Get player-specific state
     */
    getPlayerState() {
        return {
            ...this.getState(),
            health: this.health,
            grounded: this.grounded,
            dead: this.dead,
            invulnerable: this.invulnerable,
            invulnerabilityTimer: this.invulnerabilityTimer,
            climbing: this.climbing,
            respawnPoint: { x: this.respawnX, y: this.respawnY }
        };
    }
    
    /**
     * Serialize player data
     */
    serialize() {
        return {
            ...super.serialize(),
            health: this.health,
            respawnX: this.respawnX,
            respawnY: this.respawnY,
            grounded: this.grounded,
            dead: this.dead
        };
    }
    
    /**
     * Deserialize player data
     */
    deserialize(data) {
        super.deserialize(data);
        this.health = data.health !== undefined ? data.health : this.health;
        this.respawnX = data.respawnX !== undefined ? data.respawnX : this.respawnX;
        this.respawnY = data.respawnY !== undefined ? data.respawnY : this.respawnY;
        this.grounded = data.grounded !== undefined ? data.grounded : this.grounded;
        this.dead = data.dead !== undefined ? data.dead : this.dead;
    }
}

export default PlayerEntity;