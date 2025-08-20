/**
 * Visual Baseline Capture System
 * Captures screenshots of all game states for regression testing
 */

class VisualBaselineCapture {
  constructor() {
    this.snapshots = {};
    this.canvas = null;
    this.ctx = null;
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.canvas || !this.ctx) {
      throw new Error('Game canvas not found');
    }
  }

  /**
   * Capture all important visual states
   */
  async captureAllStates() {
    console.log('📸 Capturing visual baselines...');
    
    this.init();
    
    const states = [
      // Player states
      { name: 'player_idle_sit', setup: () => this.setupPlayerState('idle_sit') },
      { name: 'player_run_1', setup: () => this.setupPlayerRun(0) },
      { name: 'player_run_2', setup: () => this.setupPlayerRun(1) },
      { name: 'player_run_3', setup: () => this.setupPlayerRun(2) },
      { name: 'player_jump_up', setup: () => this.setupPlayerState('jump_up') },
      { name: 'player_fall_down', setup: () => this.setupPlayerState('fall_down') },
      { name: 'player_crouch', setup: () => this.setupPlayerState('crouch') },
      { name: 'player_dodge_roll', setup: () => this.setupPlayerState('dodge_roll') },
      
      // Level states
      { name: 'level_1_start', setup: () => this.setupLevel(1, 'start') },
      { name: 'level_1_platforms', setup: () => this.setupLevel(1, 'platforms') },
      { name: 'level_2_start', setup: () => this.setupLevel(2, 'start') },
      { name: 'level_2_mice', setup: () => this.setupLevel(2, 'mice') },
      { name: 'level_3_start', setup: () => this.setupLevel(3, 'start') },
      { name: 'level_3_pits', setup: () => this.setupLevel(3, 'pits') },
      { name: 'level_4_dog', setup: () => this.setupLevel(4, 'dog') },
      { name: 'level_5_victory', setup: () => this.setupLevel(5, 'victory') },
      
      // UI states
      { name: 'sprite_editor_closed', setup: () => this.setupUI('editor_closed') },
      { name: 'sprite_editor_open', setup: () => this.setupUI('editor_open') },
      { name: 'mobile_controls_visible', setup: () => this.setupUI('mobile_controls') },
      { name: 'settings_panel_open', setup: () => this.setupUI('settings_panel') },
      { name: 'win_overlay_visible', setup: () => this.setupUI('win_overlay') },
      
      // Entity states
      { name: 'fireball_active', setup: () => this.setupEntities('fireball') },
      { name: 'dog_chasing', setup: () => this.setupEntities('dog_chase') },
      { name: 'mice_scattered', setup: () => this.setupEntities('mice') },
      { name: 'particles_active', setup: () => this.setupEntities('particles') }
    ];

    for (const state of states) {
      await this.captureState(state);
    }

    this.saveAllSnapshots();
    console.log('✅ Visual baselines captured successfully');
    return this.snapshots;
  }

  async captureState(state) {
    try {
      console.log(`📷 Capturing: ${state.name}`);
      
      // Setup the specific state
      await state.setup();
      
      // Wait for render
      await this.waitForRender();
      
      // Capture canvas
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const dataURL = this.canvas.toDataURL('image/png');
      
      const snapshot = {
        name: state.name,
        timestamp: Date.now(),
        width: this.canvas.width,
        height: this.canvas.height,
        dataURL: dataURL,
        hash: this.calculateHash(imageData),
        metadata: {
          gameState: this.captureGameState(),
          canvasStyle: this.getCanvasStyle()
        }
      };
      
      this.snapshots[state.name] = snapshot;
      
    } catch (error) {
      console.error(`Failed to capture ${state.name}:`, error);
    }
  }

  async setupPlayerState(stateName) {
    if (!game || !game.player) return;
    
    // Position player in center
    game.player.x = 400;
    game.player.y = 300;
    game.player.vx = 0;
    game.player.vy = 0;
    game.player.state = stateName;
    game.player.grounded = stateName !== 'jump_up' && stateName !== 'fall_down';
    
    // Set animation frame for run states
    if (stateName.includes('run')) {
      game.player.animFrame = 0;
    }
    
    // Clear other entities
    if (game.fireballs) game.fireballs.length = 0;
    if (game.mice) game.mice.length = 0;
    if (game.particles) game.particles.length = 0;
  }

  async setupPlayerRun(frameIndex) {
    await this.setupPlayerState('run');
    if (game && game.player) {
      game.player.animFrame = frameIndex;
      game.player.vx = physics.moveSpeed;
    }
  }

  async setupLevel(levelNum, section) {
    if (!game) return;
    
    // Load specific level
    game.currentLevel = levelNum;
    game.level = game.createLevel();
    game.initLevel();
    
    // Position player based on section
    switch (section) {
      case 'start':
        game.player.x = 100;
        game.player.y = 300;
        break;
      case 'platforms':
        game.player.x = 300;
        game.player.y = 200;
        break;
      case 'mice':
        // Show mice in level 2
        if (levelNum === 2 && game.mice) {
          game.mice.forEach((mouse, i) => {
            mouse.x = 200 + i * 100;
            mouse.y = 350;
            mouse.caught = false;
          });
        }
        break;
      case 'pits':
        // Position near pits in level 3
        game.player.x = 300;
        game.player.y = 350;
        break;
      case 'dog':
        // Show dog in level 4
        if (levelNum === 4 && game.dog) {
          game.dog.x = 500;
          game.dog.y = 350;
          game.dog.active = true;
        }
        break;
      case 'victory':
        // Victory state in level 5
        if (levelNum === 5) {
          game.player.x = 400;
          game.player.y = 350;
          // Show food/water bowls
        }
        break;
    }
  }

  async setupUI(uiState) {
    switch (uiState) {
      case 'editor_closed':
        // Ensure editor is hidden
        document.getElementById('leftPanel').classList.add('hidden');
        break;
      case 'editor_open':
        // Show editor
        document.getElementById('leftPanel').classList.remove('hidden');
        switchTab('editor');
        break;
      case 'mobile_controls':
        // Show mobile controls
        document.getElementById('mobileControls').style.display = 'block';
        break;
      case 'settings_panel':
        // Show settings panel
        document.getElementById('leftPanel').classList.remove('hidden');
        switchTab('play');
        break;
      case 'win_overlay':
        // Show win overlay
        document.getElementById('winOverlay').style.display = 'block';
        break;
    }
  }

  async setupEntities(entityType) {
    if (!game) return;
    
    switch (entityType) {
      case 'fireball':
        // Add fireballs for level 1
        if (game.fireballs) {
          game.fireballs.push({
            x: 300, y: 200, vx: 50, vy: 0,
            width: 12, height: 12
          });
        }
        break;
      case 'dog_chase':
        // Dog in chase mode
        if (game.dog) {
          game.dog.x = 350;
          game.dog.y = 350;
          game.dog.active = true;
          game.dog.chasing = true;
        }
        break;
      case 'mice':
        // Multiple mice active
        if (game.mice) {
          game.mice.forEach((mouse, i) => {
            mouse.x = 150 + i * 80;
            mouse.y = 350;
            mouse.caught = false;
            mouse.direction = i % 2 === 0 ? 1 : -1;
          });
        }
        break;
      case 'particles':
        // Create particle effects
        if (game.createParticles) {
          game.createParticles(400, 300, 10);
        }
        break;
    }
  }

  captureGameState() {
    if (!game) return null;
    
    return {
      level: game.currentLevel,
      score: game.score,
      lives: game.lives,
      playerState: game.player ? {
        x: game.player.x,
        y: game.player.y,
        state: game.player.state,
        facing: game.player.facing
      } : null,
      entityCounts: {
        fireballs: game.fireballs ? game.fireballs.length : 0,
        mice: game.mice ? game.mice.filter(m => !m.caught).length : 0,
        particles: game.particles ? game.particles.length : 0
      }
    };
  }

  getCanvasStyle() {
    return {
      width: this.canvas.style.width,
      height: this.canvas.style.height,
      imageRendering: this.canvas.style.imageRendering,
      transform: this.canvas.style.transform
    };
  }

  calculateHash(imageData) {
    let hash = 0;
    const data = imageData.data;
    
    // Sample every 100th pixel for performance
    for (let i = 0; i < data.length; i += 400) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  async waitForRender() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }

  saveAllSnapshots() {
    const baselineData = {
      version: '1.0.0',
      recordedAt: new Date().toISOString(),
      gameVersion: 'monolithic',
      snapshots: this.snapshots,
      summary: {
        totalSnapshots: Object.keys(this.snapshots).length,
        canvasSize: {
          width: this.canvas.width,
          height: this.canvas.height
        }
      }
    };

    // Save to localStorage
    localStorage.setItem('visual_baseline', JSON.stringify(baselineData));
    
    // Create downloadable archive
    this.downloadSnapshots(baselineData);

    console.log('💾 Visual baseline saved to localStorage and downloaded');
  }

  downloadSnapshots(baselineData) {
    // Create a simplified version for download (without image data)
    const downloadData = {
      ...baselineData,
      snapshots: Object.fromEntries(
        Object.entries(baselineData.snapshots).map(([key, snapshot]) => [
          key,
          {
            name: snapshot.name,
            timestamp: snapshot.timestamp,
            hash: snapshot.hash,
            metadata: snapshot.metadata
          }
        ])
      )
    };

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual_baseline_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Compare function for future validation
  compareSnapshot(currentSnapshot, baselineName, threshold = 0.01) {
    const baseline = this.snapshots[baselineName];
    if (!baseline) {
      throw new Error(`No baseline snapshot found for ${baselineName}`);
    }

    // Simple hash comparison
    const hashMatch = currentSnapshot.hash === baseline.hash;
    
    return {
      match: hashMatch,
      hashMatch: hashMatch,
      baseline: baseline.hash,
      current: currentSnapshot.hash,
      threshold: threshold
    };
  }
}

// Export for use
window.VisualBaselineCapture = VisualBaselineCapture;

// Auto-start if game is ready
if (typeof game !== 'undefined' && document.getElementById('gameCanvas')) {
  console.log('📸 READY TO CAPTURE VISUAL BASELINE');
  console.log('Run: new VisualBaselineCapture().captureAllStates()');
} else {
  console.log('⏳ Waiting for game canvas...');
}