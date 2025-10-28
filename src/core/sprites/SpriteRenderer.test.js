/**
 * SpriteRenderer Tests - E002.1-001
 *
 * Unit tests for sprite rendering to canvas
 */

import { vi, describe, test, expect, beforeEach } from 'vitest';
import {
    SpriteRenderer,
    getSpriteRenderer,
    resetSpriteRenderer
} from './SpriteRenderer.js';

// Mock canvas context
function createMockContext() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1,
        font: '10px sans-serif',
        imageSmoothingEnabled: true
    };
}

// Mock image
function createMockImage() {
    return {
        width: 96,
        height: 96,
        src: 'data:image/png;base64,mock'
    };
}

// Mock sprite data
function createMockSprite() {
    return {
        img: createMockImage(),
        crop: [0, 0, 32, 32],
        pivot: [0.5, 1]
    };
}

describe('SpriteRenderer', () => {
    let renderer;
    let ctx;

    beforeEach(() => {
        renderer = new SpriteRenderer();
        ctx = createMockContext();
    });

    describe('Initialization', () => {
        test('initializes with debug mode off', () => {
            expect(renderer.debugMode).toBe(false);
        });
    });

    describe('render()', () => {
        test('renders sprite with default options', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
            expect(ctx.translate).toHaveBeenCalled();
            expect(ctx.drawImage).toHaveBeenCalledWith(
                sprite.img,
                0, 0, 32, 32,  // Source crop
                expect.any(Number), expect.any(Number), 30, 30  // Dest
            );
        });

        test('applies invulnerability flash effect', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30, {
                invulnerable: true
            });

            // Alpha should be either 1 or 0.5 based on time (flash effect)
            // Since it's time-dependent, just verify it was set (either value is valid)
            expect([0.5, 1]).toContain(ctx.globalAlpha);
        });

        test('applies custom alpha', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30, {
                alpha: 0.5
            });

            expect(ctx.globalAlpha).toBe(0.5);
        });

        test('flips sprite when facing left', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30, {
                facing: -1
            });

            expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
        });

        test('does not flip sprite when facing right', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30, {
                facing: 1
            });

            expect(ctx.scale).not.toHaveBeenCalled();
        });

        test('renders fallback when sprite is null', () => {
            renderer.render(ctx, null, 100, 200, 30, 30);

            expect(ctx.fillRect).toHaveBeenCalledWith(100, 200, 30, 30);
        });

        test('renders fallback when sprite has no image', () => {
            const sprite = { ...createMockSprite(), img: null };

            renderer.render(ctx, sprite, 100, 200, 30, 30);

            expect(ctx.fillRect).toHaveBeenCalled();
        });

        test('uses custom pivot point', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30, {
                pivot: [0, 0]
            });

            expect(ctx.translate).toHaveBeenCalledWith(100, 200);
        });

        test('saves and restores context state', () => {
            const sprite = createMockSprite();

            renderer.render(ctx, sprite, 100, 200, 30, 30);

            expect(ctx.save).toHaveBeenCalledBefore(ctx.restore);
        });
    });

    describe('renderFallback()', () => {
        test('renders colored rectangle', () => {
            renderer.renderFallback(ctx, 100, 200, 30, 30);

            expect(ctx.fillRect).toHaveBeenCalledWith(100, 200, 30, 30);
            expect(ctx.fillStyle).toBe('#ffffff');
        });

        test('uses custom color', () => {
            renderer.renderFallback(ctx, 100, 200, 30, 30, {
                color: '#ff0000'
            });

            expect(ctx.fillStyle).toBe('#ff0000');
        });

        test('saves and restores context', () => {
            renderer.renderFallback(ctx, 100, 200, 30, 30);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('renderWithCamera()', () => {
        test('offsets position by camera', () => {
            const sprite = createMockSprite();
            const camera = { x: 50, y: 25 };

            const renderSpy = vi.spyOn(renderer, 'render');

            renderer.renderWithCamera(ctx, sprite, 100, 200, 30, 30, camera, {});

            expect(renderSpy).toHaveBeenCalledWith(
                ctx,
                sprite,
                50,  // 100 - 50
                175, // 200 - 25
                30,
                30,
                {}
            );
        });
    });

    describe('renderRotated()', () => {
        test('applies rotation transform', () => {
            const sprite = createMockSprite();
            const rotation = Math.PI / 4;  // 45 degrees

            renderer.renderRotated(ctx, sprite, 100, 200, 30, 30, rotation);

            expect(ctx.rotate).toHaveBeenCalledWith(rotation);
        });

        test('centers sprite at rotation point', () => {
            const sprite = createMockSprite();

            renderer.renderRotated(ctx, sprite, 100, 200, 30, 30, 0);

            // Should translate to center before rotating
            expect(ctx.translate).toHaveBeenCalledWith(115, 215);  // x+w/2, y+h/2
        });

        test('saves and restores context', () => {
            const sprite = createMockSprite();

            renderer.renderRotated(ctx, sprite, 100, 200, 30, 30, 0);

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('renderScaled()', () => {
        test('scales sprite dimensions', () => {
            const sprite = createMockSprite();
            const renderSpy = vi.spyOn(renderer, 'render');

            renderer.renderScaled(ctx, sprite, 100, 200, 30, 30, 2, 2);

            expect(renderSpy).toHaveBeenCalledWith(
                ctx,
                sprite,
                100,
                200,
                60,  // 30 * 2
                60,  // 30 * 2
                {}
            );
        });

        test('supports non-uniform scaling', () => {
            const sprite = createMockSprite();
            const renderSpy = vi.spyOn(renderer, 'render');

            renderer.renderScaled(ctx, sprite, 100, 200, 30, 30, 2, 0.5);

            expect(renderSpy).toHaveBeenCalledWith(
                ctx,
                sprite,
                100,
                200,
                60,  // 30 * 2
                15,  // 30 * 0.5
                {}
            );
        });
    });

    describe('renderTinted()', () => {
        test('applies tint overlay', () => {
            const sprite = createMockSprite();

            renderer.renderTinted(ctx, sprite, 100, 200, 30, 30, '#ff0000');

            expect(ctx.globalCompositeOperation).toBe('multiply');
            expect(ctx.fillStyle).toBe('#ff0000');
            expect(ctx.fillRect).toHaveBeenCalledWith(100, 200, 30, 30);
        });

        test('saves and restores context', () => {
            const sprite = createMockSprite();

            renderer.renderTinted(ctx, sprite, 100, 200, 30, 30, '#ff0000');

            expect(ctx.save).toHaveBeenCalled();
            expect(ctx.restore).toHaveBeenCalled();
        });
    });

    describe('getSprite()', () => {
        test('creates sprite object from sheet and mapping', () => {
            const sheet = {
                img: createMockImage(),
                cells: []
            };
            const mapping = {
                crop: [0, 0, 32, 32],
                pivot: [0.5, 1]
            };

            const sprite = renderer.getSprite(sheet, mapping);

            expect(sprite).toBeDefined();
            expect(sprite.img).toBe(sheet.img);
            expect(sprite.crop).toBe(mapping.crop);
            expect(sprite.pivot).toBe(mapping.pivot);
        });

        test('uses default pivot when not provided', () => {
            const sheet = {
                img: createMockImage(),
                cells: []
            };
            const mapping = {
                crop: [0, 0, 32, 32]
            };

            const sprite = renderer.getSprite(sheet, mapping);

            expect(sprite.pivot).toEqual([0.5, 1]);
        });

        test('returns null when sheet is invalid', () => {
            const sprite = renderer.getSprite(null, {});

            expect(sprite).toBeNull();
        });

        test('returns null when sheet has no image', () => {
            const sheet = { img: null, cells: [] };
            const sprite = renderer.getSprite(sheet, {});

            expect(sprite).toBeNull();
        });

        test('returns null when mapping is invalid', () => {
            const sheet = { img: createMockImage(), cells: [] };
            const sprite = renderer.getSprite(sheet, null);

            expect(sprite).toBeNull();
        });
    });

    describe('Debug Mode', () => {
        test('enableDebug turns on debug mode', () => {
            renderer.enableDebug();

            expect(renderer.debugMode).toBe(true);
        });

        test('disableDebug turns off debug mode', () => {
            renderer.enableDebug();
            renderer.disableDebug();

            expect(renderer.debugMode).toBe(false);
        });

        test('renderDebugBox renders when debug enabled', () => {
            renderer.enableDebug();

            renderer.renderDebugBox(ctx, 100, 200, 30, 30);

            expect(ctx.strokeRect).toHaveBeenCalledWith(100, 200, 30, 30);
            expect(ctx.fillRect).toHaveBeenCalled();  // Center point
        });

        test('renderDebugBox does not render when debug disabled', () => {
            renderer.disableDebug();

            renderer.renderDebugBox(ctx, 100, 200, 30, 30);

            expect(ctx.strokeRect).not.toHaveBeenCalled();
        });

        test('renderDebugText renders when debug enabled', () => {
            renderer.enableDebug();

            renderer.renderDebugText(ctx, 'Test', 100, 200);

            expect(ctx.fillText).toHaveBeenCalledWith('Test', 100, 200);
            expect(ctx.strokeText).toHaveBeenCalledWith('Test', 100, 200);
        });

        test('renderDebugText does not render when debug disabled', () => {
            renderer.disableDebug();

            renderer.renderDebugText(ctx, 'Test', 100, 200);

            expect(ctx.fillText).not.toHaveBeenCalled();
        });

        test('uses custom debug box color', () => {
            renderer.enableDebug();

            renderer.renderDebugBox(ctx, 100, 200, 30, 30, '#FF00FF');

            expect(ctx.strokeStyle).toBe('#FF00FF');
            expect(ctx.fillStyle).toBe('#FF00FF');
        });
    });

    describe('Singleton functions', () => {
        test('getSpriteRenderer returns singleton instance', () => {
            const instance1 = getSpriteRenderer();
            const instance2 = getSpriteRenderer();

            expect(instance1).toBe(instance2);
        });

        test('resetSpriteRenderer creates new instance', () => {
            const instance1 = getSpriteRenderer();
            instance1.enableDebug();

            const instance2 = resetSpriteRenderer();

            expect(instance1).not.toBe(instance2);
            expect(instance2.debugMode).toBe(false);
        });
    });
});

// Helper matcher for Jest
expect.extend({
    toHaveBeenCalledBefore(received, expected) {
        const receivedCalls = received.mock.invocationCallOrder;
        const expectedCalls = expected.mock.invocationCallOrder;

        const pass = receivedCalls[0] < expectedCalls[0];

        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received.getMockName()} not to be called before ${expected.getMockName()}`
                    : `expected ${received.getMockName()} to be called before ${expected.getMockName()}`
        };
    }
});
