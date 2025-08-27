/**
 * Asset Loader System
 * Extracted from monolithic index.html
 * Handles loading and managing game assets (images, sounds, etc.)
 */

export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadPromises = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        
        // Preload canvas for sprite processing
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
    }

    /**
     * Load an image asset
     * Extracted from loadImage function in monolithic version
     */
    async loadImage(url, options = {}) {
        // Return cached asset if already loaded
        if (this.assets.has(url)) {
            return this.assets.get(url);
        }

        // Return existing promise if already loading
        if (this.loadPromises.has(url)) {
            return this.loadPromises.get(url);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log(`✅ Loaded image: ${url}`);
                
                // Process image if needed
                let processedAsset = img;
                if (options.process) {
                    processedAsset = this.processImage(img, options);
                }
                
                this.assets.set(url, processedAsset);
                this.loadPromises.delete(url);
                this.loadedCount++;
                
                if (this.onProgress) {
                    this.onProgress(this.loadedCount, this.totalCount);
                }
                
                resolve(processedAsset);
            };

            img.onerror = (error) => {
                console.error(`❌ Failed to load image: ${url}`, error);
                this.loadPromises.delete(url);
                reject(new Error(`Failed to load image: ${url}`));
            };

            // Set cross-origin if needed
            if (options.crossOrigin) {
                img.crossOrigin = options.crossOrigin;
            }

            img.src = url;
        });

        this.loadPromises.set(url, loadPromise);
        this.totalCount++;
        
        return loadPromise;
    }

    /**
     * Process image for optimization or effects
     */
    processImage(img, options) {
        if (!options.process) return img;

        // Set up temp canvas
        this.tempCanvas.width = img.width;
        this.tempCanvas.height = img.height;
        this.tempCtx.clearRect(0, 0, img.width, img.height);
        this.tempCtx.drawImage(img, 0, 0);

        // Apply processing options
        if (options.flipX) {
            this.tempCtx.scale(-1, 1);
            this.tempCtx.drawImage(img, -img.width, 0);
            this.tempCtx.scale(-1, 1);
        }

        if (options.tint) {
            this.tempCtx.globalCompositeOperation = 'multiply';
            this.tempCtx.fillStyle = options.tint;
            this.tempCtx.fillRect(0, 0, img.width, img.height);
            this.tempCtx.globalCompositeOperation = 'source-over';
        }

        // Create new image from processed canvas
        const processedImg = new Image();
        processedImg.src = this.tempCanvas.toDataURL();
        return processedImg;
    }

    /**
     * Load multiple assets in parallel
     */
    async loadAssets(assetList) {
        const loadPromises = assetList.map(asset => {
            if (typeof asset === 'string') {
                return this.loadImage(asset);
            } else if (asset.type === 'image' || !asset.type) {
                return this.loadImage(asset.url, asset.options);
            }
            // Add other asset types here (audio, etc.)
            throw new Error(`Unsupported asset type: ${asset.type}`);
        });

        return Promise.all(loadPromises);
    }

    /**
     * Load game-specific assets extracted from monolithic version
     */
    async loadGameAssets() {
        console.log('🎨 Loading game assets...');

        const assetList = [
            // Pet bowl sprites - these are served from the root
            '/pet_food_bowl.png',
            '/pet_water_bowl.png',
            
            // Cat sprites
            '/bowie_cat_3x3.png',
            '/happy_buttercup_cat_3x3.png', 
            '/sad_buttercup_cat_3x3.png',
            
            // Dog sprites  
            '/bonbon_dog_3x3.png',
            
            // Environment
            '/cat-tree.png'
        ];

        const results = {};
        
        // Load each asset with error handling
        for (const url of assetList) {
            try {
                const asset = await this.loadImage(url);
                const key = this.urlToKey(url);
                results[key] = asset;
            } catch (error) {
                console.warn(`⚠️ Could not load ${url}, will use fallback`);
                results[this.urlToKey(url)] = null;
            }
        }

        console.log(`✅ Loaded ${Object.keys(results).length} game assets`);
        return results;
    }

    /**
     * Convert URL to asset key
     */
    urlToKey(url) {
        return url.replace('./', '').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * Get loaded asset by URL or key
     */
    get(urlOrKey) {
        // Try direct URL lookup first
        if (this.assets.has(urlOrKey)) {
            return this.assets.get(urlOrKey);
        }
        
        // Try key lookup
        const key = this.urlToKey(urlOrKey);
        for (const [url, asset] of this.assets) {
            if (this.urlToKey(url) === key) {
                return asset;
            }
        }
        
        return null;
    }

    /**
     * Check if asset is loaded
     */
    has(urlOrKey) {
        return this.get(urlOrKey) !== null;
    }

    /**
     * Get loading progress
     */
    getProgress() {
        return {
            loaded: this.loadedCount,
            total: this.totalCount,
            progress: this.totalCount > 0 ? this.loadedCount / this.totalCount : 1
        };
    }

    /**
     * Set progress callback
     */
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    /**
     * Clear all loaded assets
     */
    clear() {
        this.assets.clear();
        this.loadPromises.clear();
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * Preload assets for better performance
     */
    async preload(assetUrls) {
        console.log(`🚀 Preloading ${assetUrls.length} assets...`);
        
        const startTime = Date.now();
        await this.loadAssets(assetUrls.map(url => ({ url, type: 'image' })));
        const loadTime = Date.now() - startTime;
        
        console.log(`✅ Preload complete in ${loadTime}ms`);
        return this.getProgress();
    }

    /**
     * Get all loaded asset keys
     */
    getLoadedAssets() {
        return Array.from(this.assets.keys());
    }
}

// Singleton instance
let instance = null;

export function getAssetLoader() {
    if (!instance) {
        instance = new AssetLoader();
    }
    return instance;
}

export function resetAssetLoader() {
    if (instance) {
        instance.clear();
    }
    instance = null;
    return getAssetLoader();
}

export default AssetLoader;