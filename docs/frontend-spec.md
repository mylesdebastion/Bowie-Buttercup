# Cat Platformer - Front End Specification

## Table of Contents
1. [Overview](#overview)
2. [Responsive Design System](#responsive-design-system)
3. [Input Systems](#input-systems)
4. [UI/UX Components](#uiux-components)
5. [Performance Optimization](#performance-optimization)
6. [Accessibility](#accessibility)
7. [Visual Design System](#visual-design-system)
8. [Technical Implementation](#technical-implementation)
9. [Progressive Web App Features](#progressive-web-app-features)

---

## Overview

This specification defines the front-end architecture for a responsive cat platformer web game that seamlessly adapts to both mobile and desktop devices while maintaining 60 FPS performance and excellent user experience.

### Current State Analysis
- Single HTML file with embedded CSS and JavaScript
- Canvas 2D API rendering at 800x400 base resolution
- Mobile D-pad controls with touch event handling
- Desktop keyboard input support
- Basic responsive layout with left panel hiding on mobile
- Safe area inset support for notched devices

---

## Responsive Design System

### Breakpoints and Viewport Strategy

```css
/* Breakpoint System */
:root {
  --xs: 320px;     /* Minimum device width */
  --sm: 480px;     /* Small mobile devices */
  --md: 768px;     /* Tablets and large phones */
  --lg: 1024px;    /* Desktop and laptops */
  --xl: 1440px;    /* Large desktop screens */
}

/* Media Query Mixins */
@media (max-width: 767px) { /* Mobile */ }
@media (min-width: 768px) and (max-width: 1023px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (orientation: portrait) { /* Portrait layout */ }
@media (orientation: landscape) { /* Landscape layout */ }
```

### Layout Architecture

```
Desktop (≥1024px):
┌─────────────────────────────────────────┐
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │             │ │                     │ │
│ │  Left Panel │ │    Game Canvas      │ │
│ │   (350px)   │ │    (Auto-sized)     │ │
│ │             │ │                     │ │
│ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────┘

Tablet Portrait (768px-1023px):
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │        Game Canvas (Full Width)     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │        Collapsible Controls         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Mobile (≤767px):
┌───────────────────────┐
│                       │
│    Game Canvas        │
│   (Fullscreen)        │
│                       │
│  ┌─D-pad─┐  ┌─Actions─┐│
│  │       │  │   Jump  ││
│  │   ←   │  │  Dodge  ││
│  └───────┘  └─────────┘│
└───────────────────────┘
```

### Canvas Scaling Strategy

```javascript
// Multi-stage responsive scaling system
const CANVAS_CONFIG = {
  baseWidth: 800,
  baseHeight: 400,
  minScale: 0.5,
  maxScale: 3.0,
  pixelPerfect: true
};

function calculateCanvasScale() {
  const viewport = getViewportDimensions();
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Strategy 1: Mobile Fullscreen (landscape/portrait adaptive)
  if (viewport.width <= 767) {
    return calculateMobileScale(viewport, devicePixelRatio);
  }
  
  // Strategy 2: Tablet Fit-to-Container
  if (viewport.width <= 1023) {
    return calculateTabletScale(viewport, devicePixelRatio);
  }
  
  // Strategy 3: Desktop Flexible
  return calculateDesktopScale(viewport, devicePixelRatio);
}

function calculateMobileScale(viewport, dpr) {
  const orientation = getOrientation();
  
  if (orientation === 'portrait') {
    // Portrait: Maximize width, letterbox height
    const scaleX = viewport.width / CANVAS_CONFIG.baseWidth;
    const scaleY = (viewport.height * 0.7) / CANVAS_CONFIG.baseHeight; // 70% height for controls
    return Math.min(scaleX, scaleY);
  } else {
    // Landscape: Fill available space
    const safeAreaTop = getCSSCustomProperty('--sat', 0);
    const safeAreaBottom = getCSSCustomProperty('--sab', 0);
    const availableHeight = viewport.height - safeAreaTop - safeAreaBottom - 100; // 100px for controls
    
    return Math.min(
      viewport.width / CANVAS_CONFIG.baseWidth,
      availableHeight / CANVAS_CONFIG.baseHeight
    );
  }
}
```

### Safe Area Handling

```css
/* Safe area inset variables */
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}

/* Game container with safe area support */
#gameContainer {
  padding: 
    var(--sat) 
    var(--sar) 
    var(--sab) 
    var(--sal);
  
  /* iPhone X+ landscape rotation handling */
  @media screen and (device-width: 375px) and (device-height: 812px) and (orientation: landscape) {
    padding-left: max(var(--sal), 44px);
    padding-right: max(var(--sar), 44px);
  }
}

/* Mobile controls positioned outside safe areas */
#mobileControls {
  bottom: calc(var(--sab) + 20px);
  left: calc(var(--sal) + 20px);
  right: calc(var(--sar) + 20px);
}
```

---

## Input Systems

### Desktop Keyboard Mapping

```javascript
const KEYBOARD_CONFIG = {
  // Movement
  moveLeft: ['ArrowLeft', 'KeyA', 'KeyH'],
  moveRight: ['ArrowRight', 'KeyD', 'KeyL'],
  jump: ['Space', 'ArrowUp', 'KeyW', 'KeyK'],
  crouch: ['ArrowDown', 'KeyS', 'KeyJ'],
  
  // Actions
  dodge: ['ShiftLeft', 'ShiftRight'],
  interact: ['KeyE', 'Enter'],
  sit: ['KeyQ'],
  
  // Game controls
  pause: ['Escape', 'KeyP'],
  restart: ['KeyR'],
  fullscreen: ['KeyF', 'F11'],
  
  // Debug (development only)
  debugToggle: ['KeyB'],
  speedBoost: ['KeyN'],
  
  // Customizable bindings
  allowRebinding: true,
  defaultBindings: true
};

class KeyboardManager {
  constructor() {
    this.bindings = { ...KEYBOARD_CONFIG };
    this.pressedKeys = new Set();
    this.justPressedKeys = new Set();
    this.justReleasedKeys = new Set();
  }
  
  handleKeyDown(event) {
    event.preventDefault();
    const action = this.getActionForKey(event.code);
    
    if (action && !this.pressedKeys.has(action)) {
      this.pressedKeys.add(action);
      this.justPressedKeys.add(action);
      this.triggerHapticFeedback('light');
    }
  }
  
  // Debounce system for rapid keypresses
  debounceAction(action, delay = 100) {
    if (this.debounceTimers[action]) return false;
    
    this.debounceTimers[action] = setTimeout(() => {
      delete this.debounceTimers[action];
    }, delay);
    
    return true;
  }
}
```

### Mobile Touch Controls

```javascript
const TOUCH_CONFIG = {
  // Touch target sizes (minimum 44px for accessibility)
  minTouchTarget: 44,
  touchTargetPadding: 12,
  
  // Control positioning
  dpadSize: 150,
  dpadPosition: { bottom: 20, left: 20 },
  actionButtonSize: 70,
  actionButtonPosition: { bottom: 40, right: 20 },
  
  // Touch behavior
  touchResponse: 'immediate',
  hapticFeedback: true,
  visualFeedback: true,
  preventScrolling: true
};

class TouchManager {
  constructor() {
    this.activeTouches = new Map();
    this.touchStartTime = new Map();
    this.setupTouchControls();
  }
  
  setupTouchControls() {
    this.createDpad();
    this.createActionButtons();
    this.setupTouchListeners();
  }
  
  createDpad() {
    const dpad = document.createElement('div');
    dpad.className = 'touch-dpad';
    
    // Create directional buttons with proper spacing
    const directions = [
      { key: 'ArrowUp', position: 'top', icon: '▲' },
      { key: 'ArrowDown', position: 'bottom', icon: '▼' },
      { key: 'ArrowLeft', position: 'left', icon: '◄' },
      { key: 'ArrowRight', position: 'right', icon: '►' }
    ];
    
    directions.forEach(dir => {
      const button = this.createTouchButton(dir.key, dir.icon, dir.position);
      button.classList.add('dpad-button', `dpad-${dir.position}`);
      dpad.appendChild(button);
    });
    
    return dpad;
  }
  
  handleTouchStart(event, element) {
    event.preventDefault();
    
    const touchId = event.changedTouches[0].identifier;
    const key = element.dataset.key;
    
    this.activeTouches.set(touchId, key);
    this.touchStartTime.set(touchId, Date.now());
    
    // Visual feedback
    element.classList.add('pressed');
    
    // Haptic feedback
    this.triggerHapticFeedback('light');
    
    // Register key press
    game.inputManager.setKeyPressed(key, true);
  }
  
  // Gesture recognition for special moves
  recognizeSwipeGesture(startTouch, endTouch) {
    const deltaX = endTouch.clientX - startTouch.clientX;
    const deltaY = endTouch.clientY - startTouch.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endTouch.timeStamp - startTouch.timeStamp;
    
    if (distance > 50 && duration < 300) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'swipeRight' : 'swipeLeft';
      } else {
        return deltaY > 0 ? 'swipeDown' : 'swipeUp';
      }
    }
    
    return null;
  }
}
```

### Input Feedback and Responsiveness

```css
/* Visual feedback for all interactive elements */
.touch-button, .dpad-button, .interactive-element {
  transition: all 0.1s ease-out;
  transform-origin: center;
}

.touch-button:active,
.touch-button.pressed {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 0 10px rgba(255, 255, 255, 0.3),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Ripple effect for touch feedback */
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.touch-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  animation: ripple 0.4s ease-out;
}
```

---

## UI/UX Components

### Game HUD Layout Variations

```css
/* Responsive HUD system */
#gameHUD {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: grid;
  padding: var(--spacing-md);
  
  /* Desktop layout */
  grid-template-areas: 
    "score lives time"
    "level speed extra";
  grid-template-columns: 1fr auto 1fr;
  gap: var(--spacing-sm);
}

/* Mobile HUD adjustments */
@media (max-width: 767px) {
  #gameHUD {
    grid-template-areas: 
      "score time"
      "lives speed"
      "level extra";
    grid-template-columns: 1fr 1fr;
    font-size: 0.9em;
    padding: var(--spacing-sm);
  }
  
  /* Compact mobile HUD for portrait */
  @media (orientation: portrait) {
    grid-template-areas: "score lives time level";
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xs);
  }
}

/* HUD elements */
.hud-element {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  text-align: center;
  backdrop-filter: blur(4px);
}
```

### Sprite Editor Interface

```css
/* Adaptive sprite editor layout */
.sprite-editor {
  display: grid;
  gap: var(--spacing-md);
  height: 100%;
}

/* Desktop: Side-by-side layout */
@media (min-width: 1024px) {
  .sprite-editor {
    grid-template-areas: 
      "canvas tools"
      "canvas properties";
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 2fr 1fr;
  }
}

/* Tablet: Stacked layout */
@media (min-width: 768px) and (max-width: 1023px) {
  .sprite-editor {
    grid-template-areas:
      "canvas"
      "tools"
      "properties";
    grid-template-rows: 2fr 1fr auto;
  }
}

/* Mobile: Collapsible sections */
@media (max-width: 767px) {
  .sprite-editor {
    grid-template-areas:
      "canvas"
      "controls";
    grid-template-rows: 1fr auto;
  }
  
  .sprite-tools,
  .sprite-properties {
    display: none;
  }
  
  .sprite-tools.expanded,
  .sprite-properties.expanded {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-surface);
    z-index: 1000;
    overflow-y: auto;
    padding: var(--spacing-md);
  }
}

/* Touch-optimized controls */
@media (pointer: coarse) {
  .sprite-control {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
  
  .range-input {
    height: 40px;
  }
  
  .number-input {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px;
  }
}
```

### Modal and Overlay Specifications

```css
/* Modal system with responsive behavior */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(8px);
  padding: var(--spacing-lg);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  /* Desktop */
  width: min(600px, 90vw);
  padding: var(--spacing-xl);
}

/* Mobile modal adjustments */
@media (max-width: 767px) {
  .modal-overlay {
    padding: var(--spacing-sm);
    align-items: flex-end; /* Bottom-sheet style on mobile */
  }
  
  .modal {
    width: 100%;
    max-height: 80vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: var(--spacing-lg);
    
    /* Smooth slide-in animation */
    transform: translateY(100%);
    animation: slideUp 0.3s ease-out forwards;
  }
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

/* Settings panel responsive design */
.settings-panel {
  display: grid;
  gap: var(--spacing-lg);
  
  /* Desktop: Multi-column layout */
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

@media (max-width: 767px) {
  .settings-panel {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
```

---

## Performance Optimization

### Rendering Strategies

```javascript
// Adaptive rendering pipeline
class RenderManager {
  constructor() {
    this.renderStrategy = this.selectRenderStrategy();
    this.frameBuffer = this.createFrameBuffer();
    this.cullingEnabled = true;
    this.levelOfDetail = true;
  }
  
  selectRenderStrategy() {
    const deviceInfo = this.analyzeDevice();
    
    if (deviceInfo.isLowEnd) {
      return new LowEndRenderStrategy();
    } else if (deviceInfo.isMobile) {
      return new MobileOptimizedStrategy();
    } else {
      return new HighPerformanceStrategy();
    }
  }
  
  analyzeDevice() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    return {
      isLowEnd: this.checkLowEndDevice(),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      supportsWebGL: !!gl,
      devicePixelRatio: window.devicePixelRatio || 1,
      screenSize: { width: screen.width, height: screen.height },
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 2
    };
  }
  
  checkLowEndDevice() {
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    
    // Heuristics for low-end device detection
    if (memory && memory <= 2) return true;
    if (cores && cores <= 2) return true;
    if (window.devicePixelRatio && window.devicePixelRatio < 2) return true;
    
    return false;
  }
}

// Viewport culling system
class CullingSystem {
  constructor(camera) {
    this.camera = camera;
    this.cullingMargin = 100; // Pixels outside viewport
  }
  
  cullEntities(entities) {
    const viewport = this.getViewport();
    
    return entities.filter(entity => {
      return this.isInViewport(entity, viewport);
    });
  }
  
  isInViewport(entity, viewport) {
    return !(
      entity.x + entity.width < viewport.x - this.cullingMargin ||
      entity.x > viewport.x + viewport.width + this.cullingMargin ||
      entity.y + entity.height < viewport.y - this.cullingMargin ||
      entity.y > viewport.y + viewport.height + this.cullingMargin
    );
  }
}
```

### Asset Loading and Caching

```javascript
// Progressive asset loading system
class AssetManager {
  constructor() {
    this.cache = new Map();
    this.loadingQueue = [];
    this.loadingPriority = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    this.initializeServiceWorker();
  }
  
  // Lazy loading with intersection observer
  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadAsset(entry.target.dataset.src, 'medium');
          observer.unobserve(entry.target);
        }
      });
    });
    
    document.querySelectorAll('[data-lazy-src]').forEach(img => {
      observer.observe(img);
    });
  }
  
  // Preload critical assets
  async preloadCriticalAssets() {
    const criticalAssets = [
      'sprites/cat-idle.png',
      'sprites/cat-run.png',
      'sprites/platforms.png',
      'audio/jump.mp3'
    ];
    
    const promises = criticalAssets.map(asset => 
      this.loadAsset(asset, 'critical')
    );
    
    await Promise.all(promises);
  }
  
  // Adaptive quality based on device capability
  selectAssetQuality(deviceInfo) {
    if (deviceInfo.isLowEnd) {
      return 'low'; // Compressed textures, lower resolution
    } else if (deviceInfo.isMobile) {
      return 'medium'; // Balanced quality/size
    } else {
      return 'high'; // Full quality assets
    }
  }
}

// Service Worker for aggressive caching
const CACHE_STRATEGY = {
  assets: 'cache-first',
  api: 'network-first',
  fallback: 'cache-only'
};
```

### Memory Management for Mobile

```javascript
class MemoryManager {
  constructor() {
    this.memoryThreshold = this.calculateMemoryThreshold();
    this.gcInterval = 30000; // 30 seconds
    this.objectPool = new ObjectPool();
    
    this.startMemoryMonitoring();
  }
  
  calculateMemoryThreshold() {
    const deviceMemory = navigator.deviceMemory || 4;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Conservative thresholds for mobile devices
    if (isMobile && deviceMemory <= 2) {
      return 50 * 1024 * 1024; // 50MB
    } else if (isMobile) {
      return 100 * 1024 * 1024; // 100MB
    } else {
      return 200 * 1024 * 1024; // 200MB
    }
  }
  
  startMemoryMonitoring() {
    setInterval(() => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        
        if (used > this.memoryThreshold) {
          this.performGarbageCollection();
        }
        
        this.logMemoryUsage(used, total);
      }
    }, this.gcInterval);
  }
  
  performGarbageCollection() {
    // Clear unused textures
    this.clearUnusedTextures();
    
    // Return objects to pools
    this.objectPool.returnUnused();
    
    // Clear audio buffers
    this.clearAudioBuffers();
    
    // Force garbage collection if available (dev tools)
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  }
}

// Object pooling for frequently created/destroyed objects
class ObjectPool {
  constructor() {
    this.pools = {
      particles: [],
      bullets: [],
      animations: []
    };
  }
  
  get(type) {
    const pool = this.pools[type];
    return pool.length > 0 ? pool.pop() : this.create(type);
  }
  
  return(type, object) {
    object.reset();
    this.pools[type].push(object);
  }
  
  create(type) {
    switch (type) {
      case 'particles': return new Particle();
      case 'bullets': return new Bullet();
      case 'animations': return new Animation();
    }
  }
}
```

---

## Accessibility

### Touch Target Sizes

```css
/* WCAG 2.1 compliant touch targets (minimum 44x44px) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: var(--spacing-sm);
  margin: var(--spacing-xs);
  
  /* Increase for small screens */
  @media (max-width: 480px) {
    min-width: 48px;
    min-height: 48px;
  }
}

/* Ensure adequate spacing between touch targets */
.touch-controls {
  gap: var(--touch-spacing, 8px);
}

.touch-controls .touch-target:not(:last-child) {
  margin-right: var(--touch-spacing, 8px);
}

/* Visual focus indicators */
.touch-target:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Color Contrast Requirements

```css
:root {
  /* WCAG AA compliant color system */
  --color-text: #ffffff;
  --color-text-secondary: #e0e0e0;
  --color-background: #1a1a2e;
  --color-surface: #16213e;
  --color-primary: #e94560;
  --color-success: #2ecc71;
  --color-warning: #f39c12;
  --color-error: #e74c3c;
  
  /* High contrast mode overrides */
  --hc-text: #ffffff;
  --hc-background: #000000;
  --hc-primary: #ffff00;
  --hc-border: #ffffff;
}

/* High contrast mode */
.high-contrast {
  --color-text: var(--hc-text);
  --color-background: var(--hc-background);
  --color-primary: var(--hc-primary);
  --color-border: var(--hc-border);
}

.high-contrast * {
  border-color: var(--hc-border) !important;
}

.high-contrast canvas {
  filter: contrast(150%) brightness(120%);
}

/* System high contrast media query */
@media (prefers-contrast: high) {
  :root {
    --color-text: var(--hc-text);
    --color-background: var(--hc-background);
    --color-primary: var(--hc-primary);
  }
}
```

### Motion Settings and Reduced Motion

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .parallax-background {
    transform: none !important;
  }
  
  .particle-effect {
    display: none !important;
  }
}

/* Reduced motion class for manual toggle */
.reduced-motion {
  animation-play-state: paused !important;
}

.reduced-motion .animated-element {
  animation: none !important;
  transition: none !important;
}
```

### Screen Reader Support

```html
<!-- Semantic HTML structure -->
<main id="gameContainer" role="main" aria-label="Cat Platformer Game">
  
  <!-- Game area with proper labeling -->
  <section id="gameArea" role="img" aria-label="Game Canvas" aria-describedby="gameDescription">
    <canvas id="gameCanvas" 
            role="img" 
            aria-label="Game viewport showing cat platformer action">
    </canvas>
  </section>
  
  <!-- Invisible description for screen readers -->
  <div id="gameDescription" class="sr-only">
    A 2D platformer game where you control a cat character through various levels,
    avoiding obstacles and collecting treats. Use arrow keys or touch controls to move.
  </div>
  
  <!-- Game controls with proper ARIA -->
  <div id="gameControls" role="group" aria-label="Game Controls">
    
    <!-- Mobile controls with descriptive labels -->
    <div id="mobileControls" role="group" aria-label="Touch Controls">
      <button class="touch-button" 
              data-key="ArrowLeft"
              aria-label="Move cat left"
              role="button">◄</button>
      
      <button class="touch-button" 
              data-key=" "
              aria-label="Make cat jump"
              role="button">Jump</button>
    </div>
    
    <!-- HUD information -->
    <div id="gameHUD" role="status" aria-live="polite" aria-label="Game Status">
      <div id="score" aria-label="Current score">Score: 0</div>
      <div id="lives" aria-label="Remaining lives">Lives: 3</div>
      <div id="level" aria-label="Current level">Level: 1</div>
    </div>
    
  </div>
  
</main>
```

```javascript
// Screen reader announcements
class AccessibilityManager {
  constructor() {
    this.announcer = document.getElementById('announcements');
    if (!this.announcer) {
      this.createAnnouncer();
    }
  }
  
  createAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.id = 'announcements';
    this.announcer.setAttribute('aria-live', 'assertive');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    document.body.appendChild(this.announcer);
  }
  
  announce(message, priority = 'polite') {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }
  
  // Game event announcements
  onLevelComplete(levelNumber) {
    this.announce(`Level ${levelNumber} completed! Moving to next level.`, 'assertive');
  }
  
  onPlayerHurt() {
    this.announce('Ouch! Cat took damage.', 'assertive');
  }
  
  onCollectible(itemName) {
    this.announce(`Collected ${itemName}`, 'polite');
  }
}
```

---

## Visual Design System

### Typography Scale

```css
:root {
  /* Font system */
  --font-mono: 'Courier New', 'Monaco', 'Menlo', monospace;
  --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Type scale (Major Third - 1.25) */
  --text-xs: 0.64rem;   /* 10.24px */
  --text-sm: 0.8rem;    /* 12.8px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.563rem;  /* 25px */
  --text-2xl: 1.953rem; /* 31.25px */
  --text-3xl: 2.441rem; /* 39px */
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}

/* Typography classes */
.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.text-3xl { font-size: var(--text-3xl); }

/* Responsive typography */
@media (max-width: 767px) {
  :root {
    --text-base: 0.9rem;
    --text-lg: 1.1rem;
    --text-xl: 1.3rem;
  }
}
```

### Color Palette

```css
:root {
  /* Brand colors */
  --color-primary: #e94560;     /* Cat pink */
  --color-primary-dark: #c73650;
  --color-primary-light: #ff6b85;
  
  --color-secondary: #f39c12;   /* Orange/yellow accent */
  --color-secondary-dark: #e67e22;
  --color-secondary-light: #f1c40f;
  
  /* Neutral palette */
  --color-gray-50: #f8f9fa;
  --color-gray-100: #e9ecef;
  --color-gray-200: #dee2e6;
  --color-gray-300: #ced4da;
  --color-gray-400: #adb5bd;
  --color-gray-500: #6c757d;
  --color-gray-600: #495057;
  --color-gray-700: #343a40;
  --color-gray-800: #212529;
  --color-gray-900: #1a1a2e;
  
  /* Surface colors */
  --color-background: var(--color-gray-900);
  --color-surface: #16213e;
  --color-surface-elevated: #0f3460;
  
  /* Text colors */
  --color-text: #ffffff;
  --color-text-secondary: #e0e0e0;
  --color-text-muted: #adb5bd;
  
  /* State colors */
  --color-success: #2ecc71;
  --color-warning: #f39c12;
  --color-error: #e74c3c;
  --color-info: #3498db;
  
  /* Game-specific colors */
  --color-platform: #8b4513;
  --color-lava: #ff4500;
  --color-water: #4169e1;
  --color-collectible: #ffd700;
}

/* Dark mode (default) */
.theme-dark {
  color-scheme: dark;
}

/* Light mode alternative */
.theme-light {
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-surface-elevated: #e9ecef;
  --color-text: #212529;
  --color-text-secondary: #495057;
  --color-text-muted: #6c757d;
  
  color-scheme: light;
}
```

### Spacing System

```css
:root {
  /* Spacing scale (based on 8px grid) */
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;      /* 48px */
  --spacing-3xl: 4rem;      /* 64px */
  
  /* Component-specific spacing */
  --touch-spacing: 8px;     /* Minimum space between touch targets */
  --panel-padding: var(--spacing-lg);
  --card-padding: var(--spacing-md);
  --button-padding: var(--spacing-sm) var(--spacing-md);
  
  /* Border radius system */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadow system */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
}
```

### Animation Guidelines

```css
:root {
  /* Animation timing */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 700ms;
  
  /* Easing functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.animate-slide-up {
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.animate-bounce {
  animation: bounce var(--duration-slow) var(--ease-bounce);
}

/* Keyframe definitions */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* Interactive animations */
.interactive {
  transition: all var(--duration-fast) var(--ease-out);
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.interactive:active {
  transform: translateY(0);
  transition-duration: var(--duration-instant);
}
```

---

## Technical Implementation

### CSS Grid and Flexbox Layouts

```css
/* Primary layout structure */
.game-layout {
  display: grid;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
  
  /* Desktop layout */
  grid-template-areas: "sidebar main";
  grid-template-columns: 350px 1fr;
  
  /* Tablet layout */
  @media (max-width: 1023px) {
    grid-template-areas: 
      "main"
      "sidebar";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  
  /* Mobile layout */
  @media (max-width: 767px) {
    grid-template-areas: "main";
    grid-template-columns: 1fr;
    
    .sidebar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      transform: translateY(100%);
      transition: transform var(--duration-normal);
    }
    
    .sidebar.open {
      transform: translateY(0);
    }
  }
}

/* Flexible component layouts */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

/* Responsive utility classes */
.hidden { display: none; }
.md\:hidden { @media (min-width: 768px) { display: none; } }
.lg\:hidden { @media (min-width: 1024px) { display: none; } }

.block { display: block; }
.md\:block { @media (min-width: 768px) { display: block; } }
.lg\:block { @media (min-width: 1024px) { display: block; } }
```

### Canvas Responsive Scaling Implementation

```javascript
class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.baseWidth = 800;
    this.baseHeight = 400;
    this.scale = 1;
    this.actualWidth = this.baseWidth;
    this.actualHeight = this.baseHeight;
    
    this.setupResponsiveScaling();
  }
  
  setupResponsiveScaling() {
    this.updateCanvasSize();
    window.addEventListener('resize', this.debounce(() => {
      this.updateCanvasSize();
    }, 100));
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateCanvasSize(), 100);
    });
  }
  
  updateCanvasSize() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate optimal scale
    this.scale = this.calculateScale(containerRect);
    
    // Set display size
    this.canvas.style.width = `${this.baseWidth * this.scale}px`;
    this.canvas.style.height = `${this.baseHeight * this.scale}px`;
    
    // Set actual size (accounting for device pixel ratio)
    this.actualWidth = this.baseWidth * this.scale * devicePixelRatio;
    this.actualHeight = this.baseHeight * this.scale * devicePixelRatio;
    
    this.canvas.width = this.actualWidth;
    this.canvas.height = this.actualHeight;
    
    // Scale the context to match device pixel ratio
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Configure pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    
    this.onResize();
  }
  
  calculateScale(containerRect) {
    const isMobile = window.innerWidth <= 767;
    const availableWidth = containerRect.width;
    const availableHeight = containerRect.height;
    
    if (isMobile) {
      // Mobile: Use maximum available space
      const scaleX = availableWidth / this.baseWidth;
      const scaleY = availableHeight / this.baseHeight;
      return Math.min(scaleX, scaleY, 3); // Cap at 3x scale
    } else {
      // Desktop: Balanced scaling
      const optimalScale = Math.min(
        availableWidth / this.baseWidth,
        availableHeight / this.baseHeight
      );
      return Math.max(0.5, Math.min(optimalScale, 2.5));
    }
  }
  
  // Convert screen coordinates to game coordinates
  screenToGame(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.baseWidth / rect.width;
    const scaleY = this.baseHeight / rect.height;
    
    return {
      x: (screenX - rect.left) * scaleX,
      y: (screenY - rect.top) * scaleY
    };
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
```

### Touch Event Handling

```javascript
class TouchEventManager {
  constructor() {
    this.touches = new Map();
    this.swipeThreshold = 50;
    this.tapThreshold = 10;
    this.longPressThreshold = 500;
    this.preventDefaults = ['touchstart', 'touchmove', 'touchend'];
    
    this.setupTouchListeners();
  }
  
  setupTouchListeners() {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
  }
  
  handleTouchStart(event) {
    if (this.shouldPreventDefault(event.target)) {
      event.preventDefault();
    }
    
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
        element: document.elementFromPoint(touch.clientX, touch.clientY)
      });
      
      // Start long press timer
      setTimeout(() => {
        if (this.touches.has(touch.identifier)) {
          this.handleLongPress(touch.identifier);
        }
      }, this.longPressThreshold);
    });
  }
  
  handleTouchMove(event) {
    if (this.shouldPreventDefault(event.target)) {
      event.preventDefault();
    }
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (touchData) {
        touchData.currentX = touch.clientX;
        touchData.currentY = touch.clientY;
      }
    });
  }
  
  handleTouchEnd(event) {
    if (this.shouldPreventDefault(event.target)) {
      event.preventDefault();
    }
    
    Array.from(event.changedTouches).forEach(touch => {
      const touchData = this.touches.get(touch.identifier);
      if (!touchData) return;
      
      const duration = Date.now() - touchData.startTime;
      const deltaX = touch.clientX - touchData.startX;
      const deltaY = touch.clientY - touchData.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Determine gesture type
      if (distance < this.tapThreshold && duration < 200) {
        this.handleTap(touchData.element, touch);
      } else if (distance > this.swipeThreshold && duration < 300) {
        this.handleSwipe(deltaX, deltaY, touchData.element);
      }
      
      this.touches.delete(touch.identifier);
    });
  }
  
  handleTap(element, touch) {
    // Trigger haptic feedback
    this.triggerHapticFeedback('light');
    
    // Handle game control elements
    if (element.classList.contains('touch-button') || 
        element.classList.contains('dpad-button')) {
      this.handleControlTap(element);
    }
  }
  
  handleSwipe(deltaX, deltaY, element) {
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontal) {
      if (deltaX > 0) {
        this.dispatchGameEvent('swipeRight');
      } else {
        this.dispatchGameEvent('swipeLeft');
      }
    } else {
      if (deltaY > 0) {
        this.dispatchGameEvent('swipeDown');
      } else {
        this.dispatchGameEvent('swipeUp');
      }
    }
  }
  
  shouldPreventDefault(element) {
    return element.closest('#gameArea') || 
           element.classList.contains('touch-button') ||
           element.classList.contains('dpad-button');
  }
  
  triggerHapticFeedback(type = 'light') {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([10, 10, 20]);
          break;
      }
    }
  }
}
```

### Viewport Meta Tag Configuration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  
  <!-- Comprehensive viewport configuration -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  
  <!-- PWA meta tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Cat Platformer">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="application-name" content="Cat Platformer">
  
  <!-- Theme colors -->
  <meta name="theme-color" content="#1a1a2e">
  <meta name="msapplication-navbutton-color" content="#1a1a2e">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- Prevent automatic phone number detection -->
  <meta name="format-detection" content="telephone=no">
  
  <!-- Optimize for performance -->
  <meta http-equiv="x-dns-prefetch-control" content="on">
  
  <title>Cat Platformer</title>
  
  <!-- Preload critical resources -->
  <link rel="preload" href="sprites/cat-sprites.png" as="image">
  <link rel="preload" href="audio/jump.mp3" as="audio">
  
  <style>
    /* Critical CSS inlined for fastest rendering */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: monospace;
      background: #1a1a2e;
      color: #eee;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      height: 100dvh; /* Dynamic viewport height */
      position: fixed;
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
</head>
```

---

## Progressive Web App Features

### Service Worker Implementation

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'cat-platformer-v1.0.0';
const OFFLINE_URL = '/offline.html';

const CACHE_STRATEGIES = {
  // Cache first for game assets
  assets: [
    '/',
    '/index.html',
    '/sprites/cat-sprites.png',
    '/sprites/dog-sprites.png',
    '/sprites/platforms.png',
    '/audio/jump.mp3',
    '/audio/collect.mp3',
    '/audio/hurt.mp3'
  ],
  
  // Network first for API calls (if any)
  api: [],
  
  // Runtime cache for user-generated content
  runtime: []
};

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_STRATEGIES.assets))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event with comprehensive caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'audio') {
    event.respondWith(handleAudioRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handlePageRequest(request));
  }
});

async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return fallback image
    return cache.match('/images/fallback.png');
  }
}

async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match(OFFLINE_URL);
    }
    throw error;
  }
}
```

### Web App Manifest

```json
{
  "name": "Cat Platformer",
  "short_name": "CatGame",
  "description": "A fun 2D platformer game featuring cats with sprite customization",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "categories": ["games", "entertainment"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop gameplay screenshot"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "375x667",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile gameplay screenshot"
    }
  ],
  "shortcuts": [
    {
      "name": "Play Game",
      "short_name": "Play",
      "description": "Start playing the cat platformer",
      "url": "/?mode=play",
      "icons": [
        {
          "src": "/icons/play-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Sprite Editor",
      "short_name": "Editor",
      "description": "Open the sprite editor",
      "url": "/?mode=editor",
      "icons": [
        {
          "src": "/icons/edit-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

### Installation and Update Management

```javascript
// PWA installation and update management
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = this.checkInstallStatus();
    
    this.setupInstallPrompt();
    this.setupUpdateHandling();
    this.setupOfflineHandling();
  }
  
  checkInstallStatus() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }
  
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      this.trackEvent('pwa_installed');
    });
  }
  
  async promptInstall() {
    if (!this.deferredPrompt) return;
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.trackEvent('install_prompt_result', { outcome });
    this.deferredPrompt = null;
  }
  
  setupUpdateHandling() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.showUpdateAvailableNotification();
      });
      
      // Check for updates periodically
      setInterval(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATE' });
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  setupOfflineHandling() {
    window.addEventListener('online', () => {
      this.hideOfflineNotification();
      this.syncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      this.showOfflineNotification();
    });
  }
  
  showInstallButton() {
    const installButton = document.getElementById('installButton');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => this.promptInstall());
    }
  }
  
  showUpdateAvailableNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-message">
        A new version is available!
        <button onclick="window.location.reload()">Update Now</button>
        <button onclick="this.parentElement.remove()">Later</button>
      </div>
    `;
    document.body.appendChild(notification);
  }
  
  trackEvent(eventName, properties = {}) {
    // Analytics tracking for PWA events
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
  }
}

// Initialize PWA manager
const pwaManager = new PWAManager();
```

---

## Implementation Checklist

### Phase 1: Core Responsive Framework
- [ ] Implement CSS Grid layout system
- [ ] Add responsive breakpoints and media queries
- [ ] Create canvas scaling system
- [ ] Add safe area inset support
- [ ] Implement touch event handling

### Phase 2: Input and Control Systems
- [ ] Enhance mobile touch controls
- [ ] Add gesture recognition
- [ ] Implement haptic feedback
- [ ] Create customizable keyboard bindings
- [ ] Add input debugging tools

### Phase 3: UI Component System
- [ ] Build responsive HUD system
- [ ] Create adaptive sprite editor interface
- [ ] Implement modal/overlay system
- [ ] Add settings panel responsive design
- [ ] Create loading and error states

### Phase 4: Performance Optimization
- [ ] Implement adaptive rendering strategies
- [ ] Add object pooling system
- [ ] Create asset loading manager
- [ ] Add memory management for mobile
- [ ] Implement viewport culling

### Phase 5: Accessibility Features
- [ ] Add ARIA labels and screen reader support
- [ ] Implement high contrast mode
- [ ] Add reduced motion support
- [ ] Ensure WCAG 2.1 AA compliance
- [ ] Create keyboard navigation system

### Phase 6: Progressive Web App
- [ ] Implement service worker
- [ ] Create web app manifest
- [ ] Add installation prompts
- [ ] Implement offline functionality
- [ ] Add update management

### Phase 7: Visual Polish
- [ ] Finalize design system
- [ ] Add smooth animations
- [ ] Implement visual feedback system
- [ ] Create loading animations
- [ ] Add micro-interactions

---

This comprehensive specification provides a roadmap for creating a fully responsive, accessible, and high-performance cat platformer game that works seamlessly across all devices while maintaining the current game's functionality and charm.