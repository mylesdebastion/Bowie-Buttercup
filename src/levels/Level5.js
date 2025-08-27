/**
 * Level 5: Victory Feast
 * 
 * Final level with food and water bowls for victory celebration.
 * Extracted from Game.js with exact functional parity preserved.
 * 
 * Epic E003: Level System Implementation  
 * US-015: Level 4 & 5 Dog and Victory
 */

import { Level } from './Level.js';

export class Level5 extends Level {
    constructor() {
        const config = {
            name: 'Victory Feast',
            description: 'Enjoy your feast! Drink from the water bowl and eat from the food plate.',
            backgroundColor: '#87CEEB',
            boundaries: { width: 800, height: 480 },
            spawnPoint: { x: 100, y: 300 }
        };
        
        super(config);
        
        // Level 5 specific state
        this.waterBowl = null;
        this.foodPlate = null;
        this.catHasEaten = false;
        this.catHasDrunk = false;
    }

    load() {
        console.log('🍽️ Loading Level 5: Victory Feast');
        
        // Create level data - exact same as Game.js createLevel() for currentLevel === 5
        this.levelData = this.createLevelData();
        
        // Create platforms from level data
        this.createPlatforms();
        
        // Initialize victory items - exact same as Game.js Level 5 initialization
        this.initVictoryItems();
        
        // Level 5 doesn't have fish treats according to Game.js
        this.fishTreats = [];
        
        console.log('✅ Level 5 loaded successfully');
    }

    createLevelData() {
        const level = [];
        
        // Exact same level generation logic as Game.js for Level 5
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                if (y === 25) {
                    level[y][x] = 2; // Wood floor tile
                } else if (y > 25) {
                    level[y][x] = 2;
                } else if (x === 0 || x === 49) {
                    level[y][x] = 3; // Walls
                } else if (y === 0) {
                    level[y][x] = 3; // Ceiling
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

    initVictoryItems() {
        // Exact same victory items initialization as Game.js Level 5
        this.waterBowl = { x: 350, y: 370, width: 40, height: 20 };
        this.foodPlate = { x: 450, y: 370, width: 40, height: 20 };
        this.catHasEaten = false;
        this.catHasDrunk = false;
    }

    updateLevelMechanics(dt) {
        // Call parent for treat collection (though Level 5 has no treats)
        super.updateLevelMechanics(dt);
        
        if (!this.player) return;
        
        // Exact same victory logic as Game.js Level 5 update
        
        // Check if cat is near water bowl
        if (!this.catHasDrunk && 
            Math.abs(this.player.x - this.waterBowl.x) < 40 &&
            Math.abs(this.player.y - this.waterBowl.y) < 40) {
            this.catHasDrunk = true;
            console.log('💧 Cat has drunk from the water bowl!');
        }
        
        // Check if cat is near food plate
        if (!this.catHasEaten && 
            Math.abs(this.player.x - this.foodPlate.x) < 40 &&
            Math.abs(this.player.y - this.foodPlate.y) < 40) {
            this.catHasEaten = true;
            console.log('🍽️ Cat has eaten from the food plate!');
        }
    }

    checkWinCondition() {
        // Exact same win condition as Game.js Level 5
        return this.catHasEaten && this.catHasDrunk;
    }

    complete() {
        // Override complete to show win screen instead of next level
        this.completed = true;
        console.log(`🎉 ${this.name} completed! Victory achieved!`);
        
        // Show win screen instead of transitioning to next level
        if (this.game && this.game.showWinScreen) {
            this.game.showWinScreen();
        }
    }

    drawLevelEntities(ctx, camera) {
        // Call parent to draw treats (none in Level 5)
        super.drawLevelEntities(ctx, camera);
        
        // Draw water bowl and food plate - exact same logic as Game.js
        if (this.game && this.game.canvasManager) {
            // Draw water bowl - changes color when drunk from
            const waterColor = this.catHasDrunk ? '#87CEEB' : '#4169E1';
            this.game.canvasManager.fillRect(
                this.waterBowl.x, 
                this.waterBowl.y, 
                this.waterBowl.width, 
                this.waterBowl.height, 
                waterColor
            );
            
            // Draw food plate - changes color when eaten from
            const foodColor = this.catHasEaten ? '#D2691E' : '#FF6347';
            this.game.canvasManager.fillRect(
                this.foodPlate.x, 
                this.foodPlate.y, 
                this.foodPlate.width, 
                this.foodPlate.height, 
                foodColor
            );
        }
    }

    // Override getTileColor for Level 5 specific tiles
    getTileColor(tile) {
        switch (tile) {
            case 1: return '#8B4513'; // Brown platform (unused in Level 5)
            case 2: return '#DEB887'; // Wood floor (lighter brown)
            case 3: return '#8B4513'; // Walls (darker brown)
            case 4: return '#228B22'; // Grass (unused in Level 5)
            default: return '#8B4513';
        }
    }

    cleanup() {
        super.cleanup();
        
        // Clean up level-specific state
        this.waterBowl = null;
        this.foodPlate = null;
        this.catHasEaten = false;
        this.catHasDrunk = false;
        
        console.log('🧹 Level 5 cleaned up');
    }

    // Debug information
    debugInfo() {
        return {
            ...super.debugInfo(),
            catHasEaten: this.catHasEaten,
            catHasDrunk: this.catHasDrunk,
            victoryProgress: this.catHasEaten && this.catHasDrunk ? 'Complete' : 
                           this.catHasEaten || this.catHasDrunk ? 'In Progress' : 'Not Started',
            waterBowlDistance: this.player ? 
                Math.round(Math.sqrt(Math.pow(this.player.x - this.waterBowl.x, 2) + Math.pow(this.player.y - this.waterBowl.y, 2))) : 'N/A',
            foodPlateDistance: this.player ? 
                Math.round(Math.sqrt(Math.pow(this.player.x - this.foodPlate.x, 2) + Math.pow(this.player.y - this.foodPlate.y, 2))) : 'N/A'
        };
    }
}

export default Level5;