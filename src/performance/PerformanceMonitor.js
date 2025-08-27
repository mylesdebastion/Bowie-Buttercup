/**
 * Performance Monitor
 * 
 * Tracks runtime performance metrics including:
 * - Frame rate (FPS)
 * - Frame time
 * - Memory usage
 * - Bundle load time
 * - Critical performance thresholds
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      fpsTarget: 60,
      frameTimeTarget: 16.67, // milliseconds (1000/60)
      memoryWarningThreshold: 50 * 1024 * 1024, // 50MB
      reportInterval: 5000, // Report every 5 seconds
      enabled: true,
      debug: options.debug || false,
      ...options
    }

    // Performance metrics
    this.metrics = {
      fps: 0,
      frameTime: 0,
      averageFrameTime: 0,
      memoryUsage: 0,
      memoryPeak: 0,
      bundleLoadTime: 0,
      renderCalls: 0,
      entityUpdates: 0,
      dropped_frames: 0
    }

    // Frame tracking
    this.frameCount = 0
    this.lastTime = performance.now()
    this.frameStartTime = 0
    this.frameTimes = []
    this.maxFrameTimeSamples = 60 // Track last 60 frames

    // Memory tracking
    this.memoryBaseline = 0
    this.lastMemoryCheck = 0

    // Performance warnings
    this.warnings = []
    
    // Report interval
    this.reportTimer = null
    this.listeners = new Map()

    this.init()
  }

  init() {
    if (!this.options.enabled) return

    // Record bundle load time
    this.metrics.bundleLoadTime = performance.now()

    // Set memory baseline
    this.updateMemoryUsage()
    this.memoryBaseline = this.metrics.memoryUsage

    // Start performance reporting
    this.startReporting()

    if (this.options.debug) {
      console.log('🔥 Performance Monitor initialized:', {
        targets: {
          fps: this.options.fpsTarget,
          frameTime: `${this.options.frameTimeTarget}ms`,
          memory: `${Math.round(this.options.memoryWarningThreshold / 1024 / 1024)}MB`
        },
        baseline: {
          bundleLoadTime: `${Math.round(this.metrics.bundleLoadTime)}ms`,
          memoryBaseline: `${Math.round(this.memoryBaseline / 1024 / 1024)}MB`
        }
      })
    }
  }

  // Frame performance tracking
  beginFrame() {
    if (!this.options.enabled) return
    this.frameStartTime = performance.now()
  }

  endFrame() {
    if (!this.options.enabled) return
    
    const now = performance.now()
    const frameTime = now - this.frameStartTime
    
    // Update frame metrics
    this.frameCount++
    this.metrics.frameTime = frameTime
    this.frameTimes.push(frameTime)
    
    // Keep only recent frame times
    if (this.frameTimes.length > this.maxFrameTimeSamples) {
      this.frameTimes.shift()
    }
    
    // Calculate average frame time
    this.metrics.averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    
    // Calculate FPS (based on last second)
    const deltaTime = now - this.lastTime
    if (deltaTime >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastTime = now
    }

    // Check for performance issues
    this.checkPerformanceThresholds(frameTime)
  }

  // Memory usage tracking
  updateMemoryUsage() {
    if (!this.options.enabled) return

    // Use performance.memory if available (Chrome)
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize
      this.metrics.memoryPeak = Math.max(this.metrics.memoryPeak, this.metrics.memoryUsage)
    }

    // Check memory warnings
    if (this.metrics.memoryUsage > this.options.memoryWarningThreshold) {
      this.addWarning('memory', `High memory usage: ${Math.round(this.metrics.memoryUsage / 1024 / 1024)}MB`)
    }
  }

  // Track render operations
  recordRenderCall() {
    if (!this.options.enabled) return
    this.metrics.renderCalls++
  }

  // Track entity updates
  recordEntityUpdate() {
    if (!this.options.enabled) return
    this.metrics.entityUpdates++
  }

  // Performance threshold checking
  checkPerformanceThresholds(frameTime) {
    // Check frame time threshold
    if (frameTime > this.options.frameTimeTarget * 1.5) {
      this.metrics.dropped_frames++
      this.addWarning('frametime', `Slow frame: ${frameTime.toFixed(2)}ms (target: ${this.options.frameTimeTarget}ms)`)
    }

    // Check FPS threshold
    if (this.metrics.fps < this.options.fpsTarget * 0.8 && this.metrics.fps > 0) {
      this.addWarning('fps', `Low FPS: ${this.metrics.fps} (target: ${this.options.fpsTarget})`)
    }
  }

  // Warning system
  addWarning(type, message) {
    const warning = {
      type,
      message,
      timestamp: performance.now(),
      count: 1
    }

    // Check for duplicate warnings (throttling)
    const existing = this.warnings.find(w => w.type === type && w.message === message)
    if (existing) {
      existing.count++
      existing.timestamp = warning.timestamp
    } else {
      this.warnings.push(warning)
      if (this.options.debug) {
        console.warn(`⚠️ Performance Warning [${type}]:`, message)
      }
    }

    // Emit warning event
    this.emit('warning', warning)
  }

  // Performance reporting
  startReporting() {
    if (!this.options.enabled) return

    this.reportTimer = setInterval(() => {
      this.updateMemoryUsage()
      this.generateReport()
      this.resetCounters()
    }, this.options.reportInterval)
  }

  generateReport() {
    const report = {
      timestamp: performance.now(),
      metrics: { ...this.metrics },
      warnings: [...this.warnings],
      health: this.getHealthScore()
    }

    // Emit report event
    this.emit('report', report)

    if (this.options.debug && this.warnings.length > 0) {
      console.log('📊 Performance Report:', report)
    }

    return report
  }

  // Calculate overall health score (0-100)
  getHealthScore() {
    let score = 100

    // FPS penalty
    if (this.metrics.fps > 0) {
      const fpsRatio = this.metrics.fps / this.options.fpsTarget
      if (fpsRatio < 0.9) score -= (0.9 - fpsRatio) * 30
    }

    // Frame time penalty
    const frameTimeRatio = this.metrics.averageFrameTime / this.options.frameTimeTarget
    if (frameTimeRatio > 1.1) score -= (frameTimeRatio - 1.1) * 40

    // Memory penalty
    const memoryGrowth = (this.metrics.memoryUsage - this.memoryBaseline) / this.memoryBaseline
    if (memoryGrowth > 0.5) score -= memoryGrowth * 20

    // Warning penalty
    score -= this.warnings.length * 5

    return Math.max(0, Math.round(score))
  }

  // Reset counters for next reporting period
  resetCounters() {
    this.metrics.renderCalls = 0
    this.metrics.entityUpdates = 0
    this.warnings = []
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics }
  }

  // Get performance summary
  getSummary() {
    return {
      fps: this.metrics.fps,
      frameTime: Math.round(this.metrics.averageFrameTime * 100) / 100,
      memory: Math.round(this.metrics.memoryUsage / 1024 / 1024 * 100) / 100,
      health: this.getHealthScore(),
      warnings: this.warnings.length
    }
  }

  // Cleanup
  destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer)
      this.reportTimer = null
    }
    this.listeners.clear()
  }
}

export default PerformanceMonitor