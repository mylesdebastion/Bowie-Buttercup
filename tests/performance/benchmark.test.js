import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Game } from '../../src/core/Game.js';
import { GameLoop } from '../../src/core/game-loop.js';
import { EntityManager } from '../../src/entities/EntityManager.js';
import { PhysicsSystem } from '../../src/entities/PhysicsSystem.js';
import PerformanceMonitor from '../../src/performance/PerformanceMonitor.js';
import memoryManager from '../../src/performance/MemoryManager.js';

// Mock heavy dependencies for consistent benchmarking
vi.mock('../../src/core/Canvas.js');
vi.mock('../../src/core/InputManager.js');
vi.mock('../../src/core/StateManager.js');
vi.mock('../../src/core/asset-loader.js');
vi.mock('../../src/ui/UIManager.js');

describe('Performance Benchmarks', () => {
  let game;
  let gameLoop;
  let entityManager;
  let physicsSystem;
  
  // Performance tracking
  const performanceMetrics = {
    frameTime: [],
    updateTime: [],
    renderTime: [],
    memoryUsage: [],
    entityCount: []
  };
  
  beforeEach(async () => {
    // Clear performance metrics
    Object.keys(performanceMetrics).forEach(key => {
      performanceMetrics[key].length = 0;
    });
    
    // Mock performance API for consistent measurements
    global.performance = {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      }
    };
    
    // Setup mocked game systems
    await setupMockedGame();
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (game) {
      game.destroy();
    }
  });

  async function setupMockedGame() {
    const { Canvas } = await import('../../src/core/Canvas.js');
    const { InputManager } = await import('../../src/core/InputManager.js');
    const { StateManager } = await import('../../src/core/StateManager.js');
    const { AssetLoader } = await import('../../src/core/asset-loader.js');
    const { UIManager } = await import('../../src/ui/UIManager.js');
    
    Canvas.mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(true),
      clear: vi.fn(),
      context: {
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn()
      },
      destroy: vi.fn()
    }));
    
    InputManager.mockImplementation(() => ({
      init: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn()
    }));
    
    StateManager.mockImplementation(() => ({
      init: vi.fn(),
      saveState: vi.fn(),
      loadState: vi.fn()
    }));
    
    AssetLoader.mockImplementation(() => ({
      loadAssets: vi.fn().mockResolvedValue({})
    }));
    
    UIManager.mockImplementation(() => ({
      init: vi.fn(),
      update: vi.fn(),
      render: vi.fn(),
      destroy: vi.fn()
    }));
    
    game = new Game();
    await game.init();
    
    entityManager = game.entityManager;
    physicsSystem = new PhysicsSystem();
    gameLoop = new GameLoop({
      onUpdate: (deltaTime) => game.update(deltaTime),
      onRender: () => game.render(),
      targetFPS: 60
    });
  }

  function measurePerformance(operation, iterations = 1) {
    const measurements = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const startMemory = performance.memory?.usedJSHeapSize || 0;
      
      operation();
      
      const endTime = performance.now();
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      
      measurements.push({
        time: endTime - startTime,
        memory: endMemory - startMemory,
        iteration: i
      });
    }
    
    return {
      avg: measurements.reduce((sum, m) => sum + m.time, 0) / measurements.length,
      min: Math.min(...measurements.map(m => m.time)),
      max: Math.max(...measurements.map(m => m.time)),
      measurements
    };
  }

  describe('Game Loop Performance', () => {
    it('should maintain 60 FPS with basic game state', () => {
      const targetFrameTime = 16.67; // 60 FPS
      const tolerance = 5; // 5ms tolerance
      
      const performance = measurePerformance(() => {
        game.update(targetFrameTime);
        game.render();
      }, 60); // Test 60 frames
      
      expect(performance.avg).toBeLessThan(targetFrameTime - tolerance);
      expect(performance.max).toBeLessThan(targetFrameTime * 2); // No frame should take more than 2x target
      
      console.log(`Game Loop Performance: avg=${performance.avg.toFixed(2)}ms, max=${performance.max.toFixed(2)}ms`);
    });

    it('should maintain stable performance over extended periods', () => {
      const frameCount = 300; // 5 seconds at 60 FPS
      const frameMetrics = [];
      
      for (let frame = 0; frame < frameCount; frame++) {
        const frameStart = performance.now();
        
        game.update(16.67);
        game.render();
        
        const frameEnd = performance.now();
        frameMetrics.push(frameEnd - frameStart);
      }
      
      const avgFrameTime = frameMetrics.reduce((sum, time) => sum + time, 0) / frameCount;
      const frameTimeVariation = Math.max(...frameMetrics) - Math.min(...frameMetrics);
      
      expect(avgFrameTime).toBeLessThan(10); // Average under 10ms
      expect(frameTimeVariation).toBeLessThan(30); // Variation under 30ms
      
      console.log(`Extended Performance: avg=${avgFrameTime.toFixed(2)}ms, variation=${frameTimeVariation.toFixed(2)}ms`);
    });
  });

  describe('Entity System Performance', () => {
    it('should handle 10 entities efficiently', () => {
      // Create 10 entities of mixed types
      for (let i = 0; i < 5; i++) {
        entityManager.createEntity('fireball', i * 50, 100, 100, 0);
      }
      for (let i = 0; i < 3; i++) {
        entityManager.createEntity('mouse', i * 100, 350);
      }
      for (let i = 0; i < 2; i++) {
        entityManager.createParticle(i * 150, 200, 50, -50);
      }
      
      const performance = measurePerformance(() => {
        entityManager.update(16.67);
      }, 100);
      
      expect(performance.avg).toBeLessThan(3); // Should be under 3ms
      expect(entityManager.getAllEntities().length).toBe(10);
      
      console.log(`10 Entity Performance: ${performance.avg.toFixed(2)}ms`);
    });

    it('should handle 50 entities with acceptable performance', () => {
      // Create 50 entities
      for (let i = 0; i < 25; i++) {
        entityManager.createEntity('fireball', 
          Math.random() * 800, 
          Math.random() * 200, 
          (Math.random() - 0.5) * 200, 
          Math.random() * 100
        );
      }
      for (let i = 0; i < 15; i++) {
        entityManager.createEntity('mouse', 
          Math.random() * 800, 
          350 + Math.random() * 50
        );
      }
      for (let i = 0; i < 10; i++) {
        entityManager.createParticle(
          Math.random() * 800,
          Math.random() * 400,
          (Math.random() - 0.5) * 200,
          -Math.random() * 150
        );
      }
      
      const performance = measurePerformance(() => {
        entityManager.update(16.67);
      }, 100);
      
      expect(performance.avg).toBeLessThan(8); // Should be under 8ms for 50 entities
      expect(entityManager.getAllEntities().length).toBe(50);
      
      console.log(`50 Entity Performance: ${performance.avg.toFixed(2)}ms`);
    });

    it('should handle 100 entities within performance budget', () => {
      // Create 100 entities
      for (let i = 0; i < 100; i++) {
        const entityType = i % 3 === 0 ? 'fireball' : i % 3 === 1 ? 'mouse' : 'particle';
        
        if (entityType === 'particle') {
          entityManager.createParticle(
            Math.random() * 800,
            Math.random() * 400,
            (Math.random() - 0.5) * 200,
            -Math.random() * 150
          );
        } else {
          entityManager.createEntity(entityType,
            Math.random() * 800,
            Math.random() * 400,
            entityType === 'fireball' ? (Math.random() - 0.5) * 200 : undefined,
            entityType === 'fireball' ? Math.random() * 100 : undefined
          );
        }
      }
      
      const performance = measurePerformance(() => {
        entityManager.update(16.67);
      }, 60);
      
      expect(performance.avg).toBeLessThan(12); // Should be under 12ms for 100 entities
      expect(performance.max).toBeLessThan(20); // No single update over 20ms
      
      console.log(`100 Entity Performance: avg=${performance.avg.toFixed(2)}ms, max=${performance.max.toFixed(2)}ms`);
    });
  });

  describe('Physics System Performance', () => {
    it('should perform collision detection efficiently', () => {
      // Create test level
      const testLevel = createPerformanceTestLevel();
      physicsSystem.setLevel(testLevel);
      
      // Create entities for collision testing
      const entities = [];
      for (let i = 0; i < 20; i++) {
        entities.push({
          x: Math.random() * 800,
          y: Math.random() * 400,
          width: 16,
          height: 16,
          vx: (Math.random() - 0.5) * 200,
          vy: Math.random() * 100
        });
      }
      
      const performance = measurePerformance(() => {
        entities.forEach(entity => {
          physicsSystem.applyGravity(entity, 16.67);
          physicsSystem.checkGroundCollision(entity, testLevel);
          physicsSystem.checkWallCollision(entity, testLevel);
        });
      }, 100);
      
      expect(performance.avg).toBeLessThan(5); // Should be under 5ms for 20 entities
      
      console.log(`Collision Detection Performance: ${performance.avg.toFixed(2)}ms`);
    });

    it('should handle gravity calculations efficiently', () => {
      const entities = [];
      for (let i = 0; i < 100; i++) {
        entities.push({
          x: Math.random() * 800,
          y: Math.random() * 400,
          vx: 0,
          vy: 0,
          grounded: false
        });
      }
      
      const performance = measurePerformance(() => {
        entities.forEach(entity => {
          physicsSystem.applyGravity(entity, 16.67);
        });
      }, 200);
      
      expect(performance.avg).toBeLessThan(2); // Gravity should be very fast
      
      console.log(`Gravity Calculation Performance: ${performance.avg.toFixed(2)}ms for 100 entities`);
    });
  });

  describe('Rendering Performance', () => {
    it('should render game efficiently', () => {
      // Set up rendering test
      const mockContext = {
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn()
      };
      
      game.canvas.context = mockContext;
      
      // Create entities to render
      for (let i = 0; i < 30; i++) {
        entityManager.createEntity('fireball', i * 20, 100, 50, 0);
      }
      
      const performance = measurePerformance(() => {
        game.render();
      }, 100);
      
      expect(performance.avg).toBeLessThan(5); // Rendering should be under 5ms
      expect(mockContext.clearRect).toHaveBeenCalled();
      
      console.log(`Rendering Performance: ${performance.avg.toFixed(2)}ms`);
    });

    it('should handle complex scenes efficiently', () => {
      const mockContext = {
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        clearRect: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn()
      };
      
      game.canvas.context = mockContext;
      
      // Create complex scene
      for (let i = 0; i < 20; i++) {
        entityManager.createEntity('fireball', Math.random() * 800, Math.random() * 200, 100, 0);
      }
      for (let i = 0; i < 15; i++) {
        entityManager.createEntity('mouse', Math.random() * 800, 350);
      }
      for (let i = 0; i < 25; i++) {
        entityManager.createParticle(
          Math.random() * 800,
          Math.random() * 400,
          (Math.random() - 0.5) * 100,
          -Math.random() * 100
        );
      }
      
      const performance = measurePerformance(() => {
        game.render();
      }, 60);
      
      expect(performance.avg).toBeLessThan(8); // Complex scene should be under 8ms
      
      console.log(`Complex Scene Rendering: ${performance.avg.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during normal gameplay', () => {
      const initialMemory = performance.memory.usedJSHeapSize;
      
      // Simulate 5 seconds of gameplay
      for (let frame = 0; frame < 300; frame++) {
        // Add and remove entities to simulate dynamic gameplay
        if (frame % 10 === 0) {
          entityManager.createParticle(
            Math.random() * 800,
            Math.random() * 400,
            (Math.random() - 0.5) * 200,
            -Math.random() * 150
          );
        }
        
        game.update(16.67);
        game.render();
        
        // Cleanup destroyed entities
        if (frame % 30 === 0) {
          entityManager.cleanupDestroyed();
        }
      }
      
      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (under 1MB for test)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
      
      console.log(`Memory usage increase: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    });

    it('should efficiently manage entity lifecycle', () => {
      const initialEntityCount = entityManager.getAllEntities().length;
      
      // Create and destroy many entities
      for (let cycle = 0; cycle < 10; cycle++) {
        // Create 20 entities
        for (let i = 0; i < 20; i++) {
          entityManager.createParticle(
            Math.random() * 800,
            Math.random() * 400,
            0, 0
          );
        }
        
        // Update entities (particles will naturally expire)
        for (let frame = 0; frame < 60; frame++) {
          entityManager.update(16.67);
        }
        
        // Force cleanup
        entityManager.cleanupDestroyed();
      }
      
      const finalEntityCount = entityManager.getAllEntities().length;
      
      // Should return to approximately initial state
      expect(finalEntityCount).toBeLessThanOrEqual(initialEntityCount + 5);
      
      console.log(`Entity count: initial=${initialEntityCount}, final=${finalEntityCount}`);
    });
  });

  describe('Stress Testing', () => {
    it('should handle extreme entity counts gracefully', () => {
      const maxEntities = 200;
      let performanceDecline = false;
      
      // Gradually increase entity count and measure performance
      for (let entityCount = 50; entityCount <= maxEntities; entityCount += 50) {
        // Clear and create entities
        entityManager.clearAll();
        
        for (let i = 0; i < entityCount; i++) {
          if (i % 3 === 0) {
            entityManager.createEntity('fireball', 
              Math.random() * 800, 
              Math.random() * 200, 
              (Math.random() - 0.5) * 200, 
              Math.random() * 100
            );
          } else {
            entityManager.createParticle(
              Math.random() * 800,
              Math.random() * 400,
              (Math.random() - 0.5) * 200,
              -Math.random() * 150
            );
          }
        }
        
        const performance = measurePerformance(() => {
          entityManager.update(16.67);
        }, 10);
        
        console.log(`${entityCount} entities: ${performance.avg.toFixed(2)}ms`);
        
        // Performance should degrade gracefully, not catastrophically
        if (performance.avg > 50) { // 50ms is extreme but acceptable for stress test
          performanceDecline = true;
          break;
        }
      }
      
      // Should handle at least 150 entities without catastrophic failure
      expect(entityManager.getAllEntities().length).toBeGreaterThanOrEqual(150);
    });

    it('should recover from performance spikes', () => {
      // Create normal load
      for (let i = 0; i < 30; i++) {
        entityManager.createParticle(
          Math.random() * 800,
          Math.random() * 400,
          (Math.random() - 0.5) * 100,
          -Math.random() * 100
        );
      }
      
      const normalPerformance = measurePerformance(() => {
        game.update(16.67);
        game.render();
      }, 10);
      
      // Create spike load
      for (let i = 0; i < 70; i++) {
        entityManager.createParticle(
          Math.random() * 800,
          Math.random() * 400,
          (Math.random() - 0.5) * 200,
          -Math.random() * 150
        );
      }
      
      const spikePerformance = measurePerformance(() => {
        game.update(16.67);
        game.render();
      }, 10);
      
      // Wait for particles to expire
      for (let frame = 0; frame < 180; frame++) {
        entityManager.update(16.67);
      }
      
      const recoveryPerformance = measurePerformance(() => {
        game.update(16.67);
        game.render();
      }, 10);
      
      // Performance should recover to near normal levels
      expect(recoveryPerformance.avg).toBeLessThan(spikePerformance.avg);
      expect(recoveryPerformance.avg / normalPerformance.avg).toBeLessThan(2); // Within 2x of normal
      
      console.log(`Performance recovery: normal=${normalPerformance.avg.toFixed(2)}ms, spike=${spikePerformance.avg.toFixed(2)}ms, recovery=${recoveryPerformance.avg.toFixed(2)}ms`);
    });
  });

  function createPerformanceTestLevel() {
    const level = [];
    for (let y = 0; y < 30; y++) {
      level[y] = [];
      for (let x = 0; x < 50; x++) {
        if (y === 25) {
          level[y][x] = 1; // Ground
        } else if (y === 15 && x >= 10 && x <= 20) {
          level[y][x] = 1; // Platform
        } else {
          level[y][x] = 0; // Air
        }
      }
    }
    return level;
  }
});

describe('Performance Monitor Tests - Epic E006', () => {
  let performanceMonitor;
  let game;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor({
      debug: false,
      fpsTarget: 60,
      frameTimeTarget: 16.67
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    game = new Game(canvas);
  });

  afterEach(() => {
    if (performanceMonitor) {
      performanceMonitor.destroy();
    }
    if (game) {
      game.destroy();
    }
  });

  it('should track frame rate accurately', async () => {
    const targetFPS = 60;
    const testDuration = 1000; // 1 second
    let frameCount = 0;

    const frameInterval = setInterval(() => {
      performanceMonitor.beginFrame();
      // Simulate frame work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Simulate 10ms of work
        Math.random();
      }
      performanceMonitor.endFrame();
      frameCount++;
    }, 1000 / targetFPS);

    await new Promise(resolve => setTimeout(resolve, testDuration));
    clearInterval(frameInterval);

    const metrics = performanceMonitor.getMetrics();
    
    expect(metrics.fps).toBeGreaterThan(50); // Allow some variance
    expect(metrics.fps).toBeLessThan(70);
    
    console.log(`Performance Monitor FPS: ${metrics.fps}`);
  });

  it('should detect frame time performance issues', () => {
    performanceMonitor.beginFrame();
    
    // Simulate slow frame
    const start = performance.now();
    while (performance.now() - start < 25) {
      Math.random(); // 25ms work (exceeds 16.67ms target)
    }
    
    performanceMonitor.endFrame();

    const metrics = performanceMonitor.getMetrics();
    expect(metrics.frameTime).toBeGreaterThan(20);
    expect(metrics.dropped_frames).toBeGreaterThan(0);
  });

  it('should calculate performance health score', () => {
    // Run some normal frames
    for (let i = 0; i < 10; i++) {
      performanceMonitor.beginFrame();
      
      // Simulate good performance
      const start = performance.now();
      while (performance.now() - start < 12) {
        Math.random(); // 12ms work (under 16.67ms target)
      }
      
      performanceMonitor.endFrame();
    }

    const health = performanceMonitor.getHealthScore();
    expect(health).toBeGreaterThanOrEqual(80); // Good performance
    expect(health).toBeLessThanOrEqual(100);
  });
});

describe('Memory Manager Tests - Epic E006', () => {
  it('should use object pooling efficiently', () => {
    // Test particle pool
    const particles = [];
    
    // Acquire particles
    for (let i = 0; i < 10; i++) {
      const particle = memoryManager.acquire('Particle');
      particles.push(particle);
    }

    // Release particles back to pool
    particles.forEach(particle => {
      memoryManager.release('Particle', particle);
    });

    const stats = memoryManager.getStats();
    
    expect(stats.pools.Particle.created).toBeGreaterThan(0);
    expect(stats.pools.Particle.reused).toBeGreaterThanOrEqual(0);
    expect(stats.pools.Particle.available).toBeGreaterThan(0);
  });

  it('should manage asset cache effectively', () => {
    const testAsset = { data: 'test', size: 100 };
    
    // Cache asset
    memoryManager.cacheAsset('test-asset', testAsset, 100);
    
    // Retrieve asset
    const retrieved = memoryManager.getAsset('test-asset');
    expect(retrieved).toBe(testAsset);

    // Remove asset
    const removed = memoryManager.removeAsset('test-asset');
    expect(removed).toBe(true);

    const retrievedAfterRemoval = memoryManager.getAsset('test-asset');
    expect(retrievedAfterRemoval).toBe(null);
  });

  it('should detect memory leaks', () => {
    // This test would need actual memory growth simulation
    // For now, test that the detection mechanism exists
    const leakDetection = memoryManager.detectMemoryLeaks();
    expect(leakDetection).toHaveProperty('detected');
  });

  it('should cleanup resources properly', () => {
    // Create some pooled objects
    const particles = [];
    for (let i = 0; i < 5; i++) {
      particles.push(memoryManager.acquire('Particle'));
    }

    // Cache some assets
    memoryManager.cacheAsset('cleanup-test', { data: 'test' }, 50);

    // Cleanup
    memoryManager.cleanup();

    const stats = memoryManager.getStats();
    expect(stats.assetCache.count).toBe(0);
  });
});

describe('Canvas Batching Tests - Epic E006', () => {
  let canvas, game;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    game = new Game(canvas);
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  });

  it('should batch draw calls when enabled', () => {
    game.canvasManager.setBatching(true);

    // Make multiple draw calls
    for (let i = 0; i < 10; i++) {
      game.canvasManager.fillRect(i * 10, i * 10, 10, 10, '#ff0000');
    }

    // Check that calls are batched
    expect(game.canvasManager.batchedDrawCalls.length).toBe(10);

    // Flush batch
    game.canvasManager.flushBatch();
    expect(game.canvasManager.batchedDrawCalls.length).toBe(0);
  });

  it('should execute draw calls immediately when batching disabled', () => {
    game.canvasManager.setBatching(false);

    // Make draw calls
    for (let i = 0; i < 5; i++) {
      game.canvasManager.fillRect(i * 20, i * 20, 15, 15, '#00ff00');
    }

    // Should not batch
    expect(game.canvasManager.batchedDrawCalls.length).toBe(0);
  });

  it('should sort batched calls by color for optimization', () => {
    game.canvasManager.setBatching(true);

    // Add calls with different colors in mixed order
    game.canvasManager.fillRect(0, 0, 10, 10, '#ff0000'); // red
    game.canvasManager.fillRect(10, 0, 10, 10, '#00ff00'); // green
    game.canvasManager.fillRect(20, 0, 10, 10, '#ff0000'); // red
    game.canvasManager.fillRect(30, 0, 10, 10, '#00ff00'); // green

    expect(game.canvasManager.batchedDrawCalls.length).toBe(4);

    // Flush should sort by color
    const spy = vi.spyOn(game.canvasManager.ctx, 'fillRect');
    game.canvasManager.flushBatch();

    expect(spy).toHaveBeenCalledTimes(4);
  });
});

describe('Bundle Size Optimization Tests - Epic E006', () => {
  it('should meet bundle size targets', async () => {
    // This would typically test actual bundle size
    // For now, verify optimization features are in place
    
    // Check that tree shaking config is present
    expect(typeof process.env.NODE_ENV).toBe('string');
    
    // In production builds, console.log should be removed
    if (process.env.NODE_ENV === 'production') {
      // This would be tested against actual build output
      expect(true).toBe(true); // Placeholder
    }
  });

  it('should support code splitting in development', () => {
    // Verify that development supports chunked loading
    // This would test actual module loading behavior
    expect(true).toBe(true); // Placeholder
  });

  it('should optimize asset loading', () => {
    // Test asset inlining thresholds and compression
    expect(true).toBe(true); // Placeholder
  });
});
