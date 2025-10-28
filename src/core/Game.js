/**
 * Game Class - Core Game Architecture
 * 
 * Extracted from monolithic index.html to provide a clean,
 * modular game loop with full feature parity.
 * 
 * US-002: Game Loop Extraction Implementation
 */

import { GameLoop } from './game-loop.js';
import { getStateManager } from './StateManager.js';
import { Canvas } from './Canvas.js';
import { InputManager } from './InputManager.js';
import { LevelManager, Level1, Level2, Level3, Level4, Level5 } from '../levels/index.js';
import { UIManager } from '../ui/index.js';
import PerformanceMonitor from '../performance/PerformanceMonitor.js';
import memoryManager from '../performance/MemoryManager.js';
import { getSpriteSystem } from './sprites/index.js';
import { PlayerEntity } from '../entities/PlayerEntity.js';

// Core classes extracted from monolithic version
// DEPRECATED: Legacy Player class - replaced by PlayerEntity for sprite system integration
// Kept for reference during migration, can be removed once all dependencies are migrated
class Player {
    constructor() {
        this.x = 100;
        this.y = 300;
        this.width = 30;
        this.height = 30;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.dead = false;
        this.animFrame = 0;
        this.animTimer = 0;
        this.currentAnimation = 'idle';
        this.facing = 1;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.health = 3;
        this.respawnX = 100;
        this.respawnY = 300;
        this.climbing = false;
        this.climbX = 0;
    }

    update(dt) {
        if (this.dead) return;

        const wasGrounded = this.grounded;
        this.grounded = this.checkGrounded();

        // Handle input using InputManager
        if (typeof game !== 'undefined' && game.inputManager) {
            this.handleInput(dt, game.inputManager);
        }

        // Physics
        this.applyPhysics(dt);

        // Update invulnerability
        if (this.invulnerable) {
            this.invulnerabilityTimer -= dt;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }

        // Update animation
        this.updateAnimation(dt);

        // Check death conditions
        if (this.y > 500) {
            this.die();
        }
    }

    handleInput(dt, inputManager) {
        // Use InputManager for unified input handling
        if (!inputManager) return;
        
        // Horizontal movement - matches monolithic physics exactly
        if (inputManager.isKeyPressed('left')) {
            this.vx = Math.max(this.vx - 800 * dt / 1000, -200);
            this.facing = -1;
        } else if (inputManager.isKeyPressed('right')) {
            this.vx = Math.min(this.vx + 800 * dt / 1000, 200);
            this.facing = 1;
        } else {
            // Apply friction - matches monolithic behavior
            this.vx *= Math.pow(0.8, dt / 16);
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

    applyPhysics(dt) {
        // Gravity
        if (!this.grounded && !this.climbing) {
            this.vy += 700 * dt / 1000;
            this.vy = Math.min(this.vy, 500);
        }

        // Update position
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;

        // Basic collision with level
        this.checkCollisions();
    }

    checkGrounded() {
        if (typeof game !== 'undefined' && game.level) {
            const level = game.level;
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
        }
        return false;
    }

    checkCollisions() {
        if (typeof game !== 'undefined' && game.level) {
            const level = game.level;
            
            // Check ground collision
            const feetY = this.y + this.height / 2;
            const centerX = this.x;
            const leftX = this.x - this.width / 2;
            const rightX = this.x + this.width / 2;
            
            // Check multiple points for ground collision
            const gridYFeet = Math.floor(feetY / 16);
            const gridXCenter = Math.floor(centerX / 16);
            const gridXLeft = Math.floor(leftX / 16);
            const gridXRight = Math.floor(rightX / 16);
            
            // Ground check
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
    }

    updateAnimation(dt) {
        this.animTimer += dt;

        if (this.animTimer > 200) {
            this.animFrame = (this.animFrame + 1) % 4;
            this.animTimer = 0;
        }

        // Determine animation state
        let newState;
        if (!this.grounded) {
            newState = this.vy < 0 ? 'jump_up' : 'fall_down';
            this.currentAnimation = this.vy < 0 ? 'jump' : 'fall'; // Legacy compatibility
        } else if (Math.abs(this.vx) > 10) {
            newState = 'run';
            this.currentAnimation = 'run';
        } else {
            newState = 'idle_sit';
            this.currentAnimation = 'idle';
        }

        // Update sprite system animation if available - E002.1-002
        if (typeof game !== 'undefined' && game.spriteSystem) {
            game.spriteSystem.updateAnimation(dt, newState);
        }
    }

    hurt() {
        if (this.invulnerable) return;
        
        this.health--;
        this.invulnerable = true;
        this.invulnerabilityTimer = 2000;
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        // Respawn after delay
        setTimeout(() => {
            this.respawn();
        }, 1000);
    }

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
}

class Particle {
    constructor(x, y, vx, vy, color = '#ff6b35') {
        this.init(x, y, vx, vy, color);
    }

    init(x, y, vx, vy, color = '#ff6b35') {
        this.x = x;
        this.y = y;
        this.vx = vx || (Math.random() - 0.5) * 200;
        this.vy = vy || -Math.random() * 100 - 50;
        this.life = 500;
        this.maxLife = 500;
        this.color = color;
        this.active = true;
    }

    update(dt) {
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        this.vy += 300 * dt / 1000;
        this.life -= dt;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    reset() {
        this.active = false;
        this.life = 0;
    }
}

class Fireball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 12;
        this.height = 12;
    }

    update(dt) {
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        this.vy += 200 * dt / 1000;
        
        // Bounce off platforms
        if (typeof game !== 'undefined' && game.level) {
            const level = game.level;
            const gridX = Math.floor(this.x / 16);
            const gridY = Math.floor(this.y / 16);
            
            if (gridY >= 0 && gridY < level.length && 
                gridX >= 0 && gridX < level[0].length &&
                level[gridY] && level[gridY][gridX] > 0) {
                this.vy = -Math.abs(this.vy) * 0.8;
                this.vx *= 0.9;
            }
        }

        // Bounce off screen edges
        if (this.x < 0 || this.x > 800) {
            this.vx = -this.vx;
        }
    }

    checkCollision(player) {
        return Math.abs(this.x - player.x) < 20 && Math.abs(this.y - player.y) < 20;
    }
}

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
        
        if (this.moveTimer > 2000 + Math.random() * 3000) {
            this.direction *= -1;
            this.vx = this.direction * (30 + Math.random() * 40);
            this.moveTimer = 0;
        }
        
        this.x += this.vx * dt / 1000;
        this.y += this.vy * dt / 1000;
        
        // Simple ground collision
        if (this.y > 350) {
            this.y = 350;
            this.vy = 0;
        }
    }

    checkCaught(player) {
        if (this.caught) return false;
        
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        
        if (dx < 25 && dy < 25 && Math.abs(player.vx) > 50) {
            this.caught = true;
            return true;
        }
        return false;
    }

    checkCollisionWithStaticCat(player) {
        const dx = Math.abs(this.x - player.x);
        const dy = Math.abs(this.y - player.y);
        return dx < 30 && dy < 30 && Math.abs(player.vx) < 10;
    }
}

class Dog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.vx = 0;
        this.vy = 0;
        this.chasing = false;
        this.active = true;
        this.spawnTimer = 0;
        this.facing = this.x < 400 ? 1 : -1;
    }

    update(dt) {
        if (!this.active) {
            this.spawnTimer += dt;
            if (this.spawnTimer > 15000 + Math.random() * 10000) {
                this.spawn();
            }
            return;
        }

        // Simple dog AI - just stand there for level 4
        // Cat can bounce off the dog
    }

    spawn() {
        this.active = true;
        this.spawnTimer = 0;
    }
}

export class Game {
    constructor(canvasElement) {
        // Initialize Canvas module
        this.canvasManager = new Canvas(canvasElement);
        
        // Keep references for backward compatibility
        this.canvas = canvasElement;
        this.ctx = this.canvasManager.getContext();
        
        // Initialize InputManager
        this.inputManager = new InputManager(canvasElement);
        
        // Initialize game loop
        this.gameLoop = new GameLoop({
            targetFPS: 60,
            onUpdate: (dt) => this.update(dt),
            onRender: () => this.draw()
        });

        // Initialize state manager
        this.stateManager = getStateManager();
        
        // Initialize UI Manager
        this.uiManager = new UIManager(this);

        // Initialize Performance Monitor
        this.performanceMonitor = new PerformanceMonitor({
            debug: process.env.NODE_ENV !== 'production',
            fpsTarget: 60,
            frameTimeTarget: 16.67
        });

        // Setup performance event handlers
        this.performanceMonitor.on('warning', (warning) => {
            console.warn(`Performance Warning [${warning.type}]:`, warning.message);
        });

        this.performanceMonitor.on('report', (report) => {
            if (report.health < 80) {
                console.log('Performance Report - Health:', report.health, 'Metrics:', report.metrics);
            }
        });

        // Register memory cleanup callback
        memoryManager.registerForCleanup(() => {
            this.cleanupGameObjects();
        });

        // Core game objects
        // Use PlayerEntity for sprite system integration - E002.1-001
        this.player = new PlayerEntity();
        this.player.initialize(this); // Initialize with game instance
        this.particles = [];
        this.fireballs = [];
        this.mice = [];
        this.dog = null;
        this.camera = { x: 0, y: 0 };
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.hits = 0;
        this.speedBoost = 1;
        this.speedBoostTimer = 0;
        this.treatsCollected = 0;
        this.startTime = Date.now();
        this.lastTime = Date.now();
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.currentLevel = this.stateManager.get('game.currentLevel');
        this.goalReached = false;

        // Initialize Level Manager
        this.levelManager = new LevelManager(this);
        this.registerLevels();

        // Legacy level properties for backward compatibility
        this.level = null;
        this.fishTreats = [];

        // Initialize current level
        this.initCurrentLevel();

        // Initialize sprite system - E002.1-001
        this.spriteSystem = getSpriteSystem();
        this.spritesLoaded = false;

        // Make game instance globally accessible for compatibility
        window.game = this;
    }

    async init() {
        console.log('🎮 Game initialized');

        // Load sprite sheets - E002.1-001
        console.log('🎨 Loading sprite sheets...');
        try {
            await this.spriteSystem.loadAllSheets();
            this.spritesLoaded = true;
            console.log('✅ Sprite sheets loaded successfully');

            // Auto-dismiss pet selector after sprites load - E003.1-002
            if (this.petSelector) {
                setTimeout(() => {
                    if (this.petSelector.isVisible && this.petSelector.isVisible()) {
                        this.petSelector.hide();
                    }
                }, 2000); // Hide after 2 seconds
            }
        } catch (error) {
            console.warn('⚠️ Failed to load sprite sheets, using fallback rendering:', error);
            this.spritesLoaded = false;
        }

        return this;
    }

    start() {
        console.log('🚀 Starting game loop');
        this.gameLoop.start();
        return this;
    }

    stop() {
        console.log('⏹️  Stopping game loop');
        this.gameLoop.stop();
        return this;
    }

    pause() {
        console.log('⏸️  Pausing game');
        this.gameLoop.pause();
        return this;
    }

    resume() {
        console.log('▶️  Resuming game');
        this.gameLoop.resume();
        return this;
    }

    /**
     * Change active pet sprite - E002.1-002
     *
     * @param {string} petId - Pet identifier ('A' or 'B')
     */
    changePet(petId) {
        if (!petId || (petId !== 'A' && petId !== 'B')) {
            console.warn(`Invalid pet ID: ${petId}, expected 'A' or 'B'`);
            return;
        }

        console.log(`🐱 Changing pet to: ${petId === 'A' ? 'Bowie Cat' : 'Buttercup Cat'}`);

        // Update sprite configuration
        this.spriteSystem.config.loadConfig(petId);

        // Reset animation state to prevent visual glitches
        this.spriteSystem.animationController.setState(this.player.currentAnimation);

        console.log(`✅ Pet changed successfully to ${petId}`);
    }

    // Level registration and management
    registerLevels() {
        // Register all levels with the level manager
        this.levelManager.registerLevel('level1', Level1, { 
            name: 'Fireball Platformer',
            difficulty: 1 
        });
        
        this.levelManager.registerLevel('level2', Level2, { 
            name: 'Mouse Catching Arena',
            difficulty: 2 
        });
        
        this.levelManager.registerLevel('level3', Level3, { 
            name: 'Challenge Arena',
            difficulty: 3 
        });
        
        this.levelManager.registerLevel('level4', Level4, { 
            name: 'Dog Bounce Level',
            difficulty: 4 
        });
        
        this.levelManager.registerLevel('level5', Level5, { 
            name: 'Victory Feast',
            difficulty: 5 
        });
        
        console.log('🎯 All levels registered with Level Manager');
    }
    
    initCurrentLevel() {
        // Load the current level using Level Manager
        const levelNumber = this.stateManager.get('game.currentLevel');
        const levelId = `level${levelNumber}`;
        
        try {
            this.levelManager.goToLevel(levelId);
            
            // Update legacy properties for backward compatibility
            const currentLevel = this.levelManager.getCurrentLevel();
            if (currentLevel) {
                this.level = currentLevel.getLevelData();
                this.fishTreats = currentLevel.fishTreats || [];
            }
            
            console.log(`🚀 Initialized level ${levelNumber}: ${levelId}`);
        } catch (error) {
            console.error(`Failed to initialize level ${levelId}:`, error);
            // Fallback to legacy initialization
            this.initLevelLegacy();
        }
    }
    
    // Legacy level initialization for fallback
    initLevelLegacy() {
        if (this.currentLevel === 1) {
            this.initFireballs();
            this.dog = null;
        } else if (this.currentLevel === 2) {
            this.initMice();
            this.fireballs = [];
            this.dog = null;
        } else if (this.currentLevel === 3) {
            this.fireballs = [];
            this.mice = [];
            this.dog = null;
        } else if (this.currentLevel === 4) {
            // Level 4 - Dog bounce level
            this.fireballs = [];
            this.mice = [];
            this.fishTreats = [];
            this.dog = new Dog(400, 350);
            this.dog.active = true;
            this.dog.chasing = false;
        } else if (this.currentLevel === 5) {
            // Level 5 - Victory feast!
            this.fireballs = [];
            this.mice = [];
            this.fishTreats = [];
            this.dog = null;
            this.waterBowl = { x: 350, y: 370, width: 40, height: 20 };
            this.foodPlate = { x: 450, y: 370, width: 40, height: 20 };
            this.catHasEaten = false;
            this.catHasDrunk = false;
        }
    }

    initFireballs() {
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

    initMice() {
        this.mice = [];
        const mousePositions = [
            {x: 200, y: 350}, {x: 350, y: 350}, {x: 500, y: 350},
            {x: 180, y: 300}, {x: 320, y: 280}, {x: 450, y: 250},
            {x: 600, y: 350}, {x: 700, y: 350}
        ];
        
        mousePositions.forEach(pos => {
            this.mice.push(new Mouse(pos.x, pos.y));
        });
    }

    createLevel() {
        const level = [];
        
        if (this.currentLevel === 1) {
            // Level 1 - Platformer with fireballs
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
                    } else if (y === 23 && x >= 12 && x <= 13) {
                        level[y][x] = 3; // Red couch trampoline
                    } else {
                        level[y][x] = 0;
                    }
                }
            }
        } else if (this.currentLevel === 2) {
            // Level 2 - Mouse catching arena
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
                    } else if (y === 24 && x >= 15 && x <= 16) {
                        level[y][x] = 3; // Red couch
                    } else {
                        level[y][x] = 0;
                    }
                }
            }
        } else if (this.currentLevel === 3) {
            // Level 3 - Challenge arena with pits
            for (let y = 0; y < 30; y++) {
                level[y] = [];
                for (let x = 0; x < 50; x++) {
                    if (y === 25) {
                        // Ground with gaps (pits)
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
                    } else if (y === 17 && x >= 26 && x <= 28) {
                        level[y][x] = 1; // Higher platform
                    } else if (y === 21 && x >= 32 && x <= 34) {
                        level[y][x] = 1; // Platform over third pit
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
            
            // Add cat tree at x=40
            this.addCatTree(level, 40, 25, 5);
        } else if (this.currentLevel === 4) {
            // Level 4 - Simple grass platform level
            for (let y = 0; y < 30; y++) {
                level[y] = [];
                for (let x = 0; x < 50; x++) {
                    if (y === 25) {
                        level[y][x] = 4; // Grass tile
                    } else if (y > 25) {
                        level[y][x] = 1; // Underground dirt
                    } else {
                        level[y][x] = 0;
                    }
                }
            }
        } else if (this.currentLevel === 5) {
            // Level 5 - Cozy room with food and water
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
        }
        
        return level;
    }

    addCatTree(level, x, groundY, height) {
        // Cat tree trunk (climbable)
        for (let y = groundY - height; y < groundY; y++) {
            if (level[y]) {
                level[y][x] = 4; // Cat tree tile
                level[y][x + 1] = 4;
            }
        }
        
        // Platform on top
        const topY = groundY - height - 1;
        if (level[topY]) {
            for (let px = x - 1; px <= x + 2; px++) {
                if (px >= 0 && px < 50) {
                    level[topY][px] = 1;
                }
            }
        }
    }

    createFishTreats() {
        return [
            {x: 240, y: 280, collected: false},
            {x: 360, y: 250, collected: false},
            {x: 520, y: 330, collected: false},
            {x: 600, y: 200, collected: false}
        ];
    }

    // Main update loop
    update(dt) {
        // Begin performance frame tracking
        this.performanceMonitor.beginFrame();
        
        // Update input system first
        this.inputManager.update();
        
        // Update UI system
        if (this.uiManager) {
            this.uiManager.update(dt);
        }
        
        // Update speed boost timer
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= dt;
            if (this.speedBoostTimer <= 0) {
                this.speedBoost = 1;
            }
        }

        // Update player
        this.player.update(dt);

        // Update particles with object pooling
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(dt);
            
            if (!particle.active || particle.life <= 0) {
                // Return particle to pool instead of garbage collection
                memoryManager.release('Particle', particle);
                this.particles.splice(i, 1);
            }
        }

        // Update current level through Level Manager
        if (this.levelManager) {
            this.levelManager.update(dt);
        }
        
        // Legacy level updates for backward compatibility
        if (this.currentLevel === 1) {
            this.fireballs.forEach(f => {
                f.update(dt);
                if (f.checkCollision(this.player)) {
                    this.player.hurt();
                }
            });

            // Check goal
            if (this.player.x > 750 && !this.goalReached) {
                this.goalReached = true;
                this.nextLevel();
            }
        } else if (this.currentLevel === 2) {
            this.mice.forEach(mouse => {
                mouse.update(dt);
                
                if (mouse.checkCaught(this.player)) {
                    this.score += 200;
                    this.playSound('collect');
                    
                    const uncaughtMice = this.mice.filter(m => !m.caught).length;
                    if (uncaughtMice === 0) {
                        this.nextLevel();
                    }
                }
                
                if (mouse.checkCollisionWithStaticCat(this.player)) {
                    if (this.treatsCollected > 0) {
                        this.ejectTreats();
                        mouse.direction *= -1;
                    }
                }
            });
        } else if (this.currentLevel === 3) {
            if (this.player.x > 740 && !this.goalReached) {
                this.goalReached = true;
                this.nextLevel();
            }
        } else if (this.currentLevel === 4) {
            if (this.dog) {
                this.dog.update(dt);
            }
        } else if (this.currentLevel === 5) {
            // Check if cat is near water bowl
            if (!this.catHasDrunk && 
                Math.abs(this.player.x - this.waterBowl.x) < 40 &&
                Math.abs(this.player.y - this.waterBowl.y) < 40) {
                this.catHasDrunk = true;
            }
            
            // Check if cat is near food plate
            if (!this.catHasEaten && 
                Math.abs(this.player.x - this.foodPlate.x) < 40 &&
                Math.abs(this.player.y - this.foodPlate.y) < 40) {
                this.catHasEaten = true;
            }
            
            // Win condition
            if (this.catHasEaten && this.catHasDrunk && !this.goalReached) {
                this.goalReached = true;
                this.showWinScreen();
            }
        }

        // Collect treats
        this.fishTreats.forEach(fish => {
            if (!fish.collected) {
                const dx = Math.abs(this.player.x - fish.x);
                const dy = Math.abs(this.player.y - fish.y);
                if (dx < 20 && dy < 20) {
                    fish.collected = true;
                    this.score += 100;
                    this.treatsCollected++;
                    
                    // Add speed boost
                    this.speedBoost = Math.min(2, this.speedBoost + 0.15);
                    this.speedBoostTimer = 5000;
                    
                    this.playSound('collect');
                }
            }
        });

        this.updateCamera();

        // Record entity updates for performance monitoring
        const entityCount = this.particles.length + this.fireballs.length + this.mice.length + 1; // +1 for player
        for (let i = 0; i < entityCount; i++) {
            this.performanceMonitor.recordEntityUpdate();
        }

        // FPS calculation
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        // End performance frame tracking
        this.performanceMonitor.endFrame();
    }

    updateCamera() {
        const canvasDimensions = this.canvasManager.getDimensions();
        const targetX = this.player.x - canvasDimensions.width / 2;
        const targetY = this.player.y - canvasDimensions.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, 800 - canvasDimensions.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, 480 - canvasDimensions.height));
    }

    // Main draw loop
    draw() {
        // Record render call for performance monitoring
        this.performanceMonitor.recordRenderCall();
        
        // Get background color from current level
        let backgroundColor = '#87CEEB'; // default
        if (this.levelManager && this.levelManager.getCurrentLevel()) {
            backgroundColor = this.levelManager.getCurrentLevel().backgroundColor;
        } else {
            // Legacy fallback
            backgroundColor = this.currentLevel === 2 ? '#4A5F7A' : '#87CEEB';
        }
        
        // Clear and background using Canvas module
        this.canvasManager.clear(backgroundColor);
        
        // Apply camera transformation using Canvas module
        this.canvasManager.save();
        this.canvasManager.applyCameraTransform(this.camera);
        
        // Render current level through Level Manager
        if (this.levelManager) {
            this.levelManager.render(this.canvasManager.ctx, this.camera);
        } else {
            // Legacy fallback
            this.drawLevel();
        }
        
        this.drawEntities();
        
        this.canvasManager.restore();
        
        // Flush batched draw calls before UI
        this.canvasManager.flushBatch();
        
        // Render UI system
        if (this.uiManager) {
            this.uiManager.render(this.canvasManager.ctx, this.camera);
        }
        
        // Final flush for any UI draw calls
        this.canvasManager.flushBatch();
    }

    drawLevel() {
        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                const tile = this.level[y][x];
                if (tile > 0) {
                    const drawX = x * 16;
                    const drawY = y * 16;

                    // Use drawCouch for tile type 3 (couch/trampoline) - E003.1-001
                    if (tile === 3 && this.currentLevel !== 5) {
                        this.drawCouch(drawX, drawY);
                    } else {
                        let tileColor;
                        if (tile === 1) {
                            tileColor = '#8B4513'; // Brown platform
                        } else if (tile === 2) {
                            tileColor = '#FF4500'; // Lava/red
                        } else if (tile === 3) {
                            tileColor = '#DC143C'; // Red couch/wall (level 5)
                        } else if (tile === 4) {
                            tileColor = '#228B22'; // Grass
                        }

                        // Use Canvas module for drawing with high contrast support
                        this.canvasManager.fillRect(drawX, drawY, 16, 16, tileColor);
                    }
                }
            }
        }
    }

    drawCouch(x, y) {
        // Port of monolithic drawCouch() method - E003.1-001
        // Creates layered pixel-art couch for trampoline effect
        // Couch base
        this.canvasManager.fillRect(x, y + 4, 16, 12, '#8B0000');

        // Cushion
        this.canvasManager.fillRect(x + 1, y + 2, 14, 10, '#DC143C');

        // Cushion detail
        this.canvasManager.fillRect(x + 3, y + 4, 10, 6, '#FF1493');

        // Legs
        this.canvasManager.fillRect(x + 2, y + 14, 2, 2, '#4B2F20');
        this.canvasManager.fillRect(x + 12, y + 14, 2, 2, '#4B2F20');
    }

    drawEntities() {
        // Use PlayerEntity's render method for sprite/fallback rendering - E002.1-001
        this.player.render(this.ctx, this.camera);

        // Draw fireballs
        this.fireballs.forEach(f => {
            this.canvasManager.fillRect(f.x - f.width/2, f.y - f.height/2, f.width, f.height, '#FF0000');
        });

        // Draw mice
        this.mice.forEach(mouse => {
            if (!mouse.caught) {
                this.canvasManager.fillRect(mouse.x - mouse.width/2, mouse.y - mouse.height/2, mouse.width, mouse.height, '#808080');
            }
        });

        // Draw dog
        if (this.dog && this.dog.active) {
            this.canvasManager.fillRect(this.dog.x - this.dog.width/2, this.dog.y - this.dog.height/2, this.dog.width, this.dog.height, '#8B4513');
        }

        // Draw fish treats
        this.fishTreats.forEach(fish => {
            if (!fish.collected) {
                this.canvasManager.fillRect(fish.x - 5, fish.y - 5, 10, 10, '#FF8C00');
            }
        });

        // Draw particles with alpha blending
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            this.canvasManager.setAlpha(alpha);
            this.canvasManager.fillRect(p.x - 2, p.y - 2, 4, 4, p.color);
            this.canvasManager.resetAlpha();
        });

        // Draw water bowl and food plate for level 5
        if (this.currentLevel === 5) {
            const waterColor = this.catHasDrunk ? '#87CEEB' : '#4169E1';
            this.canvasManager.fillRect(this.waterBowl.x, this.waterBowl.y, this.waterBowl.width, this.waterBowl.height, waterColor);
            
            const foodColor = this.catHasEaten ? '#D2691E' : '#FF6347';
            this.canvasManager.fillRect(this.foodPlate.x, this.foodPlate.y, this.foodPlate.width, this.foodPlate.height, foodColor);
        }
    }

    // Create particle using object pool
    createParticle(x, y, vx, vy, color = '#ff6b35') {
        try {
            const particle = memoryManager.acquire('Particle');
            particle.init(x, y, vx, vy, color);
            return particle;
        } catch (error) {
            // Fallback to regular constructor if pool is not available
            return new Particle(x, y, vx, vy, color);
        }
    }

    // Memory cleanup for game objects
    cleanupGameObjects() {
        // Clear particle arrays and return objects to pool
        this.particles.forEach(particle => {
            memoryManager.release('Particle', particle);
        });
        this.particles.length = 0;

        // Clear other object arrays
        this.fireballs.length = 0;
        
        // Clear caught mice
        this.mice = this.mice.filter(mouse => !mouse.caught);
        
        console.log('🧹 Game objects cleaned up');
    }

    // Game mechanics
    ejectTreats() {
        const treatCount = Math.min(3, this.treatsCollected);
        this.treatsCollected = Math.max(0, this.treatsCollected - treatCount);
        
        for (let i = 0; i < treatCount; i++) {
            const angle = (Math.PI * 2 / treatCount) * i;
            const speed = 150;
            this.fishTreats.push({
                x: this.player.x + this.player.width/2,
                y: this.player.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 100,
                collected: false,
                flying: true
            });
        }
        
        this.speedBoost = Math.max(1, this.speedBoost - treatCount * 0.15);
        this.playSound('hurt');
    }

    nextLevel() {
        // Use Level Manager for level transitions
        if (this.levelManager) {
            const success = this.levelManager.nextLevel();
            if (success) {
                // Update current level number for backward compatibility
                this.currentLevel = this.levelManager.getCurrentLevelNumber();
                
                // Update legacy properties
                const currentLevel = this.levelManager.getCurrentLevel();
                if (currentLevel) {
                    this.level = currentLevel.getLevelData();
                    this.fishTreats = currentLevel.fishTreats || [];
                }
                
                console.log(`🚀 Transitioned to level ${this.currentLevel}`);
            }
            return;
        }
        
        // Legacy fallback
        if (this.stateManager.nextLevel()) {
            this.currentLevel = this.stateManager.get('game.currentLevel');
        } else {
            this.showWinScreen();
            return;
        }
        
        this.player.x = 100;
        this.player.y = 300;
        this.player.respawnX = 100;
        this.player.respawnY = 300;
        this.player.climbing = false;
        this.level = this.createLevel();
        this.fishTreats = this.createFishTreats();
        this.initLevelLegacy();
        this.goalReached = false;
    }

    showWinScreen() {
        console.log('🎉 Game Won!');
        // Implement win screen
    }

    playSound(type) {
        // Placeholder for sound system
        console.log(`🔊 Playing sound: ${type}`);
    }

    // Input API access
    getInputManager() {
        return this.inputManager;
    }
    
    // Check if input action is pressed (for compatibility)
    isKeyPressed(action) {
        return this.inputManager.isKeyPressed(action);
    }

    // Public API
    getFPS() {
        return this.gameLoop.getFPS();
    }

    isRunning() {
        return this.gameLoop.isRunning();
    }

    isPaused() {
        return this.gameLoop.isPaused();
    }

    getState() {
        const gameState = this.stateManager.get('game');
        const playerState = this.stateManager.get('runtime.player');
        return {
            level: gameState.currentLevel,
            score: gameState.score,
            lives: gameState.lives,
            fps: this.fps,
            player: {
                x: playerState.x,
                y: playerState.y,
                health: this.player.health
            }
        };
    }

    // Canvas API access
    getCanvasManager() {
        return this.canvasManager;
    }

    // Convert screen coordinates to game coordinates (for input handling)
    screenToGame(screenX, screenY) {
        return this.canvasManager.screenToGame(screenX, screenY, this.camera);
    }

    // Enable/disable accessibility features
    setHighContrast(enabled) {
        this.stateManager.setSetting('highContrast', enabled);
        this.canvasManager.setHighContrast(enabled);
    }
    
    // UI system integration methods
    setMuted(enabled) {
        this.stateManager.setSetting('muted', enabled);
        // Could implement actual sound muting here
    }
    
    setDebugMode(enabled) {
        this.stateManager.setSetting('debugMode', enabled);
        // Could toggle debug rendering, logging, etc.
    }

    // Performance monitoring API
    getPerformanceMetrics() {
        return this.performanceMonitor.getMetrics();
    }

    getPerformanceSummary() {
        return this.performanceMonitor.getSummary();
    }

    getMemoryStats() {
        return memoryManager.getStats();
    }

    // Force memory cleanup (useful for debugging)
    forceMemoryCleanup() {
        memoryManager.cleanup();
        this.cleanupGameObjects();
        
        // Force garbage collection if available
        memoryManager.forceGC();
    }

    // Cleanup
    destroy() {
        this.stop();
        
        // Cleanup performance monitoring
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
        }
        
        // Cleanup memory manager
        memoryManager.unregisterFromCleanup(this.cleanupGameObjects);
        this.cleanupGameObjects();
        
        // Cleanup UI Manager
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        
        // Cleanup Level Manager
        if (this.levelManager) {
            this.levelManager.cleanup();
        }
        
        this.inputManager.destroy();
        this.canvasManager.destroy();
        window.game = null;
    }
}

export default Game;