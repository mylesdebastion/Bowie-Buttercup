/**
 * Test setup file for Vitest
 * Configures global test environment for cat platformer
 */

import { vi } from 'vitest'

// Mock browser APIs
global.requestAnimationFrame = vi.fn((cb) => {
  return setTimeout(cb, 16) // 60 FPS
})

global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id)
})

global.performance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
}

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  imageSmoothingEnabled: false,
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  putImageData: vi.fn(),
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
}))

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
)

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
global.localStorage = localStorageMock

// Mock audio context
global.AudioContext = vi.fn(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 }
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 }
  })),
  destination: {}
}))

// Game test utilities
global.createMockGame = () => ({
  player: {
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    width: 24,
    height: 28,
    state: 'idle_sit',
    facing: 1,
    grounded: true,
    dodging: false,
    invulnerable: false,
    animFrame: 0,
    update: vi.fn(),
    draw: vi.fn(),
    hurt: vi.fn(),
    dodge: vi.fn()
  },
  camera: { x: 0, y: 0 },
  score: 0,
  lives: 3,
  currentLevel: 1,
  level: [],
  entities: [],
  particles: [],
  fireballs: [],
  mice: [],
  dog: null,
  update: vi.fn(),
  render: vi.fn(),
  restart: vi.fn(),
  createParticles: vi.fn(),
  playSound: vi.fn()
})

global.createMockPhysics = () => ({
  gravity: 500,
  jumpForce: 250,
  moveSpeed: 150,
  friction: 0.8,
  coyoteTime: 80,
  jumpBuffer: 100
})

// Test helpers
global.waitForAnimationFrame = () => {
  return new Promise(resolve => {
    global.requestAnimationFrame(resolve)
  })
}

global.waitFor = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Physics test helpers
global.simulatePhysicsFrames = (game, frames) => {
  const results = []
  for (let i = 0; i < frames; i++) {
    if (game.update) {
      game.update(16.67) // 60 FPS
    }
    results.push({
      frame: i,
      player: {
        x: game.player.x,
        y: game.player.y,
        vx: game.player.vx,
        vy: game.player.vy,
        grounded: game.player.grounded,
        state: game.player.state
      }
    })
  }
  return results
}

// Visual test helpers
global.createMockCanvas = (width = 800, height = 400) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.id = 'gameCanvas'
  document.body.appendChild(canvas)
  return canvas
}

// Baseline comparison helpers
global.loadBaseline = (name) => {
  const baseline = global.localStorage.getItem(name)
  return baseline ? JSON.parse(baseline) : null
}

global.comparePhysicsFrames = (current, baseline, tolerance = 1) => {
  if (!baseline || !current) {
    throw new Error('Missing baseline or current data')
  }

  const differences = []
  const maxFrames = Math.min(current.length, baseline.length)

  for (let i = 0; i < maxFrames; i++) {
    const c = current[i]
    const b = baseline[i]

    const positionDiff = {
      x: Math.abs(c.player.x - b.player.x),
      y: Math.abs(c.player.y - b.player.y)
    }

    const velocityDiff = {
      vx: Math.abs(c.player.vx - b.player.vx),
      vy: Math.abs(c.player.vy - b.player.vy)
    }

    if (positionDiff.x > tolerance || positionDiff.y > tolerance ||
        velocityDiff.vx > tolerance || velocityDiff.vy > tolerance) {
      differences.push({
        frame: i,
        positionDiff,
        velocityDiff
      })
    }
  }

  return {
    passed: differences.length === 0,
    differences,
    tolerance,
    frameCount: maxFrames
  }
}

console.log('🧪 Test environment setup complete')