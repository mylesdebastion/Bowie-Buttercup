# Technology Stack: Cat Platformer Game

**Owner**: Technical Lead  
**Last Updated**: 2025-01-18  
**Version**: 1.0  
**Related Docs**: 
- [Architecture Overview](./overview.md)
- [Deployment](./deployment.md)
- [Testing Strategy](./testing-strategy.md)

---

## 1. Core Technologies

### 1.1 Runtime Environment

**Browser JavaScript Engine**
- **Technology**: Vanilla JavaScript ES6+
- **Rationale**: Zero dependencies, maximum compatibility, optimal performance
- **Version**: ES2017+ features (async/await, modules, classes)
- **Constraints**: No transpilation, no polyfills, no external runtime

**Supported Browser Engines**:
- **Chrome V8** 90+ (Desktop & Mobile)
- **Firefox SpiderMonkey** 88+ (Desktop & Mobile)  
- **Safari JavaScriptCore** 14+ (Desktop & Mobile)
- **Edge Chakra/V8** 90+ (Desktop)

### 1.2 Rendering Technology

**HTML5 Canvas 2D API**
- **Technology**: CanvasRenderingContext2D
- **Rationale**: Hardware-accelerated 2D rendering, wide browser support
- **Features**: Sprite rendering, geometric shapes, image manipulation
- **Fallbacks**: Software rendering on unsupported hardware

**Pixel-Perfect Rendering**:
- Device pixel ratio handling for high-DPI displays
- Integer positioning for crisp sprite rendering
- Optimized clipping and culling for performance

### 1.3 Storage Technology

**Local Storage API**
- **Technology**: window.localStorage
- **Usage**: Game saves, settings, progress tracking
- **Capacity**: 5-10MB typical browser limit
- **Fallbacks**: In-memory storage if localStorage unavailable

**Session Storage**:
- **Technology**: window.sessionStorage
- **Usage**: Temporary game state, performance metrics
- **Lifecycle**: Cleared on tab close

## 2. Development Tools

### 2.1 Build System

**Vite.js**
- **Version**: 4.x+
- **Rationale**: Fast development server, ES module support, optimized production builds
- **Features**: Hot module replacement, source maps, asset optimization
- **Configuration**: Zero-config defaults with custom optimization

**Key Features**:
```javascript
// vite.config.js
export default {
  build: {
    target: 'es2017',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single bundle
        entryFileNames: 'game.[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: true
  }
}
```

### 2.2 Package Management

**npm**
- **Version**: 8.x+
- **Rationale**: Standard Node.js package manager, widespread adoption
- **Usage**: Development dependencies only (build tools, testing, linting)

**Development Dependencies**:
```json
{
  "devDependencies": {
    "vite": "^4.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@jest/environment-jsdom": "^29.0.0",
    "canvas": "^2.11.0"
  }
}
```

### 2.3 Code Quality Tools

**ESLint**
- **Version**: 8.x+
- **Configuration**: JavaScript Standard Style + custom game dev rules
- **Integration**: IDE integration, pre-commit hooks, CI/CD pipeline

**ESLint Configuration**:
```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2017: true,
    jest: true
  },
  extends: ['standard'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-unused-vars': 'error',
    'complexity': ['warn', 10]
  }
}
```

## 3. Testing Framework

### 3.1 Unit Testing

**Jest**
- **Version**: 29.x+
- **Rationale**: Comprehensive testing framework, built-in mocking, coverage reporting
- **Environment**: jsdom for DOM simulation
- **Features**: Snapshot testing, async testing, performance testing

**Jest Configuration**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/utils/Constants.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### 3.2 Browser Testing

**Manual Testing Setup**:
- **Local Development**: Vite dev server with hot reload
- **Cross-browser Testing**: BrowserStack or manual device testing
- **Performance Testing**: Chrome DevTools Performance tab

**Test Browsers**:
- Chrome 90+ (Windows, macOS, Linux, Android)
- Firefox 88+ (Windows, macOS, Linux)
- Safari 14+ (macOS, iOS)
- Edge 90+ (Windows)

## 4. Game-Specific Technologies

### 4.1 Physics Engine

**Custom 2D Physics**
- **Technology**: Custom implementation in vanilla JavaScript
- **Features**: AABB collision detection, gravity simulation, basic particle physics
- **Rationale**: Lightweight, game-specific optimizations, no external dependencies

**Physics Components**:
```javascript
// Core physics systems
class Physics {
  // AABB collision detection
  static checkAABB(rect1, rect2)
  
  // Gravity and velocity integration  
  static integrate(entity, deltaTime, gravity)
  
  // Collision response
  static resolveCollision(entityA, entityB, normal)
}
```

### 4.2 Animation System

**Custom Frame-Based Animation**
- **Technology**: Canvas sprite rendering with frame sequences
- **Features**: Sprite sheet support, animation state machines, interpolation
- **Storage**: Base64 encoded sprites or external image references

**Animation Framework**:
```javascript
class Animation {
  constructor(frames, frameRate, loop = true) {
    this.frames = frames;
    this.frameRate = frameRate;
    this.currentFrame = 0;
    this.elapsedTime = 0;
  }
  
  update(deltaTime) {
    // Frame advancement logic
  }
  
  getCurrentFrame() {
    return this.frames[this.currentFrame];
  }
}
```

### 4.3 Audio System

**Web Audio API**
- **Technology**: AudioContext and AudioBuffer
- **Usage**: Sound effects, background music (if added)
- **Fallbacks**: HTML5 Audio element for basic sound playback

**Audio Architecture**:
```javascript
class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
  }
  
  async loadSound(id, url) {
    // Load and decode audio data
  }
  
  playSound(id, volume = 1.0) {
    // Play sound with Web Audio API
  }
}
```

## 5. Performance Technologies

### 5.1 Optimization Techniques

**Object Pooling**
- **Technology**: Custom object pool implementation
- **Usage**: Particles, projectiles, temporary entities
- **Benefit**: Reduced garbage collection pressure

**Spatial Partitioning**
- **Technology**: Grid-based spatial indexing
- **Usage**: Collision detection optimization
- **Implementation**: Custom grid system for entity queries

**Rendering Optimizations**:
- **Dirty Rectangle Rendering**: Only redraw changed areas
- **Sprite Batching**: Group similar sprites for efficient rendering
- **Culling**: Skip off-screen entities in update/render

### 5.2 Memory Management

**Memory Monitoring**:
- **Technology**: Performance.memory API (Chrome)
- **Usage**: Track heap usage and detect memory leaks
- **Alerts**: Warn when memory usage exceeds thresholds

**Asset Management**:
- **Lazy Loading**: Load assets as needed
- **Unloading**: Clean up unused assets between levels
- **Caching**: Intelligent asset cache with size limits

## 6. Development Workflow

### 6.1 Hot Module Replacement

**Vite HMR Integration**:
```javascript
// HMR support for game modules
if (import.meta.hot) {
  import.meta.hot.accept('./Player.js', (newPlayer) => {
    // Hot swap player implementation
    game.updatePlayer(newPlayer.default);
  });
}
```

### 6.2 Debug Tools

**Development Console**:
- **Technology**: Custom in-game debug overlay
- **Features**: FPS monitoring, entity inspection, performance metrics
- **Toggle**: Debug mode enabled via URL parameter or key combination

**Performance Profiling**:
- **Browser DevTools**: Chrome Performance tab integration
- **Custom Metrics**: Frame time tracking, memory usage monitoring
- **Automated Testing**: Performance regression detection in CI/CD

## 7. Deployment Technologies

### 7.1 Build Pipeline

**Production Build**:
- **Bundling**: Single JavaScript file with inlined CSS
- **Minification**: Terser for JavaScript optimization
- **Asset Optimization**: Image compression, base64 inlining

**Build Configuration**:
```javascript
// Production build optimizations
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
}
```

### 7.2 Asset Pipeline

**Asset Processing**:
- **Images**: Optimized PNG/JPG with compression
- **Sprites**: Base64 encoding for inline embedding
- **Data**: JSON minification and compression

**Self-Contained Deployment**:
- **Single HTML File**: All assets embedded or inlined
- **No External Dependencies**: Runtime independent of external services
- **Offline Capability**: Full functionality without network access

## 8. Browser API Usage

### 8.1 Core APIs

**Essential Browser APIs**:
- `requestAnimationFrame` - Game loop timing
- `Canvas 2D Context` - Rendering and drawing
- `localStorage` - Data persistence
- `addEventListener` - Event handling
- `performance.now()` - High-resolution timing

**Optional Enhancement APIs**:
- `Performance.memory` - Memory monitoring (Chrome)
- `Navigator.deviceMemory` - Device capability detection
- `Screen.orientation` - Mobile layout optimization

### 8.2 Polyfill Strategy

**No Polyfills Policy**:
- Graceful degradation for missing features
- Feature detection before usage
- Fallback implementations where necessary

**Feature Detection Example**:
```javascript
// Safe feature usage
const hasPerformanceMemory = 'memory' in performance;
const memoryUsage = hasPerformanceMemory 
  ? performance.memory.usedJSHeapSize 
  : 0;
```

## 9. Technology Constraints and Limitations

### 9.1 Imposed Constraints

**Vanilla JavaScript Only**:
- No frameworks (React, Vue, Angular)
- No build-time transpilation (Babel, TypeScript)
- No runtime polyfills or shims

**Browser Compatibility**:
- ES2017+ features only (no cutting-edge JavaScript)
- Standard Web APIs only (no experimental features)
- Cross-platform consistency required

**Performance Constraints**:
- 60 FPS target on supported hardware
- <50MB memory usage on mobile devices
- <200KB bundle size for fast loading

### 9.2 Technology Trade-offs

**Benefits of Vanilla JavaScript**:
- Zero external dependencies
- Maximum performance and control
- Broad browser compatibility
- Simple deployment and debugging

**Limitations**:
- More verbose code compared to frameworks
- Manual implementation of common patterns
- Limited tooling compared to framework ecosystems
- Higher development time for complex features

**Mitigation Strategies**:
- Strong architectural patterns compensate for framework absence
- Custom utilities provide common functionality
- Comprehensive testing ensures reliability
- Clear documentation reduces complexity

---

**Document Control**:
- **Technology Decisions**: All technology choices documented with rationale
- **Version Tracking**: Technology versions locked in package.json and documentation
- **Upgrade Path**: Technology upgrade decisions require architecture review
- **Compatibility Matrix**: Browser/feature support matrix maintained and tested