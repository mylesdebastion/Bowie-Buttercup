import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Entity } from './Entity.js';

describe('Entity', () => {
  let entity;
  let mockGame;

  beforeEach(() => {
    mockGame = {
      level: [],
      camera: { x: 0, y: 0 },
      canvas: {
        context: {
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          strokeRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn()
        }
      }
    };
    
    entity = new Entity({
      x: 100,
      y: 200,
      width: 32,
      height: 32,
      vx: 50,
      vy: -100
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided properties', () => {
      expect(entity.x).toBe(100);
      expect(entity.y).toBe(200);
      expect(entity.width).toBe(32);
      expect(entity.height).toBe(32);
      expect(entity.vx).toBe(50);
      expect(entity.vy).toBe(-100);
    });

    it('should initialize with default values when not provided', () => {
      const defaultEntity = new Entity();
      
      expect(defaultEntity.x).toBe(0);
      expect(defaultEntity.y).toBe(0);
      expect(defaultEntity.width).toBe(16);
      expect(defaultEntity.height).toBe(16);
      expect(defaultEntity.vx).toBe(0);
      expect(defaultEntity.vy).toBe(0);
      expect(defaultEntity.active).toBe(true);
      expect(defaultEntity.destroyed).toBe(false);
    });

    it('should set up animation properties', () => {
      expect(entity.animFrame).toBe(0);
      expect(entity.animTimer).toBe(0);
      expect(entity.animSpeed).toBe(100);
      expect(entity.facing).toBe(1);
    });
  });

  describe('position and movement', () => {
    it('should update position based on velocity', () => {
      const deltaTime = 16.67; // ~60 FPS
      
      entity.updatePosition(deltaTime);
      
      const expectedX = 100 + (50 * deltaTime / 1000);
      const expectedY = 200 + (-100 * deltaTime / 1000);
      
      expect(entity.x).toBeCloseTo(expectedX, 2);
      expect(entity.y).toBeCloseTo(expectedY, 2);
    });

    it('should set position directly', () => {
      entity.setPosition(300, 400);
      
      expect(entity.x).toBe(300);
      expect(entity.y).toBe(400);
    });

    it('should set velocity', () => {
      entity.setVelocity(75, -150);
      
      expect(entity.vx).toBe(75);
      expect(entity.vy).toBe(-150);
    });

    it('should add velocity', () => {
      entity.addVelocity(25, 50);
      
      expect(entity.vx).toBe(75); // 50 + 25
      expect(entity.vy).toBe(-50); // -100 + 50
    });

    it('should apply friction to velocity', () => {
      entity.applyFriction(0.8);
      
      expect(entity.vx).toBe(40); // 50 * 0.8
      expect(entity.vy).toBe(-80); // -100 * 0.8
    });
  });

  describe('bounds and collision', () => {
    it('should calculate bounding box', () => {
      const bounds = entity.getBounds();
      
      expect(bounds.left).toBe(100);
      expect(bounds.right).toBe(132); // 100 + 32
      expect(bounds.top).toBe(200);
      expect(bounds.bottom).toBe(232); // 200 + 32
      expect(bounds.centerX).toBe(116); // 100 + 16
      expect(bounds.centerY).toBe(216); // 200 + 16
    });

    it('should check collision with another entity', () => {
      const otherEntity = new Entity({
        x: 120,
        y: 220,
        width: 32,
        height: 32
      });
      
      const isColliding = entity.checkCollision(otherEntity);
      
      expect(isColliding).toBe(true);
    });

    it('should detect no collision when entities are separate', () => {
      const otherEntity = new Entity({
        x: 200,
        y: 300,
        width: 32,
        height: 32
      });
      
      const isColliding = entity.checkCollision(otherEntity);
      
      expect(isColliding).toBe(false);
    });

    it('should calculate distance to another entity', () => {
      const otherEntity = new Entity({
        x: 103,
        y: 204,
        width: 32,
        height: 32
      });
      
      const distance = entity.getDistanceTo(otherEntity);
      
      expect(distance).toBe(5); // 3² + 4² = 5²
    });
  });

  describe('animation', () => {
    it('should update animation frame over time', () => {
      entity.animSpeed = 100; // 100ms per frame
      
      entity.updateAnimation(150); // 1.5 frames worth of time
      
      expect(entity.animTimer).toBe(50); // Remainder after one frame
      expect(entity.animFrame).toBe(1);
    });

    it('should cycle animation frames', () => {
      entity.animSpeed = 100;
      entity.maxAnimFrames = 3;
      entity.animFrame = 2;
      
      entity.updateAnimation(100); // One full frame
      
      expect(entity.animFrame).toBe(0); // Cycled back to start
    });

    it('should handle different animation speeds', () => {
      entity.animSpeed = 200; // Slower animation
      
      entity.updateAnimation(100); // Half a frame
      
      expect(entity.animFrame).toBe(0); // Should not advance yet
      expect(entity.animTimer).toBe(100);
    });

    it('should set animation frame directly', () => {
      entity.setAnimationFrame(5);
      
      expect(entity.animFrame).toBe(5);
      expect(entity.animTimer).toBe(0); // Reset timer
    });
  });

  describe('facing direction', () => {
    it('should update facing direction based on velocity', () => {
      entity.vx = 100; // Moving right
      entity.updateFacing();
      
      expect(entity.facing).toBe(1);
      
      entity.vx = -100; // Moving left
      entity.updateFacing();
      
      expect(entity.facing).toBe(-1);
    });

    it('should not change facing when velocity is zero', () => {
      entity.facing = 1;
      entity.vx = 0;
      
      entity.updateFacing();
      
      expect(entity.facing).toBe(1); // Should remain unchanged
    });
  });

  describe('lifecycle management', () => {
    it('should activate and deactivate entity', () => {
      entity.deactivate();
      expect(entity.active).toBe(false);
      
      entity.activate();
      expect(entity.active).toBe(true);
    });

    it('should mark entity for destruction', () => {
      entity.destroy();
      
      expect(entity.destroyed).toBe(true);
      expect(entity.active).toBe(false);
    });

    it('should check if entity is alive', () => {
      expect(entity.isAlive()).toBe(true);
      
      entity.destroy();
      expect(entity.isAlive()).toBe(false);
      
      entity.destroyed = false;
      entity.deactivate();
      expect(entity.isAlive()).toBe(false);
    });
  });

  describe('rendering', () => {
    let mockContext;
    
    beforeEach(() => {
      mockContext = mockGame.canvas.context;
    });

    it('should render entity as colored rectangle when no sprite', () => {
      entity.color = '#ff0000';
      
      entity.render(mockContext, mockGame);
      
      expect(mockContext.fillRect).toHaveBeenCalledWith(100, 200, 32, 32);
    });

    it('should render sprite when available', () => {
      const mockSprite = { width: 64, height: 64 };
      entity.sprite = mockSprite;
      entity.spriteX = 0;
      entity.spriteY = 0;
      entity.spriteWidth = 32;
      entity.spriteHeight = 32;
      
      entity.render(mockContext, mockGame);
      
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockSprite, 0, 0, 32, 32, 100, 200, 32, 32
      );
    });

    it('should apply camera offset when rendering', () => {
      mockGame.camera.x = 50;
      mockGame.camera.y = 25;
      entity.color = '#00ff00';
      
      entity.render(mockContext, mockGame);
      
      expect(mockContext.fillRect).toHaveBeenCalledWith(50, 175, 32, 32);
    });

    it('should not render when inactive', () => {
      entity.deactivate();
      entity.color = '#0000ff';
      
      entity.render(mockContext, mockGame);
      
      expect(mockContext.fillRect).not.toHaveBeenCalled();
      expect(mockContext.drawImage).not.toHaveBeenCalled();
    });

    it('should flip sprite based on facing direction', () => {
      const mockSprite = { width: 64, height: 64 };
      entity.sprite = mockSprite;
      entity.facing = -1; // Facing left
      
      entity.render(mockContext, mockGame);
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.translate).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });
  });

  describe('update cycle', () => {
    it('should call all update methods in sequence', () => {
      const updatePositionSpy = vi.spyOn(entity, 'updatePosition');
      const updateAnimationSpy = vi.spyOn(entity, 'updateAnimation');
      const updateFacingSpy = vi.spyOn(entity, 'updateFacing');
      
      entity.update(16.67, mockGame);
      
      expect(updatePositionSpy).toHaveBeenCalledWith(16.67);
      expect(updateAnimationSpy).toHaveBeenCalledWith(16.67);
      expect(updateFacingSpy).toHaveBeenCalled();
    });

    it('should not update when inactive', () => {
      entity.deactivate();
      const updatePositionSpy = vi.spyOn(entity, 'updatePosition');
      
      entity.update(16.67, mockGame);
      
      expect(updatePositionSpy).not.toHaveBeenCalled();
    });
  });

  describe('custom properties', () => {
    it('should support custom properties', () => {
      const customEntity = new Entity({
        x: 0,
        y: 0,
        customProperty: 'test',
        health: 100
      });
      
      expect(customEntity.customProperty).toBe('test');
      expect(customEntity.health).toBe(100);
    });

    it('should allow property modification', () => {
      entity.health = 75;
      entity.damage = 10;
      
      expect(entity.health).toBe(75);
      expect(entity.damage).toBe(10);
    });
  });

  describe('serialization', () => {
    it('should serialize entity state', () => {
      entity.health = 100;
      entity.customProp = 'test';
      
      const serialized = entity.serialize();
      
      expect(serialized).toMatchObject({
        x: 100,
        y: 200,
        width: 32,
        height: 32,
        vx: 50,
        vy: -100,
        active: true,
        destroyed: false,
        health: 100,
        customProp: 'test'
      });
    });

    it('should deserialize entity state', () => {
      const state = {
        x: 300,
        y: 400,
        vx: 25,
        vy: 75,
        health: 50,
        facing: -1
      };
      
      entity.deserialize(state);
      
      expect(entity.x).toBe(300);
      expect(entity.y).toBe(400);
      expect(entity.vx).toBe(25);
      expect(entity.vy).toBe(75);
      expect(entity.health).toBe(50);
      expect(entity.facing).toBe(-1);
    });
  });
});
