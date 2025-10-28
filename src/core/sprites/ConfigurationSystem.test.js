/**
 * Configuration System Tests - E002.1-004
 *
 * Tests for JSON-based sprite configuration import/export
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SpriteConfig, getSpriteConfig, resetSpriteConfig } from './SpriteConfig.js';
import petAConfig from '../../configs/sprites/pet-a-config.json';
import petBConfig from '../../configs/sprites/pet-b-config.json';

describe('Configuration System - E002.1-004', () => {
    let spriteConfig;

    beforeEach(() => {
        spriteConfig = resetSpriteConfig();
    });

    describe('JSON Configuration Import', () => {
        test('imports valid Pet A configuration', () => {
            const jsonData = JSON.stringify(petAConfig);
            const success = spriteConfig.importConfig(jsonData, 'pet-a');

            expect(success).toBe(true);
        });

        test('imports valid Pet B configuration', () => {
            const jsonData = JSON.stringify(petBConfig);
            const success = spriteConfig.importConfig(jsonData, 'pet-b');

            expect(success).toBe(true);
        });

        test('validates required animation states on import', () => {
            const invalidConfig = {
                ...petAConfig,
                cells: petAConfig.cells.slice(0, 5) // Remove required animations
            };

            const jsonData = JSON.stringify(invalidConfig);
            const success = spriteConfig.importConfig(jsonData, 'invalid');

            expect(success).toBe(false);
        });

        test('rejects malformed JSON', () => {
            const invalidJSON = '{ invalid json }';
            const success = spriteConfig.importConfig(invalidJSON, 'invalid');

            expect(success).toBe(false);
        });
    });

    describe('JSON Configuration Export', () => {
        test('exports Pet A configuration as valid JSON', () => {
            // Load Pet A first
            spriteConfig.loadConfig('A');

            const exported = spriteConfig.exportConfig('pet-a');
            const parsed = JSON.parse(exported);

            expect(parsed).toBeDefined();
            expect(parsed.id).toBe('pet-a');
            expect(parsed.exportedAt).toBeDefined();
        });

        test('exported configuration includes all required fields', () => {
            spriteConfig.loadConfig('A');
            const exported = spriteConfig.exportConfig('pet-a');
            const parsed = JSON.parse(exported);

            expect(parsed.sheet).toBeDefined();
            expect(parsed.cells).toBeDefined();
            expect(Array.isArray(parsed.cells)).toBe(true);
            expect(parsed.fireball).toBeDefined();
        });

        test('throws error when exporting non-existent configuration', () => {
            expect(() => {
                spriteConfig.exportConfig('non-existent');
            }).toThrow();
        });
    });

    describe('Configuration Roundtrip', () => {
        test('import/export roundtrip preserves configuration', () => {
            // Load original config
            spriteConfig.loadConfig('A');

            // Export
            const exported = spriteConfig.exportConfig('pet-a');

            // Clear and reimport
            resetSpriteConfig();
            const reimported = new SpriteConfig();
            const success = reimported.importConfig(exported, 'pet-a-reimported');

            expect(success).toBe(true);

            // Verify cell count matches
            const originalCells = spriteConfig.configs.get('pet-a').cells;
            const reimportedCells = reimported.configs.get('pet-a-reimported').cells;

            expect(reimportedCells.length).toBe(originalCells.length);
        });

        test('imported configuration works for sprite mapping', () => {
            const jsonData = JSON.stringify(petAConfig);
            spriteConfig.importConfig(jsonData, 'test-pet');

            spriteConfig.loadConfig('test-pet');
            const mapping = spriteConfig.getMappingForPlayerState('idle_sit', 0);

            expect(mapping).toBeDefined();
            expect(mapping.assign).toBe('idle_sit');
        });
    });

    describe('Configuration Validation', () => {
        test('validates all required animation states are present', () => {
            const requiredStates = [
                'idle_sit',
                'run_1', 'run_2', 'run_3',
                'jump_up',
                'fall_down',
                'crouch',
                'dodge_roll',
                'idle_sit_front'
            ];

            const jsonData = JSON.stringify(petAConfig);
            spriteConfig.importConfig(jsonData, 'pet-a');
            spriteConfig.loadConfig('pet-a');

            requiredStates.forEach(state => {
                const mapping = spriteConfig.getMappingByState(state);
                expect(mapping).toBeDefined();
                expect(mapping.assign).toBe(state);
            });
        });

        test('rejects configuration missing required states', () => {
            const incompleteConfig = {
                id: 'incomplete',
                sheet: 'A',
                cells: [
                    { r: 1, c: 1, crop: [0, 0, 32, 32], assign: 'idle_sit', pivot: [0.5, 1], flipX: false }
                ],
                fireball: null
            };

            const jsonData = JSON.stringify(incompleteConfig);
            const success = spriteConfig.importConfig(jsonData, 'incomplete');

            expect(success).toBe(false);
        });

        test('validates pivot points are in 0-1 range', () => {
            const config = petAConfig;

            config.cells.forEach(cell => {
                expect(cell.pivot[0]).toBeGreaterThanOrEqual(0);
                expect(cell.pivot[0]).toBeLessThanOrEqual(1);
                expect(cell.pivot[1]).toBeGreaterThanOrEqual(0);
                expect(cell.pivot[1]).toBeLessThanOrEqual(1);
            });
        });

        test('validates crop coordinates are non-negative', () => {
            const config = petAConfig;

            config.cells.forEach(cell => {
                expect(cell.crop[0]).toBeGreaterThanOrEqual(0); // x
                expect(cell.crop[1]).toBeGreaterThanOrEqual(0); // y
                expect(cell.crop[2]).toBeGreaterThan(0); // width
                expect(cell.crop[3]).toBeGreaterThan(0); // height
            });
        });
    });

    describe('Configuration Metadata', () => {
        test('Pet A configuration has correct metadata', () => {
            expect(petAConfig.id).toBe('pet-a');
            expect(petAConfig.name).toBe('Bowie Cat');
            expect(petAConfig.spriteSheet).toBe('bowie_cat_3x3.png');
            expect(petAConfig.version).toBe('1.0.0');
        });

        test('Pet B configuration has correct metadata', () => {
            expect(petBConfig.id).toBe('pet-b');
            expect(petBConfig.name).toBe('Buttercup Cat');
            expect(petBConfig.spriteSheet).toBe('happy_buttercup_cat_3x3.png');
            expect(petBConfig.version).toBe('1.0.0');
        });

        test('configurations include animation metadata', () => {
            expect(petAConfig.animations).toBeDefined();
            expect(petAConfig.animations.run).toBeDefined();
            expect(petAConfig.animations.run.frames).toEqual(['run_1', 'run_2', 'run_3']);
            expect(petAConfig.animations.run.speed).toBe(100);
        });
    });

    describe('Singleton Pattern', () => {
        test('getSpriteConfig returns same instance', () => {
            const instance1 = getSpriteConfig();
            const instance2 = getSpriteConfig();

            expect(instance1).toBe(instance2);
        });

        test('resetSpriteConfig creates new instance', () => {
            const instance1 = getSpriteConfig();
            instance1.loadConfig('A');

            const instance2 = resetSpriteConfig();

            expect(instance1).not.toBe(instance2);
            expect(instance2.currentId).toBeNull();
        });
    });
});
