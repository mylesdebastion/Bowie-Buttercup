/**
 * Level 3: Challenge Arena
 * 
 * Challenge level with pits and complex platforming.
 * Extracted from Game.js with exact functional parity preserved.
 * 
 * Epic E003: Level System Implementation  
 * US-014: Level 3 Challenge Arena
 */

import { Level } from './Level.js';

export class Level3 extends Level {
    constructor() {
        const config = {
            name: 'Challenge Arena',
            description: 'Navigate dangerous platforms and reach the cat tree',
            backgroundColor: '#87CEEB',
            boundaries: { width: 800, height: 480 },
            spawnPoint: { x: 100, y: 300 }
        };
        
        super(config);
        
        // Level 3 specific state
        this.catTreeX = 40;
        this.catTreeHeight = 5;
    }

    load() {
        console.log('🏔️ Loading Level 3: Challenge Arena');
        
        // Create level data - exact same as Game.js createLevel() for currentLevel === 3
        this.levelData = this.createLevelData();
        
        // Create platforms from level data
        this.createPlatforms();
        
        // Create fish treats - exact same as Game.js
        this.fishTreats = this.createFishTreats();
        
        console.log('✅ Level 3 loaded successfully');
    }

    createLevelData() {
        const level = [];
        
        // Exact same level generation logic as Game.js for Level 3
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                if (y === 25) {
                    // Ground with gaps (pits) - exact same logic as Game.js
                    if (x < 8 || (x >= 12 && x <= 18) || (x >= 23 && x <= 30) || x >= 35) {
                        level[y][x] = 1;
                    } else {
                        level[y][x] = 0; // Pits
                    }
                } else if (y === 22 && x >= 5 && x <= 7) {
                    level[y][x] = 1; // Small safe platform before first pit
                } else if (y === 20 && x >= 9 && x <= 11) {
                    level[y][x] = 1; // Floating platform over first pit
                } else if (y === 19 && x >= 20 && x <= 22) {
                    level[y][x] = 1; // Floating platform over second pit
                } else if (y === 20 && x >= 26 && x <= 28) {
                    level[y][x] = 1; // Higher platform (lowered for easier jumping)
                } else if (y === 23 && x >= 32 && x <= 34) {
                    level[y][x] = 1; // Platform over third pit (lowered for easier jumping)
                } else if (y === 15 && x >= 15 && x <= 17) {
                    level[y][x] = 1; // High challenge platform
                } else if (y === 23 && x === 25) {
                    level[y][x] = 3; // Red couch for big jump
                } else if (y === 24 && x === 6) {
                    level[y][x] = 3; // Another couch
                } else {
                    level[y][x] = 0;
                }
            }
        }
        
        // Add cat tree at x=40 - exact same logic as Game.js
        this.addCatTree(level, this.catTreeX, 25, this.catTreeHeight);
        
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

    updateLevelMechanics(dt) {
        // Call parent for treat collection
        super.updateLevelMechanics(dt);
        
        // Level 3 has no specific mechanics - just platforming and pit avoidance
        // All mechanics are handled by the base player physics and collision systems
    }

    checkWinCondition() {
        // Exact same win condition as Game.js Level 3 - reach x > 740
        if (this.player && this.player.x > 740) {
            return true;
        }
        return false;
    }

    drawLevelEntities(ctx, camera) {
        // Call parent to draw treats
        super.drawLevelEntities(ctx, camera);
        
        // Level 3 has no additional entities to draw beyond treats
        // The cat tree is part of the level geometry
    }

    cleanup() {
        super.cleanup();
        
        console.log('🧹 Level 3 cleaned up');
    }

    // Debug information
    debugInfo() {
        return {
            ...super.debugInfo(),
            playerX: this.player ? Math.round(this.player.x) : 'N/A',
            winZoneDistance: this.player ? Math.max(0, 740 - this.player.x) : 'N/A',
            catTreePosition: this.catTreeX * 16,
            platformCount: this.platforms.length
        };
    }
}

export default Level3;