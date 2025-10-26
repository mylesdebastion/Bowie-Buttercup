/**
 * Level 1: Fireball Platformer
 * 
 * First level featuring platforming mechanics with dodging fireballs.
 * Extracted from Game.js with exact functional parity preserved.
 * 
 * Epic E003: Level System Implementation  
 * US-012: Level 1 Fireball Platformer
 */

import { Level } from './Level.js';

// Fireball entity (extracted from Game.js)
class Fireball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 12;
        this.height = 12;
    }

    update(dt, level) {
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        this.vy += 200 * dt / 1000; // Gravity
        
        // Bounce off platforms - exact same logic as Game.js
        if (level) {
            const gridX = Math.floor(this.x / 16);
            const gridY = Math.floor(this.y / 16);
            
            if (gridY >= 0 && gridY < level.length && 
                gridX >= 0 && gridX < level[0].length &&
                level[gridY] && level[gridY][gridX] > 0) {
                this.vy = -Math.abs(this.vy) * 0.8;
                this.vx *= 0.9;
            }
        }

        // Bounce off screen edges - exact same logic as Game.js
        if (this.x < 0 || this.x > 800) {
            this.vx = -this.vx;
        }
    }

    checkCollision(player) {
        return Math.abs(this.x - player.x) < 20 && Math.abs(this.y - player.y) < 20;
    }

    render(ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

export class Level1 extends Level {
    constructor() {
        const config = {
            name: 'Fireball Platformer',
            description: 'Navigate platforms while avoiding fireballs',
            backgroundColor: '#87CEEB',
            boundaries: { width: 800, height: 480 },
            spawnPoint: { x: 100, y: 300 }
        };
        
        super(config);
        
        // Level 1 specific state
        this.fireballs = [];
    }

    load() {
        console.log('🔥 Loading Level 1: Fireball Platformer');
        
        // Create level data - exact same as Game.js createLevel() for currentLevel === 1
        this.levelData = this.createLevelData();
        
        // Create platforms from level data
        this.createPlatforms();
        
        // Initialize fireballs - exact same as Game.js initFireballs()
        this.initFireballs();
        
        // Create fish treats - exact same as Game.js
        this.fishTreats = this.createFishTreats();
        
        console.log('✅ Level 1 loaded successfully');
    }

    createLevelData() {
        const level = [];
        
        // Exact same level generation logic as Game.js for Level 1
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                if (y === 25) {
                    level[y][x] = 1; // Main ground
                } else if (y === 20 && x >= 10 && x <= 14) {
                    level[y][x] = 1; // Platform 1
                } else if (y === 18 && x >= 20 && x <= 24) {
                    level[y][x] = 1; // Platform 2
                } else if (y === 22 && x >= 30 && x <= 34) {
                    level[y][x] = 1; // Platform 3
                } else if (y === 15 && x >= 25 && x <= 29) {
                    level[y][x] = 1; // Higher platform
                } else if (y === 16 && x >= 40 && x <= 44) {
                    level[y][x] = 1; // Another platform
                } else if (y > 26 && x >= 15 && x <= 19) {
                    level[y][x] = 2; // Lava pit
                } else if (y === 25 && x >= 5 && x <= 12) {
                    level[y][x] = 3; // Red couch seat (on ground)
                } else if (y === 24 && x >= 5 && x <= 12) {
                    level[y][x] = 3; // Red couch seat middle
                } else if (y === 23 && x >= 5 && x <= 12) {
                    level[y][x] = 3; // Red couch backrest
                } else if (y === 22 && x >= 5 && x <= 12) {
                    level[y][x] = 3; // Red couch backrest top
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

    initFireballs() {
        // Exact same fireball initialization as Game.js initFireballs()
        this.fireballs = [];
        for (let i = 0; i < 3; i++) {
            this.fireballs.push(new Fireball(
                200 + i * 200,
                100,
                (Math.random() - 0.5) * 100,
                0
            ));
        }
    }

    updateLevelMechanics(dt) {
        // Call parent for treat collection
        super.updateLevelMechanics(dt);
        
        // Update fireballs - exact same logic as Game.js
        this.fireballs.forEach(fireball => {
            fireball.update(dt, this.levelData);
            
            // Check collision with player - exact same logic as Game.js
            if (this.player && fireball.checkCollision(this.player)) {
                this.player.hurt();
            }
        });
    }

    checkWinCondition() {
        // Exact same win condition as Game.js Level 1
        if (this.player && this.player.x > 750) {
            return true;
        }
        return false;
    }

    drawLevelEntities(ctx, camera) {
        // Call parent to draw treats
        super.drawLevelEntities(ctx, camera);

        // Draw "Hello World" test text at top of level
        if (ctx) {
            ctx.save();
            ctx.font = '32px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText('Hello World', 400, 50);
            ctx.restore();
        }

        // Draw fireballs using game's canvas manager
        if (this.game && this.game.canvasManager) {
            this.fireballs.forEach(fireball => {
                this.game.canvasManager.fillRect(
                    fireball.x - fireball.width/2,
                    fireball.y - fireball.height/2,
                    fireball.width,
                    fireball.height,
                    '#FF0000'
                );
            });
        }
    }

    cleanup() {
        super.cleanup();
        
        // Clean up level-specific entities
        this.fireballs = [];
        
        console.log('🧹 Level 1 cleaned up');
    }

    // Debug information
    debugInfo() {
        return {
            ...super.debugInfo(),
            fireballCount: this.fireballs.length,
            playerX: this.player ? Math.round(this.player.x) : 'N/A',
            winZoneDistance: this.player ? Math.max(0, 750 - this.player.x) : 'N/A'
        };
    }
}

export default Level1;