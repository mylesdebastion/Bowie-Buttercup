/**
 * Game State Manager
 *
 * Manages global game state including level progression,
 * player stats, and game configuration.
 */

export class GameState {
  constructor(initialState = {}) {
    // Core game state
    this.currentLevel = initialState.currentLevel || 1;
    this.maxLevel = initialState.maxLevel || 5;
    this.lives = initialState.lives || 3;
    this.score = initialState.score || 0;
    this.highScore = initialState.highScore || 0;
    this.coins = initialState.coins || 0;

    // Game flags
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.isTransitioning = false;

    // Player state
    this.playerState = {
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
    };

    // Level state
    this.levelState = {
      startTime: 0,
      elapsedTime: 0,
      enemiesDefeated: 0,
      coinsCollected: 0,
      checkpointReached: false,
      checkpointX: 50,
      checkpointY: 200
    };

    // Camera state
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      smoothing: 0.1
    };

    // Configuration
    this.config = {
      gravity: initialState.gravity || 700,
      jumpPower: initialState.jumpPower || 350,
      moveSpeed: initialState.moveSpeed || 200,
      maxFallSpeed: initialState.maxFallSpeed || 500,
      coyoteTime: initialState.coyoteTime || 150,
      acceleration: initialState.acceleration || 1200,
      friction: initialState.friction || 800
    };

    // Subscribers for state changes
    this.subscribers = new Map();

    // Load saved state if available
    this.loadState();
  }

  // State management
  reset() {
    this.currentLevel = 1;
    this.lives = 3;
    this.score = 0;
    this.coins = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.resetLevel();
  }

  resetLevel() {
    this.playerState.x = this.levelState.checkpointReached
      ? this.levelState.checkpointX
      : 50;
    this.playerState.y = this.levelState.checkpointReached
      ? this.levelState.checkpointY
      : 200;
    this.playerState.vx = 0;
    this.playerState.vy = 0;
    this.playerState.isGrounded = false;
    this.playerState.isJumping = false;
    this.playerState.isDucking = false;
    this.playerState.invulnerable = true;
    this.playerState.invulnerableTime = 2000;

    if (!this.levelState.checkpointReached) {
      this.levelState.startTime = Date.now();
      this.levelState.enemiesDefeated = 0;
      this.levelState.coinsCollected = 0;
    }

    this.camera.x = 0;
    this.camera.y = 0;

    this.notify('levelReset');
  }

  nextLevel() {
    if (this.currentLevel < this.maxLevel) {
      this.currentLevel++;
      this.levelState = {
        startTime: Date.now(),
        elapsedTime: 0,
        enemiesDefeated: 0,
        coinsCollected: 0,
        checkpointReached: false,
        checkpointX: 50,
        checkpointY: 200
      };
      this.resetLevel();
      this.notify('levelChanged', this.currentLevel);
      return true;
    }
    return false;
  }

  previousLevel() {
    if (this.currentLevel > 1) {
      this.currentLevel--;
      this.levelState = {
        startTime: Date.now(),
        elapsedTime: 0,
        enemiesDefeated: 0,
        coinsCollected: 0,
        checkpointReached: false,
        checkpointX: 50,
        checkpointY: 200
      };
      this.resetLevel();
      this.notify('levelChanged', this.currentLevel);
      return true;
    }
    return false;
  }

  // Player actions
  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.resetLevel();
    }
    this.notify('livesChanged', this.lives);
  }

  addLife() {
    this.lives++;
    this.notify('livesChanged', this.lives);
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.notify('highScoreChanged', this.highScore);
    }
    this.notify('scoreChanged', this.score);
  }

  collectCoin() {
    this.coins++;
    this.levelState.coinsCollected++;
    this.addScore(10);
    this.notify('coinsChanged', this.coins);

    // Extra life every 100 coins
    if (this.coins % 100 === 0) {
      this.addLife();
    }
  }

  defeatEnemy() {
    this.levelState.enemiesDefeated++;
    this.addScore(50);
    this.notify('enemyDefeated', this.levelState.enemiesDefeated);
  }

  reachCheckpoint(x, y) {
    if (!this.levelState.checkpointReached) {
      this.levelState.checkpointReached = true;
      this.levelState.checkpointX = x;
      this.levelState.checkpointY = y;
      this.notify('checkpointReached', { x, y });
    }
  }

  // Game state changes
  pause() {
    this.isPaused = true;
    this.notify('gamePaused');
  }

  resume() {
    this.isPaused = false;
    this.notify('gameResumed');
  }

  gameOver() {
    this.isGameOver = true;
    this.saveState();
    this.notify('gameOver');
  }

  victory() {
    this.isVictory = true;
    this.saveState();
    this.notify('victory');
  }

  // State persistence
  saveState() {
    const saveData = {
      highScore: this.highScore,
      currentLevel: this.currentLevel,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('catPlatformerSave', JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  loadState() {
    try {
      const saveData = localStorage.getItem('catPlatformerSave');
      if (saveData) {
        const data = JSON.parse(saveData);
        this.highScore = data.highScore || 0;
        return true;
      }
    } catch (e) {
      console.error('Failed to load game state:', e);
    }
    return false;
  }

  clearSave() {
    try {
      localStorage.removeItem('catPlatformerSave');
      return true;
    } catch (e) {
      console.error('Failed to clear save:', e);
      return false;
    }
  }

  // Event system
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notify(event, data) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Getters for readonly access
  getPlayerPosition() {
    return {
      x: this.playerState.x,
      y: this.playerState.y
    };
  }

  getCameraPosition() {
    return {
      x: this.camera.x,
      y: this.camera.y
    };
  }

  getLevelTime() {
    return Date.now() - this.levelState.startTime;
  }

  getState() {
    return {
      level: this.currentLevel,
      lives: this.lives,
      score: this.score,
      coins: this.coins,
      highScore: this.highScore,
      isPaused: this.isPaused,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory
    };
  }
}

// Singleton instance
let instance = null;

export function getGameState() {
  if (!instance) {
    instance = new GameState();
  }
  return instance;
}

export function resetGameState() {
  instance = null;
  return getGameState();
}

export default GameState;
