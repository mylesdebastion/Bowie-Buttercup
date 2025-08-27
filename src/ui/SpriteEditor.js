/**
 * Sprite Editor Module - Sprite Customization and Editing
 * 
 * Epic E004: UI System Implementation - US-017
 * Foundation for sprite editing functionality (to be expanded based on requirements)
 */

export class SpriteEditor {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // State
        this.isVisible = false;
        this.currentSprite = null;
        this.selectedTool = 'pencil'; // pencil, eraser, fill, colorPicker
        this.currentColor = '#FF6B35';
        this.spriteSize = 32; // 32x32 pixel sprite
        
        // Sprite data
        this.sprites = new Map();
        this.currentSpriteData = null;
        
        // UI elements
        this.editorContainer = null;
        this.canvas2D = null; // Separate canvas for sprite editing
        this.ctx2D = null;
        
        // Tools
        this.tools = {
            pencil: { name: 'Pencil', icon: '✏️', cursor: 'crosshair' },
            eraser: { name: 'Eraser', icon: '🧹', cursor: 'crosshair' },
            fill: { name: 'Fill', icon: '🪣', cursor: 'crosshair' },
            colorPicker: { name: 'Color Picker', icon: '🎨', cursor: 'pointer' }
        };
        
        // Color palette
        this.palette = [
            '#FF6B35', '#F7931E', '#FFD93D', '#6BCF7F', '#51A3A3',
            '#4ECDC4', '#44A08D', '#093637', '#2C3E50', '#E74C3C',
            '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12', '#E67E22',
            '#FFFFFF', '#BDC3C7', '#95A5A6', '#7F8C8D', '#2C3E50',
            '#34495E', '#000000'
        ];
        
        // Initialize sprite editor
        this.init();
    }
    
    init() {
        console.log('🎨 Initializing Sprite Editor');
        
        // Create sprite editor UI
        this.createSpriteEditorUI();
        
        // Setup event handlers
        this.setupEventHandlers();
        
        // Load saved sprites
        this.loadSavedSprites();
        
        // Initially hidden
        this.hide();
        
        console.log('✅ Sprite Editor initialized');
    }
    
    createSpriteEditorUI() {
        // Create editor container
        this.editorContainer = document.createElement('div');
        this.editorContainer.id = 'spriteEditor';
        this.editorContainer.className = 'sprite-editor';
        
        // Apply styles
        this.applySpriteEditorStyles();
        
        // Create editor content
        this.editorContainer.innerHTML = `
            <div class="sprite-editor-header">
                <h2>Sprite Editor</h2>
                <div class="editor-actions">
                    <button id="newSprite" class="editor-button">New</button>
                    <button id="loadSprite" class="editor-button">Load</button>
                    <button id="saveSprite" class="editor-button">Save</button>
                    <button id="exportSprite" class="editor-button">Export</button>
                    <button id="closeSpriteEditor" class="close-button">×</button>
                </div>
            </div>
            
            <div class="sprite-editor-content">
                <div class="editor-toolbar">
                    <div class="tool-group">
                        <h4>Tools</h4>
                        <div class="tools-container">
                            ${Object.keys(this.tools).map(tool => 
                                `<button class="tool-button ${tool === this.selectedTool ? 'active' : ''}" data-tool="${tool}">
                                    <span class="tool-icon">${this.tools[tool].icon}</span>
                                    <span class="tool-name">${this.tools[tool].name}</span>
                                </button>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="color-group">
                        <h4>Color</h4>
                        <div class="current-color">
                            <div class="color-swatch" style="background-color: ${this.currentColor}"></div>
                            <input type="color" id="colorInput" value="${this.currentColor}">
                        </div>
                        <div class="color-palette">
                            ${this.palette.map(color => 
                                `<div class="palette-color" style="background-color: ${color}" data-color="${color}"></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="editor-workspace">
                    <div class="canvas-container">
                        <h4>Sprite Canvas</h4>
                        <canvas id="spriteCanvas" width="${this.spriteSize * 16}" height="${this.spriteSize * 16}"></canvas>
                    </div>
                    
                    <div class="sprite-preview">
                        <h4>Preview</h4>
                        <div class="preview-container">
                            <canvas id="previewCanvas" width="${this.spriteSize}" height="${this.spriteSize}"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.editorContainer);
        
        // Get canvas references
        this.canvas2D = this.editorContainer.querySelector('#spriteCanvas');
        this.ctx2D = this.canvas2D.getContext('2d');
        this.previewCanvas = this.editorContainer.querySelector('#previewCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // Initialize with blank sprite
        this.createNewSprite();
    }
    
    applySpriteEditorStyles() {
        // Add CSS for sprite editor if not exists
        if (document.getElementById('sprite-editor-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sprite-editor-styles';
        style.textContent = `
            .sprite-editor {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 2001;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .sprite-editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: white;
                margin-bottom: 20px;
            }
            
            .editor-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            
            .editor-button {
                padding: 8px 16px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .editor-button:hover {
                background: #2980b9;
            }
            
            .close-button {
                background: #e74c3c;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .sprite-editor-content {
                display: flex;
                gap: 20px;
                height: calc(100% - 80px);
            }
            
            .editor-toolbar {
                width: 200px;
                background: #2c3e50;
                padding: 15px;
                border-radius: 8px;
                overflow-y: auto;
            }
            
            .editor-toolbar h4 {
                color: #ecf0f1;
                margin: 0 0 10px 0;
                font-size: 14px;
            }
            
            .tool-group {
                margin-bottom: 20px;
            }
            
            .tools-container {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .tool-button {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #34495e;
                color: #ecf0f1;
                border: 2px solid transparent;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tool-button:hover {
                background: #4a5f7a;
            }
            
            .tool-button.active {
                background: #3498db;
                border-color: #2980b9;
            }
            
            .tool-icon {
                font-size: 16px;
            }
            
            .tool-name {
                font-size: 12px;
            }
            
            .color-group {
                margin-bottom: 20px;
            }
            
            .current-color {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .color-swatch {
                width: 30px;
                height: 30px;
                border: 2px solid white;
                border-radius: 4px;
            }
            
            #colorInput {
                width: 60px;
                height: 30px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .color-palette {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 3px;
            }
            
            .palette-color {
                width: 25px;
                height: 25px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                cursor: pointer;
                transition: transform 0.1s;
            }
            
            .palette-color:hover {
                transform: scale(1.1);
                border-color: white;
            }
            
            .editor-workspace {
                flex: 1;
                display: flex;
                gap: 20px;
                align-items: flex-start;
            }
            
            .canvas-container {
                background: #2c3e50;
                padding: 15px;
                border-radius: 8px;
            }
            
            .canvas-container h4 {
                color: #ecf0f1;
                margin: 0 0 10px 0;
            }
            
            #spriteCanvas {
                border: 2px solid #34495e;
                background: white;
                image-rendering: pixelated;
                cursor: crosshair;
            }
            
            .sprite-preview {
                background: #2c3e50;
                padding: 15px;
                border-radius: 8px;
                min-width: 150px;
            }
            
            .sprite-preview h4 {
                color: #ecf0f1;
                margin: 0 0 10px 0;
            }
            
            .preview-container {
                background: white;
                padding: 10px;
                border-radius: 4px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            #previewCanvas {
                image-rendering: pixelated;
                border: 1px solid #ccc;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    setupEventHandlers() {
        // Close button
        const closeButton = this.editorContainer.querySelector('#closeSpriteEditor');
        closeButton.addEventListener('click', () => this.hide());
        
        // Tool selection
        const toolButtons = this.editorContainer.querySelectorAll('.tool-button');
        toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = button.getAttribute('data-tool');
                this.selectTool(tool);
            });
        });
        
        // Color input
        const colorInput = this.editorContainer.querySelector('#colorInput');
        colorInput.addEventListener('change', (e) => {
            this.setColor(e.target.value);
        });
        
        // Color palette
        const paletteColors = this.editorContainer.querySelectorAll('.palette-color');
        paletteColors.forEach(colorDiv => {
            colorDiv.addEventListener('click', (e) => {
                const color = colorDiv.getAttribute('data-color');
                this.setColor(color);
            });
        });
        
        // Canvas mouse events
        this.setupCanvasEvents();
        
        // Action buttons
        const newButton = this.editorContainer.querySelector('#newSprite');
        const saveButton = this.editorContainer.querySelector('#saveSprite');
        const loadButton = this.editorContainer.querySelector('#loadSprite');
        const exportButton = this.editorContainer.querySelector('#exportSprite');
        
        newButton.addEventListener('click', () => this.createNewSprite());
        saveButton.addEventListener('click', () => this.saveCurrentSprite());
        loadButton.addEventListener('click', () => this.showLoadDialog());
        exportButton.addEventListener('click', () => this.exportSprite());
        
        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
    
    setupCanvasEvents() {
        let isDrawing = false;
        
        // Mouse down
        this.canvas2D.addEventListener('mousedown', (e) => {
            isDrawing = true;
            this.handleCanvasClick(e);
        });
        
        // Mouse move
        this.canvas2D.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                this.handleCanvasClick(e);
            }
        });
        
        // Mouse up
        this.canvas2D.addEventListener('mouseup', () => {
            isDrawing = false;
        });
        
        // Context menu (right click)
        this.canvas2D.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // Could implement right-click to pick color
        });
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas2D.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 16); // 16px per sprite pixel
        const y = Math.floor((e.clientY - rect.top) / 16);
        
        if (x >= 0 && x < this.spriteSize && y >= 0 && y < this.spriteSize) {
            this.applyTool(x, y);
        }
    }
    
    applyTool(x, y) {
        switch (this.selectedTool) {
            case 'pencil':
                this.drawPixel(x, y, this.currentColor);
                break;
                
            case 'eraser':
                this.drawPixel(x, y, 'transparent');
                break;
                
            case 'fill':
                this.floodFill(x, y, this.currentColor);
                break;
                
            case 'colorPicker':
                this.pickColor(x, y);
                break;
        }
        
        this.updatePreview();
    }
    
    drawPixel(x, y, color) {
        // Draw on the editing canvas (16x scale)
        this.ctx2D.fillStyle = color === 'transparent' ? 'white' : color;
        this.ctx2D.fillRect(x * 16, y * 16, 16, 16);
        
        // Update sprite data
        if (!this.currentSpriteData) {
            this.currentSpriteData = new Array(this.spriteSize * this.spriteSize).fill('transparent');
        }
        
        this.currentSpriteData[y * this.spriteSize + x] = color;
    }
    
    floodFill(startX, startY, fillColor) {
        // Simple flood fill implementation
        if (!this.currentSpriteData) return;
        
        const targetColor = this.currentSpriteData[startY * this.spriteSize + startX];
        if (targetColor === fillColor) return;
        
        const stack = [[startX, startY]];
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            
            if (x < 0 || x >= this.spriteSize || y < 0 || y >= this.spriteSize) continue;
            if (this.currentSpriteData[y * this.spriteSize + x] !== targetColor) continue;
            
            this.drawPixel(x, y, fillColor);
            
            // Add neighboring pixels
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    
    pickColor(x, y) {
        if (this.currentSpriteData) {
            const color = this.currentSpriteData[y * this.spriteSize + x];
            if (color && color !== 'transparent') {
                this.setColor(color);
            }
        }
    }
    
    selectTool(toolName) {
        this.selectedTool = toolName;
        
        // Update UI
        const toolButtons = this.editorContainer.querySelectorAll('.tool-button');
        toolButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-tool') === toolName);
        });
        
        // Update cursor
        this.canvas2D.style.cursor = this.tools[toolName].cursor;
        
        console.log(`🎨 Selected tool: ${toolName}`);
    }
    
    setColor(color) {
        this.currentColor = color;
        
        // Update UI
        const colorSwatch = this.editorContainer.querySelector('.color-swatch');
        const colorInput = this.editorContainer.querySelector('#colorInput');
        
        colorSwatch.style.backgroundColor = color;
        colorInput.value = color;
        
        console.log(`🎨 Selected color: ${color}`);
    }
    
    createNewSprite() {
        // Clear sprite data
        this.currentSpriteData = new Array(this.spriteSize * this.spriteSize).fill('transparent');
        
        // Clear canvas
        this.ctx2D.fillStyle = 'white';
        this.ctx2D.fillRect(0, 0, this.canvas2D.width, this.canvas2D.height);
        
        // Add grid
        this.drawGrid();
        
        // Update preview
        this.updatePreview();
        
        console.log('🎨 Created new sprite');
    }
    
    drawGrid() {
        this.ctx2D.strokeStyle = '#E0E0E0';
        this.ctx2D.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.spriteSize; x++) {
            this.ctx2D.beginPath();
            this.ctx2D.moveTo(x * 16, 0);
            this.ctx2D.lineTo(x * 16, this.spriteSize * 16);
            this.ctx2D.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.spriteSize; y++) {
            this.ctx2D.beginPath();
            this.ctx2D.moveTo(0, y * 16);
            this.ctx2D.lineTo(this.spriteSize * 16, y * 16);
            this.ctx2D.stroke();
        }
    }
    
    updatePreview() {
        // Clear preview canvas
        this.previewCtx.fillStyle = 'white';
        this.previewCtx.fillRect(0, 0, this.spriteSize, this.spriteSize);
        
        // Draw sprite at actual size
        if (this.currentSpriteData) {
            for (let y = 0; y < this.spriteSize; y++) {
                for (let x = 0; x < this.spriteSize; x++) {
                    const color = this.currentSpriteData[y * this.spriteSize + x];
                    if (color && color !== 'transparent') {
                        this.previewCtx.fillStyle = color;
                        this.previewCtx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
    }
    
    saveCurrentSprite() {
        // Save sprite to internal storage
        const spriteName = prompt('Enter sprite name:') || `sprite_${Date.now()}`;
        this.sprites.set(spriteName, [...this.currentSpriteData]);
        
        // Save to localStorage
        this.saveSpritesToStorage();
        
        console.log(`🎨 Saved sprite: ${spriteName}`);
    }
    
    showLoadDialog() {
        // Simple load dialog (could be enhanced with a proper UI)
        const spriteNames = Array.from(this.sprites.keys());
        if (spriteNames.length === 0) {
            alert('No saved sprites found');
            return;
        }
        
        const spriteName = prompt(`Load sprite:\n${spriteNames.join('\n')}`);
        if (spriteName && this.sprites.has(spriteName)) {
            this.loadSprite(spriteName);
        }
    }
    
    loadSprite(spriteName) {
        const spriteData = this.sprites.get(spriteName);
        if (spriteData) {
            this.currentSpriteData = [...spriteData];
            this.redrawCanvas();
            this.updatePreview();
            console.log(`🎨 Loaded sprite: ${spriteName}`);
        }
    }
    
    redrawCanvas() {
        // Clear and redraw the entire canvas
        this.ctx2D.fillStyle = 'white';
        this.ctx2D.fillRect(0, 0, this.canvas2D.width, this.canvas2D.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw sprite data
        if (this.currentSpriteData) {
            for (let y = 0; y < this.spriteSize; y++) {
                for (let x = 0; x < this.spriteSize; x++) {
                    const color = this.currentSpriteData[y * this.spriteSize + x];
                    if (color && color !== 'transparent') {
                        this.ctx2D.fillStyle = color;
                        this.ctx2D.fillRect(x * 16, y * 16, 16, 16);
                    }
                }
            }
        }
    }
    
    exportSprite() {
        // Export as PNG data URL
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.spriteSize;
        exportCanvas.height = this.spriteSize;
        const exportCtx = exportCanvas.getContext('2d');
        
        // Draw sprite at actual size
        if (this.currentSpriteData) {
            for (let y = 0; y < this.spriteSize; y++) {
                for (let x = 0; x < this.spriteSize; x++) {
                    const color = this.currentSpriteData[y * this.spriteSize + x];
                    if (color && color !== 'transparent') {
                        exportCtx.fillStyle = color;
                        exportCtx.fillRect(x, y, 1, 1);
                    }
                }
            }
        }
        
        // Create download link
        const dataURL = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `sprite_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        
        console.log('🎨 Sprite exported');
    }
    
    saveSpritesToStorage() {
        const spritesData = Object.fromEntries(this.sprites);
        localStorage.setItem('gameSprites', JSON.stringify(spritesData));
    }
    
    loadSavedSprites() {
        try {
            const spritesData = JSON.parse(localStorage.getItem('gameSprites') || '{}');
            this.sprites = new Map(Object.entries(spritesData));
            console.log(`🎨 Loaded ${this.sprites.size} saved sprites`);
        } catch (e) {
            console.warn('Could not load saved sprites:', e);
        }
    }
    
    show() {
        this.isVisible = true;
        this.editorContainer.style.display = 'block';
        console.log('🎨 Sprite Editor shown');
    }
    
    hide() {
        this.isVisible = false;
        this.editorContainer.style.display = 'none';
        console.log('🎨 Sprite Editor hidden');
    }
    
    update(dt) {
        // Sprite editor is UI-driven, no per-frame updates needed
    }
    
    render(ctx, camera) {
        // Sprite editor renders to DOM, not canvas
        // This method exists for interface consistency
    }
    
    applySettings(settings) {
        // Apply UI settings like scale, colors, etc.
        if (settings.spriteEditorTheme) {
            // Could implement different color themes
        }
    }
    
    // Public API
    isVisible() {
        return this.isVisible;
    }
    
    getCurrentSprite() {
        return this.currentSpriteData ? [...this.currentSpriteData] : null;
    }
    
    // Cleanup
    destroy() {
        console.log('🧹 Cleaning up Sprite Editor');
        
        // Save current work
        this.saveSpritesToStorage();
        
        // Remove DOM elements
        if (this.editorContainer && this.editorContainer.parentNode) {
            this.editorContainer.parentNode.removeChild(this.editorContainer);
        }
        
        // Remove styles
        const styleElement = document.getElementById('sprite-editor-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        // Clear references
        this.editorContainer = null;
        this.canvas2D = null;
        this.ctx2D = null;
        this.previewCanvas = null;
        this.previewCtx = null;
    }
}

export default SpriteEditor;