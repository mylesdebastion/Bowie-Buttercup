/**
 * Mobile Controls Module - Touch D-pad and Action Buttons
 * 
 * Epic E004: UI System Implementation - US-018
 * Extracted from monolithic index.html with full functional parity
 */

export class MobileControls {
    constructor(game) {
        this.game = game;
        this.inputManager = game.inputManager;
        
        // State
        this.isVisible = false;
        this.isMobile = false;
        
        // DOM elements
        this.mobileControlsContainer = null;
        this.dpad = null;
        this.actionButtons = null;
        this.touchButtons = [];
        
        // Touch handling
        this.activeTouches = new Map();
        
        // Initialize mobile controls
        this.init();
    }
    
    init() {
        console.log('📱 Initializing Mobile Controls');
        
        // Create mobile controls UI
        this.createMobileControlsUI();
        
        // Setup touch event handlers
        this.setupTouchControls();
        
        // Initially hidden
        this.hide();
        
        console.log('✅ Mobile Controls initialized');
    }
    
    createMobileControlsUI() {
        // Find or create mobile controls container
        this.mobileControlsContainer = document.getElementById('mobileControls');
        
        if (!this.mobileControlsContainer) {
            this.mobileControlsContainer = document.createElement('div');
            this.mobileControlsContainer.id = 'mobileControls';
            document.getElementById('gameArea').appendChild(this.mobileControlsContainer);
        }
        
        // Apply styles
        this.applyMobileControlsStyles();
        
        // Create D-pad
        this.createDpad();
        
        // Create action buttons
        this.createActionButtons();
    }
    
    applyMobileControlsStyles() {
        // Apply mobile controls container styles
        const styles = {
            display: 'none',
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            height: '200px',
            pointerEvents: 'none',
            zIndex: '1000',
            padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
        };
        
        Object.assign(this.mobileControlsContainer.style, styles);
        
        // Add CSS for touch buttons if not exists
        this.addTouchButtonStyles();
    }
    
    addTouchButtonStyles() {
        // Check if styles already exist
        if (document.getElementById('mobile-controls-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-controls-styles';
        style.textContent = `
            .touch-button {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                width: 80px;
                height: 80px;
                font-size: 14px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: auto;
                touch-action: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                transition: all 0.1s ease;
            }
            
            .touch-button.pressed {
                background: rgba(255, 255, 255, 0.4);
                border-color: rgba(255, 255, 255, 0.6);
                transform: scale(0.95);
            }
            
            .dpad-button {
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 8px;
                position: absolute;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: white;
                pointer-events: auto;
                touch-action: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                transition: all 0.1s ease;
            }
            
            .dpad-button.pressed {
                background: rgba(255, 255, 255, 0.4);
                border-color: rgba(255, 255, 255, 0.6);
                transform: scale(0.95);
            }
            
            #dpad {
                position: absolute;
                left: 20px;
                bottom: 50px;
                width: 160px;
                height: 160px;
                pointer-events: none;
            }
            
            #actionButtons {
                position: absolute;
                right: 20px;
                bottom: 50px;
                display: flex;
                gap: 20px;
                pointer-events: none;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    createDpad() {
        // Create D-pad container
        this.dpad = document.createElement('div');
        this.dpad.id = 'dpad';
        
        // Create directional buttons
        const dpadButtons = [
            { key: 'ArrowUp', text: '▲', style: 'top: 10px; left: 50px; width: 60px;' },
            { key: 'ArrowDown', text: '▼', style: 'bottom: 10px; left: 50px; width: 60px;' },
            { key: 'ArrowLeft', text: '◄', style: 'top: 50px; left: 10px; height: 60px;' },
            { key: 'ArrowRight', text: '►', style: 'top: 50px; right: 10px; height: 60px;' }
        ];
        
        dpadButtons.forEach(buttonConfig => {
            const button = document.createElement('div');
            button.className = 'dpad-button';
            button.setAttribute('data-key', buttonConfig.key);
            button.style.cssText = buttonConfig.style;
            button.textContent = buttonConfig.text;
            
            this.dpad.appendChild(button);
            this.touchButtons.push(button);
        });
        
        this.mobileControlsContainer.appendChild(this.dpad);
    }
    
    createActionButtons() {
        // Create action buttons container
        this.actionButtons = document.createElement('div');
        this.actionButtons.id = 'actionButtons';
        
        // Create action buttons
        const actionButtonConfigs = [
            { key: ' ', text: 'Jump', id: 'jumpBtn' },
            { key: 'Shift', text: 'Dodge', id: 'dodgeBtn' }
        ];
        
        actionButtonConfigs.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.className = 'touch-button';
            button.id = buttonConfig.id;
            button.setAttribute('data-key', buttonConfig.key);
            button.textContent = buttonConfig.text;
            
            this.actionButtons.appendChild(button);
            this.touchButtons.push(button);
        });
        
        this.mobileControlsContainer.appendChild(this.actionButtons);
    }
    
    setupTouchControls() {
        // Setup touch handlers for all buttons
        this.touchButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            // Touch start
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('pressed');
                
                // Send key press to input manager
                if (this.inputManager && this.inputManager.setKeyState) {
                    this.inputManager.setKeyState(key, true);
                }
                
                // Haptic feedback if supported
                this.triggerHapticFeedback();
            }, { passive: false });
            
            // Touch end
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                
                // Send key release to input manager
                if (this.inputManager && this.inputManager.setKeyState) {
                    this.inputManager.setKeyState(key, false);
                }
            }, { passive: false });
            
            // Touch cancel (when touch is interrupted)
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                button.classList.remove('pressed');
                
                // Send key release to input manager
                if (this.inputManager && this.inputManager.setKeyState) {
                    this.inputManager.setKeyState(key, false);
                }
            }, { passive: false });
        });
        
        // Prevent scrolling and zooming on mobile game area
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('#gameArea')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    triggerHapticFeedback() {
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50); // Short vibration
        }
    }
    
    show() {
        this.isVisible = true;
        if (this.mobileControlsContainer) {
            this.mobileControlsContainer.style.display = 'block';
        }
        console.log('📱 Mobile controls shown');
    }
    
    hide() {
        this.isVisible = false;
        if (this.mobileControlsContainer) {
            this.mobileControlsContainer.style.display = 'none';
        }
    }
    
    update(dt) {
        // Update mobile controls state if needed
        // Currently mobile controls are event-driven, no per-frame updates needed
    }
    
    applySettings(settings) {
        // Apply settings like scale, opacity, etc.
        if (settings.uiScale && this.mobileControlsContainer) {
            const scale = settings.uiScale;
            this.mobileControlsContainer.style.transform = `scale(${scale})`;
        }
        
        if (settings.mobileControlsOpacity && this.mobileControlsContainer) {
            this.mobileControlsContainer.style.opacity = settings.mobileControlsOpacity;
        }
    }
    
    // Public API
    isActive() {
        return this.isVisible;
    }
    
    getTouchButtons() {
        return this.touchButtons;
    }
    
    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up Mobile Controls');
        
        // Remove touch event listeners
        this.touchButtons.forEach(button => {
            button.removeEventListener('touchstart', null);
            button.removeEventListener('touchend', null);
            button.removeEventListener('touchcancel', null);
        });
        
        // Remove DOM elements
        if (this.mobileControlsContainer && this.mobileControlsContainer.parentNode) {
            this.mobileControlsContainer.parentNode.removeChild(this.mobileControlsContainer);
        }
        
        // Remove styles
        const styleElement = document.getElementById('mobile-controls-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Clear references
        this.touchButtons = [];
        this.mobileControlsContainer = null;
        this.dpad = null;
        this.actionButtons = null;
    }
}

export default MobileControls;