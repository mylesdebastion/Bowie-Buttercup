/**
 * Level Base Class
 * 
 * Provides standardized interface and common functionality for all game levels.
 * Extracted from monolithic Game.js to enable modular level architecture.
 * 
 * Epic E003: Level System Implementation
 * US-011: Level Base Class and Interface
 */

export class Level {
    constructor(config = {}) {
        // Level configuration
        this.config = config;
        this.name = config.name || 'Unnamed Level';
        this.description = config.description || '';
        
        // Level state
        this.completed = false;
        this.active = false;
        this.goalReached = false;
        
        // World properties
        this.boundaries = config.boundaries || { width: 800, height: 480 };
        this.spawnPoint = config.spawnPoint || { x: 100, y: 300 };
        
        // Level data
        this.levelData = [];
        this.platforms = [];
        this.entities = [];
        this.fishTreats = [];
        
        // Level-specific properties
        this.backgroundColor = config.backgroundColor || '#87CEEB';
        
        // References to game systems (set by LevelManager)
        this.game = null;
        this.entityManager = null;
        this.player = null;
    }

    // Abstract methods - must be implemented by subclasses
    load() {
        throw new Error('Must implement load() method in level subclass');
    }

    checkWinCondition() {
        throw new Error('Must implement checkWinCondition() method in level subclass');
    }

    // Standard lifecycle methods
    start() {
        this.active = true;
        this.completed = false;
        this.goalReached = false;
        console.log(`🎮 Starting ${this.name}`);
    }

    update(dt) {
        if (!this.active || this.completed) return;

        // Update level-specific entities and mechanics
        this.updateLevelMechanics(dt);
        
        // Check for level completion
        if (this.checkWinCondition() && !this.goalReached) {
            this.goalReached = true;
            this.complete();
        }
    }

    render(ctx, camera) {
        if (!this.active) return;

        // Draw level background
        this.drawBackground(ctx, camera);
        
        // Draw platforms/level geometry
        this.drawLevel(ctx, camera);
        
        // Draw level-specific entities
        this.drawLevelEntities(ctx, camera);
    }

    cleanup() {
        this.active = false;
        
        // Clean up level-specific entities
        this.entities.forEach(entity => {
            if (entity.cleanup) {
                entity.cleanup();
            }
        });
        
        this.entities = [];
        this.fishTreats = [];
        
        console.log(`🧹 Cleaned up ${this.name}`);
    }

    // Shared utility methods
    initializePlayer() {
        if (this.player) {
            this.player.x = this.spawnPoint.x;
            this.player.y = this.spawnPoint.y;
            this.player.respawnX = this.spawnPoint.x;
            this.player.respawnY = this.spawnPoint.y;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.dead = false;
            this.player.climbing = false;
        }
    }

    createLevelData() {
        // Create default empty level
        const level = [];
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                level[y][x] = 0;
            }
        }
        return level;
    }

    addPlatform(x, y, width, height, type = 1) {
        const platform = { x, y, width, height, type };
        this.platforms.push(platform);
        
        // Add to level data for collision detection
        const startX = Math.floor(x / 16);
        const startY = Math.floor(y / 16);
        const endX = Math.floor((x + width) / 16);
        const endY = Math.floor((y + height) / 16);
        
        for (let py = startY; py <= endY; py++) {
            for (let px = startX; px <= endX; px++) {
                if (this.levelData[py] && px >= 0 && px < this.levelData[py].length) {
                    this.levelData[py][px] = type;
                }
            }
        }
    }

    spawnEntity(entityType, x, y, config = {}) {
        // This will be implemented by subclasses or use EntityFactory
        console.log(`Spawning ${entityType} at (${x}, ${y})`);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    createFishTreats() {
        // Default treat configuration - can be overridden by subclasses
        return [
            {x: 240, y: 280, collected: false},
            {x: 360, y: 250, collected: false},
            {x: 520, y: 330, collected: false},
            {x: 600, y: 200, collected: false}
        ];
    }

    collectTreats(player) {
        this.fishTreats.forEach(fish => {
            if (!fish.collected) {
                const dx = Math.abs(player.x - fish.x);
                const dy = Math.abs(player.y - fish.y);
                if (dx < 20 && dy < 20) {
                    fish.collected = true;
                    if (this.game) {
                        this.game.score += 100;
                        this.game.treatsCollected++;
                        this.game.speedBoost = Math.min(2, this.game.speedBoost + 0.15);
                        this.game.speedBoostTimer = 5000;
                        this.game.playSound('collect');
                    }
                }
            }
        });
    }

    // Drawing methods
    drawBackground(ctx, camera) {
        // Override in subclasses for level-specific backgrounds
    }

    drawLevel(ctx, camera) {
        if (!this.levelData) return;

        for (let y = 0; y < this.levelData.length; y++) {
            for (let x = 0; x < this.levelData[y].length; x++) {
                const tile = this.levelData[y][x];
                if (tile > 0) {
                    const drawX = x * 16;
                    const drawY = y * 16;
                    
                    let tileColor = this.getTileColor(tile);
                    
                    if (this.game && this.game.canvasManager) {
                        this.game.canvasManager.fillRect(drawX, drawY, 16, 16, tileColor);
                    }
                }
            }
        }
    }

    getTileColor(tile) {
        switch (tile) {
            case 1: return '#8B4513'; // Brown platform
            case 2: return '#FF4500'; // Lava/red or wood floor
            case 3: return '#DC143C'; // Red couch/walls
            case 4: return '#228B22'; // Grass/cat tree
            default: return '#8B4513';
        }
    }

    drawLevelEntities(ctx, camera) {
        // Draw fish treats
        this.fishTreats.forEach(fish => {
            if (!fish.collected && this.game && this.game.canvasManager) {
                this.game.canvasManager.fillRect(fish.x - 5, fish.y - 5, 10, 10, '#FF8C00');
            }
        });
    }

    // Level mechanics - to be implemented by subclasses
    updateLevelMechanics(dt) {
        // Default implementation handles treat collection
        if (this.player) {
            this.collectTreats(this.player);
        }
    }

    // Completion handling
    complete() {
        this.completed = true;
        console.log(`✅ ${this.name} completed!`);
        
        // Notify game of level completion
        if (this.game && this.game.nextLevel) {
            this.game.nextLevel();
        }
    }

    // Utility methods for level access
    isCompleted() {
        return this.completed;
    }

    isActive() {
        return this.active;
    }

    getName() {
        return this.name;
    }

    getSpawnPoint() {
        return { ...this.spawnPoint };
    }

    getBoundaries() {
        return { ...this.boundaries };
    }

    getLevelData() {
        return this.levelData;
    }

    // Cat tree utility for Level 3
    addCatTree(level, x, groundY, height) {
        // Cat tree trunk (climbable)
        for (let y = groundY - height; y < groundY; y++) {
            if (level[y]) {
                level[y][x] = 4; // Cat tree tile
                if (level[y][x + 1] !== undefined) {
                    level[y][x + 1] = 4;
                }
            }
        }
        
        // Platform on top
        const topY = groundY - height - 1;
        if (level[topY]) {
            for (let px = x - 1; px <= x + 2; px++) {
                if (px >= 0 && px < 50 && level[topY][px] !== undefined) {
                    level[topY][px] = 1;
                }
            }
        }
    }

    // Integration with game systems
    setGameReference(game) {
        this.game = game;
        this.player = game.player;
        this.entityManager = game.entityManager;
    }

    // Debug methods
    debugInfo() {
        return {
            name: this.name,
            active: this.active,
            completed: this.completed,
            entityCount: this.entities.length,
            treatCount: this.fishTreats.filter(t => !t.collected).length
        };
    }
}

export default Level;