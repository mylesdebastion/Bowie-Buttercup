/**
 * Main Game Entry Point
 *
 * Initializes and coordinates all game modules
 */

import './styles/main.css';
import { GameLoop } from './core/game-loop.js';
import { getGameState } from './core/game-state.js';
import { getAssetLoader } from './core/asset-loader.js';
import { ItemSystem } from './entities/items.js';

// Global game instance
let gameInstance = null;

class CatPlatformerGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = getGameState();
    this.gameLoop = null;
    this.assetLoader = getAssetLoader();
    this.initialized = false;

    // Game systems
    this.itemSystem = new ItemSystem(this.gameState);

    // Input state
    this.keys = {};

    // Debug mode
    this.debug = false;
  }

  async init() {
    if (this.initialized) return;

    console.log('🎮 Initializing Cat Platformer (Modular Edition)...');

    // Setup canvas
    this.setupCanvas();

    // Setup input handlers
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

    // Load level (start on Level 5 to test pet bowls)
    this.gameState.currentLevel = 5;
    await this.loadLevel(this.gameState.currentLevel);

    this.initialized = true;
    console.log('✅ Game initialized successfully');

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
      this.canvas.width = 800;
      this.canvas.height = 400;

      const gameArea = document.getElementById('gameArea') || document.body;
      gameArea.appendChild(this.canvas);
    }

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
    // Keyboard input
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Prevent default for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Debug toggle
      if (e.code === 'F3') {
        this.debug = !this.debug;
        const debugOverlay = document.getElementById('debugOverlay');
        if (debugOverlay) {
          debugOverlay.style.display = this.debug ? 'block' : 'none';
        }
      }

      // Pause toggle
      if (e.code === 'Escape' || e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Touch input for mobile
    this.setupTouchControls();
  }

  setupTouchControls() {
    // Mobile controls setup will be implemented in a separate module
    // For now, just prevent default touch behavior on canvas
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
    this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    this.canvas.addEventListener('touchend', (e) => e.preventDefault());
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
    this.gameState.subscribe('gameOver', () => {
      console.log('💀 Game Over!');
      this.gameLoop.stop();
    });

    this.gameState.subscribe('victory', () => {
      console.log('🎉 Victory!');
      this.gameLoop.stop();
    });

    this.gameState.subscribe('levelChanged', (level) => {
      console.log(`📍 Level changed to ${level}`);
      this.loadLevel(level);
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
    this.gameState.resetLevel();
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
    if (this.gameState.isPaused) {
      this.gameState.resume();
      this.gameLoop.resume();
    } else {
      this.gameState.pause();
      this.gameLoop.pause();
    }
  }

  update(dt) {
    if (this.gameState.isGameOver || this.gameState.isVictory) {
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
  }

  fixedUpdate(dt) {
    // Physics updates will go here
    // This runs at a fixed timestep for consistent physics
    const deltaTime = dt / 1000;

    // Apply gravity
    if (!this.gameState.playerState.isGrounded) {
      this.gameState.playerState.vy += this.gameState.config.gravity * deltaTime;
      this.gameState.playerState.vy = Math.min(
        this.gameState.playerState.vy,
        this.gameState.config.maxFallSpeed
      );
    }

    // Update positions
    this.gameState.playerState.x += this.gameState.playerState.vx * deltaTime;
    this.gameState.playerState.y += this.gameState.playerState.vy * deltaTime;

    // Temporary ground check (will be replaced with proper collision)
    if (this.gameState.playerState.y > 350) {
      this.gameState.playerState.y = 350;
      this.gameState.playerState.vy = 0;
      this.gameState.playerState.isGrounded = true;
    }
  }

  handleInput(dt) {
    const state = this.gameState.playerState;
    const config = this.gameState.config;

    // Horizontal movement
    if (this.keys.ArrowLeft || this.keys.KeyA) {
      state.vx = Math.max(state.vx - config.acceleration * dt, -config.moveSpeed);
      state.facingRight = false;
    } else if (this.keys.ArrowRight || this.keys.KeyD) {
      state.vx = Math.min(state.vx + config.acceleration * dt, config.moveSpeed);
      state.facingRight = true;
    } else {
      // Apply friction
      if (Math.abs(state.vx) > 0) {
        const friction = config.friction * dt;
        if (state.vx > 0) {
          state.vx = Math.max(0, state.vx - friction);
        } else {
          state.vx = Math.min(0, state.vx + friction);
        }
      }
    }

    // Jump
    if ((this.keys.Space || this.keys.ArrowUp || this.keys.KeyW) &&
        state.isGrounded && !state.isJumping) {
      state.vy = -config.jumpPower;
      state.isGrounded = false;
      state.isJumping = true;
    }

    // Release jump
    if (!this.keys.Space && !this.keys.ArrowUp && !this.keys.KeyW) {
      state.isJumping = false;
    }

    // Duck
    state.isDucking = this.keys.ArrowDown || this.keys.KeyS;
  }

  updateCamera(dt) {
    const camera = this.gameState.camera;
    const player = this.gameState.playerState;

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
      const state = this.gameState.getState();
      hud.innerHTML = `
        <div>Level: ${state.level}</div>
        <div>Lives: ${'❤️'.repeat(state.lives)}</div>
        <div>Score: ${state.score}</div>
        <div>Coins: ${state.coins}</div>
      `;
    }

    if (this.debug) {
      const debugOverlay = document.getElementById('debugOverlay');
      if (debugOverlay) {
        const player = this.gameState.playerState;
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

    // Save context
    this.ctx.save();

    // Apply camera transform
    const camera = this.gameState.camera;
    this.ctx.translate(-camera.x, -camera.y);

    // Draw level (will be implemented in level module)
    this.drawLevel();

    // Draw items (pet bowls, etc.)
    this.itemSystem.render(this.ctx);

    // Draw player
    this.drawPlayer(interpolation);

    // Restore context
    this.ctx.restore();
  }

  drawLevel() {
    // Temporary level visualization
    this.ctx.fillStyle = '#0f3460';
    this.ctx.fillRect(0, 380, 2000, 20);

    // Draw some platforms
    this.ctx.fillRect(200, 300, 100, 20);
    this.ctx.fillRect(400, 250, 100, 20);
    this.ctx.fillRect(600, 320, 150, 20);
  }

  drawPlayer(interpolation) {
    const player = this.gameState.playerState;

    // Simple player rectangle for now
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

// Initialize game when DOM is ready
function initGame() {
  gameInstance = new CatPlatformerGame();
  gameInstance.init();

  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.game = gameInstance;
    window.gameState = gameInstance.gameState;
  }
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

export default CatPlatformerGame;
