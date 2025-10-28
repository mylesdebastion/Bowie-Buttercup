/**
 * UI Manager - Coordinates all UI components
 * 
 * Epic E004: UI System Implementation
 * Manages all user interface modules and their interactions
 */

import { MobileControls } from './MobileControls.js';
import { SettingsPanel } from './SettingsPanel.js';
import { HUD } from './HUD.js';
import { SpriteEditor } from './SpriteEditor.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // UI component instances
        this.mobileControls = null;
        this.settingsPanel = null;
        this.hud = null;
        this.spriteEditor = null;
        
        // UI state
        this.isVisible = true;
        this.currentUIMode = 'game'; // 'game', 'settings', 'sprite-editor'
        
        // Initialize UI components
        this.init();
    }
    
    init() {
        console.log('🎨 Initializing UI Manager');
        
        // Initialize mobile controls
        this.mobileControls = new MobileControls(this.game);
        
        // Initialize settings panel
        this.settingsPanel = new SettingsPanel(this.game);
        
        // Initialize HUD
        this.hud = new HUD(this.game);
        
        // Initialize sprite editor
        this.spriteEditor = new SpriteEditor(this.game);
        
        // Setup UI event handlers
        this.setupEventHandlers();
        
        // Detect and setup mobile if needed
        this.detectMobile();
        
        console.log('✅ UI Manager initialized successfully');
    }
    
    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                         || ('ontouchstart' in window)
                         || (navigator.maxTouchPoints > 0);
        
        if (isMobile) {
            this.mobileControls.show();
            console.log('📱 Mobile UI enabled');
        } else {
            this.mobileControls.hide();
        }
        
        return isMobile;
    }
    
    setupEventHandlers() {
        // Handle UI mode switching via keyboard events
        // Note: InputManager doesn't have onKeyPressed, so we'll handle this in update
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.toggleSpriteEditor();
            } else if (e.key === 's' && e.ctrlKey) {
                e.preventDefault();
                this.toggleSettingsPanel();
            }
        });
    }
    
    update(dt) {
        // Update all active UI components
        if (this.mobileControls) {
            this.mobileControls.update(dt);
        }

        // Skip settings panel update if not implemented yet
        if (this.settingsPanel && typeof this.settingsPanel.isVisible === 'function' && this.settingsPanel.isVisible()) {
            this.settingsPanel.update(dt);
        }

        if (this.hud && this.isVisible) {
            this.hud.update(dt);
        }

        // Skip sprite editor update if not implemented yet
        if (this.spriteEditor && typeof this.spriteEditor.isVisible === 'function' && this.spriteEditor.isVisible()) {
            this.spriteEditor.update(dt);
        }
    }
    
    render(ctx, camera) {
        if (!this.isVisible) return;
        
        // Render HUD (always on top)
        if (this.hud) {
            this.hud.render(ctx, camera);
        }
        
        // Render active modal UI components
        if (this.settingsPanel && typeof this.settingsPanel.isVisible === 'function' && this.settingsPanel.isVisible()) {
            this.settingsPanel.render(ctx, camera);
        }

        if (this.spriteEditor && typeof this.spriteEditor.isVisible === 'function' && this.spriteEditor.isVisible()) {
            this.spriteEditor.render(ctx, camera);
        }
        
        // Mobile controls render themselves to DOM
    }
    
    // UI Mode Management
    setUIMode(mode) {
        const previousMode = this.currentUIMode;
        this.currentUIMode = mode;
        
        // Hide all modal UIs first
        if (this.settingsPanel) this.settingsPanel.hide();
        if (this.spriteEditor) this.spriteEditor.hide();
        
        // Show the requested UI
        switch (mode) {
            case 'settings':
                if (this.settingsPanel) this.settingsPanel.show();
                break;
            case 'sprite-editor':
                if (this.spriteEditor) this.spriteEditor.show();
                break;
            case 'game':
            default:
                // Game mode - all modal UIs hidden
                break;
        }
        
        console.log(`🎨 UI mode changed: ${previousMode} → ${mode}`);
    }
    
    toggleSpriteEditor() {
        if (this.currentUIMode === 'sprite-editor') {
            this.setUIMode('game');
        } else {
            this.setUIMode('sprite-editor');
        }
    }
    
    toggleSettingsPanel() {
        if (this.currentUIMode === 'settings') {
            this.setUIMode('game');
        } else {
            this.setUIMode('settings');
        }
    }
    
    // Settings Integration
    applySettings(settings) {
        // Apply settings to all UI components
        if (this.mobileControls) {
            this.mobileControls.applySettings(settings);
        }
        
        if (this.hud) {
            this.hud.applySettings(settings);
        }
        
        if (this.spriteEditor) {
            this.spriteEditor.applySettings(settings);
        }
        
        // Apply accessibility settings
        if (settings.highContrast !== undefined) {
            document.body.classList.toggle('high-contrast', settings.highContrast);
        }
    }
    
    // Public API
    getHUD() {
        return this.hud;
    }
    
    getMobileControls() {
        return this.mobileControls;
    }
    
    getSettingsPanel() {
        return this.settingsPanel;
    }
    
    getSpriteEditor() {
        return this.spriteEditor;
    }
    
    show() {
        this.isVisible = true;
    }
    
    hide() {
        this.isVisible = false;
    }
    
    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up UI Manager');
        
        if (this.mobileControls) {
            this.mobileControls.destroy();
        }
        
        if (this.settingsPanel) {
            this.settingsPanel.destroy();
        }
        
        if (this.hud) {
            this.hud.destroy();
        }
        
        if (this.spriteEditor) {
            this.spriteEditor.destroy();
        }
    }
}

export default UIManager;