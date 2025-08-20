/**
 * Physics Baseline Recording System
 * CRITICAL: Run this BEFORE any code changes to capture exact behavior
 */

class PhysicsBaselineRecorder {
  constructor() {
    this.recordings = {};
    this.isRecording = false;
    this.currentScenario = null;
    this.frameData = [];
    this.startTime = 0;
  }

  /**
   * Record physics scenarios to establish baseline
   */
  async recordAllScenarios() {
    console.log('🔴 CRITICAL: Recording physics baselines...');
    
    const scenarios = [
      {
        name: 'jump_arc',
        description: 'Basic jump physics',
        setup: () => {
          game.player.x = 100;
          game.player.y = 300;
          game.player.vx = 0;
          game.player.vy = 0;
          game.player.grounded = true;
        },
        actions: [
          { frame: 0, action: 'jump' },
          { frame: 60, action: 'release_jump' }
        ],
        duration: 120
      },
      {
        name: 'coyote_time',
        description: 'Coyote time window test',
        setup: () => {
          game.player.x = 200;
          game.player.y = 200;
          game.player.grounded = true;
        },
        actions: [
          { frame: 0, action: 'move_right' },
          { frame: 30, action: 'fall_off_platform' },
          { frame: 35, action: 'jump' } // Within 80ms window
        ],
        duration: 90
      },
      {
        name: 'acceleration',
        description: 'Movement acceleration curve',
        setup: () => {
          game.player.x = 100;
          game.player.y = 300;
          game.player.vx = 0;
          game.player.grounded = true;
        },
        actions: [
          { frame: 0, action: 'move_right' },
          { frame: 60, action: 'stop' },
          { frame: 90, action: 'move_left' }
        ],
        duration: 150
      },
      {
        name: 'platform_collision',
        description: 'Platform collision response',
        setup: () => {
          game.player.x = 150;
          game.player.y = 100;
          game.player.vy = 50; // Falling
        },
        actions: [
          { frame: 0, action: 'fall' },
          { frame: 30, action: 'hit_platform' }
        ],
        duration: 60
      },
      {
        name: 'dodge_roll',
        description: 'Dodge roll physics',
        setup: () => {
          game.player.x = 200;
          game.player.y = 300;
          game.player.grounded = true;
        },
        actions: [
          { frame: 0, action: 'dodge' }
        ],
        duration: 60
      }
    ];

    for (const scenario of scenarios) {
      await this.recordScenario(scenario);
    }

    this.saveAllBaselines();
    console.log('✅ Physics baselines recorded successfully');
    return this.recordings;
  }

  async recordScenario(scenario) {
    console.log(`📹 Recording: ${scenario.name} - ${scenario.description}`);
    
    this.currentScenario = scenario.name;
    this.frameData = [];
    this.isRecording = true;
    
    // Setup scenario
    scenario.setup();
    
    // Wait for setup to stabilize
    await this.wait(100);
    
    this.startTime = performance.now();
    
    // Record frames
    for (let frame = 0; frame < scenario.duration; frame++) {
      // Execute scenario actions
      this.executeActions(scenario.actions, frame);
      
      // Record frame data
      this.recordFrame(frame);
      
      // Update game
      if (game && game.update) {
        game.update(16.67); // 60 FPS
      }
      
      // Wait for next frame
      await this.wait(16.67);
    }
    
    this.isRecording = false;
    
    // Save recording
    this.recordings[scenario.name] = {
      frames: [...this.frameData],
      metadata: {
        scenario: scenario.name,
        description: scenario.description,
        date: new Date().toISOString(),
        duration: scenario.duration,
        physics: this.capturePhysicsConfig()
      }
    };
  }

  executeActions(actions, currentFrame) {
    const action = actions.find(a => a.frame === currentFrame);
    if (!action) return;

    switch (action.action) {
      case 'jump':
        if (game && game.player) {
          game.player.vy = -physics.jumpForce;
        }
        break;
      case 'move_right':
        if (game && game.player) {
          game.player.vx = physics.moveSpeed;
        }
        break;
      case 'move_left':
        if (game && game.player) {
          game.player.vx = -physics.moveSpeed;
        }
        break;
      case 'stop':
        if (game && game.player) {
          game.player.vx = 0;
        }
        break;
      case 'dodge':
        if (game && game.player && game.player.dodge) {
          game.player.dodge();
        }
        break;
    }
  }

  recordFrame(frameNumber) {
    if (!game || !game.player) return;

    const frameData = {
      frame: frameNumber,
      timestamp: performance.now() - this.startTime,
      position: {
        x: Math.round(game.player.x * 100) / 100,
        y: Math.round(game.player.y * 100) / 100
      },
      velocity: {
        vx: Math.round(game.player.vx * 100) / 100,
        vy: Math.round(game.player.vy * 100) / 100
      },
      state: {
        grounded: game.player.grounded,
        state: game.player.state,
        facing: game.player.facing,
        dodging: game.player.dodging || false
      },
      physics: {
        gravity: physics.gravity,
        jumpForce: physics.jumpForce,
        moveSpeed: physics.moveSpeed,
        friction: physics.friction
      }
    };

    this.frameData.push(frameData);
  }

  capturePhysicsConfig() {
    return {
      gravity: physics.gravity,
      jumpForce: physics.jumpForce,
      moveSpeed: physics.moveSpeed,
      friction: physics.friction,
      coyoteTime: physics.coyoteTime,
      jumpBuffer: physics.jumpBuffer
    };
  }

  saveAllBaselines() {
    const baselineData = {
      version: '1.0.0',
      recordedAt: new Date().toISOString(),
      gameVersion: 'monolithic',
      recordings: this.recordings,
      summary: {
        totalScenarios: Object.keys(this.recordings).length,
        totalFrames: Object.values(this.recordings).reduce((sum, r) => sum + r.frames.length, 0)
      }
    };

    // Save to localStorage
    localStorage.setItem('physics_baseline', JSON.stringify(baselineData));
    
    // Also create downloadable file
    const blob = new Blob([JSON.stringify(baselineData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics_baseline_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('💾 Baseline saved to localStorage and downloaded');
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Compare function for future validation
  compareBaseline(currentRecording, baselineName, tolerance = 1) {
    const baseline = this.recordings[baselineName];
    if (!baseline) {
      throw new Error(`No baseline found for ${baselineName}`);
    }

    const differences = [];
    const maxFrames = Math.min(currentRecording.length, baseline.frames.length);

    for (let i = 0; i < maxFrames; i++) {
      const current = currentRecording[i];
      const base = baseline.frames[i];

      const positionDiff = {
        x: Math.abs(current.position.x - base.position.x),
        y: Math.abs(current.position.y - base.position.y)
      };

      const velocityDiff = {
        vx: Math.abs(current.velocity.vx - base.velocity.vx),
        vy: Math.abs(current.velocity.vy - base.velocity.vy)
      };

      if (positionDiff.x > tolerance || positionDiff.y > tolerance ||
          velocityDiff.vx > tolerance || velocityDiff.vy > tolerance) {
        differences.push({
          frame: i,
          positionDiff,
          velocityDiff,
          current: current,
          baseline: base
        });
      }
    }

    return {
      match: differences.length === 0,
      differences: differences,
      tolerance: tolerance,
      comparison: `${differences.length}/${maxFrames} frames differ`
    };
  }
}

// Export for use
window.PhysicsBaselineRecorder = PhysicsBaselineRecorder;

// Auto-start recording if game is ready
if (typeof game !== 'undefined' && game.player) {
  console.log('🔴 READY TO RECORD PHYSICS BASELINE');
  console.log('Run: new PhysicsBaselineRecorder().recordAllScenarios()');
} else {
  console.log('⏳ Waiting for game to load...');
}