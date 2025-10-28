/**
 * SpriteConfig Tests - E002.1-001
 *
 * Unit tests for sprite configuration management
 */

import {
    SpriteConfig,
    getSpriteConfig,
    resetSpriteConfig,
    DEFAULT_PET_A_MAPPING,
    DEFAULT_PET_B_MAPPING,
    DOG_MAPPING,
    REQUIRED_ANIMATIONS
} from './SpriteConfig.js';

describe('SpriteConfig', () => {
    let spriteConfig;

    beforeEach(() => {
        spriteConfig = new SpriteConfig();
    });

    describe('Initialization', () => {
        test('initializes with default configurations', () => {
            expect(spriteConfig.configs.size).toBe(3);
            expect(spriteConfig.configs.has('pet-a')).toBe(true);
            expect(spriteConfig.configs.has('pet-b')).toBe(true);
            expect(spriteConfig.configs.has('dog')).toBe(true);
        });

        test('sets Pet A as default configuration', () => {
            expect(spriteConfig.currentConfig).toBeDefined();
            expect(spriteConfig.currentConfig.sheet).toBe('A');
        });
    });

    describe('loadConfig()', () => {
        test('loads valid pet configuration', () => {
            const config = spriteConfig.loadConfig('pet-b');

            expect(config).toBeDefined();
            expect(config.sheet).toBe('B');
            expect(spriteConfig.currentConfig).toBe(config);
        });

        test('falls back to pet-a for invalid configuration ID', () => {
            const config = spriteConfig.loadConfig('invalid-pet');

            expect(config).toBeDefined();
            expect(config.sheet).toBe('A');
        });

        test('updates current configuration', () => {
            spriteConfig.loadConfig('dog');

            expect(spriteConfig.currentConfig.sheet).toBe('dog');
        });
    });

    describe('getMappingByState()', () => {
        test('finds mapping for valid animation state', () => {
            const mapping = spriteConfig.getMappingByState('idle_sit');

            expect(mapping).toBeDefined();
            expect(mapping.assign).toBe('idle_sit');
            expect(mapping.crop).toHaveLength(4);
            expect(mapping.pivot).toHaveLength(2);
        });

        test('returns null for invalid animation state', () => {
            const mapping = spriteConfig.getMappingByState('invalid_state');

            expect(mapping).toBeNull();
        });

        test('searches custom config when provided', () => {
            const customConfig = {
                sheet: 'custom',
                cells: [
                    {assign: 'custom_state', crop: [0, 0, 32, 32], pivot: [0.5, 1]}
                ]
            };

            const mapping = spriteConfig.getMappingByState('custom_state', customConfig);

            expect(mapping).toBeDefined();
            expect(mapping.assign).toBe('custom_state');
        });
    });

    describe('getMappingForPlayerState()', () => {
        test('handles run animation frame cycling', () => {
            const frame0 = spriteConfig.getMappingForPlayerState('run', 0);
            const frame1 = spriteConfig.getMappingForPlayerState('run', 1);
            const frame2 = spriteConfig.getMappingForPlayerState('run', 2);

            expect(frame0.assign).toBe('run_1');
            expect(frame1.assign).toBe('run_2');
            expect(frame2.assign).toBe('run_3');
        });

        test('wraps run frame index', () => {
            const frame3 = spriteConfig.getMappingForPlayerState('run', 3);
            const frame0 = spriteConfig.getMappingForPlayerState('run', 0);

            expect(frame3.assign).toBe(frame0.assign);
        });

        test('handles non-run states directly', () => {
            const mapping = spriteConfig.getMappingForPlayerState('idle_sit', 0);

            expect(mapping.assign).toBe('idle_sit');
        });
    });

    describe('validateConfig()', () => {
        test('validates complete configuration as valid', () => {
            const validation = spriteConfig.validateConfig(DEFAULT_PET_A_MAPPING);

            expect(validation.valid).toBe(true);
            expect(validation.missing).toHaveLength(0);
            expect(validation.error).toBeNull();
        });

        test('detects missing required animations', () => {
            const incompleteConfig = {
                sheet: 'test',
                cells: [
                    {assign: 'idle_sit', crop: [0, 0, 32, 32], pivot: [0.5, 1]}
                ]
            };

            const validation = spriteConfig.validateConfig(incompleteConfig);

            expect(validation.valid).toBe(false);
            expect(validation.missing.length).toBeGreaterThan(0);
            expect(validation.error).toBeDefined();
        });

        test('rejects invalid configuration structure', () => {
            const validation = spriteConfig.validateConfig({});

            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Invalid configuration structure');
        });

        test('rejects null configuration', () => {
            const validation = spriteConfig.validateConfig(null);

            expect(validation.valid).toBe(false);
        });
    });

    describe('addConfig()', () => {
        test('adds valid configuration', () => {
            const validConfig = {
                sheet: 'custom',
                cells: REQUIRED_ANIMATIONS.map(anim => ({
                    assign: anim,
                    crop: [0, 0, 32, 32],
                    pivot: [0.5, 1]
                }))
            };

            const result = spriteConfig.addConfig('custom-pet', validConfig);

            expect(result).toBe(true);
            expect(spriteConfig.configs.has('custom-pet')).toBe(true);
        });

        test('rejects invalid configuration', () => {
            const invalidConfig = {
                sheet: 'invalid',
                cells: []
            };

            const result = spriteConfig.addConfig('invalid-pet', invalidConfig);

            expect(result).toBe(false);
            expect(spriteConfig.configs.has('invalid-pet')).toBe(false);
        });

        test('clones configuration to prevent mutations', () => {
            const config = {
                sheet: 'test',
                cells: REQUIRED_ANIMATIONS.map(anim => ({
                    assign: anim,
                    crop: [0, 0, 32, 32],
                    pivot: [0.5, 1]
                }))
            };

            spriteConfig.addConfig('test-pet', config);
            config.cells = [];  // Mutate original

            const stored = spriteConfig.configs.get('test-pet');
            expect(stored.cells.length).toBeGreaterThan(0);
        });
    });

    describe('exportConfig()', () => {
        test('exports current configuration as JSON', () => {
            const json = spriteConfig.exportConfig();
            const parsed = JSON.parse(json);

            expect(parsed.sheet).toBe('A');
            expect(parsed.cells).toBeDefined();
            expect(parsed.exportedAt).toBeDefined();
            expect(parsed.version).toBe('1.0.0');
        });

        test('exports specific pet configuration', () => {
            const json = spriteConfig.exportConfig('pet-b');
            const parsed = JSON.parse(json);

            expect(parsed.sheet).toBe('B');
        });

        test('throws error when no configuration to export', () => {
            spriteConfig.currentConfig = null;

            expect(() => spriteConfig.exportConfig()).toThrow('No configuration to export');
        });
    });

    describe('importConfig()', () => {
        test('imports valid JSON configuration', () => {
            const validConfig = {
                sheet: 'imported',
                cells: REQUIRED_ANIMATIONS.map(anim => ({
                    assign: anim,
                    crop: [0, 0, 32, 32],
                    pivot: [0.5, 1]
                }))
            };

            const result = spriteConfig.importConfig(JSON.stringify(validConfig), 'imported-pet');

            expect(result).toBe(true);
            expect(spriteConfig.configs.has('imported-pet')).toBe(true);
        });

        test('rejects invalid JSON', () => {
            const result = spriteConfig.importConfig('invalid json', 'test');

            expect(result).toBe(false);
        });

        test('rejects incomplete configuration', () => {
            const incompleteConfig = {
                sheet: 'incomplete',
                cells: [{assign: 'idle_sit', crop: [0, 0, 32, 32], pivot: [0.5, 1]}]
            };

            const result = spriteConfig.importConfig(JSON.stringify(incompleteConfig), 'incomplete');

            expect(result).toBe(false);
        });
    });

    describe('getCurrentConfig()', () => {
        test('returns current configuration', () => {
            const config = spriteConfig.getCurrentConfig();

            expect(config).toBeDefined();
            expect(config).toBe(spriteConfig.currentConfig);
        });
    });

    describe('getCurrentSheet()', () => {
        test('returns sheet ID for current config', () => {
            const sheetId = spriteConfig.getCurrentSheet();

            expect(sheetId).toBe('A');
        });

        test('returns sheet ID after switching config', () => {
            spriteConfig.loadConfig('pet-b');
            const sheetId = spriteConfig.getCurrentSheet();

            expect(sheetId).toBe('B');
        });
    });

    describe('reset()', () => {
        test('resets to default Pet A configuration', () => {
            spriteConfig.loadConfig('pet-b');
            spriteConfig.reset();

            expect(spriteConfig.currentConfig.sheet).toBe('A');
        });
    });

    describe('getAvailableConfigs()', () => {
        test('returns all configuration IDs', () => {
            const configs = spriteConfig.getAvailableConfigs();

            expect(configs).toContain('pet-a');
            expect(configs).toContain('pet-b');
            expect(configs).toContain('dog');
            expect(configs.length).toBe(3);
        });
    });

    describe('Singleton functions', () => {
        test('getSpriteConfig returns singleton instance', () => {
            const instance1 = getSpriteConfig();
            const instance2 = getSpriteConfig();

            expect(instance1).toBe(instance2);
        });

        test('resetSpriteConfig creates new instance', () => {
            const instance1 = getSpriteConfig();
            const instance2 = resetSpriteConfig();

            expect(instance1).not.toBe(instance2);
        });
    });

    describe('Constants', () => {
        test('DEFAULT_PET_A_MAPPING has required structure', () => {
            expect(DEFAULT_PET_A_MAPPING.sheet).toBe('A');
            expect(DEFAULT_PET_A_MAPPING.cells).toBeDefined();
            expect(DEFAULT_PET_A_MAPPING.cells.length).toBeGreaterThan(0);
        });

        test('DEFAULT_PET_B_MAPPING has required structure', () => {
            expect(DEFAULT_PET_B_MAPPING.sheet).toBe('B');
            expect(DEFAULT_PET_B_MAPPING.cells).toBeDefined();
        });

        test('DOG_MAPPING has required structure', () => {
            expect(DOG_MAPPING.sheet).toBe('dog');
            expect(DOG_MAPPING.cells).toBeDefined();
        });

        test('REQUIRED_ANIMATIONS contains all animation states', () => {
            expect(REQUIRED_ANIMATIONS).toContain('idle_sit');
            expect(REQUIRED_ANIMATIONS).toContain('run_1');
            expect(REQUIRED_ANIMATIONS).toContain('run_2');
            expect(REQUIRED_ANIMATIONS).toContain('run_3');
            expect(REQUIRED_ANIMATIONS).toContain('jump_up');
            expect(REQUIRED_ANIMATIONS).toContain('fall_down');
            expect(REQUIRED_ANIMATIONS).toContain('crouch');
            expect(REQUIRED_ANIMATIONS).toContain('dodge_roll');
        });
    });
});
