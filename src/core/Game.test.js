import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Game } from './Game.js';
import { Canvas } from './Canvas.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';
import { AssetLoader } from './asset-loader.js';

vi.mock('./Canvas.js');
vi.mock('./InputManager.js');
vi.mock('./StateManager.js');
vi.mock('./asset-loader.js');
vi.mock('../ui/UIManager.js', () => ({
  UIManager: vi.fn().mockImplementation(() => ({
    init: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
    handleResize: vi.fn(),
    destroy: vi.fn()
  }))
}));

describe('Game', () => {
  let game;
  let mockCanvas;
  let mockCanvasElement;
  let mockContext;

  beforeEach(() => {
    // Mock DOM canvas element
    mockCanvasElement = {
      width: 800,
      height: 400,
      getContext: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn()
    };
    
    mockCanvasElement.getContext.mockReturnValue(mockContext);
    
    // Mock Canvas class
    mockCanvas = {
      element: mockCanvasElement,
      context: mockContext,
      width: 800,
      height: 400,
      init: vi.fn().mockResolvedValue(true),
      clear: vi.fn(),
      resize: vi.fn(),
      destroy: vi.fn()
    };
    Canvas.mockImplementation(() => mockCanvas);
    
    // Mock other dependencies
    InputManager.mockImplementation(() => ({
      init: vi.fn(),
      update: vi.fn(),
      isKeyPressed: vi.fn().mockReturnValue(false),
      isJumpPressed: vi.fn().mockReturnValue(false),
      isJumpBuffered: vi.fn().mockReturnValue(false),
      clearJumpBuffer: vi.fn(),
      destroy: vi.fn()
    }));
    
    StateManager.mockImplementation(() => ({
      init: vi.fn(),
      saveState: vi.fn(),
      loadState: vi.fn().mockResolvedValue(null),
      clearState: vi.fn()
    }));
    
    AssetLoader.mockImplementation(() => ({
      loadAssets: vi.fn().mockResolvedValue({})
    }));
    
    // Mock global DOM
    global.document = {
      getElementById: vi.fn().mockReturnValue(mockCanvasElement),
      createElement: vi.fn().mockReturnValue(mockCanvasElement)
    };
    
    game = new Game();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(game.state).toBe('loading');
      expect(game.currentLevel).toBe(1);
      expect(game.score).toBe(0);
      expect(game.lives).toBe(3);
      expect(game.level).toEqual([]);
      expect(game.entities).toEqual([]);
      expect(game.particles).toEqual([]);
    });

    it('should create required systems', () => {
      expect(Canvas).toHaveBeenCalled();
      expect(InputManager).toHaveBeenCalled();
      expect(StateManager).toHaveBeenCalled();
      expect(AssetLoader).toHaveBeenCalled();
    });
  });

  describe('initialization process', () => {
    it('should initialize all systems successfully', async () => {
      const result = await game.init();
      
      expect(game.canvas.init).toHaveBeenCalled();
      expect(game.inputManager.init).toHaveBeenCalled();
      expect(game.stateManager.init).toHaveBeenCalled();
      expect(game.assetLoader.loadAssets).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      game.canvas.init.mockRejectedValue(new Error('Canvas init failed'));
      
      const result = await game.init();
      expect(result).toBe(false);
    });
  });

  describe('game loop', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should start the game loop', () => {
      const result = game.start();
      expect(game.running).toBe(true);
      expect(result).toBe(game);
    });

    it('should stop the game loop', () => {
      game.start();
      const result = game.stop();
      expect(game.running).toBe(false);
      expect(result).toBe(game);
    });

    it('should pause and resume the game', () => {
      game.start();
      
      game.pause();
      expect(game.paused).toBe(true);
      
      game.resume();
      expect(game.paused).toBe(false);
    });
  });

  describe('level management', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should load a level', async () => {
      const mockLevel = [[1, 1, 1], [0, 0, 0]];
      
      await game.loadLevel(2, mockLevel);
      
      expect(game.currentLevel).toBe(2);
      expect(game.level).toEqual(mockLevel);
      expect(game.entities).toEqual([]);
      expect(game.particles).toEqual([]);
    });

    it('should restart the current level', async () => {
      game.currentLevel = 3;
      game.score = 100;
      
      await game.restart();
      
      expect(game.score).toBe(0);
      expect(game.lives).toBe(3);
    });
  });

  describe('game state management', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should handle game over', () => {
      game.lives = 1;
      game.state = 'playing';
      
      game.handleGameOver();
      
      expect(game.state).toBe('gameOver');
      expect(game.lives).toBe(0);
    });

    it('should handle level completion', () => {
      game.currentLevel = 2;
      game.state = 'playing';
      
      game.handleLevelComplete();
      
      expect(game.state).toBe('levelComplete');
    });

    it('should handle victory', () => {
      game.currentLevel = 5;
      game.state = 'playing';
      
      game.handleVictory();
      
      expect(game.state).toBe('victory');
    });
  });

  describe('entity management', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should add entities to the game', () => {
      const mockEntity = { x: 100, y: 100, update: vi.fn(), render: vi.fn() };
      
      game.addEntity(mockEntity);
      
      expect(game.entities).toContain(mockEntity);
    });

    it('should remove entities from the game', () => {
      const mockEntity = { x: 100, y: 100, update: vi.fn(), render: vi.fn() };
      game.entities = [mockEntity];
      
      game.removeEntity(mockEntity);
      
      expect(game.entities).not.toContain(mockEntity);
    });

    it('should clean up destroyed entities', () => {
      const mockEntity1 = { destroyed: false };
      const mockEntity2 = { destroyed: true };
      const mockEntity3 = { destroyed: false };
      
      game.entities = [mockEntity1, mockEntity2, mockEntity3];
      
      game.cleanupEntities();
      
      expect(game.entities).toEqual([mockEntity1, mockEntity3]);
    });
  });

  describe('rendering', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should render the game state', () => {
      const mockEntity = { render: vi.fn() };
      game.entities = [mockEntity];
      
      game.render();
      
      expect(game.canvas.clear).toHaveBeenCalled();
      expect(mockEntity.render).toHaveBeenCalledWith(mockContext, expect.any(Object));
    });

    it('should apply camera offset when rendering', () => {
      game.camera = { x: 50, y: 25 };
      const mockEntity = { render: vi.fn() };
      game.entities = [mockEntity];
      
      game.render();
      
      expect(mockContext.translate).toHaveBeenCalledWith(-50, -25);
    });
  });

  describe('update cycle', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should update all systems when not paused', () => {
      const mockEntity = { update: vi.fn() };
      game.entities = [mockEntity];
      game.running = true;
      game.paused = false;
      
      game.update(16.67);
      
      expect(game.inputManager.update).toHaveBeenCalled();
      expect(mockEntity.update).toHaveBeenCalledWith(16.67, game);
    });

    it('should not update entities when paused', () => {
      const mockEntity = { update: vi.fn() };
      game.entities = [mockEntity];
      game.running = true;
      game.paused = true;
      
      game.update(16.67);
      
      expect(mockEntity.update).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await game.init();
    });

    it('should destroy all systems properly', () => {
      game.destroy();
      
      expect(game.inputManager.destroy).toHaveBeenCalled();
      expect(game.canvas.destroy).toHaveBeenCalled();
      expect(game.uiManager.destroy).toHaveBeenCalled();
      expect(game.running).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle update errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockEntity = { 
        update: vi.fn().mockImplementation(() => { 
          throw new Error('Entity update failed'); 
        }) 
      };
      
      game.entities = [mockEntity];
      
      expect(() => game.update(16.67)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle render errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockEntity = { 
        render: vi.fn().mockImplementation(() => { 
          throw new Error('Entity render failed'); 
        }) 
      };
      
      game.entities = [mockEntity];
      
      expect(() => game.render()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});
