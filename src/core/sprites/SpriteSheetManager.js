/**
 * Sprite Sheet Manager Module - E002.1-001
 *
 * Extracted from monolithic index.html sprite sheet loading
 * Handles sprite sheet image loading, validation, and management
 *
 * Features:
 * - Load sprite sheets from File objects or URLs
 * - Generate preview thumbnails
 * - Validate sprite sheet dimensions
 * - Cache loaded sheets
 * - Support for multiple sheets (A, B, dog, etc.)
 */

/**
 * SpriteSheetManager class
 * Manages sprite sheet loading and storage
 */
export class SpriteSheetManager {
    constructor() {
        // Sheet storage - matches monolithic sheets object structure
        this.sheets = {
            A: { img: null, cells: [] },
            B: { img: null, cells: [] },
            dog: { img: null, cells: [] }
        };

        this.loadingPromises = new Map();
    }

    /**
     * Load sprite sheet from File object
     * Extracted from monolithic loadSheet() function
     *
     * @param {string} sheetId - Sheet identifier (A, B, dog)
     * @param {File} file - PNG file object
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    loadSheet(sheetId, file) {
        if (!file) {
            throw new Error('No file provided for sprite sheet');
        }

        // Check if already loading
        const loadKey = `${sheetId}:${file.name}`;
        if (this.loadingPromises.has(loadKey)) {
            return this.loadingPromises.get(loadKey);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    console.log(`✅ Loaded sprite sheet ${sheetId}: ${file.name}`);

                    // Validate image dimensions
                    if (!this.validateSheetDimensions(img, sheetId)) {
                        console.warn(`⚠️ Sheet ${sheetId} has unexpected dimensions: ${img.width}x${img.height}`);
                    }

                    // Store in sheets object
                    this.sheets[sheetId].img = img;

                    this.loadingPromises.delete(loadKey);
                    resolve(img);
                };

                img.onerror = (error) => {
                    console.error(`❌ Failed to load sprite sheet ${sheetId}:`, error);
                    this.loadingPromises.delete(loadKey);
                    reject(new Error(`Failed to load sprite sheet: ${sheetId}`));
                };

                img.src = e.target.result;
            };

            reader.onerror = (error) => {
                console.error(`❌ Failed to read file for sheet ${sheetId}:`, error);
                this.loadingPromises.delete(loadKey);
                reject(new Error('Failed to read sprite sheet file'));
            };

            reader.readAsDataURL(file);
        });

        this.loadingPromises.set(loadKey, loadPromise);
        return loadPromise;
    }

    /**
     * Load sprite sheet from URL
     *
     * @param {string} sheetId - Sheet identifier
     * @param {string} url - Image URL
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    loadSheetFromURL(sheetId, url) {
        const loadKey = `${sheetId}:${url}`;

        // Return cached promise if already loading
        if (this.loadingPromises.has(loadKey)) {
            return this.loadingPromises.get(loadKey);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = async () => {
                console.log(`✅ Loaded sprite sheet ${sheetId} from URL: ${url}`);

                if (!this.validateSheetDimensions(img, sheetId)) {
                    console.warn(`⚠️ Sheet ${sheetId} has unexpected dimensions: ${img.width}x${img.height}`);
                }

                this.sheets[sheetId].img = img;

                // Calculate crop coordinates dynamically based on actual image dimensions
                await this.calculateCropCoordinates(sheetId, img);

                this.loadingPromises.delete(loadKey);
                resolve(img);
            };

            img.onerror = (error) => {
                console.error(`❌ Failed to load sprite sheet ${sheetId} from ${url}:`, error);
                this.loadingPromises.delete(loadKey);
                reject(new Error(`Failed to load sprite sheet from URL: ${url}`));
            };

            // Enable CORS if needed
            img.crossOrigin = 'anonymous';
            img.src = url;
        });

        this.loadingPromises.set(loadKey, loadPromise);
        return loadPromise;
    }

    /**
     * Generate preview thumbnail for sprite sheet
     * Extracted from monolithic thumbnail generation code
     *
     * @param {string} sheetId - Sheet identifier
     * @param {number} [size=96] - Thumbnail size in pixels
     * @returns {HTMLCanvasElement|null} Thumbnail canvas or null if sheet not loaded
     */
    generatePreview(sheetId, size = 96) {
        const sheet = this.sheets[sheetId];
        if (!sheet || !sheet.img) {
            console.warn(`Cannot generate preview: sheet ${sheetId} not loaded`);
            return null;
        }

        // Create thumbnail canvas
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = size;
        thumbCanvas.height = size;
        const thumbCtx = thumbCanvas.getContext('2d');

        // Disable smoothing for pixel art
        thumbCtx.imageSmoothingEnabled = false;

        // Draw scaled sprite sheet
        thumbCtx.drawImage(sheet.img, 0, 0, size, size);

        return thumbCanvas;
    }

    /**
     * Validate sprite sheet dimensions
     * Expected: 96x96 for 3x3 grid of 32x32 sprites
     *
     * @param {HTMLImageElement} img - Image to validate
     * @param {string} sheetId - Sheet identifier for logging
     * @returns {boolean} True if valid dimensions
     */
    validateSheetDimensions(img, sheetId) {
        const expectedWidth = 96;
        const expectedHeight = 96;

        if (img.width !== expectedWidth || img.height !== expectedHeight) {
            console.warn(
                `Sheet ${sheetId} dimensions (${img.width}x${img.height}) ` +
                `do not match expected (${expectedWidth}x${expectedHeight})`
            );
            return false;
        }

        return true;
    }

    /**
     * Get loaded sprite sheet
     *
     * @param {string} sheetId - Sheet identifier
     * @returns {Object|null} Sheet object or null if not found
     */
    getSheet(sheetId) {
        const sheet = this.sheets[sheetId];
        if (!sheet) {
            console.warn(`Sheet not found: ${sheetId}`);
            return null;
        }

        return sheet;
    }

    /**
     * Get sprite sheet image
     *
     * @param {string} sheetId - Sheet identifier
     * @returns {HTMLImageElement|null} Image or null if not loaded
     */
    getSheetImage(sheetId) {
        const sheet = this.getSheet(sheetId);
        return sheet ? sheet.img : null;
    }

    /**
     * Check if sprite sheet is loaded
     *
     * @param {string} sheetId - Sheet identifier
     * @returns {boolean} True if sheet is loaded
     */
    isSheetLoaded(sheetId) {
        const sheet = this.sheets[sheetId];
        return Boolean(sheet && sheet.img !== null);
    }

    /**
     * Unload sprite sheet
     *
     * @param {string} sheetId - Sheet identifier
     */
    unloadSheet(sheetId) {
        if (this.sheets[sheetId]) {
            this.sheets[sheetId].img = null;
            console.log(`🗑️ Unloaded sprite sheet: ${sheetId}`);
        }
    }

    /**
     * Load all game sprite sheets from URLs
     *
     * @param {Object} sheetURLs - Map of sheet IDs to URLs
     * @returns {Promise<Object>} Map of loaded sheets
     */
    async loadAllSheets(sheetURLs = {}) {
        const defaultURLs = {
            A: '../bowie_cat_3x3.png',
            B: '../happy_buttercup_cat_3x3.png',
            dog: '../bonbon_dog_3x3.png'
        };

        const urls = { ...defaultURLs, ...sheetURLs };
        const loadPromises = [];

        for (const [sheetId, url] of Object.entries(urls)) {
            loadPromises.push(
                this.loadSheetFromURL(sheetId, url).catch(error => {
                    console.warn(`⚠️ Failed to load sheet ${sheetId}, will use fallback rendering`);
                    return null;
                })
            );
        }

        await Promise.all(loadPromises);

        console.log('✅ All sprite sheets loaded');
        return this.sheets;
    }

    /**
     * Get all loaded sheet IDs
     *
     * @returns {string[]} Array of loaded sheet IDs
     */
    getLoadedSheets() {
        return Object.keys(this.sheets).filter(id => this.isSheetLoaded(id));
    }

    /**
     * Clear all loaded sheets
     */
    clear() {
        Object.keys(this.sheets).forEach(sheetId => {
            this.unloadSheet(sheetId);
        });

        this.loadingPromises.clear();
        console.log('🗑️ Cleared all sprite sheets');
    }

    /**
     * Calculate crop coordinates dynamically based on actual image dimensions
     * Matches monolithic analyzeAndSetupGrid() function (index.html:2892-2921)
     *
     * @param {string} sheetId - Sheet identifier
     * @param {HTMLImageElement} img - Loaded sprite sheet image
     */
    async calculateCropCoordinates(sheetId, img) {
        try {
            // Import SpriteConfig to update crop coordinates
            const { getSpriteConfig } = await import('./SpriteConfig.js');
            const config = getSpriteConfig();

            // Calculate cell dimensions from actual image size
            const cellWidth = img.width / 3;
            const cellHeight = img.height / 3;

            console.log(`🔧 Calculating crops for ${sheetId}: ${Math.floor(cellWidth)}x${Math.floor(cellHeight)} cells`);

            // Get the configuration for this sheet
            const petId = sheetId === 'A' ? 'pet-a' : sheetId === 'B' ? 'pet-b' : 'dog';
            const currentConfig = config.getConfigForPet(petId);

            if (!currentConfig || !currentConfig.cells) {
                console.warn(`No config found for ${petId}, skipping crop calculation`);
                return;
            }

            // Update crop coordinates for each cell
            currentConfig.cells.forEach((cell, idx) => {
                const r = Math.floor(idx / 3);  // Row (0-2)
                const c = idx % 3;                // Column (0-2)

                cell.crop = [
                    Math.floor(c * cellWidth),
                    Math.floor(r * cellHeight),
                    Math.floor(cellWidth),
                    Math.floor(cellHeight)
                ];
            });

            console.log(`✅ Updated ${currentConfig.cells.length} crop coordinates for ${sheetId}`);
        } catch (err) {
            console.error('Failed to update crop coordinates:', err);
        }
    }

    /**
     * Get sprite sheet stats
     *
     * @returns {Object} Stats object
     */
    getStats() {
        const totalSheets = Object.keys(this.sheets).length;
        const loadedSheets = this.getLoadedSheets().length;

        return {
            totalSheets,
            loadedSheets,
            loadingProgress: totalSheets > 0 ? loadedSheets / totalSheets : 0,
            sheets: Object.keys(this.sheets).reduce((acc, id) => {
                const sheet = this.sheets[id];
                acc[id] = {
                    loaded: sheet.img !== null,
                    width: sheet.img ? sheet.img.width : null,
                    height: sheet.img ? sheet.img.height : null
                };
                return acc;
            }, {})
        };
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton sprite sheet manager instance
 *
 * @returns {SpriteSheetManager} Sprite sheet manager instance
 */
export function getSpriteSheetManager() {
    if (!instance) {
        instance = new SpriteSheetManager();
    }
    return instance;
}

/**
 * Reset sprite sheet manager singleton (mainly for testing)
 */
export function resetSpriteSheetManager() {
    if (instance) {
        instance.clear();
    }
    instance = null;
    return getSpriteSheetManager();
}

export default SpriteSheetManager;
