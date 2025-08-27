/**
 * StateManager - Centralized State Management System
 *
 * Manages all game state including progression, settings, and editor data
 * with robust localStorage persistence and validation.
 */

export class StateManager {
  constructor() {
    console.log('🏗️ BMaD Trace: StateManager constructor starting...');
    try {
      // Default state schema
      this.defaultState = {
      // Game Progress
      game: {
        currentLevel: 1,
        maxLevel: 5,
        lives: 3,
        score: 0,
        highScore: 0,
        coins: 0,
        levelsCompleted: [false, false, false, false, false], // index-based for levels 1-5
        playerStats: {
          totalPlayTime: 0,
          enemiesDefeated: 0,
          coinsCollected: 0,
          deathCount: 0,
          jumpCount: 0
        }
      },

      // Game Settings & Accessibility
      settings: {
        // Accessibility
        highContrast: false,
        reducedMotion: false,
        
        // Audio
        musicMuted: false,
        sfxMuted: false,
        musicVolume: 1.0,
        sfxVolume: 1.0,
        
        // Display
        uiScale: 2,
        fullscreen: false,
        
        // Physics & Gameplay
        physics: {
          gravity: 700,
          jumpPower: 350,
          moveSpeed: 200,
          maxFallSpeed: 500,
          coyoteTime: 150,
          acceleration: 1200,
          friction: 800,
          jumpBuffer: 100
        },
        
        // Controls
        keyMap: {
          left: ['ArrowLeft', 'KeyA'],
          right: ['ArrowRight', 'KeyD'],
          up: ['ArrowUp', 'KeyW'],
          down: ['ArrowDown', 'KeyS'],
          jump: ['Space'],
          duck: ['ShiftLeft', 'ShiftRight']
        }
      },

      // Sprite Editor Data
      spriteEditor: {
        customSprites: {},
        selectedSprite: 'default',
        currentMapping: null, // Will be set to default mapping
        editMode: false
      },

      // Runtime state (not persisted)
      runtime: {
        isPaused: false,
        isGameOver: false,
        isVictory: false,
        isTransitioning: false,
        currentMode: 'play', // 'play', 'menu', 'editor', 'settings'
        
        // Player state (reset per level)
        player: {
          x: 50,
          y: 200,
          vx: 0,
          vy: 0,
          width: 30,
          height: 30,
          isGrounded: false,
          isJumping: false,
          isDucking: false,
          facingRight: true,
          animationFrame: 0,
          invulnerable: false,
          invulnerableTime: 0
        },

        // Level state (reset per level)
        level: {
          startTime: 0,
          elapsedTime: 0,
          enemiesDefeated: 0,
          coinsCollected: 0,
          checkpointReached: false,
          checkpointX: 50,
          checkpointY: 200
        },

        // Camera state
        camera: {
          x: 0,
          y: 0,
          targetX: 0,
          targetY: 0,
          smoothing: 0.1
        }
      }
    };

    // Initialize current state
    this.state = this.deepClone(this.defaultState);
    
    // Event system for state changes
    this.subscribers = new Map();
    
    // State validation schema
    this.validationSchema = this.createValidationSchema();
    
    // Storage keys
    this.storageKeys = {
      gameProgress: 'catPlatformerSave',
      settings: 'catPlatformerSettings',
      spriteEditor: 'catPlatformerEditor'
    };
    
    // Initialize state properties
    this.state = this.deepClone(this.defaultState);
    this.listeners = [];
    this.validationSchema = this.createValidationSchema();
    
    console.log('🔧 BMaD Trace: About to load persisted state...');
    // Load persisted state
    this.load();
    console.log('✅ BMaD Trace: StateManager constructor completed');
    } catch (error) {
      console.error('❌ BMaD Trace: StateManager constructor failed:', error);
      throw error;
    }
  }

  /**
   * Create validation schema for state properties
   */
  createValidationSchema() {
    return {
      game: {
        currentLevel: (v) => Number.isInteger(v) && v >= 1 && v <= 5,
        maxLevel: (v) => Number.isInteger(v) && v >= 1 && v <= 10,
        lives: (v) => Number.isInteger(v) && v >= 0 && v <= 99,
        score: (v) => Number.isInteger(v) && v >= 0,
        highScore: (v) => Number.isInteger(v) && v >= 0,
        coins: (v) => Number.isInteger(v) && v >= 0,
        levelsCompleted: (v) => Array.isArray(v) && v.length === 5,
        playerStats: (v) => typeof v === 'object' && v !== null
      },
      settings: {
        highContrast: (v) => typeof v === 'boolean',
        reducedMotion: (v) => typeof v === 'boolean',
        musicMuted: (v) => typeof v === 'boolean',
        sfxMuted: (v) => typeof v === 'boolean',
        musicVolume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
        sfxVolume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
        uiScale: (v) => Number.isInteger(v) && v >= 1 && v <= 4,
        physics: (v) => typeof v === 'object' && v !== null,
        keyMap: (v) => typeof v === 'object' && v !== null
      },
      spriteEditor: {
        customSprites: (v) => typeof v === 'object' && v !== null,
        selectedSprite: (v) => typeof v === 'string',
        currentMapping: (v) => v === null || typeof v === 'object',
        editMode: (v) => typeof v === 'boolean'
      }
    };
  }

  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Validate state data against schema
   */
  validateState(data, schema, path = '') {
    const errors = [];
    
    for (const [key, validator] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in data)) {
        errors.push(`Missing property: ${currentPath}`);
        continue;
      }
      
      if (typeof validator === 'function') {
        if (!validator(data[key])) {
          errors.push(`Invalid value at ${currentPath}: ${data[key]}`);
        }
      } else if (typeof validator === 'object') {
        const nestedErrors = this.validateState(data[key], validator, currentPath);
        errors.push(...nestedErrors);
      }
    }
    
    return errors;
  }

  /**
   * Sanitize and validate incoming state data
   */
  sanitizeState(data, defaults) {
    if (!data || typeof data !== 'object') {
      return this.deepClone(defaults);
    }
    
    const sanitized = this.deepClone(defaults);
    
    // Merge valid properties from data
    for (const [key, value] of Object.entries(data)) {
      if (key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
          sanitized[key] = this.sanitizeState(value, sanitized[key]);
        } else {
          // Simple validation - use value if type matches, otherwise keep default
          if (typeof value === typeof sanitized[key]) {
            sanitized[key] = value;
          }
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Get state value by key path
   */
  get(keyPath) {
    const keys = keyPath.split('.');
    let current = this.state;
    
    for (const key of keys) {
      if (current === null || typeof current !== 'object' || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  /**
   * Set state value by key path
   */
  set(keyPath, value) {
    const keys = keyPath.split('.');
    const lastKey = keys.pop();
    let current = this.state;
    
    // Navigate to parent object
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the value
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // Notify subscribers
    this.notify('stateChanged', { keyPath, value, oldValue });
    this.notify(`change:${keyPath}`, { value, oldValue });
    
    return true;
  }

  /**
   * Get complete state object (readonly)
   */
  getState() {
    return this.deepClone(this.state);
  }

  /**
   * Update multiple state properties at once
   */
  setState(updates) {
    const changes = [];
    
    for (const [keyPath, value] of Object.entries(updates)) {
      const oldValue = this.get(keyPath);
      if (oldValue !== value) {
        this.set(keyPath, value);
        changes.push({ keyPath, value, oldValue });
      }
    }
    
    if (changes.length > 0) {
      this.notify('multipleChanges', changes);
    }
    
    return changes.length;
  }

  /**
   * Reset state to defaults
   */
  reset() {
    this.state = this.deepClone(this.defaultState);
    this.notify('stateReset');
    return true;
  }

  /**
   * Reset specific state section
   */
  resetSection(section) {
    if (section in this.defaultState) {
      this.state[section] = this.deepClone(this.defaultState[section]);
      this.notify('sectionReset', section);
      return true;
    }
    return false;
  }

  /**
   * Save state to localStorage
   */
  save() {
    const results = {
      gameProgress: false,
      settings: false,
      spriteEditor: false
    };
    
    try {
      // Save game progress (essential game data)
      const gameData = {
        currentLevel: this.state.game.currentLevel,
        highScore: this.state.game.highScore,
        levelsCompleted: this.state.game.levelsCompleted,
        playerStats: this.state.game.playerStats,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKeys.gameProgress, JSON.stringify(gameData));
      results.gameProgress = true;
      
    } catch (e) {
      console.error('Failed to save game progress:', e);
    }
    
    try {
      // Save settings (user preferences)
      const settingsData = {
        ...this.state.settings,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKeys.settings, JSON.stringify(settingsData));
      results.settings = true;
      
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
    
    try {
      // Save sprite editor data
      const editorData = {
        ...this.state.spriteEditor,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKeys.spriteEditor, JSON.stringify(editorData));
      results.spriteEditor = true;
      
    } catch (e) {
      console.error('Failed to save sprite editor data:', e);
    }
    
    this.notify('stateSaved', results);
    return results;
  }

  /**
   * Load state from localStorage
   */
  load() {
    const results = {
      gameProgress: false,
      settings: false,
      spriteEditor: false,
      errors: []
    };
    
    // Load game progress
    try {
      const gameData = localStorage.getItem(this.storageKeys.gameProgress);
      if (gameData) {
        const parsed = JSON.parse(gameData);
        
        // Validate and sanitize
        const sanitized = this.sanitizeState(parsed, this.defaultState.game);
        
        // Validate specific fields
        const errors = this.validateState(sanitized, this.validationSchema.game);
        if (errors.length > 0) {
          console.warn('Game progress validation errors:', errors);
          results.errors.push(...errors);
        } else {
          this.state.game = { ...this.state.game, ...sanitized };
          results.gameProgress = true;
        }
      }
    } catch (e) {
      console.error('Failed to load game progress:', e);
      results.errors.push('Game progress corrupted');
    }
    
    // Load settings
    try {
      const settingsData = localStorage.getItem(this.storageKeys.settings);
      if (settingsData) {
        const parsed = JSON.parse(settingsData);
        
        // Sanitize settings data
        const sanitized = this.sanitizeState(parsed, this.defaultState.settings);
        
        this.state.settings = { ...this.state.settings, ...sanitized };
        results.settings = true;
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
      results.errors.push('Settings corrupted');
    }
    
    // Load sprite editor data
    try {
      const editorData = localStorage.getItem(this.storageKeys.spriteEditor);
      if (editorData) {
        const parsed = JSON.parse(editorData);
        
        // Sanitize editor data
        const sanitized = this.sanitizeState(parsed, this.defaultState.spriteEditor);
        
        this.state.spriteEditor = { ...this.state.spriteEditor, ...sanitized };
        results.spriteEditor = true;
      }
    } catch (e) {
      console.error('Failed to load sprite editor data:', e);
      results.errors.push('Sprite editor data corrupted');
    }
    
    this.notify('stateLoaded', results);
    return results;
  }

  /**
   * Clear all saved data
   */
  clear() {
    const results = {
      gameProgress: false,
      settings: false,
      spriteEditor: false
    };
    
    try {
      localStorage.removeItem(this.storageKeys.gameProgress);
      results.gameProgress = true;
    } catch (e) {
      console.error('Failed to clear game progress:', e);
    }
    
    try {
      localStorage.removeItem(this.storageKeys.settings);
      results.settings = true;
    } catch (e) {
      console.error('Failed to clear settings:', e);
    }
    
    try {
      localStorage.removeItem(this.storageKeys.spriteEditor);
      results.spriteEditor = true;
    } catch (e) {
      console.error('Failed to clear sprite editor data:', e);
    }
    
    // Reset to defaults
    this.reset();
    
    this.notify('stateCleared', results);
    return results;
  }

  /**
   * Check localStorage availability and quota
   */
  checkStorageHealth() {
    const health = {
      available: false,
      quota: null,
      usage: null,
      hasData: false,
      canWrite: false
    };
    
    try {
      // Check if localStorage is available
      const testKey = '_storage_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      health.available = true;
      health.canWrite = true;
      
      // Check if we have existing data
      health.hasData = !!(
        localStorage.getItem(this.storageKeys.gameProgress) ||
        localStorage.getItem(this.storageKeys.settings) ||
        localStorage.getItem(this.storageKeys.spriteEditor)
      );
      
      // Estimate storage usage
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(estimate => {
          health.quota = estimate.quota;
          health.usage = estimate.usage;
        });
      }
      
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    
    return health;
  }

  // ===== EVENT SYSTEM =====

  /**
   * Subscribe to state changes
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    
    this.subscribers.get(event).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(event, callback) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify subscribers of state changes
   */
  notify(event, data) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      // Create a copy to avoid issues if callbacks modify the subscriber list
      const callbacksCopy = [...callbacks];
      callbacksCopy.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in state change callback for ${event}:`, e);
        }
      });
    }
  }

  // ===== GAME-SPECIFIC HELPER METHODS =====

  /**
   * Game progress helpers
   */
  nextLevel() {
    const currentLevel = this.get('game.currentLevel');
    const maxLevel = this.get('game.maxLevel');
    
    if (currentLevel < maxLevel) {
      this.set('game.currentLevel', currentLevel + 1);
      this.markLevelCompleted(currentLevel);
      this.resetLevel();
      return true;
    }
    return false;
  }

  previousLevel() {
    const currentLevel = this.get('game.currentLevel');
    if (currentLevel > 1) {
      this.set('game.currentLevel', currentLevel - 1);
      this.resetLevel();
      return true;
    }
    return false;
  }

  markLevelCompleted(level) {
    const levelsCompleted = [...this.get('game.levelsCompleted')];
    if (level >= 1 && level <= levelsCompleted.length) {
      levelsCompleted[level - 1] = true;
      this.set('game.levelsCompleted', levelsCompleted);
    }
  }

  addScore(points) {
    const currentScore = this.get('game.score');
    const newScore = currentScore + points;
    this.set('game.score', newScore);
    
    const highScore = this.get('game.highScore');
    if (newScore > highScore) {
      this.set('game.highScore', newScore);
    }
  }

  collectCoin() {
    this.set('game.coins', this.get('game.coins') + 1);
    this.set('runtime.level.coinsCollected', this.get('runtime.level.coinsCollected') + 1);
    this.addScore(10);
    
    // Extra life every 100 coins
    if (this.get('game.coins') % 100 === 0) {
      this.set('game.lives', this.get('game.lives') + 1);
    }
  }

  loseLife() {
    const lives = this.get('game.lives');
    this.set('game.lives', lives - 1);
    
    if (lives - 1 <= 0) {
      this.set('runtime.isGameOver', true);
    } else {
      this.resetLevel();
    }
  }

  resetLevel() {
    // Reset player position
    const checkpoint = this.get('runtime.level.checkpointReached');
    this.set('runtime.player.x', checkpoint ? this.get('runtime.level.checkpointX') : 50);
    this.set('runtime.player.y', checkpoint ? this.get('runtime.level.checkpointY') : 200);
    
    // Reset player state
    this.setState({
      'runtime.player.vx': 0,
      'runtime.player.vy': 0,
      'runtime.player.isGrounded': false,
      'runtime.player.isJumping': false,
      'runtime.player.isDucking': false,
      'runtime.player.invulnerable': true,
      'runtime.player.invulnerableTime': 2000
    });
    
    // Reset camera
    this.setState({
      'runtime.camera.x': 0,
      'runtime.camera.y': 0
    });
    
    // Reset level stats if not at checkpoint
    if (!checkpoint) {
      this.setState({
        'runtime.level.startTime': Date.now(),
        'runtime.level.enemiesDefeated': 0,
        'runtime.level.coinsCollected': 0
      });
    }
  }

  // ===== SETTINGS HELPERS =====

  getSetting(key) {
    return this.get(`settings.${key}`);
  }

  setSetting(key, value) {
    return this.set(`settings.${key}`, value);
  }

  getSettings() {
    return this.get('settings');
  }

  updateSettings(settings) {
    const updates = {};
    for (const [key, value] of Object.entries(settings)) {
      updates[`settings.${key}`] = value;
    }
    return this.setState(updates);
  }
}

// ===== SINGLETON INSTANCE =====

let instance = null;

/**
 * Get singleton StateManager instance
 */
export function getStateManager() {
  console.log('🔍 BMaD Trace: getStateManager called, instance exists?', !!instance);
  if (!instance) {
    console.log('🏗️ BMaD Trace: Creating new StateManager instance');
    try {
      instance = new StateManager();
      console.log('✅ BMaD Trace: StateManager created successfully');
    } catch (error) {
      console.error('❌ BMaD Trace: StateManager creation failed:', error);
      return null;
    }
  }
  console.log('✅ BMaD Trace: Returning StateManager instance');
  return instance;
}

/**
 * Reset StateManager singleton (for testing)
 */
export function resetStateManager() {
  if (instance) {
    instance.clear();
  }
  instance = null;
  return getStateManager();
}

export default StateManager;