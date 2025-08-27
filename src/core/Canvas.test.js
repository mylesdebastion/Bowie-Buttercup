import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Canvas } from './Canvas.js';

describe('Canvas', () => {
  let canvas;
  let mockCanvasElement;
  let mockContext;

  beforeEach(() => {
    // Mock canvas element
    mockCanvasElement = {
      width: 0,
      height: 0,
      style: { imageRendering: '' },
      getContext: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      focus: vi.fn()
    };
    
    // Mock 2D context
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      imageSmoothingEnabled: true,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn()
    };
    
    mockCanvasElement.getContext.mockReturnValue(mockContext);
    
    // Mock document
    global.document = {
      getElementById: vi.fn().mockReturnValue(mockCanvasElement),
      createElement: vi.fn().mockReturnValue(mockCanvasElement)
    };
    
    // Mock window
    global.window = {
      devicePixelRatio: 1,
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };
    
    canvas = new Canvas();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(400);
      expect(canvas.pixelated).toBe(true);
    });

    it('should accept custom configuration', () => {
      const customCanvas = new Canvas({
        width: 1024,
        height: 576,
        pixelated: false,
        canvasId: 'customCanvas'
      });
      
      expect(customCanvas.width).toBe(1024);
      expect(customCanvas.height).toBe(576);
      expect(customCanvas.pixelated).toBe(false);
      expect(customCanvas.canvasId).toBe('customCanvas');
    });
  });

  describe('canvas creation and setup', () => {
    it('should create canvas element if not found in DOM', async () => {
      global.document.getElementById.mockReturnValue(null);
      
      const result = await canvas.init();
      
      expect(global.document.createElement).toHaveBeenCalledWith('canvas');
      expect(result).toBe(true);
    });

    it('should use existing canvas element from DOM', async () => {
      global.document.getElementById.mockReturnValue(mockCanvasElement);
      
      const result = await canvas.init();
      
      expect(global.document.createElement).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should configure canvas properties correctly', async () => {
      await canvas.init();
      
      expect(mockCanvasElement.width).toBe(800);
      expect(mockCanvasElement.height).toBe(400);
      expect(mockContext.imageSmoothingEnabled).toBe(false);
      expect(mockCanvasElement.style.imageRendering).toBe('pixelated');
    });

    it('should handle WebGL context failure gracefully', async () => {
      mockCanvasElement.getContext.mockReturnValue(null);
      
      const result = await canvas.init();
      
      expect(result).toBe(false);
    });
  });

  describe('drawing operations', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should clear the canvas', () => {
      canvas.clear();
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 400);
    });

    it('should clear with custom color', () => {
      canvas.clear('#ff0000');
      
      expect(mockContext.fillStyle).toBe('#ff0000');
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
    });

    it('should fill rectangle', () => {
      canvas.fillRect(10, 20, 100, 50, '#00ff00');
      
      expect(mockContext.fillStyle).toBe('#00ff00');
      expect(mockContext.fillRect).toHaveBeenCalledWith(10, 20, 100, 50);
    });

    it('should stroke rectangle', () => {
      canvas.strokeRect(10, 20, 100, 50, '#0000ff', 2);
      
      expect(mockContext.strokeStyle).toBe('#0000ff');
      expect(mockContext.lineWidth).toBe(2);
      expect(mockContext.strokeRect).toHaveBeenCalledWith(10, 20, 100, 50);
    });

    it('should draw image', () => {
      const mockImage = { width: 32, height: 32 };
      
      canvas.drawImage(mockImage, 100, 200);
      
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 100, 200);
    });

    it('should draw image with sprite coordinates', () => {
      const mockImage = { width: 256, height: 256 };
      
      canvas.drawSprite(mockImage, 0, 0, 32, 32, 100, 200, 64, 64);
      
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockImage, 0, 0, 32, 32, 100, 200, 64, 64
      );
    });
  });

  describe('transformation operations', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should save and restore context state', () => {
      canvas.save();
      canvas.restore();
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('should translate context', () => {
      canvas.translate(50, 100);
      
      expect(mockContext.translate).toHaveBeenCalledWith(50, 100);
    });

    it('should scale context', () => {
      canvas.scale(2, 1.5);
      
      expect(mockContext.scale).toHaveBeenCalledWith(2, 1.5);
    });

    it('should rotate context', () => {
      canvas.rotate(Math.PI / 4);
      
      expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 4);
    });
  });

  describe('resize functionality', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should resize canvas dimensions', () => {
      canvas.resize(1024, 576);
      
      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(576);
      expect(mockCanvasElement.width).toBe(1024);
      expect(mockCanvasElement.height).toBe(576);
    });

    it('should maintain aspect ratio when resizing', () => {
      canvas.resizeToAspectRatio(16, 9, 800);
      
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(450);
    });

    it('should fit canvas to container', () => {
      const mockContainer = {
        clientWidth: 1200,
        clientHeight: 600
      };
      
      canvas.fitToContainer(mockContainer);
      
      expect(canvas.width).toBe(1200);
      expect(canvas.height).toBe(600);
    });
  });

  describe('high-DPI support', () => {
    beforeEach(async () => {
      global.window.devicePixelRatio = 2;
      await canvas.init();
    });

    it('should handle high-DPI displays', () => {
      canvas.handleHighDPI();
      
      expect(mockCanvasElement.width).toBe(1600); // 800 * 2
      expect(mockCanvasElement.height).toBe(800); // 400 * 2
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
    });
  });

  describe('event handling', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should set up window resize listener', () => {
      canvas.enableAutoResize();
      
      expect(global.window.addEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });

    it('should clean up event listeners', () => {
      canvas.enableAutoResize();
      canvas.destroy();
      
      expect(global.window.removeEventListener).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
    });
  });

  describe('canvas state queries', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should report initialization state', () => {
      expect(canvas.isInitialized()).toBe(true);
    });

    it('should get canvas dimensions', () => {
      const dimensions = canvas.getDimensions();
      
      expect(dimensions).toEqual({
        width: 800,
        height: 400
      });
    });

    it('should get aspect ratio', () => {
      const ratio = canvas.getAspectRatio();
      
      expect(ratio).toBe(2); // 800/400
    });
  });

  describe('pixel manipulation', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should get image data', () => {
      const mockImageData = { data: new Uint8ClampedArray([255, 0, 0, 255]) };
      mockContext.getImageData.mockReturnValue(mockImageData);
      
      const imageData = canvas.getImageData(0, 0, 10, 10);
      
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 10, 10);
      expect(imageData).toBe(mockImageData);
    });

    it('should put image data', () => {
      const mockImageData = { data: new Uint8ClampedArray([255, 0, 0, 255]) };
      
      canvas.putImageData(mockImageData, 50, 75);
      
      expect(mockContext.putImageData).toHaveBeenCalledWith(mockImageData, 50, 75);
    });
  });

  describe('error handling', () => {
    it('should handle missing canvas element gracefully', async () => {
      global.document.getElementById.mockReturnValue(null);
      global.document.createElement.mockImplementation(() => {
        throw new Error('Cannot create canvas');
      });
      
      const result = await canvas.init();
      
      expect(result).toBe(false);
    });

    it('should handle context creation failure', async () => {
      mockCanvasElement.getContext.mockReturnValue(null);
      
      const result = await canvas.init();
      
      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await canvas.init();
    });

    it('should destroy canvas properly', () => {
      canvas.destroy();
      
      expect(canvas.element).toBe(null);
      expect(canvas.context).toBe(null);
    });
  });
});
