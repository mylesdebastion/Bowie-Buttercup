/**
 * Game Loop Module
 *
 * Extracted from monolithic index.html
 * Provides main game loop functionality with delta time,
 * frame rate limiting, and pause/resume capabilities.
 */

export class GameLoop {
  constructor(config = {}) {
    this.targetFPS = config.targetFPS || 60;
    this.maxDelta = config.maxDelta || 100;
    this.running = false;
    this.paused = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.accumulator = 0;
    this.frameTime = 1000 / this.targetFPS;
    this.animationId = null;

    // Callbacks
    this.onUpdate = config.onUpdate || (() => {});
    this.onRender = config.onRender || (() => {});
    this.onFixedUpdate = config.onFixedUpdate || (() => {});

    // Performance tracking
    this.frameCount = 0;
    this.fps = 0;
    this.fpsAccumulator = 0;
    this.fpsUpdateInterval = 500;
    this.lastFpsUpdate = 0;

    // Bind methods
    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.lastFpsUpdate = this.lastTime;
    this.loop(this.lastTime);

    return this;
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    return this;
  }

  pause() {
    this.paused = true;
    return this;
  }

  resume() {
    if (!this.running) {
      return this.start();
    }
    this.paused = false;
    this.lastTime = performance.now();
    return this;
  }

  loop(currentTime) {
    if (!this.running) return;

    this.animationId = requestAnimationFrame(this.loop);

    if (this.paused) return;

    // Calculate delta time
    const rawDelta = currentTime - this.lastTime;
    this.deltaTime = Math.min(rawDelta, this.maxDelta);
    this.lastTime = currentTime;

    // Update FPS counter
    this.updateFPS(currentTime, rawDelta);

    // Fixed timestep with interpolation
    this.accumulator += this.deltaTime;

    // Fixed updates (physics)
    while (this.accumulator >= this.frameTime) {
      this.onFixedUpdate(this.frameTime);
      this.accumulator -= this.frameTime;
    }

    // Variable update (game logic)
    this.onUpdate(this.deltaTime);

    // Render with interpolation value
    const interpolation = this.accumulator / this.frameTime;
    this.onRender(interpolation);
  }

  updateFPS(currentTime, delta) {
    this.frameCount++;
    this.fpsAccumulator += delta;

    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
      this.lastFpsUpdate = currentTime;
    }
  }

  getFPS() {
    return this.fps;
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  isRunning() {
    return this.running && !this.paused;
  }

  isPaused() {
    return this.paused;
  }

  setTargetFPS(fps) {
    this.targetFPS = fps;
    this.frameTime = 1000 / fps;
    return this;
  }
}

// Factory function for backward compatibility
export function createGameLoop(update, render, config = {}) {
  return new GameLoop({
    ...config,
    onUpdate: update,
    onRender: render
  });
}

// Default export
export default GameLoop;
