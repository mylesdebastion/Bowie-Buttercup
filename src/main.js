/**
 * Main Game Entry Point
 *
 * Initializes and coordinates all game modules
 */

import './styles/main.css';
import { GameLoop } from './core/game-loop.js';
import { getStateManager } from './core/StateManager.js';
import { getAssetLoader } from './core/asset-loader.js';
import { ItemSystem } from './entities/items.js';
import { getConfigLoader } from './core/ConfigLoader.js';

// Global game instance
let gameInstance = null;

class CatPlatformerGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.stateManager = getStateManager();
    this.gameLoop = null;
    this.assetLoader = getAssetLoader();
    this.configLoader = getConfigLoader();
    this.initialized = false;

    // Game configuration (loaded from vanity URL, query param, or default)
    this.gameConfig = null;

    // Game systems
    this.itemSystem = new ItemSystem(this.stateManager);

    // Input state (will be managed by Game's InputManager)
    this.keys = {};

    // Debug mode
    this.debug = false;

    // API compatibility properties for testing
    this.level = null;
    this.player = null;
    this.score = 0;
    this.physics = {
      jumpForce: 250,
      moveSpeed: 200
    };
  }

  async init() {
    if (this.initialized) return;

    console.log('🎮 BMaD Trace: Starting Cat Platformer init (Modular Edition)...');
    console.log('🔍 BMaD Trace: Canvas element exists?', !!document.getElementById('gameCanvas'));

    // Load game configuration from vanity URL, query param, or default
    this.gameConfig = await this.configLoader.loadConfig();
    console.log('🎮 Game Configuration:', this.gameConfig);

    // Update page title with pet name
    if (this.gameConfig.petName) {
      document.title = `${this.gameConfig.petName}'s Adventure - SparkleClassic`;
    }

    // Store config in StateManager for access throughout the game
    this.stateManager.set('game.config', this.gameConfig);

    // Setup canvas
    this.setupCanvas();

    // Setup input handling
    this.setupInput();

    // Create game loop
    this.gameLoop = new GameLoop({
      targetFPS: 60,
      onUpdate: (dt) => this.update(dt),
      onRender: (interpolation) => this.render(interpolation),
      onFixedUpdate: (dt) => this.fixedUpdate(dt)
    });

    // Initialize game systems
    await this.initializeSystems();

    // Subscribe to game state events
    this.setupStateListeners();

    // Load level (start on Level 1 for platform layout testing)
    this.stateManager.set('game.currentLevel', 1);
    await this.loadLevel(this.stateManager.get('game.currentLevel'));
    
    // Position player at Level 1 spawn point (like monolithic version)
    this.stateManager.set('runtime.player.x', 100);
    this.stateManager.set('runtime.player.y', 300);

    this.initialized = true;
    console.log('✅ Game initialized successfully');

    // Sync compatibility API
    this.syncCompatibilityAPI();

    // Add modular indicator to body
    document.body.classList.add('modular-architecture');

    // Start game loop
    this.start();
  }

  setupCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      // Create canvas if it doesn't exist
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'gameCanvas';
      const gameArea = document.getElementById('gameArea') || document.body;
      gameArea.appendChild(this.canvas);
    }
    
    // Set proper game resolution
    this.canvas.width = 800;
    this.canvas.height = 400;

    this.ctx = this.canvas.getContext('2d');

    // Handle resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = Math.min(
      containerWidth / this.canvas.width,
      containerHeight / this.canvas.height
    );

    this.canvas.style.width = `${this.canvas.width * scale}px`;
    this.canvas.style.height = `${this.canvas.height * scale}px`;
  }

  setupInput() {
    // Set up basic keyboard input handling
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    console.log('⌨️ Input handling initialized');
  }

  setupTouchControls() {
    // Touch controls are now handled by Game's InputManager
    console.log('📱 Touch controls delegated to Game\'s InputManager');
  }

  async initializeSystems() {
    console.log('🔧 Initializing game systems...');
    
    // Load core game assets
    await this.assetLoader.loadGameAssets();
    
    // Initialize item system
    await this.itemSystem.initialize();
    
    console.log('✅ All systems initialized');
  }

  setupStateListeners() {
    this.stateManager.subscribe('change:runtime.isGameOver', ({ value }) => {
      if (value) {
        console.log('💀 Game Over!');
        this.gameLoop.stop();
      }
    });

    this.stateManager.subscribe('change:runtime.isVictory', ({ value }) => {
      if (value) {
        console.log('🎉 Victory!');
        this.gameLoop.stop();
      }
    });

    this.stateManager.subscribe('change:game.currentLevel', ({ value }) => {
      console.log(`📍 Level changed to ${value}`);
      this.loadLevel(value);
    });

    // Connect accessibility settings - will be handled by CSS classes for now
    this.stateManager.subscribe('change:settings.highContrast', ({ value }) => {
      console.log(`🎨 High contrast changed to ${value}`);
      document.body.classList.toggle('high-contrast', value);
    });

    this.stateManager.subscribe('change:settings.reducedMotion', ({ value }) => {
      console.log(`🏃 Reduced motion changed to ${value}`);
      document.body.classList.toggle('reduced-motion', value);
    });

    // Initialize accessibility settings from StateManager
    const initialContrast = this.stateManager.get('settings.highContrast');
    const initialMotion = this.stateManager.get('settings.reducedMotion');
    
    document.body.classList.toggle('high-contrast', initialContrast);
    document.body.classList.toggle('reduced-motion', initialMotion);
    
    console.log('🎯 Accessibility settings connected', { 
      highContrast: initialContrast, 
      reducedMotion: initialMotion 
    });
  }

  async loadLevel(levelNumber) {
    console.log(`Loading level ${levelNumber}...`);

    // Clear previous level items
    this.itemSystem.clear();

    // Load level-specific content
    if (levelNumber === 5) {
      this.itemSystem.createLevel5Items();
    }

    // Reset player position
    this.stateManager.resetLevel();
  }

  // Compatibility methods for testing/monolithic API compatibility
  createLevel() {
    // Simple level data structure for testing
    // This is a placeholder that matches the monolithic API
    const level = [];
    
    // Create basic platform layout for current level
    if (this.stateManager.get('game.currentLevel') === 5) {
      // Level 5 layout - simple ground level
      for (let i = 0; i < 50; i++) {
        level.push(new Array(25).fill(0).map(() => Math.random() > 0.95 ? 1 : 0));
      }
      // Add solid ground at bottom
      for (let i = 0; i < 5; i++) {
        level.push(new Array(25).fill(1));
      }
    }
    
    return level;
  }

  initLevel() {
    // Initialize level state - called after createLevel
    // This matches the monolithic API for compatibility
    console.log(`Initializing level ${this.stateManager.get('game.currentLevel')}...`);
    
    // Load level-specific content
    if (this.stateManager.get('game.currentLevel') === 5) {
      this.itemSystem.createLevel5Items();
    }
    
    // Reset player position
    this.stateManager.resetLevel();
    
    // Sync compatibility properties
    this.syncCompatibilityAPI();
  }

  syncCompatibilityAPI() {
    // Sync properties for API compatibility with test runners and monolithic version
    this.currentLevel = this.stateManager.get('game.currentLevel');
    this.level = this.createLevel();
    this.score = this.stateManager.get('game.score');
    
    // Create player compatibility object
    const playerState = this.stateManager.get('runtime.player');
    this.player = {
      x: playerState.x,
      y: playerState.y,
      vx: playerState.vx,
      vy: playerState.vy,
      grounded: playerState.isGrounded,
      state: playerState.isDucking ? 'crouch' : (playerState.isJumping ? 'jump' : 'idle')
    };
  }

  start() {
    this.gameLoop.start();
    console.log('🚀 Game started');
  }

  stop() {
    this.gameLoop.stop();
    console.log('🛑 Game stopped');
  }

  togglePause() {
    if (this.stateManager.get('runtime.isPaused')) {
      this.stateManager.set('runtime.isPaused', false);
      this.gameLoop.resume();
    } else {
      this.stateManager.set('runtime.isPaused', true);
      this.gameLoop.pause();
    }
  }

  update(dt) {
    if (this.stateManager.get('runtime.isGameOver') || this.stateManager.get('runtime.isVictory')) {
      return;
    }

    // Convert dt from milliseconds to seconds for calculations
    const deltaTime = dt / 1000;

    // Handle input
    this.handleInput(deltaTime);

    // Update game systems
    this.itemSystem.update(deltaTime);

    // Update camera
    this.updateCamera(deltaTime);

    // Update HUD
    this.updateHUD();

    // Keep compatibility API in sync
    this.syncCompatibilityAPI();
  }

  fixedUpdate(dt) {
    // Physics updates will go here
    // This runs at a fixed timestep for consistent physics
    const deltaTime = dt / 1000;

    // Apply gravity
    if (!this.stateManager.get('runtime.player.isGrounded')) {
      const currentVy = this.stateManager.get('runtime.player.vy');
      const newVy = currentVy + (this.stateManager.get('settings.physics.gravity') * deltaTime);
      this.stateManager.set('runtime.player.vy', Math.min(newVy, this.stateManager.get('settings.physics.maxFallSpeed')));
    }

    // Update positions
    const currentX = this.stateManager.get('runtime.player.x');
    const currentY = this.stateManager.get('runtime.player.y');
    const vx = this.stateManager.get('runtime.player.vx');
    const vy = this.stateManager.get('runtime.player.vy');
    
    this.stateManager.set('runtime.player.x', currentX + (vx * deltaTime));
    this.stateManager.set('runtime.player.y', currentY + (vy * deltaTime));

    // Simple ground/platform collision for Level 5
    const playerY = this.stateManager.get('runtime.player.y');
    const playerX = this.stateManager.get('runtime.player.x');
    const currentLevel = this.stateManager.get('game.currentLevel');
    
    if (currentLevel === 5) {
      // Check collision with main wooden platform (350-550, y=360)
      if (playerX >= 350 && playerX <= 550 && playerY > 340 && playerY <= 380) {
        this.stateManager.set('runtime.player.y', 340); // Stand on platform
        this.stateManager.set('runtime.player.vy', 0);
        this.stateManager.set('runtime.player.isGrounded', true);
      }
      // Check collision with floor (y=370+)
      else if (playerY > 350) {
        this.stateManager.set('runtime.player.y', 350); // Stand on floor
        this.stateManager.set('runtime.player.vy', 0);
        this.stateManager.set('runtime.player.isGrounded', true);
      }
    } else {
      // Default ground check
      if (playerY > 350) {
        this.stateManager.set('runtime.player.y', 350);
        this.stateManager.set('runtime.player.vy', 0);
        this.stateManager.set('runtime.player.isGrounded', true);
      }
    }
  }

  handleInput(dt) {
    const player = this.stateManager.get('runtime.player');
    const physics = this.stateManager.get('settings.physics');
    
    // Horizontal movement
    let moveInput = 0;
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      moveInput = -1;
      this.stateManager.set('runtime.player.facingRight', false);
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      moveInput = 1;
      this.stateManager.set('runtime.player.facingRight', true);
    }
    
    // Apply movement
    if (moveInput !== 0) {
      const newVx = moveInput * physics.moveSpeed;
      this.stateManager.set('runtime.player.vx', newVx);
    } else {
      // Apply friction
      const currentVx = this.stateManager.get('runtime.player.vx');
      const friction = physics.friction * dt;
      const newVx = Math.abs(currentVx) > friction ? 
        currentVx - Math.sign(currentVx) * friction : 0;
      this.stateManager.set('runtime.player.vx', newVx);
    }
    
    // Jump
    if ((this.keys['ArrowUp'] || this.keys[' '] || this.keys['w']) && 
        this.stateManager.get('runtime.player.isGrounded')) {
      this.stateManager.set('runtime.player.vy', -physics.jumpPower);
      this.stateManager.set('runtime.player.isJumping', true);
      this.stateManager.set('runtime.player.isGrounded', false);
    }
    
    // Duck/crouch
    if (this.keys['ArrowDown'] || this.keys['s']) {
      this.stateManager.set('runtime.player.isDucking', true);
    } else {
      this.stateManager.set('runtime.player.isDucking', false);
    }
  }

  updateCamera(dt) {
    const camera = this.stateManager.get('runtime.camera');
    const player = this.stateManager.get('runtime.player');

    // Simple camera follow with smoothing
    camera.targetX = player.x - this.canvas.width / 2;
    camera.targetY = player.y - this.canvas.height / 2;

    // Smooth camera movement
    camera.x += (camera.targetX - camera.x) * camera.smoothing;
    camera.y += (camera.targetY - camera.y) * camera.smoothing;

    // Clamp camera to level bounds (will be set by level module)
    camera.x = Math.max(0, camera.x);
    camera.y = Math.max(0, camera.y);
  }

  updateHUD() {
    const hud = document.getElementById('hud');
    if (hud) {
      const gameState = this.stateManager.get('game');
      hud.innerHTML = `
        <div>Level: ${gameState.currentLevel}</div>
        <div>Lives: ${'❤️'.repeat(gameState.lives)}</div>
        <div>Score: ${gameState.score}</div>
        <div>Coins: ${gameState.coins}</div>
      `;
    }

    if (this.debug) {
      const debugOverlay = document.getElementById('debugOverlay');
      if (debugOverlay) {
        const player = this.stateManager.get('runtime.player');
        debugOverlay.innerHTML = `
          FPS: ${this.gameLoop.getFPS()}
          Pos: ${Math.round(player.x)}, ${Math.round(player.y)}
          Vel: ${Math.round(player.vx)}, ${Math.round(player.vy)}
          Grounded: ${player.isGrounded}
        `;
      }
    }
  }

  render(interpolation) {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Debug removed - game working
    

    // Save context
    this.ctx.save();

    // Apply camera transform
    const camera = this.stateManager.get('runtime.camera');
    this.ctx.translate(-camera.x, -camera.y);

    // Draw level (will be implemented in level module)
    try {
      this.drawLevel();
    } catch (error) {
      console.error('Error in drawLevel:', error);
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(0, 30, 300, 20);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(`drawLevel ERROR: ${error.message}`, 5, 45);
    }

    // Draw items (pet bowls, etc.)
    this.itemSystem.render(this.ctx);

    // Draw player
    this.drawPlayer(interpolation);

    // Restore context
    this.ctx.restore();
  }

  drawLevel() {
    const currentLevel = this.stateManager.get('game.currentLevel');
    
    if (currentLevel === 5) {
      // Level 5 background - indoor setting
      this.ctx.fillStyle = '#2d1810'; // Dark brown floor
      this.ctx.fillRect(0, 370, 2000, 30);
      
      // Main wooden platform where cat and bowls are
      this.ctx.fillStyle = '#8B4513'; // Brown wood
      this.ctx.fillRect(350, 360, 200, 20);
      
      // Floor pattern
      this.ctx.fillStyle = '#4a3420';
      for (let i = 0; i < 2000; i += 40) {
        this.ctx.fillRect(i, 390, 35, 10);
      }
    } else {
      // Default level visualization
      this.ctx.fillStyle = '#0f3460';
      this.ctx.fillRect(0, 380, 2000, 20);

      // Draw some platforms
      this.ctx.fillRect(200, 300, 100, 20);
      this.ctx.fillRect(400, 250, 100, 20);
      this.ctx.fillRect(600, 320, 150, 20);
    }
  }

  drawPlayer(interpolation) {
    const player = this.stateManager.get('runtime.player');

    // Try to draw cat sprite
    const catSprite = this.assetLoader.get('/bowie_cat_3x3.png');
    if (catSprite && catSprite.complete) {
      // The cat sprite is 3x3, showing sitting cat at position (0,0)
      // Each sprite tile is 1024/3 = ~341 pixels
      const spriteSize = 1024 / 3;
      const drawSize = 30; // Scale down to fit game
      
      this.ctx.drawImage(
        catSprite,
        0, 0, spriteSize, spriteSize, // Source: top-left cat (sitting)
        player.x - drawSize/2, player.y - drawSize/2, drawSize, drawSize // Destination
      );
    } else {
      // Fallback to rectangle if sprite not loaded
      this.ctx.fillStyle = '#f39c12';
      this.ctx.fillRect(
        player.x - player.width / 2,
        player.y - player.height / 2,
        player.width,
        player.height
      );

      // Draw facing direction indicator
      this.ctx.fillStyle = '#fff';
      const eyeX = player.x + (player.facingRight ? 5 : -5);
      this.ctx.fillRect(eyeX - 2, player.y - 10, 4, 4);
    }
  }
}

// Initialize game when DOM is ready
function initGame() {
  console.log('🎮 BMaD Trace: Initializing game...');
  try {
    gameInstance = new CatPlatformerGame();
    console.log('🏗️ BMaD Trace: Game instance created');
    gameInstance.init();
    console.log('✅ BMaD Trace: Game init called');
  } catch (error) {
    console.error('❌ BMaD Trace: Init failed:', error);
  }

  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.game = gameInstance;
    window.stateManager = gameInstance.stateManager;
  }
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

export default CatPlatformerGame;
