import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PhysicsSystem } from '../../src/entities/PhysicsSystem.js';
import { PlayerEntity } from '../../src/entities/PlayerEntity.js';
import { FireballEntity } from '../../src/entities/FireballEntity.js';
import { MouseEntity } from '../../src/entities/MouseEntity.js';

describe('Physics System Integration Tests', () => {
  let physicsSystem;
  let testLevel;
  let player;
  let entities;

  beforeEach(() => {
    // Create test level with platforms and obstacles
    testLevel = createTestLevel();
    physicsSystem = new PhysicsSystem();
    physicsSystem.setLevel(testLevel);
    
    // Create test entities
    player = new PlayerEntity(100, 200);
    entities = {
      fireballs: [],
      mice: [],
      particles: []
    };
    
    // Mock game context
    global.mockGame = {
      level: testLevel,
      camera: { x: 0, y: 0 },
      playSound: vi.fn(),
      createParticles: vi.fn(),
      ejectTreats: vi.fn(),
      score: 0,
      treatsCollected: 0
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createTestLevel() {
    const level = [];
    for (let y = 0; y < 30; y++) {
      level[y] = [];
      for (let x = 0; x < 50; x++) {
        if (y === 25) {
          level[y][x] = 1; // Ground platform
        } else if (y === 20 && x >= 10 && x <= 15) {
          level[y][x] = 1; // Floating platform
        } else if (y >= 26 && x === 25) {
          level[y][x] = 1; // Wall
        } else if (y >= 28) {
          level[y][x] = 3; // Pit
        } else {
          level[y][x] = 0; // Air
        }
      }
    }
    return level;
  }

  describe('Gravity and Ground Collision Integration', () => {
    it('should apply gravity and land player on ground', () => {
      player.x = 100;
      player.y = 100; // High above ground
      player.vy = 0;
      player.grounded = false;
      
      // Simulate falling for several frames
      for (let i = 0; i < 30; i++) {
        physicsSystem.applyGravity(player, 16.67);
        const collision = physicsSystem.checkGroundCollision(player, testLevel);
        
        if (collision.grounded) {
          player.y = collision.groundY - player.height;
          player.vy = 0;
          player.grounded = true;
          break;
        }
        
        player.y += player.vy * (16.67 / 1000);
      }
      
      expect(player.grounded).toBe(true);
      expect(player.vy).toBe(0);
      expect(player.y).toBeCloseTo(25 * 16 - player.height, 1);
    });

    it('should handle player jumping and landing', () => {
      // Start player on ground
      player.x = 100;
      player.y = 25 * 16 - player.height;
      player.grounded = true;
      player.vy = 0;
      
      // Jump
      player.vy = -250;
      player.grounded = false;
      
      let maxHeight = player.y;
      let frameCount = 0;
      
      // Simulate jump arc
      while (frameCount < 120 && !player.grounded) { // Max 2 seconds
        physicsSystem.applyGravity(player, 16.67);
        player.y += player.vy * (16.67 / 1000);
        
        if (player.y < maxHeight) {
          maxHeight = player.y;
        }
        
        const collision = physicsSystem.checkGroundCollision(player, testLevel);
        if (collision.grounded) {
          player.y = collision.groundY - player.height;
          player.vy = 0;
          player.grounded = true;
        }
        
        frameCount++;
      }
      
      expect(player.grounded).toBe(true);
      expect(maxHeight).toBeLessThan(25 * 16 - player.height); // Should have jumped up
      expect(player.y).toBeCloseTo(25 * 16 - player.height, 1); // Should land back on ground
    });

    it('should handle player landing on floating platform', () => {
      // Position player above floating platform
      player.x = 12 * 16; // Center of platform (x: 10-15)
      player.y = 150; // Above platform
      player.vy = 100; // Falling
      player.grounded = false;
      
      // Simulate falling
      for (let i = 0; i < 20; i++) {
        physicsSystem.applyGravity(player, 16.67);
        player.y += player.vy * (16.67 / 1000);
        
        const collision = physicsSystem.checkGroundCollision(player, testLevel);
        if (collision.grounded) {
          player.y = collision.groundY - player.height;
          player.vy = 0;
          player.grounded = true;
          break;
        }
      }
      
      expect(player.grounded).toBe(true);
      expect(player.y).toBeCloseTo(20 * 16 - player.height, 1); // Should land on platform
    });
  });

  describe('Wall Collision Integration', () => {
    it('should stop player movement when hitting wall', () => {
      // Position player next to wall
      player.x = 24 * 16; // Just before wall at x=25
      player.y = 25 * 16 - player.height; // On ground
      player.vx = 100; // Moving right toward wall
      player.grounded = true;
      
      // Simulate movement toward wall
      for (let i = 0; i < 10; i++) {
        const oldX = player.x;
        player.x += player.vx * (16.67 / 1000);
        
        const collision = physicsSystem.checkWallCollision(player, testLevel);
        if (collision.collision) {
          player.x = oldX; // Reset position
          player.vx = 0; // Stop movement
          break;
        }
      }
      
      expect(player.vx).toBe(0);
      expect(player.x).toBeLessThan(25 * 16); // Should be stopped before wall
    });

    it('should allow player to jump over wall', () => {
      // Position player next to wall
      player.x = 24 * 16;
      player.y = 25 * 16 - player.height;
      player.vx = 50; // Slower horizontal speed
      player.vy = -250; // Jump force
      player.grounded = false;
      
      let clearedWall = false;
      
      // Simulate jump over wall
      for (let i = 0; i < 60; i++) {
        physicsSystem.applyGravity(player, 16.67);
        player.x += player.vx * (16.67 / 1000);
        player.y += player.vy * (16.67 / 1000);
        
        // Check if player cleared the wall
        if (player.x > 25 * 16 + 16 && player.y < 25 * 16) {
          clearedWall = true;
        }
        
        // Check ground collision
        const groundCollision = physicsSystem.checkGroundCollision(player, testLevel);
        if (groundCollision.grounded) {
          player.y = groundCollision.groundY - player.height;
          player.vy = 0;
          player.grounded = true;
          break;
        }
      }
      
      expect(clearedWall).toBe(true);
      expect(player.x).toBeGreaterThan(25 * 16 + 16); // Should be past the wall
    });
  });

  describe('Entity Physics Integration', () => {
    it('should simulate fireball trajectory physics', () => {
      const fireball = new FireballEntity(100, 200, 150, 0); // Horizontal fireball
      
      const trajectory = [];
      
      // Simulate fireball flight
      for (let i = 0; i < 60; i++) {
        physicsSystem.applyGravity(fireball, 16.67);
        fireball.x += fireball.vx * (16.67 / 1000);
        fireball.y += fireball.vy * (16.67 / 1000);
        
        trajectory.push({ x: fireball.x, y: fireball.y, frame: i });
        
        // Stop if hits ground
        if (fireball.y >= 25 * 16) {
          break;
        }
      }
      
      expect(trajectory.length).toBeGreaterThan(1);
      expect(trajectory[0].x).toBe(100);
      expect(trajectory[0].y).toBe(200);
      expect(trajectory[trajectory.length - 1].x).toBeGreaterThan(100); // Moved horizontally
      expect(trajectory[trajectory.length - 1].y).toBeGreaterThan(200); // Fell due to gravity
    });

    it('should handle mouse entity ground collision', () => {
      const mouse = new MouseEntity(200, 100); // Above ground
      mouse.vy = 100; // Falling
      
      // Simulate mouse falling to ground
      for (let i = 0; i < 30; i++) {
        physicsSystem.applyGravity(mouse, 16.67);
        mouse.y += mouse.vy * (16.67 / 1000);
        
        const collision = physicsSystem.checkGroundCollision(mouse, testLevel);
        if (collision.grounded) {
          mouse.y = collision.groundY - mouse.height;
          mouse.vy = 0;
          mouse.grounded = true;
          break;
        }
      }
      
      expect(mouse.grounded).toBe(true);
      expect(mouse.vy).toBe(0);
      expect(mouse.y).toBeCloseTo(25 * 16 - mouse.height, 1);
    });
  });

  describe('Collision Detection Integration', () => {
    it('should detect player-fireball collision', () => {
      const fireball = new FireballEntity(100, 200, 0, 0);
      player.x = 100;
      player.y = 200;
      
      const collision = physicsSystem.checkEntityCollision(player, fireball);
      
      expect(collision).toBeTruthy();
      expect(collision.type).toBe('overlap');
    });

    it('should detect player catching mouse', () => {
      const mouse = new MouseEntity(100, 200);
      player.x = 105; // Slightly overlapping
      player.y = 205;
      player.vx = 120; // Moving fast enough to catch
      
      const canCatch = mouse.checkCaught(player);
      
      expect(canCatch).toBe(true);
    });

    it('should handle multiple entity collisions simultaneously', () => {
      const fireball1 = new FireballEntity(100, 200, 0, 0);
      const fireball2 = new FireballEntity(105, 205, 0, 0);
      const mouse = new MouseEntity(110, 210);
      
      player.x = 102;
      player.y = 202;
      player.vx = 100;
      
      const collisions = {
        fireball1: physicsSystem.checkEntityCollision(player, fireball1),
        fireball2: physicsSystem.checkEntityCollision(player, fireball2),
        mouseCatch: mouse.checkCaught(player)
      };
      
      expect(collisions.fireball1).toBeTruthy();
      expect(collisions.fireball2).toBeTruthy();
      expect(collisions.mouseCatch).toBe(true);
    });
  });

  describe('Physics Performance Integration', () => {
    it('should maintain performance with many physics entities', () => {
      // Create many entities
      const entities = [];
      for (let i = 0; i < 100; i++) {
        entities.push(new FireballEntity(
          Math.random() * 800,
          Math.random() * 200,
          (Math.random() - 0.5) * 200,
          Math.random() * 100
        ));
      }
      
      const startTime = performance.now();
      
      // Simulate physics for 60 frames
      for (let frame = 0; frame < 60; frame++) {
        entities.forEach(entity => {
          physicsSystem.applyGravity(entity, 16.67);
          entity.x += entity.vx * (16.67 / 1000);
          entity.y += entity.vy * (16.67 / 1000);
          
          // Check ground collision
          const collision = physicsSystem.checkGroundCollision(entity, testLevel);
          if (collision.grounded) {
            entity.y = collision.groundY - entity.height;
            entity.vy = 0;
          }
        });
      }
      
      const endTime = performance.now();
      const avgFrameTime = (endTime - startTime) / 60;
      
      expect(avgFrameTime).toBeLessThan(5); // Should be under 5ms per frame
    });

    it('should handle physics edge cases without errors', () => {
      // Test edge cases
      const edgeCases = [
        { x: -100, y: -100, vx: 1000, vy: 1000 }, // Outside level bounds
        { x: 5000, y: 5000, vx: -1000, vy: -1000 }, // Far outside bounds
        { x: 0, y: 0, vx: 0, vy: 0 }, // Corner of level
        { x: 800, y: 480, vx: 0, vy: 0 } // Other corner
      ];
      
      edgeCases.forEach((testCase, index) => {
        const entity = new FireballEntity(testCase.x, testCase.y, testCase.vx, testCase.vy);
        
        expect(() => {
          for (let i = 0; i < 10; i++) {
            physicsSystem.applyGravity(entity, 16.67);
            physicsSystem.checkGroundCollision(entity, testLevel);
            physicsSystem.checkWallCollision(entity, testLevel);
            
            entity.x += entity.vx * (16.67 / 1000);
            entity.y += entity.vy * (16.67 / 1000);
          }
        }).not.toThrow(`Edge case ${index} should not throw`);
      });
    });
  });

  describe('Complex Physics Scenarios', () => {
    it('should handle player bouncing off multiple surfaces', () => {
      // Position player to bounce between surfaces
      player.x = 200;
      player.y = 100;
      player.vx = 150;
      player.vy = 100;
      player.grounded = false;
      
      const trajectory = [];
      let bounces = 0;
      
      for (let i = 0; i < 200 && bounces < 5; i++) {
        physicsSystem.applyGravity(player, 16.67);
        
        const oldVx = player.vx;
        const oldVy = player.vy;
        
        player.x += player.vx * (16.67 / 1000);
        player.y += player.vy * (16.67 / 1000);
        
        // Check collisions and bounce
        const wallCollision = physicsSystem.checkWallCollision(player, testLevel);
        if (wallCollision.collision) {
          player.vx = -player.vx * 0.7; // Bounce with energy loss
          bounces++;
        }
        
        const groundCollision = physicsSystem.checkGroundCollision(player, testLevel);
        if (groundCollision.grounded) {
          player.y = groundCollision.groundY - player.height;
          player.vy = -player.vy * 0.7; // Bounce with energy loss
          bounces++;
        }
        
        trajectory.push({ x: player.x, y: player.y, vx: player.vx, vy: player.vy });
      }
      
      expect(bounces).toBeGreaterThan(0);
      expect(trajectory.length).toBeGreaterThan(10);
    });

    it('should simulate realistic falling object physics', () => {
      const fallingObject = new FireballEntity(400, 50, 0, 0);
      const fallData = [];
      
      // Simulate realistic fall with air resistance
      while (fallingObject.y < 400 && fallData.length < 120) {
        physicsSystem.applyGravity(fallingObject, 16.67);
        
        // Simple air resistance
        fallingObject.vy *= 0.999;
        
        fallingObject.y += fallingObject.vy * (16.67 / 1000);
        
        fallData.push({
          time: fallData.length * 16.67,
          position: fallingObject.y,
          velocity: fallingObject.vy
        });
      }
      
      // Check that object accelerated initially
      expect(fallData[10].velocity).toBeGreaterThan(fallData[0].velocity);
      
      // Check that it eventually reached terminal velocity-like behavior
      const lateVelocities = fallData.slice(-10).map(d => d.velocity);
      const velocityVariation = Math.max(...lateVelocities) - Math.min(...lateVelocities);
      expect(velocityVariation).toBeLessThan(50); // Should be relatively stable
    });
  });

  describe('Physics System State Consistency', () => {
    it('should maintain consistent state across save/load cycles', () => {
      // Set up initial state
      player.x = 150;
      player.y = 200;
      player.vx = 75;
      player.vy = -125;
      player.grounded = false;
      
      // Run physics for some time
      for (let i = 0; i < 30; i++) {
        physicsSystem.applyGravity(player, 16.67);
        player.x += player.vx * (16.67 / 1000);
        player.y += player.vy * (16.67 / 1000);
      }
      
      // Save state
      const savedState = {
        x: player.x,
        y: player.y,
        vx: player.vx,
        vy: player.vy,
        grounded: player.grounded
      };
      
      // Create new player and restore state
      const restoredPlayer = new PlayerEntity(0, 0);
      restoredPlayer.x = savedState.x;
      restoredPlayer.y = savedState.y;
      restoredPlayer.vx = savedState.vx;
      restoredPlayer.vy = savedState.vy;
      restoredPlayer.grounded = savedState.grounded;
      
      // Continue physics simulation
      const originalNextState = { ...player };
      physicsSystem.applyGravity(player, 16.67);
      player.x += player.vx * (16.67 / 1000);
      player.y += player.vy * (16.67 / 1000);
      
      const restoredNextState = { ...restoredPlayer };
      physicsSystem.applyGravity(restoredPlayer, 16.67);
      restoredPlayer.x += restoredPlayer.vx * (16.67 / 1000);
      restoredPlayer.y += restoredPlayer.vy * (16.67 / 1000);
      
      // States should be identical
      expect(player.x).toBeCloseTo(restoredPlayer.x, 5);
      expect(player.y).toBeCloseTo(restoredPlayer.y, 5);
      expect(player.vx).toBeCloseTo(restoredPlayer.vx, 5);
      expect(player.vy).toBeCloseTo(restoredPlayer.vy, 5);
    });
  });
});
