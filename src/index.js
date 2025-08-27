/**
 * Cat Platformer - Modular Entry Point
 *
 * This is the main entry point for the modular cat platformer.
 * It initializes the game systems and starts the game loop.
 * 
 * US-002: Game Loop Extraction Implementation
 */

import { Game } from './core/Game.js';

// Global variables for compatibility (InputManager will handle input)
window.keys = {};

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});

async function initializeGame() {
  try {
    console.log('🎮 Initializing Cat Platformer...');
    
    // Get or create canvas
    let canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      canvas = createCanvas();
    }
    
    // Input handling is now managed by Game's InputManager
    // setupInputHandlers();
    
    // Check for URL parameters to override level (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const forceLevel = urlParams.get('level');
    
    // Create and start game (Canvas module handles context internally)
    const game = new Game(canvas);
    
    // Override level if specified in URL
    if (forceLevel && !isNaN(parseInt(forceLevel))) {
      const level = Math.max(1, Math.min(5, parseInt(forceLevel)));
      console.log(`🔧 Forcing level to ${level} for testing`);
      game.stateManager.set('game.currentLevel', level);
      game.currentLevel = level;
      game.level = game.createLevel();
      game.initLevel();
    }
    
    game.init().start();
    
    console.log('✅ Cat Platformer loaded successfully');
    console.log('🎯 Modular architecture: Canvas Management Module Complete');
    console.log('📦 Build system: Active');
    
  } catch (error) {
    console.error('❌ Failed to load game:', error);
  }
}

function createCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = '2px solid #0f3460';
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = '-moz-crisp-edges';
  canvas.style.imageRendering = 'crisp-edges';
  
  // Find game area or create one
  let gameArea = document.getElementById('gameArea');
  if (!gameArea) {
    gameArea = document.body;
  }
  
  gameArea.appendChild(canvas);
  return canvas;
}

function setupInputHandlers() {
  // Input handling is now managed by Game's InputManager
  // This function is kept for compatibility but no longer sets up input
  
  // Only prevent context menu on canvas (non-input related)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
      e.preventDefault();
    }
  });
  
  console.log('⌨️  Input handling delegated to Game\'s InputManager');
}

// Development mode indicators
if (import.meta.env.DEV) {
  console.log('🛠️  Development mode active');
  console.log('🔥 Hot module replacement enabled');
}

// Version information
console.log(`🐱 Cat Platformer v${import.meta.env.PACKAGE_VERSION || '2.0.0'}`);
console.log('🏗️  BMad Method: US-004 Input Management System');
