/**
 * Level Manager
 * 
 * Manages level lifecycle, transitions, and registration.
 * Provides centralized level management for the game engine.
 * 
 * Epic E003: Level System Implementation
 * US-016: Level Manager and Transitions
 */

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = new Map();
        this.levelOrder = [];
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        
        // State tracking
        this.transitionInProgress = false;
        this.transitionCallback = null;
    }

    // Level registration
    registerLevel(levelId, LevelClass, config = {}) {
        if (this.levels.has(levelId)) {
            console.warn(`Level ${levelId} is already registered. Overwriting.`);
        }
        
        this.levels.set(levelId, { LevelClass, config });
        
        // Add to ordered list if not already present
        if (!this.levelOrder.includes(levelId)) {
            this.levelOrder.push(levelId);
        }
        
        console.log(`📝 Registered level: ${levelId}`);
    }

    // Level loading and initialization
    loadLevel(levelId) {
        const levelInfo = this.levels.get(levelId);
        if (!levelInfo) {
            throw new Error(`Level ${levelId} is not registered`);
        }

        // Clean up current level
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }

        // Create new level instance
        const { LevelClass, config } = levelInfo;
        this.currentLevel = new LevelClass(config);
        
        // Set up level with game references
        this.currentLevel.setGameReference(this.game);
        
        // Load level data and initialize
        this.currentLevel.load();
        this.currentLevel.start();
        
        // Update game references
        this.game.level = this.currentLevel.getLevelData();
        this.game.fishTreats = this.currentLevel.fishTreats;
        
        // Reset player to level spawn point
        this.currentLevel.initializePlayer();
        
        console.log(`🎮 Loaded level: ${levelId}`);
        return this.currentLevel;
    }

    // Level progression
    nextLevel() {
        if (this.transitionInProgress) {
            console.log('Level transition already in progress');
            return false;
        }

        const nextIndex = this.currentLevelIndex + 1;
        
        if (nextIndex >= this.levelOrder.length) {
            // Game complete
            console.log('🎉 All levels completed!');
            this.game.showWinScreen();
            return false;
        }

        return this.transitionToLevel(nextIndex);
    }

    previousLevel() {
        if (this.transitionInProgress) {
            console.log('Level transition already in progress');
            return false;
        }

        const prevIndex = this.currentLevelIndex - 1;
        
        if (prevIndex < 0) {
            console.log('Already at first level');
            return false;
        }

        return this.transitionToLevel(prevIndex);
    }

    transitionToLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= this.levelOrder.length) {
            console.error(`Invalid level index: ${levelIndex}`);
            return false;
        }

        this.transitionInProgress = true;
        this.currentLevelIndex = levelIndex;
        
        const levelId = this.levelOrder[levelIndex];
        
        try {
            // Update state manager
            if (this.game.stateManager) {
                this.game.stateManager.set('game.currentLevel', levelIndex + 1);
            }
            
            // Load the new level
            this.loadLevel(levelId);
            
            // Reset game state for new level
            this.resetGameStateForLevel();
            
            this.transitionInProgress = false;
            
            console.log(`🚀 Transitioned to level ${levelIndex + 1}: ${levelId}`);
            return true;
            
        } catch (error) {
            console.error(`Failed to transition to level ${levelId}:`, error);
            this.transitionInProgress = false;
            return false;
        }
    }

    resetGameStateForLevel() {
        // Reset goal reached flag
        this.game.goalReached = false;
        
        // Clear any level-specific temporary state
        if (this.game.particles) {
            this.game.particles = [];
        }
        
        // Reset level-specific collections
        this.game.treatsCollected = 0;
        this.game.speedBoost = 1;
        this.game.speedBoostTimer = 0;
    }

    // Level navigation
    goToLevel(levelId) {
        const levelIndex = this.levelOrder.indexOf(levelId);
        if (levelIndex === -1) {
            console.error(`Level ${levelId} not found in level order`);
            return false;
        }

        return this.transitionToLevel(levelIndex);
    }

    goToLevelByNumber(levelNumber) {
        const levelIndex = levelNumber - 1; // Convert to 0-based index
        return this.transitionToLevel(levelIndex);
    }

    // Level querying
    getCurrentLevel() {
        return this.currentLevel;
    }

    getCurrentLevelId() {
        return this.levelOrder[this.currentLevelIndex];
    }

    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }

    getTotalLevels() {
        return this.levelOrder.length;
    }

    getLevelInfo(levelId) {
        const levelInfo = this.levels.get(levelId);
        if (!levelInfo) return null;

        return {
            id: levelId,
            registered: true,
            config: levelInfo.config
        };
    }

    getAllLevels() {
        return this.levelOrder.map(id => ({
            id,
            ...this.getLevelInfo(id)
        }));
    }

    // Update and render delegation
    update(dt) {
        if (this.currentLevel && this.currentLevel.isActive()) {
            this.currentLevel.update(dt);
        }
    }

    render(ctx, camera) {
        if (this.currentLevel && this.currentLevel.isActive()) {
            this.currentLevel.render(ctx, camera);
        }
    }

    // State management
    isLevelActive() {
        return this.currentLevel && this.currentLevel.isActive();
    }

    isLevelCompleted() {
        return this.currentLevel && this.currentLevel.isCompleted();
    }

    isTransitioning() {
        return this.transitionInProgress;
    }

    // Initialization helper
    initializeDefaultLevels() {
        // This will be called after all level classes are imported
        // Individual levels will register themselves
        console.log('🎯 Level Manager initialized, waiting for level registrations');
    }

    // Cleanup
    cleanup() {
        if (this.currentLevel) {
            this.currentLevel.cleanup();
        }
        
        this.levels.clear();
        this.levelOrder = [];
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.transitionInProgress = false;
        
        console.log('🧹 Level Manager cleaned up');
    }

    // Debug methods
    getDebugInfo() {
        return {
            currentLevel: this.getCurrentLevelId(),
            currentLevelNumber: this.getCurrentLevelNumber(),
            totalLevels: this.getTotalLevels(),
            isTransitioning: this.isTransitioning(),
            registeredLevels: this.levelOrder,
            levelState: this.currentLevel ? this.currentLevel.debugInfo() : null
        };
    }

    // For backward compatibility with existing Game.js
    getLevel() {
        return this.currentLevel ? this.currentLevel.getLevelData() : null;
    }

    getCurrentLevelBackground() {
        return this.currentLevel ? this.currentLevel.backgroundColor : '#87CEEB';
    }
}

export default LevelManager;