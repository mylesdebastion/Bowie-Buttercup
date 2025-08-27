/**
 * InputManager - Unified Input Handling System
 * 
 * US-004: Input Management System Implementation
 * 
 * Provides a unified interface for keyboard and touch input,
 * maintaining identical responsiveness to the original monolithic version.
 * 
 * Features:
 * - Unified keyboard and touch input handling
 * - Input state management (current/previous frame)
 * - Input buffering for precise timing
 * - Mobile D-pad support with exact touch mapping
 * - Key mapping configuration and normalization
 * - Frame-based input updates for consistent timing
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Raw input state - mirrors monolithic version exactly
        this.keys = {};
        this.previousKeys = {};
        
        // Key mapping system - matches monolithic keyMap
        this.keyMap = {
            left: ['ArrowLeft', 'a', 'A'],
            right: ['ArrowRight', 'd', 'D'],
            jump: [' ', 'w', 'W', 'ArrowUp'],
            crouch: ['s', 'S', 'ArrowDown'],
            sit: ['q', 'Q'],
            dodge: ['e', 'E'],
            restart: ['r', 'R'],
            toggleMode: ['Tab'],
            debug: ['`'],
            mute: ['m', 'M']
        };
        
        // Input buffering for frame-perfect timing
        this.jumpBufferTime = 0;
        this.jumpBufferDuration = 100; // milliseconds - matches monolithic
        
        // Touch input state
        this.touchControls = {
            enabled: false,
            active: {},
            buttons: []
        };
        
        // Input history for debugging and analysis
        this.inputHistory = [];
        this.maxHistoryLength = 60; // 1 second at 60fps
        
        // Mobile detection - matches monolithic logic
        this.isMobile = this.detectMobile();
        
        // Event listeners array for cleanup
        this.eventListeners = [];
        
        // Initialize input systems
        this.initKeyboardInput();
        this.initTouchInput();
        
        console.log('🎮 InputManager initialized', {
            mobile: this.isMobile,
            touchEnabled: this.touchControls.enabled
        });
    }
    
    /**
     * Mobile detection - matches monolithic implementation exactly
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || ('ontouchstart' in window)
               || (navigator.maxTouchPoints > 0);
    }
    
    /**
     * Initialize keyboard input handling
     * Matches monolithic addEventListener logic exactly
     */
    initKeyboardInput() {
        const keydownHandler = (e) => {
            this.keys[e.key] = true;
            
            // Handle special keys - matches monolithic behavior
            if (e.key === 'Tab') {
                e.preventDefault();
                // Tab handling will be managed by game logic
            }
            
            if (e.key === 'F11') {
                e.preventDefault();
                // Fullscreen handling will be managed by game logic
            }
            
            // Update input buffer for jump
            if (this.isKeyPressed('jump')) {
                this.jumpBufferTime = Date.now();
            }
        };
        
        const keyupHandler = (e) => {
            this.keys[e.key] = false;
        };
        
        // Add event listeners and store references for cleanup
        window.addEventListener('keydown', keydownHandler);
        window.addEventListener('keyup', keyupHandler);
        
        this.eventListeners.push(
            { element: window, type: 'keydown', handler: keydownHandler },
            { element: window, type: 'keyup', handler: keyupHandler }
        );
    }
    
    /**
     * Initialize touch input handling
     * Implements mobile D-pad with exact monolithic behavior
     */
    initTouchInput() {
        if (!this.isMobile) return;
        
        // Enable touch controls for mobile
        this.touchControls.enabled = true;
        
        // Create mobile control buttons if they don't exist
        this.createMobileControls();
        
        // Setup touch event handlers for existing controls
        this.setupTouchEventHandlers();
        
        // Prevent default touch behaviors - matches monolithic
        const touchMoveHandler = (e) => {
            if (e.target.closest('#gameArea')) {
                e.preventDefault();
            }
        };
        
        // Prevent double-tap zoom - matches monolithic
        let lastTouchEnd = 0;
        const touchEndHandler = (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        };
        
        document.addEventListener('touchmove', touchMoveHandler, { passive: false });
        document.addEventListener('touchend', touchEndHandler, { passive: false });
        
        this.eventListeners.push(
            { element: document, type: 'touchmove', handler: touchMoveHandler },
            { element: document, type: 'touchend', handler: touchEndHandler }
        );
    }
    
    /**
     * Create mobile control interface
     * Matches monolithic mobile control structure
     */
    createMobileControls() {
        let mobileControls = document.getElementById('mobileControls');
        
        if (!mobileControls) {
            // Create mobile controls container
            mobileControls = document.createElement('div');
            mobileControls.id = 'mobileControls';
            mobileControls.innerHTML = `
                <div class="d-pad">
                    <button class="control-btn up-btn" data-key="ArrowUp">↑</button>
                    <button class="control-btn left-btn" data-key="ArrowLeft">←</button>
                    <button class="control-btn down-btn" data-key="ArrowDown">↓</button>
                    <button class="control-btn right-btn" data-key="ArrowRight">→</button>
                </div>
                <div class="action-buttons">
                    <button class="control-btn action-btn" data-key=" ">JUMP</button>
                    <button class="control-btn action-btn" data-key="s">DUCK</button>
                </div>
            `;
            
            // Add CSS for mobile controls
            const style = document.createElement('style');
            style.textContent = `
                #mobileControls {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    display: none;
                    z-index: 1000;
                    pointer-events: auto;
                    user-select: none;
                }
                
                @media (max-width: 768px) {
                    #mobileControls { display: flex; }
                }
                
                .d-pad {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin-right: 20px;
                }
                
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-left: auto;
                }
                
                .control-btn {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border: 2px solid #333;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    touch-action: manipulation;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .control-btn.pressed {
                    background: rgba(255, 165, 0, 0.8);
                    transform: scale(0.95);
                }
                
                .up-btn { top: 0; left: 40px; }
                .left-btn { top: 40px; left: 0; }
                .down-btn { bottom: 0; left: 40px; }
                .right-btn { top: 40px; right: 0; }
                
                .action-btn {
                    position: static;
                    width: 60px;
                    height: 40px;
                    font-size: 12px;
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(mobileControls);
        }
        
        // Store button references
        this.touchControls.buttons = Array.from(mobileControls.querySelectorAll('.control-btn'));
    }
    
    /**
     * Setup touch event handlers for mobile controls
     * Matches monolithic touch handling exactly
     */
    setupTouchEventHandlers() {
        this.touchControls.buttons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            const touchStartHandler = (e) => {
                e.preventDefault();
                button.classList.add('pressed');
                this.keys[key] = true;
                
                // Haptic feedback - matches monolithic
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            };
            
            const touchEndHandler = (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[key] = false;
            };
            
            const touchCancelHandler = (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                this.keys[key] = false;
            };
            
            button.addEventListener('touchstart', touchStartHandler);
            button.addEventListener('touchend', touchEndHandler);
            button.addEventListener('touchcancel', touchCancelHandler);
            
            this.eventListeners.push(
                { element: button, type: 'touchstart', handler: touchStartHandler },
                { element: button, type: 'touchend', handler: touchEndHandler },
                { element: button, type: 'touchcancel', handler: touchCancelHandler }
            );
        });
    }
    
    /**
     * Check if a specific key is currently pressed
     * Matches monolithic isKeyPressed function exactly
     */
    isKeyPressed(action) {
        if (!this.keyMap[action]) {
            console.warn(`Unknown input action: ${action}`);
            return false;
        }
        return this.keyMap[action].some(key => this.keys[key]);
    }
    
    /**
     * Check if a key was just pressed this frame
     */
    isKeyDown(action) {
        if (!this.keyMap[action]) return false;
        return this.keyMap[action].some(key => 
            this.keys[key] && !this.previousKeys[key]
        );
    }
    
    /**
     * Check if a key was just released this frame
     */
    isKeyUp(action) {
        if (!this.keyMap[action]) return false;
        return this.keyMap[action].some(key => 
            !this.keys[key] && this.previousKeys[key]
        );
    }
    
    /**
     * Get raw key state (for compatibility)
     */
    getRawKeyState(keyCode) {
        return this.keys[keyCode] || false;
    }
    
    /**
     * Check if jump input is buffered
     * Implements frame-perfect jump buffering like monolithic version
     */
    isJumpBuffered() {
        return Date.now() - this.jumpBufferTime < this.jumpBufferDuration;
    }
    
    /**
     * Clear jump buffer (called when jump is consumed)
     */
    clearJumpBuffer() {
        this.jumpBufferTime = 0;
    }
    
    /**
     * Get touch input state for compatibility
     */
    getTouchInput() {
        if (!this.touchControls.enabled) return null;
        
        return {
            enabled: this.touchControls.enabled,
            active: { ...this.touchControls.active }
        };
    }
    
    /**
     * Set key mapping configuration
     */
    setKeyMapping(action, keys) {
        if (Array.isArray(keys)) {
            this.keyMap[action] = [...keys];
        } else {
            this.keyMap[action] = [keys];
        }
    }
    
    /**
     * Set key state directly (for UI system integration)
     */
    setKeyState(key, pressed) {
        this.keys[key] = pressed;
    }
    
    /**
     * Enable/disable touch controls
     */
    enableTouchControls(enabled) {
        this.touchControls.enabled = enabled;
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = enabled ? 'flex' : 'none';
        }
    }
    
    /**
     * Frame-based update - must be called every frame
     * Maintains input state and history for consistent behavior
     */
    update() {
        // Store previous frame state for edge detection
        this.previousKeys = { ...this.keys };
        
        // Sync with global keys object for backward compatibility
        if (typeof window !== 'undefined' && window.keys) {
            Object.keys(this.keys).forEach(key => {
                window.keys[key] = this.keys[key];
            });
        }
        
        // Update input history for debugging
        this.inputHistory.push({
            timestamp: Date.now(),
            keys: { ...this.keys },
            actions: Object.keys(this.keyMap).reduce((acc, action) => {
                acc[action] = this.isKeyPressed(action);
                return acc;
            }, {})
        });
        
        // Limit history size
        if (this.inputHistory.length > this.maxHistoryLength) {
            this.inputHistory.shift();
        }
    }
    
    /**
     * Reset input state
     */
    reset() {
        this.keys = {};
        this.previousKeys = {};
        this.jumpBufferTime = 0;
        this.inputHistory = [];
        
        // Reset touch button visual states
        if (this.touchControls.enabled) {
            this.touchControls.buttons.forEach(button => {
                button.classList.remove('pressed');
            });
        }
    }
    
    /**
     * Get input debugging information
     */
    getDebugInfo() {
        return {
            keys: { ...this.keys },
            keyMap: { ...this.keyMap },
            jumpBuffered: this.isJumpBuffered(),
            touchEnabled: this.touchControls.enabled,
            mobile: this.isMobile,
            historyLength: this.inputHistory.length
        };
    }
    
    /**
     * Clean up event listeners and resources
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
        
        // Remove mobile controls
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.remove();
        }
        
        // Clear input state
        this.reset();
        
        console.log('🎮 InputManager destroyed');
    }
}

export default InputManager;