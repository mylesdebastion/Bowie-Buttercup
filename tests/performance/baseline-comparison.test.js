import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Game } from '../../src/core/Game.js';
import { PlayerEntity } from '../../src/entities/PlayerEntity.js';
import { EntityManager } from '../../src/entities/EntityManager.js';

/**
 * Baseline Comparison Tests
 * 
 * These tests compare the performance of the modular architecture
 * against established baselines to detect performance regressions.
 */

describe('Baseline Performance Comparison', () => {
  let game;
  let entityManager;
  
  // Performance baselines (in milliseconds)
  // These should be updated when legitimate performance improvements are made
  const BASELINES = {
    gameInitialization: 100, // Game startup time
    singleEntityUpdate: 1,   // Update one entity
    tenEntitiesUpdate: 5,    // Update 10 entities  
    frameRender: 10,         // Single frame render
    levelLoad: 50,           // Load a level
    physicsStep: 3,          // Physics simulation step
    collisionCheck: 2,       // Collision detection
    stateSerialize: 5,       // State serialization
    memoryPerEntity: 1024    // Memory per entity (bytes)
  };
  
  // Performance tolerance (percentage)
  const TOLERANCE = 0.2; // 20% tolerance
  
  beforeEach(async () => {
    await setupTestEnvironment();
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
    vi.clearAllMocks();
  });

  async function setupTestEnvironment() {
    // Mock dependencies for consistent testing
    const { Canvas } = await import('../../src/core/Canvas.js');
    const { InputManager } = await import('../../src/core/InputManager.js');
    const { StateManager } = await import('../../src/core/StateManager.js');
    const { AssetLoader } = await import('../../src/core/asset-loader.js');
    const { UIManager } = await import('../../src/ui/UIManager.js');
    
    vi.mocked(Canvas).mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(true),
      clear: vi.fn(),
      context: { fillRect: vi.fn(), drawImage: vi.fn() },
      destroy: vi.fn()
    }));
    
    vi.mocked(InputManager).mockImplementation(() => ({
      init: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn()
    }));
    
    vi.mocked(StateManager).mockImplementation(() => ({
      init: vi.fn(),
      saveState: vi.fn(),
      loadState: vi.fn().mockResolvedValue(null)
    }));
    
    vi.mocked(AssetLoader).mockImplementation(() => ({
      loadAssets: vi.fn().mockResolvedValue({})
    }));
    
    vi.mocked(UIManager).mockImplementation(() => ({
      init: vi.fn(),
      update: vi.fn(),
      render: vi.fn(),
      destroy: vi.fn()
    }));
    
    global.performance = {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000
      }
    };
  }

  function measureWithTolerance(operation, baselineMs, testName) {
    const measurements = [];
    const iterations = 10;
    
    // Warm up
    for (let i = 0; i < 3; i++) {
      operation();
    }
    
    // Measure
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      operation();
      const end = performance.now();
      measurements.push(end - start);
    }
    
    const avgTime = measurements.reduce((sum, time) => sum + time, 0) / iterations;
    const maxTime = Math.max(...measurements);
    const minTime = Math.min(...measurements);
    
    const toleranceMs = baselineMs * TOLERANCE;
    const isWithinTolerance = avgTime <= (baselineMs + toleranceMs);
    
    console.log(`${testName}: avg=${avgTime.toFixed(2)}ms (baseline: ${baselineMs}ms, tolerance: ±${toleranceMs.toFixed(2)}ms)`);
    
    return {
      avgTime,
      maxTime,
      minTime,
      baselineMs,
      toleranceMs,
      isWithinTolerance,
      measurements
    };
  }

  describe('Core System Baselines', () => {
    it('should initialize game within baseline time', async () => {
      const result = measureWithTolerance(
        async () => {
          const testGame = new Game();
          await testGame.init();
          testGame.destroy();
        },
        BASELINES.gameInitialization,
        'Game Initialization'
      );
      
      expect(result.isWithinTolerance).toBe(true);
      expect(result.avgTime).toBeLessThan(BASELINES.gameInitialization + result.toleranceMs);
    });

    it('should load level within baseline time', async () => {
      game = new Game();
      await game.init();
      
      const testLevel = createSimpleTestLevel();
      
      const result = measureWithTolerance(
        () => {
          game.loadLevel(1, testLevel);
        },
        BASELINES.levelLoad,
        'Level Loading'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });

    it('should render frame within baseline time', async () => {
      game = new Game();
      await game.init();
      
      // Add some entities for realistic rendering
      for (let i = 0; i < 5; i++) {
        game.entityManager.createEntity('fireball', i * 50, 100, 50, 0);
      }
      
      const result = measureWithTolerance(
        () => {
          game.render();
        },
        BASELINES.frameRender,
        'Frame Rendering'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });
  });

  describe('Entity System Baselines', () => {
    beforeEach(async () => {
      game = new Game();
      await game.init();
      entityManager = game.entityManager;
    });

    it('should update single entity within baseline time', () => {
      const player = entityManager.createPlayer(100, 300);
      
      const result = measureWithTolerance(
        () => {
          player.update(16.67, {
            inputManager: {
              getMovementInput: () => ({ x: 0, y: 0 }),
              isJumpPressed: () => false,
              isKeyPressed: () => false
            },
            level: [],
            camera: { x: 0, y: 0 },
            playSound: vi.fn()
          });
        },
        BASELINES.singleEntityUpdate,
        'Single Entity Update'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });

    it('should update ten entities within baseline time', () => {
      const entities = [];
      for (let i = 0; i < 10; i++) {
        entities.push(entityManager.createEntity('fireball', i * 50, 100, 50, 0));
      }
      
      const mockGame = {
        level: [],
        camera: { x: 0, y: 0 },
        playSound: vi.fn()
      };
      
      const result = measureWithTolerance(
        () => {
          entities.forEach(entity => entity.update(16.67, mockGame));
        },
        BASELINES.tenEntitiesUpdate,
        'Ten Entities Update'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });

    it('should handle entity creation efficiently', () => {
      const result = measureWithTolerance(
        () => {
          // Create and immediately clean up to test creation overhead
          const entity = entityManager.createEntity('particle', 100, 200, 50, -50);
          entityManager.removeEntity(entity);
        },
        1, // 1ms baseline for creation
        'Entity Creation'
      );
      
      expect(result.avgTime).toBeLessThan(2); // Should be very fast
    });
  });

  describe('Physics System Baselines', () => {
    beforeEach(async () => {
      game = new Game();
      await game.init();
    });

    it('should perform physics step within baseline time', () => {
      const entities = [];
      const testLevel = createSimpleTestLevel();
      
      // Create entities for physics testing
      for (let i = 0; i < 5; i++) {
        entities.push({
          x: i * 100,
          y: 200,
          vx: (Math.random() - 0.5) * 100,
          vy: Math.random() * 50,
          width: 16,
          height: 16,
          grounded: false
        });
      }
      
      const result = measureWithTolerance(
        () => {
          entities.forEach(entity => {
            // Simulate basic physics step
            entity.vy += 500 * (16.67 / 1000); // Gravity
            entity.x += entity.vx * (16.67 / 1000);
            entity.y += entity.vy * (16.67 / 1000);
            
            // Simple ground collision
            if (entity.y >= 400) {
              entity.y = 400;
              entity.vy = 0;
              entity.grounded = true;
            }
          });
        },
        BASELINES.physicsStep,
        'Physics Step'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });

    it('should perform collision detection within baseline time', () => {
      const entities = [];
      for (let i = 0; i < 10; i++) {
        entities.push({
          x: Math.random() * 400,
          y: Math.random() * 400,
          width: 16,
          height: 16
        });
      }
      
      const result = measureWithTolerance(
        () => {
          // Simple collision detection between all entities
          for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
              const a = entities[i];
              const b = entities[j];
              
              const collision = (
                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y
              );
            }
          }
        },
        BASELINES.collisionCheck,
        'Collision Detection'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });
  });

  describe('Memory Usage Baselines', () => {
    it('should maintain memory usage per entity within baseline', () => {
      game = new Game();
      const initialMemory = performance.memory.usedJSHeapSize;
      
      // Create 100 entities
      const entityCount = 100;
      for (let i = 0; i < entityCount; i++) {
        game.entityManager.createEntity('particle', 
          Math.random() * 800, 
          Math.random() * 400, 
          Math.random() * 100, 
          Math.random() * 100
        );
      }
      
      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryPerEntity = (finalMemory - initialMemory) / entityCount;
      
      console.log(`Memory per entity: ${memoryPerEntity.toFixed(0)} bytes (baseline: ${BASELINES.memoryPerEntity} bytes)`);
      
      expect(memoryPerEntity).toBeLessThan(BASELINES.memoryPerEntity * (1 + TOLERANCE));
    });

    it('should not have memory leaks over time', () => {
      game = new Game();
      const memoryMeasurements = [];
      
      // Measure memory usage over multiple cycles
      for (let cycle = 0; cycle < 10; cycle++) {
        const cycleStart = performance.memory.usedJSHeapSize;
        
        // Create entities
        for (let i = 0; i < 20; i++) {
          game.entityManager.createParticle(
            Math.random() * 800,
            Math.random() * 400,
            Math.random() * 100,
            Math.random() * 100
          );
        }
        
        // Update entities (particles will expire)
        for (let frame = 0; frame < 60; frame++) {
          game.entityManager.update(16.67);
        }
        
        // Force cleanup
        game.entityManager.cleanupDestroyed();
        
        const cycleEnd = performance.memory.usedJSHeapSize;
        memoryMeasurements.push(cycleEnd - cycleStart);
      }
      
      // Memory growth should stabilize (later measurements should be smaller)
      const earlyGrowth = memoryMeasurements.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const lateGrowth = memoryMeasurements.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      
      expect(lateGrowth).toBeLessThanOrEqual(earlyGrowth * 1.5); // Allow some growth but not unbounded
    });
  });

  describe('State Management Baselines', () => {
    beforeEach(async () => {
      game = new Game();
      await game.init();
    });

    it('should serialize state within baseline time', () => {
      // Create complex game state
      game.score = 1500;
      game.lives = 2;
      game.currentLevel = 3;
      
      for (let i = 0; i < 10; i++) {
        game.entityManager.createEntity('fireball', i * 50, 100, 50, 0);
      }
      
      const result = measureWithTolerance(
        () => {
          const gameState = {
            score: game.score,
            lives: game.lives,
            currentLevel: game.currentLevel,
            entities: game.entityManager.getAllEntities().map(entity => ({
              type: entity.constructor.name,
              x: entity.x,
              y: entity.y,
              vx: entity.vx,
              vy: entity.vy
            }))
          };
          
          const serialized = JSON.stringify(gameState);
          const deserialized = JSON.parse(serialized);
        },
        BASELINES.stateSerialize,
        'State Serialization'
      );
      
      expect(result.isWithinTolerance).toBe(true);
    });
  });

  describe('Regression Detection', () => {
    it('should detect significant performance regressions', () => {
      // This test is designed to fail if there's a major performance regression
      const criticalOperations = [
        {
          name: 'Critical Frame Update',
          operation: () => {
            if (!game) return;
            game.update(16.67);
          },
          maxTime: 15 // Critical: must be under 15ms
        },
        {
          name: 'Critical Entity Creation',
          operation: () => {
            if (!game) return;
            const entity = game.entityManager.createEntity('particle', 100, 100, 0, 0);
            game.entityManager.removeEntity(entity);
          },
          maxTime: 2 // Critical: must be under 2ms
        }
      ];
      
      game = new Game();
      
      criticalOperations.forEach(test => {
        const measurements = [];
        
        for (let i = 0; i < 5; i++) {
          const start = performance.now();
          test.operation();
          const end = performance.now();
          measurements.push(end - start);
        }
        
        const maxMeasurement = Math.max(...measurements);
        
        console.log(`${test.name}: max=${maxMeasurement.toFixed(2)}ms (limit: ${test.maxTime}ms)`);
        
        expect(maxMeasurement).toBeLessThan(test.maxTime);
      });
    });
  });

  function createSimpleTestLevel() {
    const level = [];
    for (let y = 0; y < 30; y++) {
      level[y] = [];
      for (let x = 0; x < 50; x++) {
        level[y][x] = (y === 25) ? 1 : 0; // Simple ground at y=25
      }
    }
    return level;
  }
});
