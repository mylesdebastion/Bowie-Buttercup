/**
 * Fireball Entity Module - Part of US-008: Secondary Entities Extraction
 * 
 * Extracted from monolithic Game.js Fireball class
 * Preserves exact physics, collision, and behavior
 * 
 * Critical Requirements:
 * - Trajectory and physics match original precisely
 * - Collision detection with player and platforms works identically  
 * - Visual effects (trail, glow) are preserved
 * - Bouncing behavior maintains exact timing and physics
 */

import { Entity } from './Entity.js';

export class FireballEntity extends Entity {
    constructor(x, y, vx = 0, vy = 0, options = {}) {
        super(x, y, {
            width: 12,
            height: 12,
            solid: false,
            collidable: true,
            gravity: false, // Fireball handles own gravity
            ...options
        });
        
        // Physics - exactly matching Game.js Fireball
        this.vx = vx;
        this.vy = vy;
        
        // Physics constants - exactly matching Game.js
        this.GRAVITY = 200; // Matches Game.js fireball gravity
        this.BOUNCE_DAMPING = 0.8; // Matches Game.js bounce damping
        this.FRICTION = 0.9; // Matches Game.js horizontal friction
        
        // Visual properties
        this.color = '#FF0000';
        this.trailParticles = [];
        
        // Reference to game systems
        this.gameInstance = null;
        
        // Set entity type
        this.type = 'fireball';
    }
    
    /**
     * Initialize with game instance for system access
     */
    initialize(gameInstance) {
        this.gameInstance = gameInstance;
    }
    
    /**
     * Main update method - extracted exactly from Game.js Fireball.update()
     */
    update(deltaTime, gameState) {
        if (!this.active || this.destroyed) return;
        
        // Update position - exactly matching Game.js logic
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Apply gravity - exactly matching Game.js logic
        this.vy += 200 * deltaTime / 1000;
        
        // Bounce off platforms - exactly matching Game.js logic
        this.checkPlatformCollisions();
        
        // Bounce off screen edges - exactly matching Game.js logic
        if (this.x < 0 || this.x > 800) {
            this.vx = -this.vx;
        }
        
        // Update trail effect
        this.updateTrailParticles(deltaTime);
    }
    
    /**
     * Check platform collisions - extracted exactly from Game.js Fireball.update()
     */
    checkPlatformCollisions() {
        if (!this.gameInstance || !this.gameInstance.level) return;
        
        const level = this.gameInstance.level;
        const gridX = Math.floor(this.x / 16);
        const gridY = Math.floor(this.y / 16);
        
        // Exactly matching Game.js collision logic
        if (gridY >= 0 && gridY < level.length && 
            gridX >= 0 && gridX < level[0].length &&
            level[gridY] && level[gridY][gridX] > 0) {
            
            // Bounce exactly matching Game.js physics
            this.vy = -Math.abs(this.vy) * 0.8;
            this.vx *= 0.9;
        }
    }
    
    /**
     * Update trail particles for visual effect
     */
    updateTrailParticles(deltaTime) {
        // Create trail particle every few frames
        if (Math.random() < 0.3) {
            this.trailParticles.push({
                x: this.x,
                y: this.y,
                life: 300,
                maxLife: 300,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50
            });
        }
        
        // Update existing trail particles
        this.trailParticles = this.trailParticles.filter(particle => {
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= deltaTime;
            return particle.life > 0;
        });
        
        // Limit trail particle count for performance
        if (this.trailParticles.length > 10) {
            this.trailParticles = this.trailParticles.slice(-10);
        }
    }
    
    /**
     * Check collision with player - extracted exactly from Game.js Fireball.checkCollision()
     */
    checkCollision(player) {
        return Math.abs(this.x - player.x) < 20 && Math.abs(this.y - player.y) < 20;
    }
    
    /**
     * Render fireball - matches Game.js drawing logic
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        if (!this.visible || this.destroyed) return;
        
        // Calculate screen position
        const screenX = this.x - this.width / 2 - camera.x;
        const screenY = this.y - this.height / 2 - camera.y;
        
        // Draw trail particles first (behind fireball)
        this.renderTrail(ctx, camera);
        
        // Draw fireball - exactly matching Game.js
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Add glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    /**
     * Render trail particles
     */
    renderTrail(ctx, camera) {
        this.trailParticles.forEach(particle => {
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            const alpha = particle.life / particle.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.7;
            ctx.fillStyle = '#FF6600';
            ctx.fillRect(screenX - 1, screenY - 1, 2, 2);
            ctx.restore();
        });
    }
    
    /**
     * Override Entity's onCollision for fireball-specific collision responses
     */
    onCollision(other, collisionData) {
        if (other.type === 'player') {
            // Fireball hits player - player will handle damage
            other.hurt();
        }
    }
    
    /**
     * Create explosion particles when fireball is destroyed
     */
    onDestroy() {
        if (this.gameInstance && this.gameInstance.particles) {
            // Create explosion particles
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const speed = 100 + Math.random() * 50;
                this.gameInstance.particles.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 500,
                    maxLife: 500,
                    color: '#FF4500'
                });
            }
        }
    }
    
    /**
     * Get fireball-specific state
     */
    getFireballState() {
        return {
            ...this.getState(),
            trailParticleCount: this.trailParticles.length,
            gravity: this.GRAVITY,
            bounceCount: this.bounceCount || 0
        };
    }
}

export default FireballEntity;