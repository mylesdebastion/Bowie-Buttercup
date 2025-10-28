/**
 * Cat Platformer - Modular Entry Point
 *
 * This is the main entry point for the modular cat platformer.
 * It initializes the game systems and starts the game loop.
 * 
 * US-002: Game Loop Extraction Implementation
 */

import { Game } from './core/Game.js';
import { PetSelector } from './ui/PetSelector.js';

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
    
    // Check for URL parameters for pet/level selection - E003.1-003
    const urlParams = new URLSearchParams(window.location.search);
    const forceLevel = urlParams.get('level');
    const petParam = urlParams.get('pet'); // ?pet=bowie or ?pet=buttercup

    // Determine selected pet from URL parameter
    let selectedPet = 'A'; // Default to Bowie Cat

    if (petParam) {
        const petLower = petParam.toLowerCase();
        if (petLower === 'buttercup' || petLower === 'b') {
            selectedPet = 'B';
            console.log('🐱 URL pet selection: Buttercup Cat (curious cream cat)');
        } else if (petLower === 'bowie' || petLower === 'a') {
            selectedPet = 'A';
            console.log('🐱 URL pet selection: Bowie Cat (calm gray tabby)');
        }
    }

    // Create and start game (Canvas module handles context internally)
    const game = new Game(canvas);

    // Set default to Level 1 for platform testing
    const level = forceLevel && !isNaN(parseInt(forceLevel)) ?
                  Math.max(1, Math.min(5, parseInt(forceLevel))) : 1;

    console.log(`🔧 Setting level to ${level} for testing`);
    game.stateManager.set('game.currentLevel', level);
    game.currentLevel = level;

    await game.init();
    game.start();

    // Initialize Pet Selector UI - E002.1-002
    const petSelectorContainer = document.getElementById('petSelectorContainer');
    if (petSelectorContainer) {
        const petSelector = new PetSelector(petSelectorContainer, game);

        // Set pet from URL before rendering - E003.1-003
        petSelector.currentPet = selectedPet;
        petSelector.saveSelection(selectedPet);

        petSelector.render();

        // Store petSelector on game for auto-dismiss - E003.1-002
        game.petSelector = petSelector;

        console.log(`🐱 Pet Selector initialized with: ${petSelector.getSelectedPet() === 'A' ? 'Bowie Cat' : 'Buttercup Cat'}`);

        // Set initial pet configuration
        game.changePet(petSelector.getSelectedPet());

        // Auto-dismiss pet selector after delay - E003.1-002
        setTimeout(() => {
            if (petSelector.isVisible && petSelector.isVisible()) {
                petSelector.hide();
            }
        }, 10000); // Hide after 10 seconds
    }

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
