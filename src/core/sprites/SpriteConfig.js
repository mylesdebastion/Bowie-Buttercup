/**
 * Sprite Configuration Module - E002.1-001
 *
 * Extracted from monolithic index.html (lines 615-638)
 * Manages sprite configurations and mappings for game entities
 *
 * Features:
 * - Pet A/B sprite configurations with 3x3 grid mappings
 * - Animation state to sprite cell mapping
 * - Configuration validation and management
 * - Support for multiple sprite sheets
 */

/**
 * Default sprite mapping for Pet A (Bowie Cat)
 * Extracted from index.html defaultMapping object
 */
export const DEFAULT_PET_A_MAPPING = {
    sheet: 'A',
    cells: [
        {r:1, c:1, crop:[0,0,32,32], assign:'dodge_roll', pivot:[0.5,1], flipX:false},
        {r:1, c:2, crop:[32,0,32,32], assign:'run_1', pivot:[0.5,1], flipX:false},
        {r:1, c:3, crop:[64,0,32,32], assign:'idle_sit', pivot:[0.5,1], flipX:false},
        {r:2, c:1, crop:[0,32,32,32], assign:'run_2', pivot:[0.5,1], flipX:false},
        {r:2, c:2, crop:[32,32,32,32], assign:'run_3', pivot:[0.5,1], flipX:false},
        {r:2, c:3, crop:[64,32,32,32], assign:'idle_sit_front', pivot:[0.5,1], flipX:false},
        {r:3, c:1, crop:[0,64,32,32], assign:'crouch', pivot:[0.5,1], flipX:false},
        {r:3, c:2, crop:[32,64,32,32], assign:'jump_up', pivot:[0.5,1], flipX:false},
        {r:3, c:3, crop:[64,64,32,32], assign:'fall_down', pivot:[0.5,1], flipX:false}
    ],
    fireball: null
};

/**
 * Default sprite mapping for Pet B (Buttercup Cat)
 * Uses same cell positions as Pet A but with different sprite sheet
 */
export const DEFAULT_PET_B_MAPPING = {
    sheet: 'B',
    cells: [
        {r:1, c:1, crop:[0,0,32,32], assign:'dodge_roll', pivot:[0.5,1], flipX:false},
        {r:1, c:2, crop:[32,0,32,32], assign:'run_1', pivot:[0.5,1], flipX:false},
        {r:1, c:3, crop:[64,0,32,32], assign:'idle_sit', pivot:[0.5,1], flipX:false},
        {r:2, c:1, crop:[0,32,32,32], assign:'run_2', pivot:[0.5,1], flipX:false},
        {r:2, c:2, crop:[32,32,32,32], assign:'run_3', pivot:[0.5,1], flipX:false},
        {r:2, c:3, crop:[64,32,32,32], assign:'idle_sit_front', pivot:[0.5,1], flipX:false},
        {r:3, c:1, crop:[0,64,32,32], assign:'crouch', pivot:[0.5,1], flipX:false},
        {r:3, c:2, crop:[32,64,32,32], assign:'jump_up', pivot:[0.5,1], flipX:false},
        {r:3, c:3, crop:[64,64,32,32], assign:'fall_down', pivot:[0.5,1], flipX:false}
    ],
    fireball: null
};

/**
 * Dog NPC sprite mapping
 */
export const DOG_MAPPING = {
    sheet: 'dog',
    cells: [
        {r:1, c:1, crop:[0,0,32,32], assign:'idle', pivot:[0.5,1], flipX:false},
        {r:1, c:2, crop:[32,0,32,32], assign:'run_1', pivot:[0.5,1], flipX:false},
        {r:1, c:3, crop:[64,0,32,32], assign:'run_2', pivot:[0.5,1], flipX:false}
    ]
};

/**
 * Animation state constants
 * Defines all possible animation states for player entities
 */
export const ANIMATION_STATES = {
    IDLE_SIT: 'idle_sit',
    IDLE_SIT_FRONT: 'idle_sit_front',
    RUN_1: 'run_1',
    RUN_2: 'run_2',
    RUN_3: 'run_3',
    JUMP_UP: 'jump_up',
    FALL_DOWN: 'fall_down',
    CROUCH: 'crouch',
    DODGE_ROLL: 'dodge_roll'
};

/**
 * Required animation states for pet configurations
 * All pet configs must include mappings for these states
 */
export const REQUIRED_ANIMATIONS = [
    'idle_sit',
    'run_1', 'run_2', 'run_3',
    'jump_up',
    'fall_down',
    'crouch',
    'dodge_roll',
    'idle_sit_front'
];

/**
 * SpriteConfig class
 * Manages sprite configurations and provides mapping utilities
 */
export class SpriteConfig {
    constructor() {
        this.configs = new Map();
        this.currentConfig = null;

        // Initialize with default pet configurations
        this.configs.set('pet-a', this.cloneMapping(DEFAULT_PET_A_MAPPING));
        this.configs.set('pet-b', this.cloneMapping(DEFAULT_PET_B_MAPPING));
        this.configs.set('dog', this.cloneMapping(DOG_MAPPING));

        // Set Pet A as default
        this.currentConfig = this.configs.get('pet-a');
    }

    /**
     * Load a pet configuration by ID
     * @param {string} petId - Pet identifier (pet-a, pet-b, dog, A, B)
     * @returns {Object} Pet configuration object
     */
    loadConfig(petId) {
        // Map short IDs to full config names - E003.1-003
        const idMap = {
            'A': 'pet-a',
            'B': 'pet-b'
        };

        const configId = idMap[petId] || petId;
        const config = this.configs.get(configId);

        if (!config) {
            console.warn(`Configuration not found: ${petId} (${configId}), using pet-a as fallback`);
            return this.configs.get('pet-a');
        }

        this.currentConfig = config;
        console.log(`✅ Loaded config: ${config.name} (${config.id})`);
        return config;
    }

    /**
     * Get mapping for a specific animation state
     * @param {string} state - Animation state (e.g., 'run_1', 'idle_sit')
     * @param {Object} [config] - Optional config to search, defaults to current
     * @returns {Object|null} Sprite cell mapping or null if not found
     */
    getMappingByState(state, config = null) {
        const searchConfig = config || this.currentConfig;
        if (!searchConfig) return null;

        return searchConfig.cells.find(cell => cell.assign === state) || null;
    }

    /**
     * Get mapping for player's current animation state
     * Handles run animation frame cycling
     * @param {string} state - Player animation state
     * @param {number} animFrame - Current animation frame
     * @returns {Object|null} Sprite cell mapping
     */
    getMappingForPlayerState(state, animFrame) {
        let searchState = state;

        // Handle run animation cycling through frames
        if (state === 'run') {
            const frameMap = ['run_1', 'run_2', 'run_3'];
            searchState = frameMap[animFrame % 3];
        }

        return this.getMappingByState(searchState);
    }

    /**
     * Validate configuration has all required animations
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validation result {valid: boolean, missing: string[]}
     */
    validateConfig(config) {
        if (!config || !config.cells || !Array.isArray(config.cells)) {
            return {
                valid: false,
                missing: REQUIRED_ANIMATIONS,
                error: 'Invalid configuration structure'
            };
        }

        const providedStates = config.cells.map(cell => cell.assign);
        const missing = REQUIRED_ANIMATIONS.filter(state => !providedStates.includes(state));

        return {
            valid: missing.length === 0,
            missing: missing,
            error: missing.length > 0 ? `Missing required animations: ${missing.join(', ')}` : null
        };
    }

    /**
     * Add or update a configuration
     * @param {string} id - Configuration identifier
     * @param {Object} config - Configuration object
     * @returns {boolean} True if valid and added, false otherwise
     */
    addConfig(id, config) {
        const validation = this.validateConfig(config);

        if (!validation.valid) {
            console.error(`Cannot add config ${id}: ${validation.error}`);
            return false;
        }

        this.configs.set(id, this.cloneMapping(config));
        return true;
    }

    /**
     * Export current configuration as JSON
     * @param {string} [petId] - Optional pet ID to export, defaults to current
     * @returns {string} JSON string of configuration
     */
    exportConfig(petId = null) {
        let config;

        if (petId) {
            config = this.configs.get(petId);
        } else {
            config = this.currentConfig;
        }

        if (!config) {
            throw new Error('No configuration to export');
        }

        return JSON.stringify({
            ...config,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        }, null, 2);
    }

    /**
     * Import configuration from JSON
     * @param {string} jsonData - JSON string of configuration
     * @param {string} id - Configuration identifier
     * @returns {boolean} True if successfully imported
     */
    importConfig(jsonData, id) {
        try {
            const config = JSON.parse(jsonData);
            return this.addConfig(id, config);
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }

    /**
     * Get current active configuration
     * @returns {Object} Current configuration
     */
    getCurrentConfig() {
        return this.currentConfig;
    }

    /**
     * Get sheet ID for current config
     * @returns {string} Sheet identifier
     */
    getCurrentSheet() {
        return this.currentConfig ? this.currentConfig.sheet : 'A';
    }

    /**
     * Get configuration for a specific pet
     * @param {string} petId - Pet identifier (pet-a, pet-b, dog)
     * @returns {Object|null} Pet configuration or null if not found
     */
    getConfigForPet(petId) {
        return this.configs.get(petId) || null;
    }

    /**
     * Clone mapping object to prevent mutations
     * @param {Object} mapping - Mapping to clone
     * @returns {Object} Deep cloned mapping
     */
    cloneMapping(mapping) {
        return JSON.parse(JSON.stringify(mapping));
    }

    /**
     * Reset to default configuration
     */
    reset() {
        this.currentConfig = this.configs.get('pet-a');
    }

    /**
     * Get all available configuration IDs
     * @returns {string[]} Array of config IDs
     */
    getAvailableConfigs() {
        return Array.from(this.configs.keys());
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton sprite config instance
 * @returns {SpriteConfig} Sprite config instance
 */
export function getSpriteConfig() {
    if (!instance) {
        instance = new SpriteConfig();
    }
    return instance;
}

/**
 * Reset sprite config singleton (mainly for testing)
 */
export function resetSpriteConfig() {
    instance = null;
    return getSpriteConfig();
}

export default SpriteConfig;
