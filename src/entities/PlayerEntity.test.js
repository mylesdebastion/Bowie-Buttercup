import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PlayerEntity } from './PlayerEntity.js';

vi.mock('./PhysicsSystem.js', () => ({
  getPhysicsSystem: () => ({
    applyGravity: vi.fn(),
    checkGroundCollision: vi.fn().mockReturnValue({ grounded: false, groundY: 0 }),
    checkWallCollision: vi.fn().mockReturnValue({ collision: false }),
    checkCeilingCollision: vi.fn().mockReturnValue({ collision: false })
  })
}));

describe('PlayerEntity', () => {
  let player;
  let mockGame;
  let mockInputManager;

  beforeEach(() => {
    mockInputManager = {
      isKeyPressed: vi.fn().mockReturnValue(false),
      isJumpPressed: vi.fn().mockReturnValue(false),
      isJumpBuffered: vi.fn().mockReturnValue(false),
      clearJumpBuffer: vi.fn(),
      getMovementInput: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      handleVirtualInput: vi.fn()
    };
    
    mockGame = {
      inputManager: mockInputManager,
      level: createTestLevel(),
      camera: { x: 0, y: 0 },
      canvas: {
        context: {
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          scale: vi.fn()
        }
      },
      playSound: vi.fn(),
      createParticles: vi.fn()
    };
    
    player = new PlayerEntity(100, 300);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function createTestLevel() {
    const level = [];
    for (let y = 0; y < 30; y++) {
      level[y] = [];
      for (let x = 0; x < 50; x++) {
        level[y][x] = (y === 25) ? 1 : 0; // Ground at y=25
      }
    }
    return level;
  }

  describe('initialization', () => {
    it('should initialize with correct player properties', () => {
      expect(player.x).toBe(100);
      expect(player.y).toBe(300);
      expect(player.width).toBe(24);
      expect(player.height).toBe(28);
      expect(player.health).toBe(3);
      expect(player.maxHealth).toBe(3);
      expect(player.state).toBe('idle_sit');
      expect(player.facing).toBe(1);
      expect(player.grounded).toBe(false);
      expect(player.dodging).toBe(false);
      expect(player.invulnerable).toBe(false);
    });

    it('should set up player physics properties', () => {
      expect(player.moveSpeed).toBe(150);
      expect(player.jumpForce).toBe(250);
      expect(player.maxFallSpeed).toBe(400);
      expect(player.coyoteTime).toBe(0);
      expect(player.maxCoyoteTime).toBe(80);
    });

    it('should initialize animation properties', () => {
      expect(player.animFrame).toBe(0);
      expect(player.animTimer).toBe(0);
      expect(player.animSpeed).toBe(150);
    });
  });

  describe('movement input handling', () => {
    beforeEach(() => {
      player.grounded = true; // Start on ground
    });

    it('should handle left movement input', () => {
      mockInputManager.getMovementInput.mockReturnValue({ x: -1, y: 0 });
      
      player.handleMovement(16.67, mockGame);
      
      expect(player.vx).toBeLessThan(0);
      expect(player.facing).toBe(-1);
      expect(player.state).toContain('walk');
    });

    it('should handle right movement input', () => {
      mockInputManager.getMovementInput.mockReturnValue({ x: 1, y: 0 });
      
      player.handleMovement(16.67, mockGame);
      
      expect(player.vx).toBeGreaterThan(0);
      expect(player.facing).toBe(1);
      expect(player.state).toContain('walk');
    });

    it('should return to idle when no input', () => {
      player.state = 'walk_right';
      player.vx = 100;
      mockInputManager.getMovementInput.mockReturnValue({ x: 0, y: 0 });
      
      player.handleMovement(16.67, mockGame);
      
      expect(player.vx).toBe(0);
      expect(player.state).toBe('idle_sit');
    });

    it('should apply friction when no horizontal input', () => {
      player.vx = 100;
      mockInputManager.getMovementInput.mockReturnValue({ x: 0, y: 0 });
      
      player.handleMovement(16.67, mockGame);
      
      expect(player.vx).toBe(0); // Friction should stop movement
    });
  });

  describe('jumping mechanics', () => {
    beforeEach(() => {
      player.grounded = true;
      player.vy = 0;
    });

    it('should jump when grounded and jump pressed', () => {
      mockInputManager.isJumpPressed.mockReturnValue(true);
      
      player.handleJump(mockGame);
      
      expect(player.vy).toBe(-250); // Jump force
      expect(player.grounded).toBe(false);
      expect(player.state).toBe('jump');
      expect(mockGame.playSound).toHaveBeenCalledWith('jump');
    });

    it('should use jump buffer when recently off ground', () => {
      player.grounded = false;
      player.coyoteTime = 50; // Within coyote time window
      mockInputManager.isJumpBuffered.mockReturnValue(true);
      
      player.handleJump(mockGame);
      
      expect(player.vy).toBe(-250);
      expect(mockInputManager.clearJumpBuffer).toHaveBeenCalled();
    });

    it('should not jump when already airborne without coyote time', () => {
      player.grounded = false;
      player.coyoteTime = 0;
      mockInputManager.isJumpPressed.mockReturnValue(true);
      
      player.handleJump(mockGame);
      
      expect(player.vy).toBe(0);
      expect(mockGame.playSound).not.toHaveBeenCalled();
    });

    it('should update coyote time when airborne', () => {
      player.grounded = false;
      player.coyoteTime = 80;
      
      player.updateCoyoteTime(16.67);
      
      expect(player.coyoteTime).toBeLessThan(80);
    });

    it('should reset coyote time when grounded', () => {
      player.grounded = true;
      player.coyoteTime = 50;
      
      player.updateCoyoteTime(16.67);
      
      expect(player.coyoteTime).toBe(80); // Reset to max
    });
  });

  describe('dodge mechanics', () => {
    beforeEach(() => {
      player.grounded = true;
      player.dodging = false;
    });

    it('should start dodge when down key pressed while grounded', () => {
      mockInputManager.isKeyPressed.mockReturnValue(true);
      
      player.handleDodge(mockGame);
      
      expect(player.dodging).toBe(true);
      expect(player.state).toBe('dodge');
      expect(player.dodgeTimer).toBeGreaterThan(0);
    });

    it('should make player invulnerable while dodging', () => {
      player.dodge();
      
      expect(player.dodging).toBe(true);
      expect(player.invulnerable).toBe(true);
      expect(player.state).toBe('dodge');
    });

    it('should end dodge after duration expires', () => {
      player.dodging = true;
      player.dodgeTimer = 5; // Very low timer
      
      player.updateDodge(10); // Update for longer than timer
      
      expect(player.dodging).toBe(false);
      expect(player.invulnerable).toBe(false);
      expect(player.state).toBe('idle_sit');
    });

    it('should not start dodge when airborne', () => {
      player.grounded = false;
      mockInputManager.isKeyPressed.mockReturnValue(true);
      
      player.handleDodge(mockGame);
      
      expect(player.dodging).toBe(false);
    });
  });

  describe('health and damage', () => {
    it('should take damage when not invulnerable', () => {
      const initialHealth = player.health;
      
      player.hurt();
      
      expect(player.health).toBe(initialHealth - 1);
      expect(player.invulnerable).toBe(true);
      expect(player.invulnerabilityTimer).toBeGreaterThan(0);
    });

    it('should not take damage when invulnerable', () => {
      player.invulnerable = true;
      const initialHealth = player.health;
      
      player.hurt();
      
      expect(player.health).toBe(initialHealth);
    });

    it('should not take damage when dodging', () => {
      player.dodging = true;
      const initialHealth = player.health;
      
      player.hurt();
      
      expect(player.health).toBe(initialHealth);
    });

    it('should trigger hurt animation and sound', () => {
      player.hurt();
      
      expect(player.state).toBe('hurt');
      expect(mockGame.playSound).toHaveBeenCalledWith('hurt');
    });

    it('should heal when health is below maximum', () => {
      player.health = 1;
      
      player.heal(1);
      
      expect(player.health).toBe(2);
    });

    it('should not heal above maximum health', () => {
      player.health = 3; // Already at max
      
      player.heal(1);
      
      expect(player.health).toBe(3);
    });

    it('should be dead when health reaches zero', () => {
      player.health = 0;
      
      expect(player.isDead()).toBe(true);
    });
  });

  describe('state management', () => {
    it('should transition from idle to walk when moving', () => {
      player.state = 'idle_sit';
      player.vx = 100;
      player.facing = 1;
      
      player.updateState();
      
      expect(player.state).toBe('walk_right');
    });

    it('should transition to jump state when airborne', () => {
      player.grounded = false;
      player.vy = -150;
      
      player.updateState();
      
      expect(player.state).toBe('jump');
    });

    it('should transition to fall state when falling', () => {
      player.grounded = false;
      player.vy = 100; // Falling down
      
      player.updateState();
      
      expect(player.state).toBe('fall');
    });

    it('should maintain hurt state during invulnerability', () => {
      player.state = 'hurt';
      player.invulnerable = true;
      player.invulnerabilityTimer = 500;
      
      player.updateState();
      
      expect(player.state).toBe('hurt');
    });

    it('should maintain dodge state while dodging', () => {
      player.dodging = true;
      player.dodgeTimer = 200;
      
      player.updateState();
      
      expect(player.state).toBe('dodge');
    });
  });

  describe('animation updates', () => {
    it('should update animation frame based on state', () => {
      player.state = 'walk_right';
      player.maxAnimFrames = 4;
      player.animSpeed = 100;
      
      player.updateAnimation(150); // 1.5 frames worth
      
      expect(player.animFrame).toBe(1);
    });

    it('should use different animation speeds for different states', () => {
      player.state = 'walk_right';
      const walkSpeed = player.getAnimationSpeed();
      
      player.state = 'jump';
      const jumpSpeed = player.getAnimationSpeed();
      
      expect(walkSpeed).not.toBe(jumpSpeed);
    });

    it('should get correct sprite coordinates for current state and frame', () => {
      player.state = 'walk_right';
      player.animFrame = 2;
      
      const spriteCoords = player.getSpriteCoordinates();
      
      expect(spriteCoords.x).toBeDefined();
      expect(spriteCoords.y).toBeDefined();
      expect(spriteCoords.width).toBe(24);
      expect(spriteCoords.height).toBe(28);
    });
  });

  describe('collision response', () => {
    it('should stop horizontal movement on wall collision', () => {
      player.vx = 100;
      
      player.handleWallCollision('left');
      
      expect(player.vx).toBe(0);
    });

    it('should land on ground and reset jump state', () => {
      player.grounded = false;
      player.vy = 100; // Falling
      player.state = 'fall';
      
      player.handleGroundLanding(400); // Land at y=400
      
      expect(player.grounded).toBe(true);
      expect(player.vy).toBe(0);
      expect(player.y).toBe(400);
      expect(player.state).toBe('idle_sit');
    });

    it('should stop upward movement on ceiling collision', () => {
      player.vy = -150; // Moving up
      
      player.handleCeilingCollision();
      
      expect(player.vy).toBe(0);
    });
  });

  describe('update cycle', () => {
    it('should call all update methods in correct order', () => {
      const handleMovementSpy = vi.spyOn(player, 'handleMovement');
      const handleJumpSpy = vi.spyOn(player, 'handleJump');
      const handleDodgeSpy = vi.spyOn(player, 'handleDodge');
      const updatePhysicsSpy = vi.spyOn(player, 'updatePhysics');
      const updateStateSpy = vi.spyOn(player, 'updateState');
      
      player.update(16.67, mockGame);
      
      expect(handleMovementSpy).toHaveBeenCalled();
      expect(handleJumpSpy).toHaveBeenCalled();
      expect(handleDodgeSpy).toHaveBeenCalled();
      expect(updatePhysicsSpy).toHaveBeenCalled();
      expect(updateStateSpy).toHaveBeenCalled();
    });

    it('should update timers', () => {
      player.invulnerabilityTimer = 100;
      player.dodgeTimer = 50;
      
      player.updateTimers(16.67);
      
      expect(player.invulnerabilityTimer).toBeLessThan(100);
      expect(player.dodgeTimer).toBeLessThan(50);
    });

    it('should end invulnerability when timer expires', () => {
      player.invulnerable = true;
      player.invulnerabilityTimer = 5;
      
      player.updateTimers(10);
      
      expect(player.invulnerable).toBe(false);
      expect(player.invulnerabilityTimer).toBe(0);
    });
  });

  describe('rendering', () => {
    let mockContext;
    
    beforeEach(() => {
      mockContext = mockGame.canvas.context;
    });

    it('should render player sprite with correct coordinates', () => {
      const mockSprite = { width: 192, height: 224 };
      player.sprite = mockSprite;
      player.state = 'idle_sit';
      player.animFrame = 0;
      
      player.render(mockContext, mockGame);
      
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('should flip sprite when facing left', () => {
      player.facing = -1;
      player.sprite = { width: 192, height: 224 };
      
      player.render(mockContext, mockGame);
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.scale).toHaveBeenCalledWith(-1, 1);
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should apply invulnerability visual effect', () => {
      player.invulnerable = true;
      player.sprite = { width: 192, height: 224 };
      
      player.render(mockContext, mockGame);
      
      // Should apply some visual effect for invulnerability
      expect(mockContext.save).toHaveBeenCalled();
    });

    it('should not render when inactive', () => {
      player.active = false;
      
      player.render(mockContext, mockGame);
      
      expect(mockContext.drawImage).not.toHaveBeenCalled();
    });
  });

  describe('debug information', () => {
    it('should provide debug information', () => {
      player.vx = 75;
      player.vy = -125;
      player.state = 'jump';
      player.grounded = false;
      
      const debugInfo = player.getDebugInfo();
      
      expect(debugInfo.position).toEqual({ x: 100, y: 300 });
      expect(debugInfo.velocity).toEqual({ vx: 75, vy: -125 });
      expect(debugInfo.state).toBe('jump');
      expect(debugInfo.grounded).toBe(false);
      expect(debugInfo.health).toBe(3);
    });
  });
});
