# Test Design Strategy: Baseline Capture & Test Architecture

**Project**: Cat Platformer Modularization  
**Date**: 2025-01-18  
**Assessor**: Quinn (QA Test Architect)  
**Type**: Test Design & Implementation Strategy

## Executive Summary

Comprehensive test design for capturing critical baselines BEFORE modularization and establishing robust test architecture to ensure zero regression during refactoring.

## Phase 1: Baseline Capture Implementation

### 1.1 Physics Baseline Recording System

```javascript
// baseline-recorder.js
class PhysicsBaselineRecorder {
  constructor(game) {
    this.game = game;
    this.recordings = {
      jump: [],
      movement: [],
      collision: [],
      gravity: [],
      friction: []
    };
    this.frameData = [];
  }

  startRecording(scenario) {
    this.currentScenario = scenario;
    this.frameData = [];
    this.startTime = performance.now();
    this.recordFrame();
  }

  recordFrame() {
    const player = this.game.player;
    const frame = {
      timestamp: performance.now() - this.startTime,
      frame: this.game.frameCount,
      position: { x: player.x, y: player.y },
      velocity: { vx: player.vx, vy: player.vy },
      acceleration: { ax: player.ax, ay: player.ay },
      state: player.state,
      grounded: player.grounded,
      input: this.captureInput(),
      collisions: this.captureCollisions()
    };
    
    this.frameData.push(frame);
    
    if (this.isScenarioComplete()) {
      this.saveRecording();
    } else {
      requestAnimationFrame(() => this.recordFrame());
    }
  }

  captureInput() {
    return {
      left: keys['ArrowLeft'] || keys['a'],
      right: keys['ArrowRight'] || keys['d'],
      jump: keys[' '] || keys['w'],
      crouch: keys['s'],
      dodge: keys['Shift']
    };
  }

  saveRecording() {
    this.recordings[this.currentScenario] = {
      frames: this.frameData,
      metadata: {
        date: new Date().toISOString(),
        version: '1.0.0',
        fps: this.game.fps,
        physics: {
          gravity: physics.gravity,
          jumpForce: physics.jumpForce,
          moveSpeed: physics.moveSpeed,
          friction: physics.friction,
          coyoteTime: physics.coyoteTime,
          jumpBuffer: physics.jumpBuffer
        }
      }
    };
    
    // Save to localStorage or export as JSON
    localStorage.setItem(
      `baseline_${this.currentScenario}`,
      JSON.stringify(this.recordings[this.currentScenario])
    );
  }
}

// Test Scenarios to Record
const PHYSICS_SCENARIOS = [
  {
    name: 'jump_arc',
    setup: () => { player.x = 100; player.y = 300; },
    actions: [
      { frame: 0, action: 'jump' },
      { frame: 60, action: 'release_jump' }
    ],
    duration: 120 // frames
  },
  {
    name: 'double_jump_coyote',
    setup: () => { player.x = 100; player.y = 200; },
    actions: [
      { frame: 0, action: 'move_right' },
      { frame: 30, action: 'fall_off_platform' },
      { frame: 35, action: 'jump' } // Within coyote time
    ],
    duration: 90
  },
  {
    name: 'acceleration_curve',
    setup: () => { player.x = 100; player.y = 300; },
    actions: [
      { frame: 0, action: 'move_right' },
      { frame: 60, action: 'stop' },
      { frame: 90, action: 'move_left' }
    ],
    duration: 150
  },
  {
    name: 'collision_response',
    setup: () => { 
      player.x = 100; 
      player.y = 100;
      // Position near platform
    },
    actions: [
      { frame: 0, action: 'move_right' },
      { frame: 30, action: 'jump' },
      { frame: 60, action: 'collide_platform' }
    ],
    duration: 120
  },
  {
    name: 'dodge_physics',
    setup: () => { player.x = 200; player.y = 300; },
    actions: [
      { frame: 0, action: 'dodge' }
    ],
    duration: 60
  }
];
```

### 1.2 Visual State Capture System

```javascript
// visual-baseline-capture.js
class VisualBaselineCapture {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.snapshots = {};
  }

  async captureAllStates() {
    const states = [
      // Player states
      { name: 'player_idle', setup: this.setupPlayerIdle },
      { name: 'player_run_1', setup: this.setupPlayerRun1 },
      { name: 'player_run_2', setup: this.setupPlayerRun2 },
      { name: 'player_run_3', setup: this.setupPlayerRun3 },
      { name: 'player_jump', setup: this.setupPlayerJump },
      { name: 'player_fall', setup: this.setupPlayerFall },
      { name: 'player_crouch', setup: this.setupPlayerCrouch },
      { name: 'player_dodge', setup: this.setupPlayerDodge },
      
      // Level states
      { name: 'level_1_start', setup: this.setupLevel1Start },
      { name: 'level_1_mid', setup: this.setupLevel1Mid },
      { name: 'level_1_end', setup: this.setupLevel1End },
      // ... all 5 levels
      
      // UI states
      { name: 'sprite_editor_open', setup: this.setupSpriteEditor },
      { name: 'settings_panel', setup: this.setupSettingsPanel },
      { name: 'mobile_controls', setup: this.setupMobileControls },
      { name: 'win_overlay', setup: this.setupWinOverlay }
    ];

    for (const state of states) {
      await this.captureState(state);
    }

    return this.snapshots;
  }

  async captureState(state) {
    // Setup the game state
    state.setup();
    
    // Wait for render
    await this.waitForRender();
    
    // Capture canvas
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const snapshot = {
      name: state.name,
      timestamp: Date.now(),
      imageData: imageData,
      dataURL: this.canvas.toDataURL('image/png'),
      hash: this.calculateHash(imageData)
    };
    
    this.snapshots[state.name] = snapshot;
    
    // Save to storage
    await this.saveSnapshot(snapshot);
  }

  calculateHash(imageData) {
    // Simple hash for change detection
    let hash = 0;
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 100) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    return hash;
  }

  async saveSnapshot(snapshot) {
    // For large images, use IndexedDB
    const db = await this.openDB();
    const tx = db.transaction(['snapshots'], 'readwrite');
    await tx.objectStore('snapshots').put(snapshot);
  }

  async compareSnapshot(currentImageData, baselineName) {
    const baseline = this.snapshots[baselineName];
    if (!baseline) throw new Error(`No baseline for ${baselineName}`);
    
    const diff = this.pixelDiff(currentImageData, baseline.imageData);
    return {
      match: diff.percentage < 0.01, // 1% threshold
      difference: diff
    };
  }

  pixelDiff(imageA, imageB) {
    let diffCount = 0;
    const dataA = imageA.data;
    const dataB = imageB.data;
    
    for (let i = 0; i < dataA.length; i += 4) {
      const rDiff = Math.abs(dataA[i] - dataB[i]);
      const gDiff = Math.abs(dataA[i+1] - dataB[i+1]);
      const bDiff = Math.abs(dataA[i+2] - dataB[i+2]);
      
      if (rDiff > 5 || gDiff > 5 || bDiff > 5) {
        diffCount++;
      }
    }
    
    return {
      pixels: diffCount,
      percentage: (diffCount / (dataA.length / 4)) * 100
    };
  }
}
```

### 1.3 State Mutation Tracking System

```javascript
// state-mutation-tracker.js
class StateMutationTracker {
  constructor() {
    this.mutations = [];
    this.stateSnapshots = [];
    this.recording = false;
  }

  startTracking() {
    this.recording = true;
    this.mutations = [];
    this.initialState = this.captureState();
    
    // Proxy all game objects
    this.proxifyGameObjects();
  }

  proxifyGameObjects() {
    // Proxy player object
    game.player = new Proxy(game.player, {
      set: (target, property, value) => {
        if (this.recording) {
          this.recordMutation('player', property, target[property], value);
        }
        target[property] = value;
        return true;
      }
    });

    // Proxy game state
    game = new Proxy(game, {
      set: (target, property, value) => {
        if (this.recording) {
          this.recordMutation('game', property, target[property], value);
        }
        target[property] = value;
        return true;
      }
    });

    // Proxy physics config
    physics = new Proxy(physics, {
      set: (target, property, value) => {
        if (this.recording) {
          this.recordMutation('physics', property, target[property], value);
        }
        target[property] = value;
        return true;
      }
    });
  }

  recordMutation(object, property, oldValue, newValue) {
    const mutation = {
      timestamp: performance.now(),
      frame: game.frameCount,
      object: object,
      property: property,
      oldValue: this.cloneValue(oldValue),
      newValue: this.cloneValue(newValue),
      stack: this.getCallStack()
    };
    
    this.mutations.push(mutation);
    
    // Trigger snapshot if significant change
    if (this.isSignificantMutation(mutation)) {
      this.takeSnapshot();
    }
  }

  isSignificantMutation(mutation) {
    const significantProps = [
      'state', 'level', 'score', 'lives',
      'x', 'y', 'vx', 'vy', 'grounded'
    ];
    return significantProps.includes(mutation.property);
  }

  takeSnapshot() {
    this.stateSnapshots.push({
      timestamp: performance.now(),
      frame: game.frameCount,
      state: this.captureState()
    });
  }

  captureState() {
    return {
      player: {
        x: game.player.x,
        y: game.player.y,
        vx: game.player.vx,
        vy: game.player.vy,
        state: game.player.state,
        facing: game.player.facing,
        grounded: game.player.grounded,
        lives: game.player.lives
      },
      game: {
        score: game.score,
        level: game.currentLevel,
        fps: game.fps,
        frameCount: game.frameCount,
        paused: game.paused
      },
      entities: game.entities.map(e => ({
        type: e.constructor.name,
        x: e.x,
        y: e.y,
        active: e.active
      }))
    };
  }

  exportLog() {
    return {
      initialState: this.initialState,
      mutations: this.mutations,
      snapshots: this.stateSnapshots,
      summary: this.generateSummary()
    };
  }

  generateSummary() {
    const mutationCounts = {};
    this.mutations.forEach(m => {
      const key = `${m.object}.${m.property}`;
      mutationCounts[key] = (mutationCounts[key] || 0) + 1;
    });
    
    return {
      totalMutations: this.mutations.length,
      totalSnapshots: this.stateSnapshots.length,
      duration: this.mutations[this.mutations.length - 1]?.timestamp || 0,
      mutationFrequency: mutationCounts
    };
  }
}
```

## Phase 2: Test Architecture Implementation

### 2.1 Test Pyramid Structure

```javascript
// test-architecture.config.js
module.exports = {
  testPyramid: {
    unit: {
      percentage: 70,
      frameworks: ['jest'],
      coverage: 80,
      files: [
        'src/**/*.test.js',
        'src/**/*.spec.js'
      ],
      examples: [
        'physics.test.js',
        'collision.test.js',
        'animation.test.js'
      ]
    },
    integration: {
      percentage: 25,
      frameworks: ['jest', 'puppeteer'],
      coverage: 60,
      files: [
        'tests/integration/**/*.test.js'
      ],
      examples: [
        'player-level.test.js',
        'entity-interaction.test.js',
        'state-management.test.js'
      ]
    },
    e2e: {
      percentage: 5,
      frameworks: ['playwright'],
      coverage: 40,
      files: [
        'tests/e2e/**/*.test.js'
      ],
      examples: [
        'complete-game-flow.test.js',
        'all-levels-playable.test.js'
      ]
    }
  }
};
```

### 2.2 Critical Test Suite Implementation

#### Suite 1: Physics Regression Tests

```javascript
// tests/critical/physics-regression.test.js
describe('Physics Regression Suite', () => {
  let baseline;
  let recorder;

  beforeAll(async () => {
    baseline = await loadBaseline('physics_baseline.json');
    recorder = new PhysicsRecorder(game);
  });

  describe('Jump Mechanics', () => {
    test('Jump arc matches baseline exactly', async () => {
      const recording = await recorder.recordScenario('jump_arc');
      
      // Compare each frame
      recording.frames.forEach((frame, index) => {
        const baselineFrame = baseline.jump_arc.frames[index];
        
        expect(frame.position.y).toBeCloseTo(baselineFrame.position.y, 1);
        expect(frame.velocity.vy).toBeCloseTo(baselineFrame.velocity.vy, 1);
      });
    });

    test('Variable jump height preserved', async () => {
      const shortJump = await recorder.recordScenario('jump_short');
      const longJump = await recorder.recordScenario('jump_long');
      
      expect(shortJump.maxHeight).toBeCloseTo(baseline.shortJumpHeight, 1);
      expect(longJump.maxHeight).toBeCloseTo(baseline.longJumpHeight, 1);
    });

    test('Coyote time window = 80ms exactly', async () => {
      const scenarios = [
        { delay: 70, shouldJump: true },
        { delay: 80, shouldJump: true },
        { delay: 90, shouldJump: false }
      ];

      for (const scenario of scenarios) {
        const result = await testCoyoteTime(scenario.delay);
        expect(result.jumped).toBe(scenario.shouldJump);
      }
    });

    test('Jump buffer window = 100ms exactly', async () => {
      const scenarios = [
        { buffer: 90, shouldQueue: true },
        { buffer: 100, shouldQueue: true },
        { buffer: 110, shouldQueue: false }
      ];

      for (const scenario of scenarios) {
        const result = await testJumpBuffer(scenario.buffer);
        expect(result.queued).toBe(scenario.shouldQueue);
      }
    });
  });

  describe('Movement Physics', () => {
    test('Acceleration curve unchanged', async () => {
      const recording = await recorder.recordScenario('acceleration');
      
      recording.frames.forEach((frame, index) => {
        const baselineFrame = baseline.acceleration.frames[index];
        expect(frame.velocity.vx).toBeCloseTo(baselineFrame.velocity.vx, 1);
      });
    });

    test('Friction deceleration matches', async () => {
      const recording = await recorder.recordScenario('friction');
      
      const frictionCurve = recording.frames.map(f => f.velocity.vx);
      const baselineCurve = baseline.friction.frames.map(f => f.velocity.vx);
      
      expect(frictionCurve).toEqual(baselineCurve);
    });

    test('Max speed capped correctly', async () => {
      const recording = await recorder.recordScenario('max_speed');
      const maxVx = Math.max(...recording.frames.map(f => Math.abs(f.velocity.vx)));
      
      expect(maxVx).toBeLessThanOrEqual(physics.moveSpeed);
    });
  });

  describe('Collision Physics', () => {
    test('Platform collision response exact', async () => {
      const recording = await recorder.recordScenario('platform_collision');
      
      const collisionFrame = recording.frames.find(f => f.collisions.length > 0);
      const baselineCollision = baseline.collisions.platform;
      
      expect(collisionFrame.position).toEqual(baselineCollision.position);
      expect(collisionFrame.velocity).toEqual(baselineCollision.velocity);
    });

    test('Wall collision stops movement', async () => {
      const recording = await recorder.recordScenario('wall_collision');
      
      const afterCollision = recording.frames.filter(f => f.timestamp > 1000);
      afterCollision.forEach(frame => {
        expect(frame.velocity.vx).toBe(0);
      });
    });

    test('Trampoline bounce height correct', async () => {
      const recording = await recorder.recordScenario('trampoline_bounce');
      const bounceVelocity = recording.frames.find(f => f.collisions.includes('trampoline')).velocity.vy;
      
      expect(bounceVelocity).toBe(-physics.jumpForce * 1.5);
    });
  });
});
```

#### Suite 2: Visual Regression Tests

```javascript
// tests/critical/visual-regression.test.js
describe('Visual Regression Suite', () => {
  let capture;
  let baselines;

  beforeAll(async () => {
    capture = new VisualBaselineCapture(canvas, ctx);
    baselines = await capture.loadBaselines();
  });

  describe('Sprite Rendering', () => {
    test.each([
      'player_idle',
      'player_run_1',
      'player_run_2',
      'player_run_3',
      'player_jump',
      'player_fall',
      'player_crouch',
      'player_dodge'
    ])('Sprite %s renders identically', async (spriteName) => {
      const current = await capture.captureState({ name: spriteName });
      const comparison = await capture.compareSnapshot(current, spriteName);
      
      expect(comparison.match).toBe(true);
      expect(comparison.difference.percentage).toBeLessThan(1);
    });
  });

  describe('Level Rendering', () => {
    test.each([1, 2, 3, 4, 5])('Level %d visual consistency', async (levelNum) => {
      game.loadLevel(levelNum);
      await game.waitForRender();
      
      const current = await capture.captureCanvas();
      const baseline = baselines[`level_${levelNum}`];
      
      const diff = await compareImages(current, baseline, {
        threshold: 0.01,
        includeAA: true
      });
      
      expect(diff.percentage).toBeLessThan(1);
    });
  });

  describe('UI Components', () => {
    test('Sprite editor renders correctly', async () => {
      showSpriteEditor();
      const current = await capture.captureCanvas();
      const comparison = await capture.compareSnapshot(current, 'sprite_editor');
      
      expect(comparison.match).toBe(true);
    });

    test('Mobile controls positioned correctly', async () => {
      enableMobileControls();
      const current = await capture.captureCanvas();
      const comparison = await capture.compareSnapshot(current, 'mobile_controls');
      
      expect(comparison.match).toBe(true);
    });
  });

  describe('Animation Sequences', () => {
    test('Run animation cycle unchanged', async () => {
      const frames = await capture.recordAnimation('run', 3);
      
      frames.forEach((frame, index) => {
        const baseline = baselines.animations.run[index];
        const diff = pixelDiff(frame, baseline);
        expect(diff.percentage).toBeLessThan(1);
      });
    });

    test('Particle effects render correctly', async () => {
      game.createParticles(400, 200, 10);
      
      // Capture over 30 frames
      const frames = await capture.recordFrames(30);
      const baselineFrames = baselines.particles;
      
      // Particles are random, so check general pattern
      frames.forEach((frame, index) => {
        const particleCount = countNonBlackPixels(frame);
        const baselineCount = countNonBlackPixels(baselineFrames[index]);
        
        expect(particleCount).toBeCloseTo(baselineCount, 10);
      });
    });
  });
});
```

#### Suite 3: State Consistency Tests

```javascript
// tests/critical/state-consistency.test.js
describe('State Consistency Suite', () => {
  let tracker;
  let stateValidator;

  beforeEach(() => {
    tracker = new StateMutationTracker();
    stateValidator = new StateValidator();
  });

  describe('State Mutation Tracking', () => {
    test('All player state changes tracked', () => {
      tracker.startTracking();
      
      // Perform actions
      player.jump();
      player.moveRight();
      player.collectTreat();
      
      const log = tracker.exportLog();
      
      expect(log.mutations).toContainEqual(
        expect.objectContaining({
          object: 'player',
          property: 'vy',
          newValue: -physics.jumpForce
        })
      );
      
      expect(log.mutations).toContainEqual(
        expect.objectContaining({
          object: 'player',
          property: 'vx',
          newValue: physics.moveSpeed
        })
      );
    });

    test('Cross-module state synchronization', () => {
      const states = captureModuleStates();
      
      // Player collects treat
      player.collectTreat();
      
      const newStates = captureModuleStates();
      
      // UI should reflect score change
      expect(newStates.ui.score).toBe(states.ui.score + 100);
      expect(newStates.game.score).toBe(states.game.score + 100);
      expect(newStates.player.score).toBe(states.player.score + 100);
    });

    test('State rollback capability', () => {
      const checkpoint = stateValidator.createCheckpoint();
      
      // Make changes
      player.x = 500;
      game.score = 1000;
      
      // Rollback
      stateValidator.rollback(checkpoint);
      
      expect(player.x).toBe(checkpoint.player.x);
      expect(game.score).toBe(checkpoint.game.score);
    });
  });

  describe('Save/Load Integrity', () => {
    test('Complete state persisted to localStorage', () => {
      const originalState = captureCompleteState();
      
      game.save();
      
      // Clear runtime state
      resetGame();
      
      game.load();
      
      const loadedState = captureCompleteState();
      
      expect(loadedState).toEqual(originalState);
    });

    test('Partial state updates preserve unchnaged data', () => {
      const original = { score: 100, level: 1, lives: 3 };
      
      saveState(original);
      updateState({ score: 200 });
      
      const loaded = loadState();
      
      expect(loaded).toEqual({ score: 200, level: 1, lives: 3 });
    });
  });

  describe('Memory Management', () => {
    test('No memory leaks during state changes', () => {
      const initialMemory = performance.memory.usedJSHeapSize;
      
      // Perform 1000 state changes
      for (let i = 0; i < 1000; i++) {
        player.jump();
        player.land();
        game.createParticles(100, 100, 5);
        game.updateParticles();
      }
      
      // Force GC if available
      if (global.gc) global.gc();
      
      const finalMemory = performance.memory.usedJSHeapSize;
      const leak = finalMemory - initialMemory;
      
      expect(leak).toBeLessThan(1_000_000); // Less than 1MB leak
    });
  });
});
```

#### Suite 4: Performance Benchmark Tests

```javascript
// tests/critical/performance-benchmarks.test.js
describe('Performance Benchmark Suite', () => {
  let profiler;

  beforeAll(() => {
    profiler = new PerformanceProfiler();
  });

  describe('Frame Rate Performance', () => {
    test('Maintains 60 FPS during normal gameplay', async () => {
      const profile = await profiler.recordGameplay(5000); // 5 seconds
      
      expect(profile.averageFPS).toBeGreaterThanOrEqual(59);
      expect(profile.minFPS).toBeGreaterThanOrEqual(55);
      expect(profile.droppedFrames).toBeLessThan(10);
    });

    test('Maintains 60 FPS with max entities', async () => {
      // Spawn maximum entities
      for (let i = 0; i < 50; i++) {
        game.spawnEntity('particle', Math.random() * 800, Math.random() * 400);
      }
      
      const profile = await profiler.recordGameplay(3000);
      
      expect(profile.averageFPS).toBeGreaterThanOrEqual(58);
    });

    test('Mobile performance targets met', async () => {
      simulateMobileDevice();
      
      const profile = await profiler.recordGameplay(5000);
      
      expect(profile.averageFPS).toBeGreaterThanOrEqual(30); // Mobile target
      expect(profile.maxFrameTime).toBeLessThan(33); // 30 FPS threshold
    });
  });

  describe('Render Performance', () => {
    test('Canvas draw calls optimized', () => {
      const drawCalls = profiler.countDrawCalls();
      
      expect(drawCalls.perFrame).toBeLessThan(100);
      expect(drawCalls.redundant).toBe(0);
    });

    test('Sprite batch rendering efficient', () => {
      const metrics = profiler.measureSpriteRendering();
      
      expect(metrics.spritesPerBatch).toBeGreaterThan(10);
      expect(metrics.textureSwaps).toBeLessThan(5);
    });
  });

  describe('Memory Performance', () => {
    test('Heap usage within limits', () => {
      const heapStats = profiler.getHeapStatistics();
      
      expect(heapStats.used).toBeLessThan(50_000_000); // 50MB
      expect(heapStats.peak).toBeLessThan(100_000_000); // 100MB
    });

    test('No memory leaks in game loop', async () => {
      const leak = await profiler.detectMemoryLeak(() => {
        game.update(16);
        game.render();
      }, 1000); // 1000 iterations
      
      expect(leak.detected).toBe(false);
      expect(leak.growthRate).toBeLessThan(0.01); // 1% growth
    });
  });

  describe('Input Latency', () => {
    test('Input response < 16ms', async () => {
      const latency = await profiler.measureInputLatency();
      
      expect(latency.average).toBeLessThan(16);
      expect(latency.p95).toBeLessThan(20);
      expect(latency.max).toBeLessThan(33);
    });
  });
});
```

#### Suite 5: Mobile Input Accuracy Tests

```javascript
// tests/critical/mobile-input.test.js
describe('Mobile Input Accuracy Suite', () => {
  let touchSimulator;
  let inputValidator;

  beforeEach(() => {
    touchSimulator = new TouchSimulator();
    inputValidator = new InputValidator();
  });

  describe('Touch Zone Accuracy', () => {
    test('D-pad zones correctly mapped', () => {
      const zones = getMobileControlZones();
      
      expect(zones.left).toMatchObject({
        x: 10, y: 250, width: 50, height: 50
      });
      
      expect(zones.right).toMatchObject({
        x: 90, y: 250, width: 50, height: 50
      });
      
      expect(zones.up).toMatchObject({
        x: 50, y: 210, width: 50, height: 50
      });
      
      expect(zones.down).toMatchObject({
        x: 50, y: 290, width: 50, height: 50
      });
    });

    test('Action button zones correct', () => {
      const zones = getMobileControlZones();
      
      expect(zones.jump).toMatchObject({
        x: 700, y: 280, width: 80, height: 80
      });
      
      expect(zones.dodge).toMatchObject({
        x: 600, y: 300, width: 60, height: 60
      });
    });

    test('Touch zones scale with viewport', () => {
      const viewports = [
        { width: 375, height: 667 },  // iPhone SE
        { width: 414, height: 896 },  // iPhone 11
        { width: 768, height: 1024 }  // iPad
      ];

      viewports.forEach(viewport => {
        setViewport(viewport);
        const zones = getMobileControlZones();
        
        // Zones should maintain relative positions
        expect(zones.left.x / viewport.width).toBeCloseTo(0.027, 2);
        expect(zones.jump.x / viewport.width).toBeCloseTo(0.933, 2);
      });
    });
  });

  describe('Multi-touch Handling', () => {
    test('Simultaneous D-pad and jump', async () => {
      await touchSimulator.multiTouch([
        { id: 1, x: 35, y: 275, type: 'start' },  // D-pad left
        { id: 2, x: 740, y: 320, type: 'start' }  // Jump button
      ]);

      expect(player.vx).toBe(-physics.moveSpeed);
      expect(player.vy).toBe(-physics.jumpForce);
    });

    test('Touch tracking maintains correct IDs', async () => {
      const touch1 = await touchSimulator.startTouch(35, 275);
      const touch2 = await touchSimulator.startTouch(740, 320);
      
      await touchSimulator.moveTouch(touch1.id, 45, 275);
      
      expect(getActiveTouch(touch1.id).x).toBe(45);
      expect(getActiveTouch(touch2.id).x).toBe(740);
    });

    test('Maximum 5 simultaneous touches', async () => {
      const touches = [];
      for (let i = 0; i < 7; i++) {
        touches.push(await touchSimulator.startTouch(i * 100, 200));
      }

      const activeTouches = getActiveTouches();
      expect(activeTouches.length).toBe(5);
    });
  });

  describe('Gesture Recognition', () => {
    test('Swipe up triggers jump', async () => {
      await touchSimulator.swipe({
        start: { x: 400, y: 300 },
        end: { x: 400, y: 200 },
        duration: 200
      });

      expect(player.vy).toBe(-physics.jumpForce);
    });

    test('Double tap triggers dodge', async () => {
      await touchSimulator.tap(400, 300);
      await touchSimulator.wait(100);
      await touchSimulator.tap(400, 300);

      expect(player.dodging).toBe(true);
    });

    test('Pinch zoom in sprite editor', async () => {
      openSpriteEditor();
      
      const initialScale = getSpriteEditorScale();
      
      await touchSimulator.pinch({
        finger1: { start: { x: 300, y: 200 }, end: { x: 250, y: 200 }},
        finger2: { start: { x: 500, y: 200 }, end: { x: 550, y: 200 }},
        duration: 300
      });

      const finalScale = getSpriteEditorScale();
      expect(finalScale).toBeGreaterThan(initialScale);
    });
  });

  describe('Touch Responsiveness', () => {
    test('Touch latency < 16ms', async () => {
      const measurements = [];
      
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await touchSimulator.tap(740, 320);
        const latency = performance.now() - start;
        measurements.push(latency);
      }

      const average = measurements.reduce((a, b) => a + b) / measurements.length;
      expect(average).toBeLessThan(16);
    });

    test('Touch feedback (haptic) triggers', async () => {
      const hapticSpy = jest.spyOn(navigator, 'vibrate');
      
      await touchSimulator.tap(740, 320); // Jump button
      
      expect(hapticSpy).toHaveBeenCalledWith(10);
    });
  });
});
```

## Phase 3: Quality Gate Implementation

### 3.1 Gate 1: Pre-Refactoring Checklist

```javascript
// quality-gates/gate-1-pre-refactor.js
class PreRefactorGate {
  async validate() {
    const results = {
      passed: true,
      checks: []
    };

    // Check 1: Physics baseline exists
    const physicsCheck = await this.checkPhysicsBaseline();
    results.checks.push(physicsCheck);
    if (!physicsCheck.passed) results.passed = false;

    // Check 2: Visual snapshots captured
    const visualCheck = await this.checkVisualSnapshots();
    results.checks.push(visualCheck);
    if (!visualCheck.passed) results.passed = false;

    // Check 3: Test harness operational
    const harnessCheck = await this.checkTestHarness();
    results.checks.push(harnessCheck);
    if (!harnessCheck.passed) results.passed = false;

    // Check 4: All current tests passing
    const testsCheck = await this.runCurrentTests();
    results.checks.push(testsCheck);
    if (!testsCheck.passed) results.passed = false;

    return results;
  }

  async checkPhysicsBaseline() {
    const requiredScenarios = [
      'jump_arc', 'double_jump_coyote', 'acceleration_curve',
      'collision_response', 'dodge_physics'
    ];

    const missing = [];
    for (const scenario of requiredScenarios) {
      const baseline = await loadBaseline(`physics_${scenario}`);
      if (!baseline) missing.push(scenario);
    }

    return {
      name: 'Physics Baseline',
      passed: missing.length === 0,
      missing: missing,
      message: missing.length === 0 
        ? 'All physics baselines recorded'
        : `Missing baselines: ${missing.join(', ')}`
    };
  }

  async checkVisualSnapshots() {
    const requiredSnapshots = [
      'player_idle', 'player_run_1', 'player_jump',
      'level_1_start', 'level_2_start', 'level_3_start',
      'level_4_start', 'level_5_start'
    ];

    const missing = [];
    for (const snapshot of requiredSnapshots) {
      const exists = await checkSnapshotExists(snapshot);
      if (!exists) missing.push(snapshot);
    }

    return {
      name: 'Visual Snapshots',
      passed: missing.length === 0,
      missing: missing,
      message: missing.length === 0
        ? 'All visual snapshots captured'
        : `Missing snapshots: ${missing.join(', ')}`
    };
  }

  async checkTestHarness() {
    const components = [
      { name: 'Jest', check: () => commandExists('jest') },
      { name: 'Puppeteer', check: () => moduleExists('puppeteer') },
      { name: 'Test Utils', check: () => fileExists('test-utils.js') }
    ];

    const missing = [];
    for (const component of components) {
      if (!await component.check()) {
        missing.push(component.name);
      }
    }

    return {
      name: 'Test Harness',
      passed: missing.length === 0,
      missing: missing,
      message: missing.length === 0
        ? 'Test harness fully operational'
        : `Missing components: ${missing.join(', ')}`
    };
  }
}
```

### 3.2 Gate 2: Module Extraction Validation

```javascript
// quality-gates/gate-2-module-extraction.js
class ModuleExtractionGate {
  async validate() {
    const results = {
      passed: true,
      checks: []
    };

    // Physics regression check
    const physicsCheck = await this.validatePhysics();
    results.checks.push(physicsCheck);
    if (!physicsCheck.passed) results.passed = false;

    // Visual regression check
    const visualCheck = await this.validateVisuals();
    results.checks.push(visualCheck);
    if (!visualCheck.passed) results.passed = false;

    // State consistency check
    const stateCheck = await this.validateState();
    results.checks.push(stateCheck);
    if (!stateCheck.passed) results.passed = false;

    // Performance check
    const perfCheck = await this.validatePerformance();
    results.checks.push(perfCheck);
    if (!perfCheck.passed) results.passed = false;

    return results;
  }

  async validatePhysics() {
    const tests = await runTestSuite('physics-regression');
    
    return {
      name: 'Physics Regression',
      passed: tests.failed === 0,
      details: {
        total: tests.total,
        passed: tests.passed,
        failed: tests.failed
      },
      message: tests.failed === 0
        ? 'No physics regression detected'
        : `${tests.failed} physics tests failing`
    };
  }

  async validateVisuals() {
    const threshold = 0.01; // 1% difference allowed
    const comparisons = await runVisualComparisons();
    
    const failures = comparisons.filter(c => c.difference > threshold);
    
    return {
      name: 'Visual Regression',
      passed: failures.length === 0,
      failures: failures,
      message: failures.length === 0
        ? 'Visual regression within tolerance'
        : `${failures.length} visual differences exceed ${threshold * 100}%`
    };
  }

  async validateState() {
    const consistencyTests = await runStateConsistencyTests();
    
    return {
      name: 'State Consistency',
      passed: consistencyTests.passed,
      issues: consistencyTests.issues,
      message: consistencyTests.passed
        ? 'State management consistent'
        : `State inconsistencies: ${consistencyTests.issues.join(', ')}`
    };
  }

  async validatePerformance() {
    const metrics = await measurePerformance();
    
    const checks = {
      fps: metrics.avgFPS >= 60,
      memory: metrics.heapUsed < 50_000_000,
      inputLatency: metrics.inputLatency < 16
    };
    
    const allPassed = Object.values(checks).every(v => v);
    
    return {
      name: 'Performance',
      passed: allPassed,
      metrics: metrics,
      checks: checks,
      message: allPassed
        ? 'Performance targets met'
        : 'Performance degradation detected'
    };
  }
}
```

### 3.3 Gate 3: Release Readiness

```javascript
// quality-gates/gate-3-release.js
class ReleaseGate {
  async validate() {
    const results = {
      passed: true,
      checks: []
    };

    // All levels playable
    const levelsCheck = await this.validateAllLevels();
    results.checks.push(levelsCheck);
    if (!levelsCheck.passed) results.passed = false;

    // Performance maintained
    const perfCheck = await this.validateReleasePerformance();
    results.checks.push(perfCheck);
    if (!perfCheck.passed) results.passed = false;

    // Mobile functionality
    const mobileCheck = await this.validateMobile();
    results.checks.push(mobileCheck);
    if (!mobileCheck.passed) results.passed = false;

    // No critical bugs
    const bugsCheck = await this.checkCriticalBugs();
    results.checks.push(bugsCheck);
    if (!bugsCheck.passed) results.passed = false;

    return results;
  }

  async validateAllLevels() {
    const levelTests = [];
    
    for (let level = 1; level <= 5; level++) {
      const test = await this.testLevel(level);
      levelTests.push(test);
    }
    
    const allPlayable = levelTests.every(t => t.playable);
    
    return {
      name: 'All Levels Playable',
      passed: allPlayable,
      levels: levelTests,
      message: allPlayable
        ? 'All 5 levels fully playable'
        : `Levels with issues: ${levelTests.filter(t => !t.playable).map(t => t.level).join(', ')}`
    };
  }

  async testLevel(levelNum) {
    const result = {
      level: levelNum,
      playable: true,
      issues: []
    };

    // Start to finish test
    const playthrough = await simulateLevelPlaythrough(levelNum);
    
    if (!playthrough.completed) {
      result.playable = false;
      result.issues.push('Cannot complete level');
    }
    
    if (playthrough.errors.length > 0) {
      result.playable = false;
      result.issues = result.issues.concat(playthrough.errors);
    }
    
    return result;
  }

  async validateReleasePerformance() {
    const targets = {
      desktop: { fps: 60, memory: 100_000_000 },
      mobile: { fps: 30, memory: 50_000_000 }
    };

    const desktop = await testPerformance('desktop');
    const mobile = await testPerformance('mobile');

    const desktopPassed = desktop.fps >= targets.desktop.fps && 
                         desktop.memory <= targets.desktop.memory;
    const mobilePassed = mobile.fps >= targets.mobile.fps && 
                        mobile.memory <= targets.mobile.memory;

    return {
      name: 'Release Performance',
      passed: desktopPassed && mobilePassed,
      desktop: desktop,
      mobile: mobile,
      message: desktopPassed && mobilePassed
        ? 'Performance targets achieved'
        : 'Performance below release standards'
    };
  }

  async validateMobile() {
    const checks = {
      touchControls: await testTouchControls(),
      orientation: await testOrientations(),
      viewport: await testViewportScaling(),
      gestures: await testGestures()
    };

    const allPassed = Object.values(checks).every(v => v.passed);

    return {
      name: 'Mobile Functionality',
      passed: allPassed,
      checks: checks,
      message: allPassed
        ? 'Mobile features fully functional'
        : 'Mobile issues detected'
    };
  }

  async checkCriticalBugs() {
    const bugs = await scanForCriticalBugs();
    
    return {
      name: 'Critical Bugs',
      passed: bugs.length === 0,
      bugs: bugs,
      message: bugs.length === 0
        ? 'No critical bugs found'
        : `${bugs.length} critical bugs must be fixed`
    };
  }
}
```

## Test Execution Plan

### Week 1: Baseline Capture
```bash
# Day 1-2: Record all baselines
npm run baseline:physics:record
npm run baseline:visual:capture
npm run baseline:state:track

# Day 3: Validate baselines
npm run baseline:validate
npm run gate:1:check
```

### Week 2: Continuous Testing
```bash
# Run on every commit
npm run test:physics:regression
npm run test:visual:quick

# Run hourly
npm run test:integration

# Run nightly
npm run test:e2e
npm run test:performance
```

### Week 3: Release Validation
```bash
# Final validation
npm run gate:2:validate
npm run gate:3:release
npm run test:all
```

## Conclusion

This comprehensive test design provides:

1. **Complete baseline capture** before any refactoring
2. **Robust test architecture** with clear pyramid structure
3. **Critical test suites** covering all risk areas
4. **Quality gates** ensuring safe progression
5. **Continuous validation** throughout development

The test-first approach with baseline recording is ESSENTIAL to prevent regression during modularization.

**Next Steps**:
1. Implement baseline recording scripts
2. Capture all baselines
3. Set up test harness
4. Begin modularization with confidence

---
*Total test implementation: ~300 tests | Coverage target: 80% | Timeline: 3 days setup*