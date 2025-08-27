import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Game } from '../../src/core/Game.js';
import { LevelManager } from '../../src/levels/LevelManager.js';
import { EntityManager } from '../../src/entities/EntityManager.js';
import { UIManager } from '../../src/ui/UIManager.js';

// Mock all external dependencies
vi.mock('../../src/core/Canvas.js');
vi.mock('../../src/core/InputManager.js');
vi.mock('../../src/core/StateManager.js');
vi.mock('../../src/core/asset-loader.js');
vi.mock('../../src/levels/LevelManager.js');
vi.mock('../../src/entities/EntityManager.js');
vi.mock('../../src/ui/UIManager.js');

describe('Game Flow Integration Tests', () => {
  let game;
  let mockLevelManager;
  let mockEntityManager;
  let mockUIManager;
  let mockCanvas;
  let mockInputManager;

  beforeEach(async () => {
    // Setup mock implementations
    mockCanvas = {
      element: { width: 800, height: 400 },
      context: {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn()
      },
      init: vi.fn().mockResolvedValue(true),
      clear: vi.fn(),
      destroy: vi.fn()
    };
    
    mockInputManager = {
      init: vi.fn(),
      update: vi.fn(),
      isKeyPressed: vi.fn().mockReturnValue(false),
      isJumpPressed: vi.fn().mockReturnValue(false),
      getMovementInput: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      destroy: vi.fn()
    };
    
    mockLevelManager = {
      init: vi.fn(),
      loadLevel: vi.fn().mockResolvedValue(true),
      getCurrentLevel: vi.fn().mockReturnValue({
        levelData: [[1, 1, 1], [0, 0, 0]],
        entities: [],
        startPosition: { x: 100, y: 300 }
      }),
      update: vi.fn(),
      render: vi.fn(),
      isLevelComplete: vi.fn().mockReturnValue(false),
      getNextLevelId: vi.fn().mockReturnValue(2)
    };
    
    mockEntityManager = {
      init: vi.fn(),
      createPlayer: vi.fn().mockReturnValue({
        x: 100, y: 300, health: 3, state: 'idle_sit',
        update: vi.fn(), render: vi.fn(),
        hurt: vi.fn(), heal: vi.fn(),
        isDead: vi.fn().mockReturnValue(false)
      }),
      update: vi.fn(),
      render: vi.fn(),
      getPlayer: vi.fn(),
      getEntities: vi.fn().mockReturnValue([]),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      clearAll: vi.fn()
    };
    
    mockUIManager = {
      init: vi.fn(),
      update: vi.fn(),
      render: vi.fn(),
      showGameOver: vi.fn(),
      showLevelComplete: vi.fn(),
      showVictory: vi.fn(),
      destroy: vi.fn()
    };
    
    // Mock constructors
    const { Canvas } = await import('../../src/core/Canvas.js');
    const { InputManager } = await import('../../src/core/InputManager.js');
    const { StateManager } = await import('../../src/core/StateManager.js');
    const { AssetLoader } = await import('../../src/core/asset-loader.js');
    
    Canvas.mockImplementation(() => mockCanvas);
    InputManager.mockImplementation(() => mockInputManager);
    StateManager.mockImplementation(() => ({
      init: vi.fn(),
      saveState: vi.fn(),
      loadState: vi.fn().mockResolvedValue(null)
    }));
    AssetLoader.mockImplementation(() => ({
      loadAssets: vi.fn().mockResolvedValue({})
    }));
    
    LevelManager.mockImplementation(() => mockLevelManager);
    EntityManager.mockImplementation(() => mockEntityManager);
    UIManager.mockImplementation(() => mockUIManager);
    
    game = new Game();
    await game.init();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Game Initialization Flow', () => {
    it('should initialize all systems in correct order', async () => {
      // Game should already be initialized in beforeEach
      expect(mockCanvas.init).toHaveBeenCalled();
      expect(mockInputManager.init).toHaveBeenCalled();
      expect(mockLevelManager.init).toHaveBeenCalled();
      expect(mockEntityManager.init).toHaveBeenCalled();
      expect(mockUIManager.init).toHaveBeenCalled();
    });

    it('should create player entity on game start', async () => {
      await game.startNewGame();
      
      expect(mockLevelManager.loadLevel).toHaveBeenCalledWith(1);
      expect(mockEntityManager.createPlayer).toHaveBeenCalled();
    });

    it('should load first level on new game', async () => {
      await game.startNewGame();
      
      expect(game.currentLevel).toBe(1);
      expect(game.state).toBe('playing');
    });
  });

  describe('Level Progression Flow', () => {
    beforeEach(async () => {
      await game.startNewGame();
      game.state = 'playing';
    });

    it('should progress to next level when current level is complete', async () => {
      mockLevelManager.isLevelComplete.mockReturnValue(true);
      mockLevelManager.getNextLevelId.mockReturnValue(2);
      
      game.update(16.67);
      
      expect(game.state).toBe('levelComplete');
      
      await game.loadNextLevel();
      
      expect(mockLevelManager.loadLevel).toHaveBeenCalledWith(2);
      expect(game.currentLevel).toBe(2);
    });

    it('should trigger victory when completing final level', async () => {
      game.currentLevel = 5; // Final level
      mockLevelManager.isLevelComplete.mockReturnValue(true);
      mockLevelManager.getNextLevelId.mockReturnValue(null);
      
      game.update(16.67);
      
      expect(game.state).toBe('victory');
      expect(mockUIManager.showVictory).toHaveBeenCalled();
    });

    it('should reset entities when loading new level', async () => {
      mockLevelManager.isLevelComplete.mockReturnValue(true);
      
      await game.loadNextLevel();
      
      expect(mockEntityManager.clearAll).toHaveBeenCalled();
      expect(mockEntityManager.createPlayer).toHaveBeenCalled();
    });
  });

  describe('Player Death and Game Over Flow', () => {
    let mockPlayer;
    
    beforeEach(async () => {
      await game.startNewGame();
      mockPlayer = mockEntityManager.createPlayer();
      mockEntityManager.getPlayer.mockReturnValue(mockPlayer);
      game.state = 'playing';
    });

    it('should handle player death and restart level', () => {
      mockPlayer.isDead.mockReturnValue(true);
      game.lives = 2;
      
      game.update(16.67);
      
      expect(game.lives).toBe(1);
      expect(game.state).toBe('respawning');
    });

    it('should trigger game over when lives reach zero', () => {
      mockPlayer.isDead.mockReturnValue(true);
      game.lives = 1;
      
      game.update(16.67);
      
      expect(game.lives).toBe(0);
      expect(game.state).toBe('gameOver');
      expect(mockUIManager.showGameOver).toHaveBeenCalled();
    });

    it('should respawn player at level start position', async () => {
      mockLevelManager.getCurrentLevel.mockReturnValue({
        startPosition: { x: 150, y: 250 }
      });
      
      await game.respawnPlayer();
      
      const createPlayerCall = mockEntityManager.createPlayer.mock.calls.slice(-1)[0];
      expect(createPlayerCall[0]).toBe(150);
      expect(createPlayerCall[1]).toBe(250);
    });
  });

  describe('Entity Interaction Flow', () => {
    let mockPlayer;
    let mockFireball;
    let mockMouse;
    
    beforeEach(async () => {
      await game.startNewGame();
      mockPlayer = {
        x: 100, y: 300, health: 3,
        update: vi.fn(), render: vi.fn(),
        hurt: vi.fn(), checkCollision: vi.fn(),
        isDead: vi.fn().mockReturnValue(false)
      };
      
      mockFireball = {
        x: 120, y: 310, active: true,
        update: vi.fn(), render: vi.fn(),
        checkCollision: vi.fn().mockReturnValue(true)
      };
      
      mockMouse = {
        x: 80, y: 290, active: true, caught: false,
        update: vi.fn(), render: vi.fn(),
        checkCaught: vi.fn().mockReturnValue(true)
      };
      
      mockEntityManager.getPlayer.mockReturnValue(mockPlayer);
      mockEntityManager.getEntities.mockReturnValue([mockFireball, mockMouse]);
    });

    it('should handle player-fireball collision', () => {
      mockPlayer.checkCollision.mockReturnValue(true);
      
      game.checkCollisions();
      
      expect(mockPlayer.hurt).toHaveBeenCalled();
    });

    it('should handle player catching mouse', () => {
      game.checkCollisions();
      
      expect(mockMouse.checkCaught).toHaveBeenCalledWith(mockPlayer);
      // Should increase score when mouse is caught
      expect(game.score).toBeGreaterThan(0);
    });

    it('should update all entities each frame', () => {
      game.update(16.67);
      
      expect(mockEntityManager.update).toHaveBeenCalledWith(16.67);
    });
  });

  describe('Game State Persistence Flow', () => {
    beforeEach(async () => {
      await game.startNewGame();
    });

    it('should save game state periodically', () => {
      game.score = 1500;
      game.lives = 2;
      game.currentLevel = 3;
      
      game.saveGameState();
      
      expect(game.stateManager.saveState).toHaveBeenCalledWith({
        currentLevel: 3,
        score: 1500,
        lives: 2,
        playerStats: expect.any(Object)
      });
    });

    it('should load saved game state on continue', async () => {
      const mockSavedState = {
        currentLevel: 4,
        score: 2000,
        lives: 1,
        playerStats: { health: 2, x: 200, y: 250 }
      };
      
      game.stateManager.loadState.mockResolvedValue(mockSavedState);
      
      await game.loadSavedGame();
      
      expect(game.currentLevel).toBe(4);
      expect(game.score).toBe(2000);
      expect(game.lives).toBe(1);
    });
  });

  describe('UI Integration Flow', () => {
    beforeEach(async () => {
      await game.startNewGame();
    });

    it('should update UI with current game state', () => {
      game.score = 750;
      game.lives = 2;
      
      game.update(16.67);
      
      expect(mockUIManager.update).toHaveBeenCalledWith({
        score: 750,
        lives: 2,
        level: 1,
        playerHealth: expect.any(Number)
      });
    });

    it('should render UI elements', () => {
      game.render();
      
      expect(mockUIManager.render).toHaveBeenCalled();
    });

    it('should handle mobile controls input', () => {
      const mockVirtualInput = { type: 'jump', pressed: true };
      
      game.handleVirtualInput(mockVirtualInput);
      
      expect(mockInputManager.handleVirtualInput).toHaveBeenCalledWith('jump', true);
    });
  });

  describe('Complete Game Session Flow', () => {
    it('should complete a full game session from start to victory', async () => {
      // Start new game
      await game.startNewGame();
      expect(game.state).toBe('playing');
      expect(game.currentLevel).toBe(1);
      
      // Progress through levels
      for (let level = 1; level <= 5; level++) {
        mockLevelManager.isLevelComplete.mockReturnValue(true);
        
        if (level < 5) {
          mockLevelManager.getNextLevelId.mockReturnValue(level + 1);
          game.update(16.67); // Trigger level completion
          await game.loadNextLevel();
          expect(game.currentLevel).toBe(level + 1);
        } else {
          mockLevelManager.getNextLevelId.mockReturnValue(null);
          game.update(16.67); // Trigger victory
          expect(game.state).toBe('victory');
        }
      }
      
      expect(mockUIManager.showVictory).toHaveBeenCalled();
    });

    it('should handle complete game over flow', async () => {
      await game.startNewGame();
      
      const mockPlayer = mockEntityManager.getPlayer();
      mockPlayer.isDead.mockReturnValue(true);
      
      // Lose all lives
      for (let lives = 3; lives > 0; lives--) {
        game.lives = lives;
        game.update(16.67);
      }
      
      expect(game.state).toBe('gameOver');
      expect(mockUIManager.showGameOver).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Flow', () => {
    it('should recover from level loading failure', async () => {
      mockLevelManager.loadLevel.mockRejectedValue(new Error('Level load failed'));
      
      const result = await game.loadLevel(2);
      
      expect(result).toBe(false);
      expect(game.state).toBe('error');
    });

    it('should handle entity update errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockEntityManager.update.mockImplementation(() => {
        throw new Error('Entity update failed');
      });
      
      expect(() => game.update(16.67)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle rendering errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockCanvas.clear.mockImplementation(() => {
        throw new Error('Render failed');
      });
      
      expect(() => game.render()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    it('should maintain stable frame rate with many entities', () => {
      const manyEntities = Array.from({ length: 100 }, (_, i) => ({
        x: i * 8, y: 300, active: true,
        update: vi.fn(), render: vi.fn()
      }));
      
      mockEntityManager.getEntities.mockReturnValue(manyEntities);
      
      const startTime = performance.now();
      
      // Simulate 60 frames
      for (let i = 0; i < 60; i++) {
        game.update(16.67);
        game.render();
      }
      
      const endTime = performance.now();
      const avgFrameTime = (endTime - startTime) / 60;
      
      // Should complete 60 frames in reasonable time
      expect(avgFrameTime).toBeLessThan(10); // 10ms per frame = 100 FPS capability
    });

    it('should cleanup resources properly on game end', () => {
      game.destroy();
      
      expect(mockCanvas.destroy).toHaveBeenCalled();
      expect(mockInputManager.destroy).toHaveBeenCalled();
      expect(mockUIManager.destroy).toHaveBeenCalled();
      expect(mockEntityManager.clearAll).toHaveBeenCalled();
    });
  });
});
