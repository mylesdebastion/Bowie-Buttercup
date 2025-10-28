/**
 * Sprite System Module - E002.1-001
 *
 * Modular sprite system extracted from monolithic index.html
 * Provides clean API for sprite management, animation, and rendering
 *
 * Usage:
 * ```javascript
 * import { SpriteSystem, getSpriteSystem } from './core/sprites';
 *
 * // Initialize sprite system
 * const spriteSystem = getSpriteSystem();
 * await spriteSystem.loadAllSheets();
 *
 * // Get sprite for rendering
 * const sprite = spriteSystem.getSpriteForState('run', 0);
 *
 * // Render sprite
 * spriteSystem.render(ctx, sprite, x, y, width, height, { facing: -1 });
 * ```
 */

import { SpriteConfig, getSpriteConfig, resetSpriteConfig } from './SpriteConfig.js';
import { SpriteSheetManager, getSpriteSheetManager, resetSpriteSheetManager } from './SpriteSheetManager.js';
import { AnimationController, createAnimationController } from './AnimationController.js';
import { SpriteRenderer, getSpriteRenderer, resetSpriteRenderer } from './SpriteRenderer.js';

/**
 * Unified Sprite System
 * Combines all sprite subsystems into single convenient API
 */
export class SpriteSystem {
    constructor() {
        this.config = getSpriteConfig();
        this.sheetManager = getSpriteSheetManager();
        this.animationController = createAnimationController();
        this.renderer = getSpriteRenderer();
    }

    /**
     * Load all sprite sheets
     *
     * @param {Object} [sheetURLs] - Optional custom sheet URLs
     * @returns {Promise<Object>} Loaded sheets
     */
    async loadAllSheets(sheetURLs) {
        return this.sheetManager.loadAllSheets(sheetURLs);
    }

    /**
     * Load specific sheet from file
     *
     * @param {string} sheetId - Sheet identifier
     * @param {File} file - PNG file
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadSheet(sheetId, file) {
        return this.sheetManager.loadSheet(sheetId, file);
    }

    /**
     * Load specific sheet from URL
     *
     * @param {string} sheetId - Sheet identifier
     * @param {string} url - Image URL
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async loadSheetFromURL(sheetId, url) {
        return this.sheetManager.loadSheetFromURL(sheetId, url);
    }

    /**
     * Switch active pet configuration
     *
     * @param {string} petId - Pet identifier (pet-a, pet-b, dog)
     * @returns {Object} Pet configuration
     */
    switchPet(petId) {
        return this.config.loadConfig(petId);
    }

    /**
     * Get sprite for current animation state
     *
     * @param {string} state - Animation state
     * @param {number} animFrame - Animation frame
     * @returns {Object|null} Sprite data {img, crop, pivot}
     */
    getSpriteForState(state, animFrame) {
        // Get mapping for state
        const mapping = this.config.getMappingForPlayerState(state, animFrame);
        if (!mapping) {
            console.warn(`No mapping found for state: ${state}`);
            return null;
        }

        // Get sheet
        const sheetId = this.config.getCurrentSheet();
        const sheet = this.sheetManager.getSheet(sheetId);

        if (!sheet || !sheet.img) {
            console.warn(`Sheet not loaded: ${sheetId}`);
            return null;
        }

        return this.renderer.getSprite(sheet, mapping);
    }

    /**
     * Update animation
     *
     * @param {number} deltaTime - Time elapsed (ms)
     * @param {string} [state] - Optional new state
     */
    updateAnimation(deltaTime, state) {
        this.animationController.update(deltaTime, state);
    }

    /**
     * Render sprite with current animation state
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} options - Rendering options
     */
    render(ctx, x, y, width, height, options = {}) {
        const state = this.animationController.getCurrentState();
        const frame = this.animationController.getCurrentFrame();

        const sprite = this.getSpriteForState(state, frame);
        this.renderer.render(ctx, sprite, x, y, width, height, options);
    }

    /**
     * Get current animation state
     *
     * @returns {string} Current state
     */
    getAnimationState() {
        return this.animationController.getCurrentState();
    }

    /**
     * Set animation state
     *
     * @param {string} state - New state
     * @param {boolean} [resetFrame=true] - Reset frame on change
     */
    setAnimationState(state, resetFrame = true) {
        this.animationController.setState(state, resetFrame);
    }

    /**
     * Get current animation frame
     *
     * @returns {number} Frame index
     */
    getAnimationFrame() {
        return this.animationController.getCurrentFrame();
    }

    /**
     * Generate preview thumbnail for sheet
     *
     * @param {string} sheetId - Sheet identifier
     * @param {number} [size=96] - Thumbnail size
     * @returns {HTMLCanvasElement|null} Thumbnail canvas
     */
    generatePreview(sheetId, size = 96) {
        return this.sheetManager.generatePreview(sheetId, size);
    }

    /**
     * Check if sheets are loaded
     *
     * @returns {boolean} True if all sheets loaded
     */
    areSheetsLoaded() {
        const stats = this.sheetManager.getStats();
        return stats.loadingProgress === 1;
    }

    /**
     * Get system stats
     *
     * @returns {Object} Stats from all subsystems
     */
    getStats() {
        return {
            sheets: this.sheetManager.getStats(),
            config: {
                currentPet: this.config.getCurrentSheet(),
                availableConfigs: this.config.getAvailableConfigs()
            },
            animation: {
                state: this.animationController.getCurrentState(),
                frame: this.animationController.getCurrentFrame(),
                progress: this.animationController.getProgress()
            }
        };
    }

    /**
     * Enable debug rendering
     */
    enableDebug() {
        this.renderer.enableDebug();
    }

    /**
     * Disable debug rendering
     */
    disableDebug() {
        this.renderer.disableDebug();
    }

    /**
     * Reset entire sprite system
     */
    reset() {
        this.config.reset();
        this.animationController.reset();
    }

    /**
     * Clear all loaded assets
     */
    clear() {
        this.sheetManager.clear();
    }
}

// Singleton instance
let systemInstance = null;

/**
 * Get singleton sprite system instance
 *
 * @returns {SpriteSystem} Sprite system instance
 */
export function getSpriteSystem() {
    if (!systemInstance) {
        systemInstance = new SpriteSystem();
    }
    return systemInstance;
}

/**
 * Reset sprite system singleton
 */
export function resetSpriteSystem() {
    resetSpriteConfig();
    resetSpriteSheetManager();
    resetSpriteRenderer();
    systemInstance = null;
    return getSpriteSystem();
}

// Export all submodules
export {
    SpriteConfig,
    getSpriteConfig,
    resetSpriteConfig
} from './SpriteConfig.js';

export {
    SpriteSheetManager,
    getSpriteSheetManager,
    resetSpriteSheetManager
} from './SpriteSheetManager.js';

export {
    AnimationController,
    createAnimationController,
    ANIMATION_SPEEDS,
    FRAME_COUNTS
} from './AnimationController.js';

export {
    SpriteRenderer,
    getSpriteRenderer,
    resetSpriteRenderer
} from './SpriteRenderer.js';

// Default export
export default SpriteSystem;
