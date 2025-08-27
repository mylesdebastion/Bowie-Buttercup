/**
 * Memory Manager
 * 
 * Handles memory optimization through:
 * - Object pooling for frequently created objects
 * - Memory leak detection and prevention
 * - Asset caching and cleanup
 * - Garbage collection optimization
 */

class MemoryManager {
  constructor() {
    // Object pools for common game objects
    this.pools = new Map()
    
    // Asset cache with automatic cleanup
    this.assetCache = new Map()
    this.assetCacheMaxSize = 50 * 1024 * 1024 // 50MB max cache
    
    // Memory leak detection
    this.objectReferences = new WeakMap()
    this.cleanupCallbacks = new Set()
    
    // Memory monitoring
    this.memoryBaseline = 0
    this.memoryChecks = []
    this.maxMemoryChecks = 100
    
    this.init()
  }

  init() {
    // Set memory baseline
    this.updateMemoryBaseline()
    
    // Initialize default object pools
    this.initDefaultPools()
    
    console.log('🧠 Memory Manager initialized with baseline:', 
      Math.round(this.memoryBaseline / 1024 / 1024) + 'MB')
  }

  // Initialize common object pools
  initDefaultPools() {
    // Vector2 pool for position/velocity objects
    this.createPool('Vector2', () => ({ x: 0, y: 0 }), (obj) => {
      obj.x = 0
      obj.y = 0
      return obj
    })

    // Rectangle pool for collision bounds
    this.createPool('Rectangle', () => ({ x: 0, y: 0, width: 0, height: 0 }), (obj) => {
      obj.x = 0
      obj.y = 0
      obj.width = 0
      obj.height = 0
      return obj
    })

    // Event object pool
    this.createPool('Event', () => ({ type: '', data: null, timestamp: 0 }), (obj) => {
      obj.type = ''
      obj.data = null
      obj.timestamp = 0
      return obj
    })

    // Particle pool for effects
    this.createPool('Particle', () => ({
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0,
      size: 1, color: '#ffffff',
      active: false
    }), (obj) => {
      obj.x = 0
      obj.y = 0
      obj.vx = 0
      obj.vy = 0
      obj.life = 0
      obj.maxLife = 0
      obj.size = 1
      obj.color = '#ffffff'
      obj.active = false
      return obj
    })
  }

  // Create object pool
  createPool(name, createFn, resetFn, initialSize = 10) {
    const pool = {
      objects: [],
      createFn,
      resetFn,
      created: 0,
      reused: 0
    }

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      pool.objects.push(createFn())
      pool.created++
    }

    this.pools.set(name, pool)
    return pool
  }

  // Get object from pool
  acquire(poolName, ...args) {
    const pool = this.pools.get(poolName)
    if (!pool) {
      throw new Error(`Pool "${poolName}" does not exist`)
    }

    let obj
    if (pool.objects.length > 0) {
      obj = pool.objects.pop()
      pool.reused++
    } else {
      obj = pool.createFn(...args)
      pool.created++
    }

    // Reset object state
    if (pool.resetFn) {
      pool.resetFn(obj)
    }

    return obj
  }

  // Return object to pool
  release(poolName, obj) {
    const pool = this.pools.get(poolName)
    if (!pool) {
      console.warn(`Cannot release object to unknown pool: ${poolName}`)
      return
    }

    // Clean object references to prevent memory leaks
    this.cleanObjectReferences(obj)

    pool.objects.push(obj)
  }

  // Batch acquire multiple objects
  acquireBatch(poolName, count, ...args) {
    const objects = []
    for (let i = 0; i < count; i++) {
      objects.push(this.acquire(poolName, ...args))
    }
    return objects
  }

  // Batch release multiple objects
  releaseBatch(poolName, objects) {
    for (const obj of objects) {
      this.release(poolName, obj)
    }
  }

  // Asset cache management
  cacheAsset(key, asset, size = 0) {
    // Check cache size limit
    if (this.getAssetCacheSize() + size > this.assetCacheMaxSize) {
      this.pruneAssetCache()
    }

    this.assetCache.set(key, {
      asset,
      size,
      lastAccessed: Date.now(),
      accessCount: 0
    })
  }

  getAsset(key) {
    const cached = this.assetCache.get(key)
    if (cached) {
      cached.lastAccessed = Date.now()
      cached.accessCount++
      return cached.asset
    }
    return null
  }

  removeAsset(key) {
    return this.assetCache.delete(key)
  }

  // Calculate total cache size
  getAssetCacheSize() {
    let totalSize = 0
    for (const cached of this.assetCache.values()) {
      totalSize += cached.size
    }
    return totalSize
  }

  // Prune least recently used assets
  pruneAssetCache(targetSize = this.assetCacheMaxSize * 0.7) {
    const entries = Array.from(this.assetCache.entries())
    
    // Sort by last accessed (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    let currentSize = this.getAssetCacheSize()
    let pruned = 0

    for (const [key, cached] of entries) {
      if (currentSize <= targetSize) break
      
      this.assetCache.delete(key)
      currentSize -= cached.size
      pruned++
    }

    console.log(`🧹 Pruned ${pruned} assets, cache size: ${Math.round(currentSize / 1024)}KB`)
  }

  // Memory leak prevention
  registerForCleanup(callback) {
    this.cleanupCallbacks.add(callback)
  }

  unregisterFromCleanup(callback) {
    this.cleanupCallbacks.delete(callback)
  }

  cleanObjectReferences(obj) {
    // Remove circular references
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          obj[key] = null
        }
      }
    }
  }

  // Memory monitoring
  updateMemoryBaseline() {
    if (performance.memory) {
      this.memoryBaseline = performance.memory.usedJSHeapSize
    }
  }

  checkMemoryUsage() {
    if (!performance.memory) return null

    const currentMemory = performance.memory.usedJSHeapSize
    const memoryDelta = currentMemory - this.memoryBaseline
    
    const check = {
      timestamp: Date.now(),
      current: currentMemory,
      baseline: this.memoryBaseline,
      delta: memoryDelta,
      growth: memoryDelta / this.memoryBaseline
    }

    this.memoryChecks.push(check)
    
    // Keep only recent checks
    if (this.memoryChecks.length > this.maxMemoryChecks) {
      this.memoryChecks.shift()
    }

    return check
  }

  // Detect potential memory leaks
  detectMemoryLeaks() {
    if (this.memoryChecks.length < 10) return null

    const recent = this.memoryChecks.slice(-10)
    const growth = recent.map(check => check.growth)
    const avgGrowth = growth.reduce((a, b) => a + b, 0) / growth.length

    // Check for consistent memory growth
    if (avgGrowth > 0.1) { // 10% growth
      return {
        detected: true,
        averageGrowth: avgGrowth,
        message: `Potential memory leak detected: ${Math.round(avgGrowth * 100)}% average growth`
      }
    }

    return { detected: false }
  }

  // Force garbage collection (if available)
  forceGC() {
    if (window.gc) {
      window.gc()
      console.log('🗑️ Forced garbage collection')
    }
  }

  // Cleanup all resources
  cleanup() {
    // Run all registered cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        callback()
      } catch (error) {
        console.warn('Error during cleanup:', error)
      }
    }

    // Clear asset cache
    this.assetCache.clear()

    // Clear object pools
    for (const pool of this.pools.values()) {
      pool.objects.length = 0
    }

    console.log('🧹 Memory Manager cleanup complete')
  }

  // Get memory statistics
  getStats() {
    const poolStats = {}
    for (const [name, pool] of this.pools.entries()) {
      poolStats[name] = {
        available: pool.objects.length,
        created: pool.created,
        reused: pool.reused,
        efficiency: pool.created > 0 ? Math.round((pool.reused / pool.created) * 100) : 0
      }
    }

    return {
      pools: poolStats,
      assetCache: {
        size: Math.round(this.getAssetCacheSize() / 1024) + 'KB',
        count: this.assetCache.size,
        maxSize: Math.round(this.assetCacheMaxSize / 1024) + 'KB'
      },
      memory: this.checkMemoryUsage(),
      leakDetection: this.detectMemoryLeaks()
    }
  }
}

// Singleton instance
const memoryManager = new MemoryManager()
export default memoryManager