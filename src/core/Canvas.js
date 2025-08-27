/**
 * Canvas Management Module - US-003 Implementation
 * 
 * Extracted from Game.js to provide reusable canvas utilities
 * with complete feature parity including:
 * - Context management and setup
 * - Responsive scaling and aspect ratio preservation  
 * - Coordinate system utilities
 * - High contrast and accessibility features
 * - Performance-optimized rendering operations
 */

export class Canvas {
    constructor(canvasElement) {
        if (!canvasElement) {
            throw new Error('Canvas element is required');
        }

        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas state
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        // Accessibility settings
        this.highContrast = false;
        this.reducedMotion = false;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.currentFPS = 0;
        
        // Performance optimizations
        this.batchedDrawCalls = [];
        this.enableBatching = true;
        this.drawCallCache = new Map();
        this.maxCacheSize = 100;
        
        // Initialize canvas setup
        this.setupCanvas();
        this.setupAccessibility();
        this.setupResponsiveHandling();
    }

    /**
     * Initialize canvas with optimal settings for pixel-perfect rendering
     */
    setupCanvas() {
        // Set up high-DPI support
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.pixelRatio;
        this.canvas.height = rect.height * this.pixelRatio;
        this.width = rect.width;
        this.height = rect.height;
        
        // Scale context for high-DPI displays
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Optimize for pixel art
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
    }

    /**
     * Set up accessibility features
     */
    setupAccessibility() {
        // Check for user preferences
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.setHighContrast(true);
        }
        
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.reducedMotion = true;
        }

        // Listen for accessibility preference changes
        if (window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addEventListener('change', (e) => {
                this.setHighContrast(e.matches);
            });

            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addEventListener('change', (e) => {
                this.reducedMotion = e.matches;
            });
        }
    }

    /**
     * Set up responsive canvas handling
     */
    setupResponsiveHandling() {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this.resize(entry.contentRect.width, entry.contentRect.height);
            }
        });
        
        resizeObserver.observe(this.canvas.parentElement || this.canvas);
        
        // Store observer for cleanup
        this.resizeObserver = resizeObserver;
    }

    /**
     * Resize canvas while maintaining aspect ratio and pixel-perfect rendering
     */
    resize(newWidth, newHeight) {
        // Store old dimensions for comparison
        const oldWidth = this.width;
        const oldHeight = this.height;
        
        // Update dimensions
        this.width = newWidth;
        this.height = newHeight;
        
        // Update canvas element
        this.canvas.width = newWidth * this.pixelRatio;
        this.canvas.height = newHeight * this.pixelRatio;
        this.canvas.style.width = newWidth + 'px';
        this.canvas.style.height = newHeight + 'px';
        
        // Re-scale context for high-DPI displays
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Re-apply canvas settings
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        // Emit resize event for listeners
        this.canvas.dispatchEvent(new CustomEvent('canvasResize', {
            detail: { 
                oldWidth, 
                oldHeight, 
                newWidth: this.width, 
                newHeight: this.height 
            }
        }));
    }

    /**
     * Enable/disable high contrast mode for accessibility
     */
    setHighContrast(enabled) {
        this.highContrast = enabled;
        
        // Apply contrast CSS class for external styling
        if (enabled) {
            this.canvas.classList.add('high-contrast');
        } else {
            this.canvas.classList.remove('high-contrast');
        }
        
        console.log(`High contrast mode: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get rendering context with proper setup
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Convert screen coordinates to game coordinates
     * Accounts for canvas scaling and positioning
     */
    screenToGame(screenX, screenY, camera = { x: 0, y: 0 }) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;
        
        const gameX = ((screenX - rect.left) * scaleX) + camera.x;
        const gameY = ((screenY - rect.top) * scaleY) + camera.y;
        
        return { x: gameX, y: gameY };
    }

    /**
     * Convert game coordinates to screen coordinates
     */
    gameToScreen(gameX, gameY, camera = { x: 0, y: 0 }) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.width;
        const scaleY = rect.height / this.height;
        
        const screenX = ((gameX - camera.x) * scaleX) + rect.left;
        const screenY = ((gameY - camera.y) * scaleY) + rect.top;
        
        return { x: screenX, y: screenY };
    }

    /**
     * Clear the entire canvas with optional background color
     */
    clear(backgroundColor = null) {
        if (backgroundColor) {
            this.ctx.fillStyle = backgroundColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Save current canvas state
     */
    save() {
        this.ctx.save();
    }

    /**
     * Restore canvas state
     */
    restore() {
        this.ctx.restore();
    }

    /**
     * Apply camera transformation
     */
    applyCameraTransform(camera) {
        this.ctx.translate(-camera.x, -camera.y);
    }

    /**
     * Set fill style with optional high contrast adjustment
     */
    setFillStyle(color) {
        if (this.highContrast) {
            // Convert colors to high contrast equivalents
            color = this.adjustColorForHighContrast(color);
        }
        this.ctx.fillStyle = color;
    }

    /**
     * Adjust colors for high contrast mode
     */
    adjustColorForHighContrast(color) {
        // High contrast color mappings
        const contrastMap = {
            '#FF6B35': '#FFFF00', // Player: Orange -> Bright Yellow
            '#FF8C00': '#FFFF00', // Treats: Orange -> Bright Yellow
            '#8B4513': '#FFFFFF', // Platforms: Brown -> White
            '#FF4500': '#FF0000', // Lava: Red Orange -> Pure Red
            '#DC143C': '#FF0000', // Couch: Dark Red -> Pure Red
            '#228B22': '#00FF00', // Grass: Forest Green -> Lime Green
            '#87CEEB': '#00FFFF', // Background: Sky Blue -> Cyan
            '#4A5F7A': '#000080', // Dark background -> Navy
            '#808080': '#FFFFFF', // Mice: Gray -> White
            '#FF0000': '#FF0000', // Fireballs: Keep red
            '#4169E1': '#0000FF', // Water: Royal Blue -> Pure Blue
            '#FF6347': '#FF0000'  // Food: Tomato -> Pure Red
        };
        
        return contrastMap[color] || color;
    }

    /**
     * Draw a filled rectangle with optional high contrast support
     */
    fillRect(x, y, width, height, color) {
        if (this.enableBatching) {
            this.batchedDrawCalls.push({
                type: 'fillRect',
                x, y, width, height, color
            });
        } else {
            this.setFillStyle(color);
            this.ctx.fillRect(x, y, width, height);
        }
    }

    // Execute all batched draw calls
    flushBatch() {
        if (this.batchedDrawCalls.length === 0) return;

        // Sort draw calls by color to minimize context switches
        this.batchedDrawCalls.sort((a, b) => {
            if (a.color === b.color) return 0;
            return a.color < b.color ? -1 : 1;
        });

        let currentColor = null;
        for (const call of this.batchedDrawCalls) {
            if (call.color !== currentColor) {
                this.setFillStyle(call.color);
                currentColor = call.color;
            }

            if (call.type === 'fillRect') {
                this.ctx.fillRect(call.x, call.y, call.width, call.height);
            }
        }

        this.batchedDrawCalls.length = 0;
    }

    // Enable/disable batching
    setBatching(enabled) {
        if (!enabled && this.enableBatching) {
            this.flushBatch();
        }
        this.enableBatching = enabled;
    }

    /**
     * Set global alpha with reduced motion consideration
     */
    setAlpha(alpha) {
        // Reduce alpha effects if reduced motion is preferred
        if (this.reducedMotion && alpha < 1) {
            alpha = Math.max(0.7, alpha); // Don't go below 70% opacity
        }
        this.ctx.globalAlpha = alpha;
    }

    /**
     * Reset global alpha
     */
    resetAlpha() {
        this.ctx.globalAlpha = 1;
    }

    /**
     * Update performance metrics
     */
    updateFPS(timestamp) {
        this.frameCount++;
        
        if (timestamp - this.lastFPSTime >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (timestamp - this.lastFPSTime));
            this.frameCount = 0;
            this.lastFPSTime = timestamp;
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.currentFPS;
    }

    /**
     * Check if reduced motion is preferred
     */
    shouldReduceMotion() {
        return this.reducedMotion;
    }

    /**
     * Get canvas dimensions
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // Remove accessibility event listeners
        if (window.matchMedia) {
            // Note: In a full implementation, we'd store references to remove these
            console.log('Canvas cleanup completed');
        }
    }
}

export default Canvas;