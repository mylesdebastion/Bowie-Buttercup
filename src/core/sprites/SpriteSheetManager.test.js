/**
 * SpriteSheetManager Tests - E002.1-001
 *
 * Unit tests for sprite sheet loading and management
 */

import { vi, describe, test, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
    SpriteSheetManager,
    getSpriteSheetManager,
    resetSpriteSheetManager
} from './SpriteSheetManager.js';

// Mock HTMLImageElement for testing
class MockImage {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
        this.width = 96;
        this.height = 96;
        this.crossOrigin = null;
    }

    // Simulate successful load
    triggerLoad() {
        if (this.onload) {
            this.onload();
        }
    }

    // Simulate load error
    triggerError(error = new Error('Load failed')) {
        if (this.onerror) {
            this.onerror(error);
        }
    }
}

// Mock FileReader for testing
class MockFileReader {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this.result = null;
    }

    readAsDataURL(file) {
        // Simulate async file reading
        setTimeout(() => {
            if (this.onload) {
                this.result = 'data:image/png;base64,mock-data';
                this.onload({ target: this });
            }
        }, 0);
    }

    triggerError(error = new Error('Read failed')) {
        if (this.onerror) {
            this.onerror(error);
        }
    }
}

describe('SpriteSheetManager', () => {
    let manager;
    let originalImage;
    let originalFileReader;
    let mockImage;

    beforeAll(() => {
        // Save originals
        originalImage = global.Image;
        originalFileReader = global.FileReader;

        // Mock Image constructor
        global.Image = vi.fn(() => {
            mockImage = new MockImage();
            return mockImage;
        });

        // Mock FileReader constructor
        global.FileReader = vi.fn(() => new MockFileReader());
    });

    afterAll(() => {
        // Restore originals
        global.Image = originalImage;
        global.FileReader = originalFileReader;
    });

    beforeEach(() => {
        manager = new SpriteSheetManager();
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        test('initializes with empty sprite sheets', () => {
            expect(manager.sheets).toBeDefined();
            expect(manager.sheets.A).toBeDefined();
            expect(manager.sheets.B).toBeDefined();
            expect(manager.sheets.dog).toBeDefined();
            expect(manager.sheets.A.img).toBeNull();
        });

        test('initializes loading promises map', () => {
            expect(manager.loadingPromises).toBeInstanceOf(Map);
            expect(manager.loadingPromises.size).toBe(0);
        });
    });

    describe('loadSheet()', () => {
        test('loads sprite sheet from file', async () => {
            const mockFile = new File([''], 'test.png', { type: 'image/png' });

            const loadPromise = manager.loadSheet('A', mockFile);

            // Trigger image load after FileReader completes
            setTimeout(() => mockImage.triggerLoad(), 10);

            const img = await loadPromise;

            expect(img).toBeDefined();
            expect(manager.sheets.A.img).toBe(img);
        });

        test('throws error when no file provided', () => {
            expect(() => manager.loadSheet('A', null)).toThrow('No file provided');
        });

        test('reuses loading promise for same file', async () => {
            const mockFile = new File([''], 'test.png', { type: 'image/png' });

            const promise1 = manager.loadSheet('A', mockFile);
            const promise2 = manager.loadSheet('A', mockFile);

            expect(promise1).toBe(promise2);
        });

        test('validates sheet dimensions on load', async () => {
            const mockFile = new File([''], 'test.png', { type: 'image/png' });
            const validateSpy = vi.spyOn(manager, 'validateSheetDimensions');

            const loadPromise = manager.loadSheet('A', mockFile);
            setTimeout(() => mockImage.triggerLoad(), 10);

            await loadPromise;

            expect(validateSpy).toHaveBeenCalled();
        });

        test('handles image load error', async () => {
            const mockFile = new File([''], 'test.png', { type: 'image/png' });

            const loadPromise = manager.loadSheet('A', mockFile);
            setTimeout(() => mockImage.triggerError(), 10);

            await expect(loadPromise).rejects.toThrow('Failed to load sprite sheet');
        });
    });

    describe('loadSheetFromURL()', () => {
        test('loads sprite sheet from URL', async () => {
            const url = '/bowie_cat_3x3.png';

            const loadPromise = manager.loadSheetFromURL('A', url);
            setTimeout(() => mockImage.triggerLoad(), 10);

            const img = await loadPromise;

            expect(img).toBeDefined();
            expect(manager.sheets.A.img).toBe(img);
            expect(mockImage.crossOrigin).toBe('anonymous');
        });

        test('reuses loading promise for same URL', async () => {
            const url = '/test.png';

            const promise1 = manager.loadSheetFromURL('A', url);
            const promise2 = manager.loadSheetFromURL('A', url);

            expect(promise1).toBe(promise2);
        });

        test('handles URL load error', async () => {
            const url = '/nonexistent.png';

            const loadPromise = manager.loadSheetFromURL('A', url);
            setTimeout(() => mockImage.triggerError(), 10);

            await expect(loadPromise).rejects.toThrow('Failed to load sprite sheet from URL');
        });
    });

    describe('generatePreview()', () => {
        test('generates preview canvas for loaded sheet', () => {
            // Mock loaded sheet
            manager.sheets.A.img = new MockImage();

            // Mock document.createElement
            const mockCanvas = {
                width: 0,
                height: 0,
                getContext: vi.fn(() => ({
                    imageSmoothingEnabled: true,
                    drawImage: vi.fn()
                }))
            };
            global.document = {
                createElement: vi.fn(() => mockCanvas)
            };

            const preview = manager.generatePreview('A', 96);

            expect(preview).toBeDefined();
            expect(mockCanvas.width).toBe(96);
            expect(mockCanvas.height).toBe(96);
        });

        test('returns null for unloaded sheet', () => {
            const preview = manager.generatePreview('A');

            expect(preview).toBeNull();
        });

        test('uses default size of 96', () => {
            manager.sheets.A.img = new MockImage();

            const mockCanvas = {
                width: 0,
                height: 0,
                getContext: vi.fn(() => ({
                    imageSmoothingEnabled: true,
                    drawImage: vi.fn()
                }))
            };
            global.document = {
                createElement: vi.fn(() => mockCanvas)
            };

            manager.generatePreview('A');

            expect(mockCanvas.width).toBe(96);
            expect(mockCanvas.height).toBe(96);
        });
    });

    describe('validateSheetDimensions()', () => {
        test('validates correct dimensions (96x96)', () => {
            const img = new MockImage();
            img.width = 96;
            img.height = 96;

            const result = manager.validateSheetDimensions(img, 'A');

            expect(result).toBe(true);
        });

        test('rejects incorrect width', () => {
            const img = new MockImage();
            img.width = 64;
            img.height = 96;

            const result = manager.validateSheetDimensions(img, 'A');

            expect(result).toBe(false);
        });

        test('rejects incorrect height', () => {
            const img = new MockImage();
            img.width = 96;
            img.height = 64;

            const result = manager.validateSheetDimensions(img, 'A');

            expect(result).toBe(false);
        });
    });

    describe('getSheet()', () => {
        test('returns sheet object for valid ID', () => {
            const sheet = manager.getSheet('A');

            expect(sheet).toBeDefined();
            expect(sheet.img).toBeNull();
            expect(sheet.cells).toBeDefined();
        });

        test('returns null for invalid sheet ID', () => {
            const sheet = manager.getSheet('invalid');

            expect(sheet).toBeNull();
        });
    });

    describe('getSheetImage()', () => {
        test('returns image for loaded sheet', () => {
            const mockImg = new MockImage();
            manager.sheets.A.img = mockImg;

            const img = manager.getSheetImage('A');

            expect(img).toBe(mockImg);
        });

        test('returns null for unloaded sheet', () => {
            const img = manager.getSheetImage('A');

            expect(img).toBeNull();
        });

        test('returns null for invalid sheet ID', () => {
            const img = manager.getSheetImage('invalid');

            expect(img).toBeNull();
        });
    });

    describe('isSheetLoaded()', () => {
        test('returns true for loaded sheet', () => {
            manager.sheets.A.img = new MockImage();

            expect(manager.isSheetLoaded('A')).toBe(true);
        });

        test('returns false for unloaded sheet', () => {
            expect(manager.isSheetLoaded('A')).toBe(false);
        });

        test('returns false for invalid sheet ID', () => {
            expect(manager.isSheetLoaded('invalid')).toBe(false);
        });
    });

    describe('unloadSheet()', () => {
        test('unloads loaded sheet', () => {
            manager.sheets.A.img = new MockImage();

            manager.unloadSheet('A');

            expect(manager.sheets.A.img).toBeNull();
        });

        test('handles unloading already unloaded sheet', () => {
            manager.unloadSheet('A');

            expect(manager.sheets.A.img).toBeNull();
        });
    });

    describe('getLoadedSheets()', () => {
        test('returns IDs of loaded sheets', () => {
            manager.sheets.A.img = new MockImage();
            manager.sheets.B.img = new MockImage();

            const loaded = manager.getLoadedSheets();

            expect(loaded).toContain('A');
            expect(loaded).toContain('B');
            expect(loaded).not.toContain('dog');
        });

        test('returns empty array when no sheets loaded', () => {
            const loaded = manager.getLoadedSheets();

            expect(loaded).toEqual([]);
        });
    });

    describe('clear()', () => {
        test('unloads all sheets', () => {
            manager.sheets.A.img = new MockImage();
            manager.sheets.B.img = new MockImage();
            manager.sheets.dog.img = new MockImage();

            manager.clear();

            expect(manager.sheets.A.img).toBeNull();
            expect(manager.sheets.B.img).toBeNull();
            expect(manager.sheets.dog.img).toBeNull();
        });

        test('clears loading promises', () => {
            manager.loadingPromises.set('test', Promise.resolve());

            manager.clear();

            expect(manager.loadingPromises.size).toBe(0);
        });
    });

    describe('getStats()', () => {
        test('returns loading statistics', () => {
            manager.sheets.A.img = new MockImage();

            const stats = manager.getStats();

            expect(stats.totalSheets).toBe(3);
            expect(stats.loadedSheets).toBe(1);
            expect(stats.loadingProgress).toBeCloseTo(1/3);
            expect(stats.sheets.A.loaded).toBe(true);
            expect(stats.sheets.B.loaded).toBe(false);
        });

        test('includes sheet dimensions in stats', () => {
            const mockImg = new MockImage();
            mockImg.width = 96;
            mockImg.height = 96;
            manager.sheets.A.img = mockImg;

            const stats = manager.getStats();

            expect(stats.sheets.A.width).toBe(96);
            expect(stats.sheets.A.height).toBe(96);
        });
    });

    describe('Singleton functions', () => {
        test('getSpriteSheetManager returns singleton instance', () => {
            const instance1 = getSpriteSheetManager();
            const instance2 = getSpriteSheetManager();

            expect(instance1).toBe(instance2);
        });

        test('resetSpriteSheetManager creates new instance', () => {
            const instance1 = getSpriteSheetManager();
            instance1.sheets.A.img = new MockImage();

            const instance2 = resetSpriteSheetManager();

            expect(instance1).not.toBe(instance2);
            expect(instance2.sheets.A.img).toBeNull();
        });
    });
});
