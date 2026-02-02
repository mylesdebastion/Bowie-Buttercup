/**
 * Level 2: Mouse Catching Arena
 * 
 * Arena level featuring mouse catching mechanics.
 * Extracted from Game.js with exact functional parity preserved.
 * 
 * Epic E003: Level System Implementation  
 * US-013: Level 2 Mouse Catching Arena
 */

import { Level } from './Level.js';

// Mouse entity (extracted from Game.js)
class Mouse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 12;
        this.vx = Math.random() > 0.5 ? 50 : -50;
        this.vy = 0;
        this.direction = this.vx > 0 ? 1 : -1;
        this.moveTimer = 0;
        this.caught = false;
        this.jumpCooldown = 0;
    }

    update(dt) {
        if (this.caught) return;
        
        this.jumpCooldown -= dt;
        this.moveTimer += dt;
        
        // Exact same logic as Game.js Mouse.update()
        if (this.moveTimer > 2000 + Math.random() * 3000) {
            this.direction *= -1;
            this.vx = this.direction * (30 + Math.random() * 40);
            this.moveTimer = 0;
        }
        
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        
        // Simple ground collision - exact same as Game.js
        if (this.y > 350) {
            this.y = 350;
            this.vy = 0;
        }
    }

    checkCaught(player) {
        if (this.caught) return false;
        
        // Exact same catching logic as Game.js
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        
        if (dx < 25 && dy < 25 && Math.abs(player.vx) > 50) {
            this.caught = true;
            return true;
        }
        return false;
    }

    checkCollisionWithStaticCat(player) {
        // Exact same static collision logic as Game.js
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        return dx < 30 && dy < 30 && Math.abs(player.vx) < 10;
    }

    render(ctx) {
        if (!this.caught) {
            ctx.fillStyle = '#808080';
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
    }
}

export class Level2 extends Level {
    constructor() {
        const config = {
            name: 'Mouse Catching Arena', 
            description: 'Catch mice by running into them',
            backgroundColor: '#4A5F7A', // Different background for Level 2
            boundaries: { width: 800, height: 480 },
            spawnPoint: { x: 100, y: 300 }
        };
        
        super(config);
        
        // Level 2 specific state
        this.mice = [];
        this.miceRequired = 0;
    }

    load() {
        console.log('🐭 Loading Level 2: Mouse Catching Arena');
        
        // Create level data - exact same as Game.js createLevel() for currentLevel === 2
        this.levelData = this.createLevelData();
        
        // Create platforms from level data
        this.createPlatforms();
        
        // Initialize mice - exact same as Game.js initMice()
        this.initMice();
        
        // Create fish treats - exact same as Game.js
        this.fishTreats = this.createFishTreats();
        
        console.log('✅ Level 2 loaded successfully');
    }

    createLevelData() {
        const level = [];
        
        // Exact same level generation logic as Game.js for Level 2
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                if (y === 25) {
                    level[y][x] = 1; // Main ground
                } else if (y === 22 && x >= 8 && x <= 12) {
                    level[y][x] = 1; // Small platform left
                } else if (y === 20 && x >= 18 && x <= 22) {
                    level[y][x] = 1; // Mid platform
                } else if (y === 22 && x >= 28 && x <= 32) {
                    level[y][x] = 1; // Small platform right
                } else if (y === 18 && x >= 38 && x <= 42) {
                    level[y][x] = 1; // High platform
                } else {
                    level[y][x] = 0;
                }
            }
        }
        
        return level;
    }

    createPlatforms() {
        // Extract platforms from level data for easier access
        this.platforms = [];
        
        for (let y = 0; y < this.levelData.length; y++) {
            for (let x = 0; x < this.levelData[y].length; x++) {
                if (this.levelData[y][x] > 0) {
                    this.platforms.push({
                        x: x * 16,
                        y: y * 16,
                        width: 16,
                        height: 16,
                        type: this.levelData[y][x]
                    });
                }
            }
        }
    }

    initMice() {
        // Exact same mouse initialization as Game.js initMice()
        this.mice = [];
        const mousePositions = [
            {x: 200, y: 350}, {x: 350, y: 350}, {x: 500, y: 350},
            {x: 180, y: 300}, {x: 320, y: 280}, {x: 450, y: 250},
            {x: 600, y: 350}, {x: 700, y: 350}
        ];
        
        mousePositions.forEach(pos => {
            this.mice.push(new Mouse(pos.x, pos.y));
        });

        this.miceRequired = this.mice.length;
    }

    updateLevelMechanics(dt) {
        // Call parent for treat collection
        super.updateLevelMechanics(dt);
        
        // Update mice - exact same logic as Game.js Level 2 update
        this.mice.forEach(mouse => {
            mouse.update(dt);
            
            // Check if mouse was caught - exact same logic as Game.js
            if (mouse.checkCaught(this.player) && this.game) {
                this.game.score += 200;
                this.game.playSound('collect');
            }
            
            // Check collision with static cat - exact same logic as Game.js
            if (mouse.checkCollisionWithStaticCat(this.player) && this.game) {
                if (this.game.treatsCollected > 0) {
                    this.game.ejectTreats();
                    mouse.direction *= -1;
                }
            }
        });
    }

    checkWinCondition() {
        // Exact same win condition as Game.js Level 2
        const uncaughtMice = this.mice.filter(m => !m.caught).length;
        return uncaughtMice === 0;
    }

    drawBackground(ctx, camera) {
        // Level 2 has a different background color - already set in config
    }

    drawLevelEntities(ctx, camera) {
        // Call parent to draw treats
        super.drawLevelEntities(ctx, camera);
        
        // Draw mice using game's canvas manager
        if (this.game && this.game.canvasManager) {
            this.mice.forEach(mouse => {
                if (!mouse.caught) {
                    this.game.canvasManager.fillRect(
                        mouse.x - mouse.width/2, 
                        mouse.y - mouse.height/2, 
                        mouse.width, 
                        mouse.height, 
                        '#808080'
                    );
                }
            });
        }
    }

    cleanup() {
        super.cleanup();
        
        // Clean up level-specific entities
        this.mice = [];
        this.miceRequired = 0;
        
        console.log('🧹 Level 2 cleaned up');
    }

    // Debug information
    debugInfo() {
        const uncaughtMice = this.mice.filter(m => !m.caught).length;
        const caughtMice = this.mice.filter(m => m.caught).length;
        
        return {
            ...super.debugInfo(),
            totalMice: this.mice.length,
            caughtMice: caughtMice,
            uncaughtMice: uncaughtMice,
            progressPercent: this.mice.length > 0 ? Math.round((caughtMice / this.mice.length) * 100) : 0
        };
    }
}

export default Level2;