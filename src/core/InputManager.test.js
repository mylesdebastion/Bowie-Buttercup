import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InputManager } from './InputManager.js';

describe('InputManager', () => {
  let inputManager;
  let mockCanvas;

  beforeEach(() => {
    // Mock canvas element
    mockCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 400
      })
    };
    
    // Mock window
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    // Mock document
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    inputManager = new InputManager(mockCanvas);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(inputManager.keys).toEqual({});
      expect(inputManager.mouse.x).toBe(0);
      expect(inputManager.mouse.y).toBe(0);
      expect(inputManager.mouse.pressed).toBe(false);
      expect(inputManager.touches).toEqual([]);
    });

    it('should set up event listeners on init', () => {
      inputManager.init();
      
      expect(global.document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(global.document.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });

    it('should set up touch event listeners', () => {
      inputManager.init();
      
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
    });
  });

  describe('keyboard input', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should register key press', () => {
      const keyEvent = new KeyboardEvent('keydown', { code: 'Space' });
      inputManager.handleKeyDown(keyEvent);
      
      expect(inputManager.keys['Space']).toBe(true);
    });

    it('should register key release', () => {
      inputManager.keys['Space'] = true;
      
      const keyEvent = new KeyboardEvent('keyup', { code: 'Space' });
      inputManager.handleKeyUp(keyEvent);
      
      expect(inputManager.keys['Space']).toBe(false);
    });

    it('should check if key is currently pressed', () => {
      inputManager.keys['ArrowLeft'] = true;
      
      expect(inputManager.isKeyPressed('ArrowLeft')).toBe(true);
      expect(inputManager.isKeyPressed('ArrowRight')).toBe(false);
    });

    it('should handle jump input with buffer', () => {
      const jumpEvent = new KeyboardEvent('keydown', { code: 'Space' });
      inputManager.handleKeyDown(jumpEvent);
      
      expect(inputManager.isJumpPressed()).toBe(true);
      expect(inputManager.isJumpBuffered()).toBe(true);
    });

    it('should clear jump buffer', () => {
      inputManager.jumpBuffer = 50;
      inputManager.clearJumpBuffer();
      
      expect(inputManager.jumpBuffer).toBe(0);
      expect(inputManager.isJumpBuffered()).toBe(false);
    });

    it('should handle multiple key mappings', () => {
      // Test WASD keys
      const wEvent = new KeyboardEvent('keydown', { code: 'KeyW' });
      const aEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
      const sEvent = new KeyboardEvent('keydown', { code: 'KeyS' });
      const dEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
      
      inputManager.handleKeyDown(wEvent);
      inputManager.handleKeyDown(aEvent);
      inputManager.handleKeyDown(sEvent);
      inputManager.handleKeyDown(dEvent);
      
      expect(inputManager.isKeyPressed('KeyW')).toBe(true);
      expect(inputManager.isKeyPressed('KeyA')).toBe(true);
      expect(inputManager.isKeyPressed('KeyS')).toBe(true);
      expect(inputManager.isKeyPressed('KeyD')).toBe(true);
    });
  });

  describe('mouse input', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should track mouse position', () => {
      const mouseEvent = {
        clientX: 150,
        clientY: 200,
        preventDefault: vi.fn()
      };
      
      inputManager.handleMouseMove(mouseEvent);
      
      expect(inputManager.mouse.x).toBe(150);
      expect(inputManager.mouse.y).toBe(200);
    });

    it('should register mouse press', () => {
      const mouseEvent = {
        clientX: 100,
        clientY: 100,
        button: 0,
        preventDefault: vi.fn()
      };
      
      inputManager.handleMouseDown(mouseEvent);
      
      expect(inputManager.mouse.pressed).toBe(true);
      expect(inputManager.mouse.button).toBe(0);
    });

    it('should register mouse release', () => {
      inputManager.mouse.pressed = true;
      
      const mouseEvent = {
        clientX: 100,
        clientY: 100,
        button: 0,
        preventDefault: vi.fn()
      };
      
      inputManager.handleMouseUp(mouseEvent);
      
      expect(inputManager.mouse.pressed).toBe(false);
    });

    it('should calculate relative mouse position', () => {
      mockCanvas.getBoundingClientRect.mockReturnValue({
        left: 50,
        top: 25,
        width: 800,
        height: 400
      });
      
      const mouseEvent = {
        clientX: 150, // 100 relative to canvas
        clientY: 125, // 100 relative to canvas
        preventDefault: vi.fn()
      };
      
      inputManager.handleMouseMove(mouseEvent);
      
      expect(inputManager.mouse.x).toBe(100);
      expect(inputManager.mouse.y).toBe(100);
    });
  });

  describe('touch input', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should register touch start', () => {
      const touchEvent = {
        touches: [{
          clientX: 200,
          clientY: 300,
          identifier: 0
        }],
        preventDefault: vi.fn()
      };
      
      inputManager.handleTouchStart(touchEvent);
      
      expect(inputManager.touches).toHaveLength(1);
      expect(inputManager.touches[0].x).toBe(200);
      expect(inputManager.touches[0].y).toBe(300);
      expect(inputManager.touches[0].id).toBe(0);
    });

    it('should register touch end', () => {
      inputManager.touches = [{ id: 0, x: 200, y: 300 }];
      
      const touchEvent = {
        changedTouches: [{ identifier: 0 }],
        preventDefault: vi.fn()
      };
      
      inputManager.handleTouchEnd(touchEvent);
      
      expect(inputManager.touches).toHaveLength(0);
    });

    it('should track touch movement', () => {
      inputManager.touches = [{ id: 0, x: 200, y: 300 }];
      
      const touchEvent = {
        touches: [{
          clientX: 250,
          clientY: 350,
          identifier: 0
        }],
        preventDefault: vi.fn()
      };
      
      inputManager.handleTouchMove(touchEvent);
      
      expect(inputManager.touches[0].x).toBe(250);
      expect(inputManager.touches[0].y).toBe(350);
    });

    it('should handle multiple simultaneous touches', () => {
      const touchEvent = {
        touches: [
          { clientX: 100, clientY: 200, identifier: 0 },
          { clientX: 300, clientY: 400, identifier: 1 }
        ],
        preventDefault: vi.fn()
      };
      
      inputManager.handleTouchStart(touchEvent);
      
      expect(inputManager.touches).toHaveLength(2);
      expect(inputManager.touches[0].id).toBe(0);
      expect(inputManager.touches[1].id).toBe(1);
    });
  });

  describe('input normalization', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should provide normalized movement input', () => {
      // Simulate left arrow key
      inputManager.keys['ArrowLeft'] = true;
      
      const movement = inputManager.getMovementInput();
      
      expect(movement.x).toBe(-1);
      expect(movement.y).toBe(0);
    });

    it('should handle simultaneous directional inputs', () => {
      inputManager.keys['ArrowLeft'] = true;
      inputManager.keys['ArrowUp'] = true;
      
      const movement = inputManager.getMovementInput();
      
      expect(movement.x).toBe(-1);
      expect(movement.y).toBe(-1);
    });

    it('should prioritize newer input when conflicting', () => {
      inputManager.keys['ArrowLeft'] = true;
      inputManager.keys['ArrowRight'] = true;
      
      // Should return the last pressed key's direction
      const movement = inputManager.getMovementInput();
      
      expect(Math.abs(movement.x)).toBe(1);
    });
  });

  describe('input buffering', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should buffer jump input', () => {
      const jumpEvent = new KeyboardEvent('keydown', { code: 'Space' });
      inputManager.handleKeyDown(jumpEvent);
      
      expect(inputManager.jumpBuffer).toBeGreaterThan(0);
    });

    it('should decrease jump buffer over time', () => {
      inputManager.jumpBuffer = 100;
      
      inputManager.update(16.67); // One frame
      
      expect(inputManager.jumpBuffer).toBeLessThan(100);
    });

    it('should expire jump buffer after timeout', () => {
      inputManager.jumpBuffer = 10;
      
      inputManager.update(20); // More than buffer time
      
      expect(inputManager.jumpBuffer).toBe(0);
      expect(inputManager.isJumpBuffered()).toBe(false);
    });
  });

  describe('virtual controls', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should handle virtual button press', () => {
      inputManager.handleVirtualInput('jump', true);
      
      expect(inputManager.isJumpPressed()).toBe(true);
    });

    it('should handle virtual directional input', () => {
      inputManager.handleVirtualInput('left', true);
      
      expect(inputManager.getMovementInput().x).toBe(-1);
    });

    it('should release virtual input', () => {
      inputManager.handleVirtualInput('right', true);
      inputManager.handleVirtualInput('right', false);
      
      expect(inputManager.getMovementInput().x).toBe(0);
    });
  });

  describe('input state queries', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should report any key pressed state', () => {
      expect(inputManager.isAnyKeyPressed()).toBe(false);
      
      inputManager.keys['Space'] = true;
      
      expect(inputManager.isAnyKeyPressed()).toBe(true);
    });

    it('should report touch active state', () => {
      expect(inputManager.isTouchActive()).toBe(false);
      
      inputManager.touches = [{ id: 0, x: 100, y: 100 }];
      
      expect(inputManager.isTouchActive()).toBe(true);
    });

    it('should get primary touch position', () => {
      inputManager.touches = [
        { id: 0, x: 150, y: 200 },
        { id: 1, x: 300, y: 400 }
      ];
      
      const primaryTouch = inputManager.getPrimaryTouch();
      
      expect(primaryTouch.x).toBe(150);
      expect(primaryTouch.y).toBe(200);
    });
  });

  describe('event prevention', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should prevent default keyboard events', () => {
      const keyEvent = {
        code: 'Space',
        preventDefault: vi.fn()
      };
      
      inputManager.handleKeyDown(keyEvent);
      
      expect(keyEvent.preventDefault).toHaveBeenCalled();
    });

    it('should prevent default touch events', () => {
      const touchEvent = {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 }],
        preventDefault: vi.fn()
      };
      
      inputManager.handleTouchStart(touchEvent);
      
      expect(touchEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      inputManager.init();
    });

    it('should remove all event listeners on destroy', () => {
      inputManager.destroy();
      
      expect(global.document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(global.document.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(mockCanvas.removeEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
    });

    it('should clear all input state on destroy', () => {
      inputManager.keys['Space'] = true;
      inputManager.touches = [{ id: 0, x: 100, y: 100 }];
      
      inputManager.destroy();
      
      expect(inputManager.keys).toEqual({});
      expect(inputManager.touches).toEqual([]);
    });
  });
});
