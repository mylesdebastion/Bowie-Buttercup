/**
 * Settings Panel Module - Game Settings and Accessibility
 * 
 * Epic E004: UI System Implementation - US-019
 * Extracted from monolithic index.html with full functional parity
 */

export class SettingsPanel {
    constructor(game) {
        this.game = game;
        this.stateManager = game.stateManager;
        
        // State
        this.isVisible = false;
        this.settings = {
            highContrast: false,
            reducedMotion: false,
            muted: false,
            debugMode: false,
            uiScale: 2
        };
        
        // DOM elements
        this.settingsContainer = null;
        this.settingsPanel = null;
        
        // Initialize settings panel
        this.init();
    }
    
    init() {
        console.log('⚙️ Initializing Settings Panel');
        
        // Load settings from state manager
        this.loadSettings();
        
        // Create settings UI
        this.createSettingsUI();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Apply initial settings
        this.applyAllSettings();
        
        // Initially hidden
        this.hide();
        
        console.log('✅ Settings Panel initialized');
    }
    
    loadSettings() {
        // Load settings from StateManager or localStorage
        const savedSettings = this.stateManager.get('settings') || {};
        
        // Merge with defaults
        this.settings = {
            ...this.settings,
            ...savedSettings
        };
        
        // Also check localStorage for backward compatibility
        try {
            const localSettings = JSON.parse(localStorage.getItem('gameSettings') || '{}');
            this.settings = { ...this.settings, ...localSettings };
        } catch (e) {
            console.warn('Could not load settings from localStorage:', e);
        }
    }
    
    createSettingsUI() {
        // Create settings container
        this.settingsContainer = document.createElement('div');
        this.settingsContainer.id = 'settingsPanel';
        this.settingsContainer.className = 'settings-panel';
        
        // Apply styles
        this.applySettingsPanelStyles();
        
        // Create settings content
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'settings-content';
        
        this.settingsPanel.innerHTML = `
            <div class="settings-header">
                <h2>Settings</h2>
                <button class="close-button" id="closeSettings">×</button>
            </div>
            
            <div class="settings-section">
                <h3>Audio</h3>
                <div class="checkbox-group">
                    <input type="checkbox" id="mutedSetting" ${this.settings.muted ? 'checked' : ''}>
                    <label for="mutedSetting">Mute Sound</label>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Accessibility</h3>
                <div class="checkbox-group">
                    <input type="checkbox" id="highContrastSetting" ${this.settings.highContrast ? 'checked' : ''}>
                    <label for="highContrastSetting">High Contrast</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="reducedMotionSetting" ${this.settings.reducedMotion ? 'checked' : ''}>
                    <label for="reducedMotionSetting">Reduced Motion</label>
                </div>
                <div class="control-group">
                    <label>UI Scale: <span id="scaleVal">${this.settings.uiScale}</span>x</label>
                    <input type="range" id="uiScaleSetting" min="1" max="3" step="0.5" value="${this.settings.uiScale}">
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Debug</h3>
                <div class="checkbox-group">
                    <input type="checkbox" id="debugModeSetting" ${this.settings.debugMode ? 'checked' : ''}>
                    <label for="debugModeSetting">Debug Mode</label>
                </div>
            </div>
            
            <div class="settings-actions">
                <button id="resetSettings" class="settings-button">Reset to Defaults</button>
                <button id="saveSettings" class="settings-button primary">Save Settings</button>
            </div>
        `;
        
        this.settingsContainer.appendChild(this.settingsPanel);
        
        // Add to document
        document.body.appendChild(this.settingsContainer);
    }
    
    applySettingsPanelStyles() {
        // Add CSS for settings panel if not exists
        if (document.getElementById('settings-panel-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'settings-panel-styles';
        style.textContent = `
            .settings-panel {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .settings-content {
                background: #2c3e50;
                color: white;
                border-radius: 8px;
                max-width: 500px;
                margin: 50px auto;
                padding: 20px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #34495e;
                padding-bottom: 10px;
            }
            
            .settings-header h2 {
                margin: 0;
                color: #ecf0f1;
            }
            
            .close-button {
                background: none;
                border: none;
                color: #ecf0f1;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .close-button:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .settings-section {
                margin-bottom: 25px;
            }
            
            .settings-section h3 {
                color: #3498db;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: bold;
            }
            
            .checkbox-group {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
            }
            
            .checkbox-group input[type="checkbox"] {
                margin-right: 10px;
                transform: scale(1.2);
            }
            
            .checkbox-group label {
                color: #ecf0f1;
                cursor: pointer;
                user-select: none;
            }
            
            .control-group {
                margin-bottom: 15px;
            }
            
            .control-group label {
                display: block;
                color: #ecf0f1;
                margin-bottom: 8px;
            }
            
            .control-group input[type="range"] {
                width: 100%;
                height: 6px;
                background: #34495e;
                outline: none;
                border-radius: 3px;
            }
            
            .control-group input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 18px;
                height: 18px;
                background: #3498db;
                border-radius: 50%;
                cursor: pointer;
            }
            
            .settings-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 2px solid #34495e;
            }
            
            .settings-button {
                padding: 10px 20px;
                border: 2px solid #3498db;
                background: transparent;
                color: #3498db;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .settings-button:hover {
                background: #3498db;
                color: white;
            }
            
            .settings-button.primary {
                background: #3498db;
                color: white;
            }
            
            .settings-button.primary:hover {
                background: #2980b9;
            }
            
            /* High contrast mode adjustments */
            body.high-contrast .settings-content {
                background: #000;
                border: 3px solid #fff;
            }
            
            body.high-contrast .settings-section h3 {
                color: #fff;
            }
            
            body.high-contrast .settings-button {
                border-color: #fff;
                color: #fff;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventHandlers() {
        // Close button
        const closeButton = this.settingsContainer.querySelector('#closeSettings');
        closeButton.addEventListener('click', () => this.hide());
        
        // Settings controls
        const highContrastCheckbox = this.settingsContainer.querySelector('#highContrastSetting');
        const reducedMotionCheckbox = this.settingsContainer.querySelector('#reducedMotionSetting');
        const mutedCheckbox = this.settingsContainer.querySelector('#mutedSetting');
        const debugModeCheckbox = this.settingsContainer.querySelector('#debugModeSetting');
        const uiScaleSlider = this.settingsContainer.querySelector('#uiScaleSetting');
        const scaleDisplay = this.settingsContainer.querySelector('#scaleVal');
        
        // High contrast
        highContrastCheckbox.addEventListener('change', (e) => {
            this.settings.highContrast = e.target.checked;
            this.applySetting('highContrast', this.settings.highContrast);
        });
        
        // Reduced motion
        reducedMotionCheckbox.addEventListener('change', (e) => {
            this.settings.reducedMotion = e.target.checked;
            this.applySetting('reducedMotion', this.settings.reducedMotion);
        });
        
        // Muted
        mutedCheckbox.addEventListener('change', (e) => {
            this.settings.muted = e.target.checked;
            this.applySetting('muted', this.settings.muted);
        });
        
        // Debug mode
        debugModeCheckbox.addEventListener('change', (e) => {
            this.settings.debugMode = e.target.checked;
            this.applySetting('debugMode', this.settings.debugMode);
        });
        
        // UI Scale
        uiScaleSlider.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            this.settings.uiScale = scale;
            scaleDisplay.textContent = scale;
            this.applySetting('uiScale', scale);
        });
        
        // Action buttons
        const resetButton = this.settingsContainer.querySelector('#resetSettings');
        const saveButton = this.settingsContainer.querySelector('#saveSettings');
        
        resetButton.addEventListener('click', () => this.resetToDefaults());
        saveButton.addEventListener('click', () => this.saveSettings());
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        
        // Close on backdrop click
        this.settingsContainer.addEventListener('click', (e) => {
            if (e.target === this.settingsContainer) {
                this.hide();
            }
        });
    }
    
    applySetting(setting, value) {
        switch (setting) {
            case 'highContrast':
                document.body.classList.toggle('high-contrast', value);
                break;
                
            case 'reducedMotion':
                // Set CSS custom property for reduced motion
                document.documentElement.style.setProperty('--reduced-motion', value ? '1' : '0');
                break;
                
            case 'muted':
                // Notify game about mute state
                if (this.game.setMuted) {
                    this.game.setMuted(value);
                }
                break;
                
            case 'debugMode':
                // Toggle debug mode in game
                if (this.game.setDebugMode) {
                    this.game.setDebugMode(value);
                }
                break;
                
            case 'uiScale':
                // Apply UI scaling
                document.documentElement.style.setProperty('--ui-scale', value);
                break;
        }
    }
    
    applyAllSettings() {
        // Apply all current settings
        Object.keys(this.settings).forEach(key => {
            this.applySetting(key, this.settings[key]);
        });
    }
    
    resetToDefaults() {
        // Reset to default settings
        this.settings = {
            highContrast: false,
            reducedMotion: false,
            muted: false,
            debugMode: false,
            uiScale: 2
        };
        
        // Update UI controls
        this.updateUIControls();
        
        // Apply settings
        this.applyAllSettings();
        
        console.log('⚙️ Settings reset to defaults');
    }
    
    updateUIControls() {
        // Update checkbox states
        this.settingsContainer.querySelector('#highContrastSetting').checked = this.settings.highContrast;
        this.settingsContainer.querySelector('#reducedMotionSetting').checked = this.settings.reducedMotion;
        this.settingsContainer.querySelector('#mutedSetting').checked = this.settings.muted;
        this.settingsContainer.querySelector('#debugModeSetting').checked = this.settings.debugMode;
        
        // Update slider and display
        this.settingsContainer.querySelector('#uiScaleSetting').value = this.settings.uiScale;
        this.settingsContainer.querySelector('#scaleVal').textContent = this.settings.uiScale;
    }
    
    saveSettings() {
        // Save to StateManager
        this.stateManager.setSetting('settings', this.settings);
        
        // Also save to localStorage for backward compatibility
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings to localStorage:', e);
        }
        
        console.log('⚙️ Settings saved:', this.settings);
        
        // Show feedback (could be a toast notification)
        this.showSaveConfirmation();
        
        // Close panel
        setTimeout(() => this.hide(), 1000);
    }
    
    showSaveConfirmation() {
        const saveButton = this.settingsContainer.querySelector('#saveSettings');
        const originalText = saveButton.textContent;
        
        saveButton.textContent = 'Saved!';
        saveButton.style.background = '#27ae60';
        
        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.style.background = '#3498db';
        }, 1000);
    }
    
    show() {
        this.isVisible = true;
        this.settingsContainer.style.display = 'block';
        
        // Update UI controls to current settings
        this.updateUIControls();
        
        console.log('⚙️ Settings panel shown');
    }
    
    hide() {
        this.isVisible = false;
        this.settingsContainer.style.display = 'none';
        console.log('⚙️ Settings panel hidden');
    }
    
    update(dt) {
        // Settings panel is UI-driven, no per-frame updates needed
    }
    
    render(ctx, camera) {
        // Settings panel renders to DOM, not canvas
        // This method exists for interface consistency
    }
    
    // Public API
    isVisible() {
        return this.isVisible;
    }
    
    getCurrentSettings() {
        return { ...this.settings };
    }
    
    setSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.applySetting(key, value);
            this.updateUIControls();
        }
    }
    
    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up Settings Panel');
        
        // Remove DOM elements
        if (this.settingsContainer && this.settingsContainer.parentNode) {
            this.settingsContainer.parentNode.removeChild(this.settingsContainer);
        }
        
        // Remove styles
        const styleElement = document.getElementById('settings-panel-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Clear references
        this.settingsContainer = null;
        this.settingsPanel = null;
    }
}

export default SettingsPanel;