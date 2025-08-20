import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GameLoop } from './game-loop.js';

describe('GameLoop', () => {
  let gameLoop;
  let updateSpy;
  let renderSpy;
  let fixedUpdateSpy;

  beforeEach(() => {
    updateSpy = vi.fn();
    renderSpy = vi.fn();
    fixedUpdateSpy = vi.fn();

    gameLoop = new GameLoop({
      onUpdate: updateSpy,
      onRender: renderSpy,
      onFixedUpdate: fixedUpdateSpy,
      targetFPS: 60
    });

    vi.useFakeTimers();
    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      setTimeout(() => callback(performance.now()), 16);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now())
    });
  });

  afterEach(() => {
    gameLoop.stop();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const loop = new GameLoop();
      expect(loop.targetFPS).toBe(60);
      expect(loop.maxDelta).toBe(100);
      expect(loop.running).toBe(false);
      expect(loop.paused).toBe(false);
    });

    it('should accept custom configuration', () => {
      const loop = new GameLoop({
        targetFPS: 30,
        maxDelta: 50
      });
      expect(loop.targetFPS).toBe(30);
      expect(loop.maxDelta).toBe(50);
    });
  });

  describe('start/stop', () => {
    it('should start the game loop', () => {
      const result = gameLoop.start();
      expect(gameLoop.running).toBe(true);
      expect(gameLoop.paused).toBe(false);
      expect(result).toBe(gameLoop);
    });

    it('should not start if already running', () => {
      gameLoop.start();
      const spy = vi.spyOn(gameLoop, 'loop');
      gameLoop.start();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should stop the game loop', () => {
      gameLoop.start();
      const result = gameLoop.stop();
      expect(gameLoop.running).toBe(false);
      expect(result).toBe(gameLoop);
    });
  });

  describe('pause/resume', () => {
    it('should pause the game loop', () => {
      gameLoop.start();
      const result = gameLoop.pause();
      expect(gameLoop.paused).toBe(true);
      expect(result).toBe(gameLoop);
    });

    it('should resume the game loop', () => {
      gameLoop.start();
      gameLoop.pause();
      const result = gameLoop.resume();
      expect(gameLoop.paused).toBe(false);
      expect(result).toBe(gameLoop);
    });

    it('should start if resumed when not running', () => {
      const result = gameLoop.resume();
      expect(gameLoop.running).toBe(true);
      expect(result).toBe(gameLoop);
    });
  });

  describe('loop execution', () => {
    it('should call update and render callbacks', () => {
      gameLoop.start();
      vi.advanceTimersByTime(16.67); // ~1 frame at 60fps

      expect(updateSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalled();
    });

    it('should not update when paused', () => {
      gameLoop.start();
      gameLoop.pause();
      vi.advanceTimersByTime(16.67);

      expect(updateSpy).not.toHaveBeenCalled();
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should calculate delta time correctly', () => {
      gameLoop.start();
      vi.advanceTimersByTime(16.67);

      const deltaTime = gameLoop.getDeltaTime();
      expect(deltaTime).toBeGreaterThan(0);
      expect(deltaTime).toBeLessThanOrEqual(gameLoop.maxDelta);
    });

    it('should limit delta time to maxDelta', () => {
      gameLoop.maxDelta = 50;
      gameLoop.start();
      vi.advanceTimersByTime(100);

      const deltaTime = gameLoop.getDeltaTime();
      expect(deltaTime).toBe(50);
    });
  });

  describe('fixed timestep', () => {
    it('should call fixedUpdate at regular intervals', () => {
      gameLoop.start();
      vi.advanceTimersByTime(33.34); // ~2 frames at 60fps

      expect(fixedUpdateSpy).toHaveBeenCalledTimes(2);
      expect(fixedUpdateSpy).toHaveBeenCalledWith(16.666666666666668);
    });

    it('should accumulate time for fixed updates', () => {
      gameLoop.start();
      vi.advanceTimersByTime(25); // 1.5 frames

      expect(fixedUpdateSpy).toHaveBeenCalledTimes(1);
      expect(gameLoop.accumulator).toBeGreaterThan(0);
    });
  });

  describe('FPS tracking', () => {
    it('should calculate FPS', () => {
      gameLoop.start();

      // Simulate 60 frames over 1 second
      for (let i = 0; i < 60; i++) {
        vi.advanceTimersByTime(16.67);
      }

      const fps = gameLoop.getFPS();
      expect(fps).toBeGreaterThan(0);
      expect(fps).toBeLessThanOrEqual(60);
    });

    it('should update FPS at intervals', () => {
      gameLoop.start();
      gameLoop.fpsUpdateInterval = 100;

      vi.advanceTimersByTime(150);
      const fps1 = gameLoop.getFPS();

      vi.advanceTimersByTime(150);
      const fps2 = gameLoop.getFPS();

      expect(fps2).toBeDefined();
    });
  });

  describe('state queries', () => {
    it('should report running state correctly', () => {
      expect(gameLoop.isRunning()).toBe(false);

      gameLoop.start();
      expect(gameLoop.isRunning()).toBe(true);

      gameLoop.pause();
      expect(gameLoop.isRunning()).toBe(false);

      gameLoop.resume();
      expect(gameLoop.isRunning()).toBe(true);

      gameLoop.stop();
      expect(gameLoop.isRunning()).toBe(false);
    });

    it('should report paused state correctly', () => {
      expect(gameLoop.isPaused()).toBe(false);

      gameLoop.start();
      expect(gameLoop.isPaused()).toBe(false);

      gameLoop.pause();
      expect(gameLoop.isPaused()).toBe(true);

      gameLoop.resume();
      expect(gameLoop.isPaused()).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should allow changing target FPS', () => {
      const result = gameLoop.setTargetFPS(30);
      expect(gameLoop.targetFPS).toBe(30);
      expect(gameLoop.frameTime).toBe(1000 / 30);
      expect(result).toBe(gameLoop);
    });
  });
});
