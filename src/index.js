/**
 * Cat Platformer - Modular Entry Point
 *
 * This is the main entry point for the modular cat platformer.
 * It initializes the game systems and starts the game loop.
 */

// Import core modules (will be created during modularization)
// import { Game } from './engine/Game.js'
// import { CanvasManager } from './engine/CanvasManager.js'
// import { InputManager } from './engine/InputManager.js'

// Temporary: Load original game until modularization is complete
import('./legacy/game-loader.js')
  .then(() => {
    console.log('🎮 Cat Platformer loaded successfully');
    console.log('🔧 Modular architecture: In development');
    console.log('📦 Build system: Active');
  })
  .catch(error => {
    console.error('❌ Failed to load game:', error);
  });

// Development mode indicators
if (import.meta.env.DEV) {
  console.log('🛠️  Development mode active');
  console.log('🔥 Hot module replacement enabled');
}

// Version information
console.log(`🐱 Cat Platformer v${import.meta.env.PACKAGE_VERSION || '2.0.0'}`);
console.log('🏗️  BMad Method: Modularization in progress');
