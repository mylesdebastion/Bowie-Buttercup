/**
 * HUD Module - Game Status Display (Score, Lives, Time, etc.)
 * 
 * Epic E004: UI System Implementation - US-020
 * Provides heads-up display for game information
 */

export class HUD {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // HUD state
        this.isVisible = true;
        this.settings = {
            fontSize: 16,
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 10,
            borderRadius: 5
        };
        
        // HUD elements configuration
        this.elements = {
            score: { x: 20, y: 30, visible: true },
            lives: { x: 20, y: 60, visible: true },
            level: { x: 20, y: 90, visible: true },
            time: { x: 20, y: 120, visible: true },
            fps: { x: 20, y: 150, visible: false }, // Hidden by default
            treatsCollected: { x: 20, y: 180, visible: true },
            speedBoost: { x: 20, y: 210, visible: true }
        };
        
        // Timing
        this.startTime = Date.now();
        this.lastUpdateTime = Date.now();
        
        console.log('📊 HUD initialized');
    }
    
    update(dt) {
        this.lastUpdateTime = Date.now();
    }
    
    render(ctx, camera) {
        if (!this.isVisible) return;
        
        // Save context state
        ctx.save();
        
        // Reset transform to render UI in screen space (not affected by camera)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Set HUD text properties
        ctx.font = `${this.settings.fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Render each HUD element
        this.renderScore(ctx);
        this.renderLives(ctx);
        this.renderLevel(ctx);
        this.renderTime(ctx);
        this.renderTreatsCollected(ctx);
        this.renderSpeedBoost(ctx);
        
        // Render FPS if debug mode is enabled
        if (this.elements.fps.visible || (this.game.stateManager && this.game.stateManager.getSetting('debugMode'))) {
            this.renderFPS(ctx);
        }
        
        // Restore context state
        ctx.restore();
    }
    
    renderScore(ctx) {
        if (!this.elements.score.visible) return;
        
        const score = this.game.score || 0;
        const text = `Score: ${score.toLocaleString()}`;
        
        this.renderHUDText(ctx, text, this.elements.score.x, this.elements.score.y);
    }
    
    renderLives(ctx) {
        if (!this.elements.lives.visible) return;
        
        const lives = this.game.lives !== undefined ? this.game.lives : 3;
        
        // Render lives as hearts
        const heartSize = 20;
        const heartSpacing = 25;
        const startX = this.elements.lives.x;
        const startY = this.elements.lives.y;
        
        // Background
        this.renderHUDBackground(ctx, startX - 5, startY - 2, lives * heartSpacing + 10, heartSize + 4);
        
        // Draw hearts
        for (let i = 0; i < lives; i++) {
            const x = startX + (i * heartSpacing);
            const y = startY;
            
            // Draw heart shape (simplified)
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 4, 0, Math.PI * 2);
            ctx.arc(x + 13, y + 5, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x + 2, y + 8);
            ctx.lineTo(x + 9, y + 15);
            ctx.lineTo(x + 16, y + 8);
            ctx.fill();
        }
    }
    
    renderLevel(ctx) {
        if (!this.elements.level.visible) return;
        
        const currentLevel = this.game.currentLevel || 1;
        const text = `Level: ${currentLevel}`;
        
        this.renderHUDText(ctx, text, this.elements.level.x, this.elements.level.y);
    }
    
    renderTime(ctx) {
        if (!this.elements.time.visible) return;
        
        const elapsedTime = Math.floor((this.lastUpdateTime - this.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const text = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.renderHUDText(ctx, text, this.elements.time.x, this.elements.time.y);
    }
    
    renderTreatsCollected(ctx) {
        if (!this.elements.treatsCollected.visible) return;
        
        const treatsCollected = this.game.treatsCollected || 0;
        const text = `Treats: ${treatsCollected}`;
        
        this.renderHUDText(ctx, text, this.elements.treatsCollected.x, this.elements.treatsCollected.y);
    }
    
    renderSpeedBoost(ctx) {
        if (!this.elements.speedBoost.visible) return;
        
        const speedBoost = this.game.speedBoost || 1;
        const speedBoostTimer = this.game.speedBoostTimer || 0;
        
        if (speedBoost > 1 && speedBoostTimer > 0) {
            const text = `Speed: ${speedBoost.toFixed(1)}x (${Math.ceil(speedBoostTimer / 1000)}s)`;
            
            // Render with special coloring for active boost
            const element = this.elements.speedBoost;
            this.renderHUDBackground(ctx, element.x - 5, element.y - 2, 200, this.settings.fontSize + 4);
            
            ctx.fillStyle = '#FFD700'; // Gold color for speed boost
            ctx.fillText(text, element.x, element.y);
        }
    }
    
    renderFPS(ctx) {
        const fps = this.game.getFPS ? this.game.getFPS() : (this.game.fps || 0);
        const text = `FPS: ${Math.round(fps)}`;
        
        // Color based on performance
        let color = this.settings.color;
        if (fps < 30) color = '#FF6B6B'; // Red for poor performance
        else if (fps < 50) color = '#FFD93D'; // Yellow for moderate performance
        else color = '#6BCF7F'; // Green for good performance
        
        const element = this.elements.fps;
        this.renderHUDBackground(ctx, element.x - 5, element.y - 2, 80, this.settings.fontSize + 4);
        
        ctx.fillStyle = color;
        ctx.fillText(text, element.x, element.y);
    }
    
    renderHUDText(ctx, text, x, y, customColor = null) {
        // Render background
        const textWidth = ctx.measureText(text).width;
        this.renderHUDBackground(ctx, x - 5, y - 2, textWidth + 10, this.settings.fontSize + 4);
        
        // Render text
        ctx.fillStyle = customColor || this.settings.color;
        ctx.fillText(text, x, y);
    }
    
    renderHUDBackground(ctx, x, y, width, height) {
        ctx.fillStyle = this.settings.backgroundColor;
        
        if (this.settings.borderRadius > 0) {
            // Rounded rectangle
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, this.settings.borderRadius);
            ctx.fill();
        } else {
            // Regular rectangle
            ctx.fillRect(x, y, width, height);
        }
    }
    
    // HUD element visibility controls
    showElement(elementName) {
        if (this.elements[elementName]) {
            this.elements[elementName].visible = true;
        }
    }
    
    hideElement(elementName) {
        if (this.elements[elementName]) {
            this.elements[elementName].visible = false;
        }
    }
    
    toggleElement(elementName) {
        if (this.elements[elementName]) {
            this.elements[elementName].visible = !this.elements[elementName].visible;
        }
    }
    
    // Position management
    setElementPosition(elementName, x, y) {
        if (this.elements[elementName]) {
            this.elements[elementName].x = x;
            this.elements[elementName].y = y;
        }
    }
    
    // Settings application
    applySettings(settings) {
        if (settings.hudFontSize) {
            this.settings.fontSize = settings.hudFontSize;
        }
        
        if (settings.hudColor) {
            this.settings.color = settings.hudColor;
        }
        
        if (settings.hudBackgroundOpacity !== undefined) {
            const opacity = Math.max(0, Math.min(1, settings.hudBackgroundOpacity));
            this.settings.backgroundColor = `rgba(0, 0, 0, ${opacity * 0.5})`;
        }
        
        if (settings.showFPS !== undefined) {
            this.elements.fps.visible = settings.showFPS;
        }
        
        // High contrast adjustments
        if (settings.highContrast) {
            this.settings.color = '#FFFFFF';
            this.settings.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        }
    }
    
    // Game event handlers
    onLevelChange(levelNumber) {
        // Reset timer on level change
        this.startTime = Date.now();
        console.log(`📊 HUD: Level changed to ${levelNumber}`);
    }
    
    onScoreChange(newScore) {
        console.log(`📊 HUD: Score changed to ${newScore}`);
    }
    
    onLivesChange(newLives) {
        console.log(`📊 HUD: Lives changed to ${newLives}`);
    }
    
    // Public API
    show() {
        this.isVisible = true;
    }
    
    hide() {
        this.isVisible = false;
    }
    
    resetTimer() {
        this.startTime = Date.now();
    }
    
    getElapsedTime() {
        return this.lastUpdateTime - this.startTime;
    }
    
    // Layout presets
    setLayoutPreset(preset) {
        switch (preset) {
            case 'top-left':
                this.elements.score.x = 20;
                this.elements.score.y = 30;
                this.elements.lives.x = 20;
                this.elements.lives.y = 60;
                this.elements.level.x = 20;
                this.elements.level.y = 90;
                this.elements.time.x = 20;
                this.elements.time.y = 120;
                break;
                
            case 'top-right':
                const canvasWidth = this.canvas.width;
                this.elements.score.x = canvasWidth - 150;
                this.elements.score.y = 30;
                this.elements.lives.x = canvasWidth - 150;
                this.elements.lives.y = 60;
                this.elements.level.x = canvasWidth - 150;
                this.elements.level.y = 90;
                this.elements.time.x = canvasWidth - 150;
                this.elements.time.y = 120;
                break;
                
            case 'minimal':
                // Show only essential elements
                this.hideElement('fps');
                this.hideElement('treatsCollected');
                this.hideElement('speedBoost');
                break;
                
            case 'full':
                // Show all elements
                Object.keys(this.elements).forEach(key => {
                    this.showElement(key);
                });
                break;
        }
        
        console.log(`📊 HUD layout changed to: ${preset}`);
    }
    
    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up HUD');
        // HUD renders to canvas, no DOM cleanup needed
    }
}

export default HUD;