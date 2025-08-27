/**
 * Particle Entity Module - Part of US-008: Secondary Entities Extraction
 * 
 * Extracted from monolithic Game.js Particle class
 * Preserves exact particle physics, lifecycle, and visual effects
 * 
 * Critical Requirements:
 * - All particle behaviors match original (movement, lifecycle, appearance)
 * - Performance impact is identical or better
 * - Particle pooling and memory management is efficient
 * - Visual effects maintain original quality
 */

import { Entity } from './Entity.js';

export class ParticleEntity extends Entity {
    constructor(x, y, vx = null, vy = null, options = {}) {
        super(x, y, {
            width: 4,
            height: 4,
            solid: false,
            collidable: false,
            gravity: true,
            maxAge: options.life || 500,
            ...options
        });
        
        // Physics - exactly matching Game.js Particle
        this.vx = vx !== null ? vx : (Math.random() - 0.5) * 200;
        this.vy = vy !== null ? vy : (-Math.random() * 100 - 50);
        
        // Lifecycle - exactly matching Game.js Particle
        this.life = options.life || 500;
        this.maxLife = this.life;
        
        // Visual properties - exactly matching Game.js Particle
        this.color = options.color || '#ff6b35';
        this.startColor = this.color;
        this.endColor = options.endColor || '#ff0000';
        
        // Physics constants - exactly matching Game.js
        this.GRAVITY = 300; // Matches Game.js particle gravity
        
        // Set entity type
        this.type = 'particle';
        
        // Particle-specific properties
        this.fadeOut = options.fadeOut !== false;
        this.shrink = options.shrink || false;
        this.startSize = { width: this.width, height: this.height };
    }
    
    /**
     * Main update method - extracted exactly from Game.js Particle.update()
     */
    update(deltaTime, gameState) {
        if (!this.active || this.destroyed) return;
        
        // Update position - exactly matching Game.js logic
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        
        // Apply gravity - exactly matching Game.js logic
        this.vy += this.GRAVITY * deltaTime / 1000;
        
        // Update life - exactly matching Game.js logic
        this.life -= deltaTime;
        
        // Check if particle should be destroyed
        if (this.life <= 0) {
            this.destroy();
            return;
        }
        
        // Update visual properties based on life
        this.updateVisuals();
    }
    
    /**
     * Update visual properties as particle ages
     */
    updateVisuals() {
        const lifeRatio = this.life / this.maxLife;
        
        // Fade out over time if enabled
        if (this.fadeOut) {
            this.alpha = lifeRatio;
        }
        
        // Shrink over time if enabled
        if (this.shrink) {
            this.width = this.startSize.width * lifeRatio;
            this.height = this.startSize.height * lifeRatio;
        }
        
        // Color interpolation if end color is specified
        if (this.endColor && this.endColor !== this.startColor) {
            this.color = this.interpolateColor(this.startColor, this.endColor, 1 - lifeRatio);
        }
    }
    
    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, factor) {
        // Simple color interpolation - could be enhanced
        // For now, just return the start color
        return color1;
    }
    
    /**
     * Render particle - matches Game.js drawing logic
     */
    render(ctx, camera = { x: 0, y: 0 }) {
        if (!this.visible || this.destroyed) return;
        
        // Calculate screen position
        const screenX = this.x - this.width / 2 - camera.x;
        const screenY = this.y - this.height / 2 - camera.y;
        
        // Apply alpha if fading
        if (this.fadeOut && this.alpha !== undefined) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
        }
        
        // Draw particle - exactly matching Game.js logic
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Restore alpha
        if (this.fadeOut && this.alpha !== undefined) {
            ctx.restore();
        }
    }
    
    /**
     * Check if particle is still alive
     */
    isAlive() {
        return this.life > 0 && !this.destroyed;
    }
    
    /**
     * Reset particle for object pooling
     */
    reset(x, y, vx, vy, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = vx !== null ? vx : (Math.random() - 0.5) * 200;
        this.vy = vy !== null ? vy : (-Math.random() * 100 - 50);
        this.life = options.life || 500;
        this.maxLife = this.life;
        this.color = options.color || '#ff6b35';
        this.startColor = this.color;
        this.endColor = options.endColor || '#ff0000';
        this.active = true;
        this.destroyed = false;
        this.visible = true;
        this.alpha = 1;
        this.width = this.startSize.width;
        this.height = this.startSize.height;
        this.age = 0;
    }
    
    /**
     * Get particle-specific state
     */
    getParticleState() {
        return {
            ...this.getState(),
            life: this.life,
            maxLife: this.maxLife,
            color: this.color,
            alpha: this.alpha || 1,
            lifeRatio: this.life / this.maxLife
        };
    }
    
    /**
     * Create explosion of particles
     */
    static createExplosion(x, y, count = 8, options = {}) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = (options.speed || 100) + Math.random() * (options.speedVariation || 50);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particles.push(new ParticleEntity(x, y, vx, vy, {
                life: (options.life || 500) + Math.random() * (options.lifeVariation || 200),
                color: options.color || '#ff6b35',
                endColor: options.endColor,
                fadeOut: options.fadeOut !== false,
                shrink: options.shrink || false
            }));
        }
        return particles;
    }
    
    /**
     * Create spray of particles
     */
    static createSpray(x, y, direction, count = 5, options = {}) {
        const particles = [];
        const spreadAngle = options.spread || Math.PI / 3; // 60 degrees
        const baseAngle = direction - spreadAngle / 2;
        
        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (spreadAngle / count) * i + (Math.random() - 0.5) * 0.2;
            const speed = (options.speed || 100) + Math.random() * (options.speedVariation || 50);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particles.push(new ParticleEntity(x, y, vx, vy, {
                life: (options.life || 500) + Math.random() * (options.lifeVariation || 200),
                color: options.color || '#ff6b35',
                endColor: options.endColor,
                fadeOut: options.fadeOut !== false,
                shrink: options.shrink || false
            }));
        }
        return particles;
    }
}

/**
 * Particle System Manager for efficient particle handling
 */
export class ParticleSystem {
    constructor(maxParticles = 100) {
        this.particles = [];
        this.maxParticles = maxParticles;
        this.pool = []; // Object pool for performance
    }
    
    /**
     * Create a new particle (using object pooling)
     */
    createParticle(x, y, vx, vy, options = {}) {
        let particle;
        
        if (this.pool.length > 0) {
            particle = this.pool.pop();
            particle.reset(x, y, vx, vy, options);
        } else {
            particle = new ParticleEntity(x, y, vx, vy, options);
        }
        
        this.particles.push(particle);
        
        // Limit particle count for performance
        if (this.particles.length > this.maxParticles) {
            const removed = this.particles.shift();
            this.pool.push(removed);
        }
        
        return particle;
    }
    
    /**
     * Update all particles
     */
    update(deltaTime, gameState) {
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime, gameState);
            
            if (!particle.isAlive()) {
                // Return to pool
                this.pool.push(particle);
                return false;
            }
            return true;
        });
    }
    
    /**
     * Render all particles
     */
    render(ctx, camera) {
        this.particles.forEach(particle => {
            particle.render(ctx, camera);
        });
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.pool.push(...this.particles);
        this.particles = [];
    }
    
    /**
     * Get particle count
     */
    getCount() {
        return this.particles.length;
    }
}

export default ParticleEntity;