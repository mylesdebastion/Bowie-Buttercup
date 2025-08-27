import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StateManager } from './StateManager.js';

describe('StateManager', () => {
  let stateManager;
  let mockLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    
    global.localStorage = mockLocalStorage;
    
    // Mock console methods to suppress test output
    global.console = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    };
    
    stateManager = new StateManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      expect(stateManager.storageKey).toBe('catPlatformerSave');
      expect(stateManager.autoSave).toBe(true);
      expect(stateManager.saveInterval).toBe(30000);
    });

    it('should accept custom configuration', () => {
      const customStateManager = new StateManager({
        storageKey: 'customGameSave',
        autoSave: false,
        saveInterval: 60000
      });
      
      expect(customStateManager.storageKey).toBe('customGameSave');
      expect(customStateManager.autoSave).toBe(false);
      expect(customStateManager.saveInterval).toBe(60000);
    });

    it('should initialize auto-save when enabled', () => {
      const timerSpy = vi.spyOn(global, 'setInterval');
      
      stateManager.init();
      
      expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    });

    it('should not initialize auto-save when disabled', () => {
      const customStateManager = new StateManager({ autoSave: false });
      const timerSpy = vi.spyOn(global, 'setInterval');
      
      customStateManager.init();
      
      expect(timerSpy).not.toHaveBeenCalled();
    });
  });

  describe('state saving', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should save game state to localStorage', () => {
      const gameState = {
        currentLevel: 3,
        score: 1500,
        lives: 2,
        treatsCollected: 5,
        playerStats: {
          health: 3,
          x: 200,
          y: 300
        }
      };
      
      stateManager.saveState(gameState);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'catPlatformerSave',
        JSON.stringify(gameState)
      );
    });

    it('should handle save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const gameState = { currentLevel: 1 };
      
      expect(() => stateManager.saveState(gameState)).not.toThrow();
      expect(global.console.error).toHaveBeenCalled();
    });

    it('should validate game state before saving', () => {
      const invalidState = null;
      
      const result = stateManager.saveState(invalidState);
      
      expect(result).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should update last save timestamp', () => {
      const gameState = { currentLevel: 1 };
      const beforeSave = Date.now();
      
      stateManager.saveState(gameState);
      
      const afterSave = Date.now();
      expect(stateManager.lastSaveTime).toBeGreaterThanOrEqual(beforeSave);
      expect(stateManager.lastSaveTime).toBeLessThanOrEqual(afterSave);
    });
  });

  describe('state loading', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should load game state from localStorage', async () => {
      const savedState = {
        currentLevel: 4,
        score: 2000,
        lives: 1,
        treatsCollected: 8
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const loadedState = await stateManager.loadState();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('catPlatformerSave');
      expect(loadedState).toEqual(savedState);
    });

    it('should return null when no save exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const loadedState = await stateManager.loadState();
      
      expect(loadedState).toBe(null);
    });

    it('should handle corrupted save data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json data');
      
      const loadedState = await stateManager.loadState();
      
      expect(loadedState).toBe(null);
      expect(global.console.error).toHaveBeenCalled();
    });

    it('should validate loaded state structure', async () => {
      const invalidState = { invalidProperty: 'test' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidState));
      
      const loadedState = await stateManager.loadState();
      
      // Should still return the data but log a warning
      expect(loadedState).toEqual(invalidState);
    });
  });

  describe('state validation', () => {
    it('should validate complete game state', () => {
      const validState = {
        currentLevel: 3,
        score: 1500,
        lives: 2,
        treatsCollected: 5,
        playerStats: {
          health: 3,
          x: 200,
          y: 300
        },
        settings: {
          soundEnabled: true,
          musicVolume: 0.8
        }
      };
      
      const isValid = stateManager.validateState(validState);
      
      expect(isValid).toBe(true);
    });

    it('should reject state with missing required fields', () => {
      const incompleteState = {
        score: 1500
        // Missing currentLevel, lives, etc.
      };
      
      const isValid = stateManager.validateState(incompleteState);
      
      expect(isValid).toBe(false);
    });

    it('should reject state with invalid data types', () => {
      const invalidState = {
        currentLevel: 'three', // Should be number
        score: 1500,
        lives: 2,
        treatsCollected: 5
      };
      
      const isValid = stateManager.validateState(invalidState);
      
      expect(isValid).toBe(false);
    });

    it('should reject state with out-of-range values', () => {
      const invalidState = {
        currentLevel: -1, // Invalid level
        score: 1500,
        lives: 10, // Too many lives
        treatsCollected: 5
      };
      
      const isValid = stateManager.validateState(invalidState);
      
      expect(isValid).toBe(false);
    });
  });

  describe('auto-save functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      stateManager.init();
    });

    afterEach(() => {
      vi.restoreAllTimers();
    });

    it('should auto-save at specified intervals', () => {
      const gameState = { currentLevel: 1, score: 100 };
      stateManager.setCurrentState(gameState);
      
      // Fast-forward past auto-save interval
      vi.advanceTimersByTime(35000);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should not auto-save if no state changes', () => {
      // Fast-forward past auto-save interval without setting state
      vi.advanceTimersByTime(35000);
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should stop auto-save when disabled', () => {
      stateManager.setAutoSave(false);
      const gameState = { currentLevel: 1, score: 100 };
      stateManager.setCurrentState(gameState);
      
      vi.advanceTimersByTime(35000);
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('state migration', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should migrate old save format to new format', async () => {
      const oldFormatSave = {
        level: 3, // Old property name
        points: 1500, // Old property name
        health: 2
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldFormatSave));
      
      const migratedState = await stateManager.loadState();
      
      // Should migrate old format to new format
      expect(migratedState.currentLevel).toBe(3);
      expect(migratedState.score).toBe(1500);
      expect(migratedState.lives).toBe(2);
    });

    it('should handle missing migration gracefully', async () => {
      const unknownFormatSave = {
        unknownProperty: 'value',
        anotherUnknown: 123
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(unknownFormatSave));
      
      const loadedState = await stateManager.loadState();
      
      expect(loadedState).toEqual(unknownFormatSave);
    });
  });

  describe('state queries', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should check if save exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ currentLevel: 1 }));
      
      const saveExists = await stateManager.hasSavedState();
      
      expect(saveExists).toBe(true);
    });

    it('should report no save when localStorage is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const saveExists = await stateManager.hasSavedState();
      
      expect(saveExists).toBe(false);
    });

    it('should get save metadata', async () => {
      const saveData = {
        currentLevel: 3,
        score: 1500,
        timestamp: Date.now()
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(saveData));
      
      const metadata = await stateManager.getSaveMetadata();
      
      expect(metadata.level).toBe(3);
      expect(metadata.score).toBe(1500);
      expect(metadata.timestamp).toBe(saveData.timestamp);
    });
  });

  describe('state clearing', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should clear saved state', () => {
      stateManager.clearState();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('catPlatformerSave');
    });

    it('should clear all game data', () => {
      stateManager.clearAllData();
      
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      stateManager.init();
    });

    it('should handle localStorage access errors', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const loadedState = await stateManager.loadState();
      
      expect(loadedState).toBe(null);
      expect(global.console.error).toHaveBeenCalled();
    });

    it('should fallback when localStorage is disabled', () => {
      global.localStorage = null;
      
      const fallbackManager = new StateManager();
      fallbackManager.init();
      
      // Should not throw when localStorage is unavailable
      expect(() => fallbackManager.saveState({ currentLevel: 1 })).not.toThrow();
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      stateManager.init();
    });

    afterEach(() => {
      vi.restoreAllTimers();
    });

    it('should clear auto-save timer on destroy', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      stateManager.destroy();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should reset all state on destroy', () => {
      stateManager.currentState = { currentLevel: 3 };
      
      stateManager.destroy();
      
      expect(stateManager.currentState).toBe(null);
      expect(stateManager.autoSaveTimer).toBe(null);
    });
  });
});
