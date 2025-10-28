/**
 * Sprite Renderer Module - E002.1-001
 *
 * Extracted from monolithic index.html Player.draw() and Dog.draw()
 * Handles sprite rendering to canvas with proper transforms
 *
 * Features:
 * - Sprite cropping and drawing
 * - Transform pipeline (translate, scale, flip)
 * - Pivot point support
 * - Fallback rendering for missing sprites
 * - Invulnerability flash effects
 */

/**
 * SpriteRenderer class
 * Handles rendering sprites to canvas context
 */
export class SpriteRenderer {
    constructor() {
        this.debugMode = false;
    }

    /**
     * Render sprite with transform pipeline
     * Extracted from monolithic Player.draw() method
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} sprite - Sprite data {img, crop, pivot}
     * @param {number} x - Entity x position
     * @param {number} y - Entity y position
     * @param {number} width - Render width
     * @param {number} height - Render height
     * @param {Object} options - Rendering options
     * @param {number} [options.facing=1] - Facing direction (1=right, -1=left)
     * @param {boolean} [options.invulnerable=false] - Invulnerability flash effect
     * @param {number} [options.alpha=1] - Alpha transparency
     * @param {Array} [options.pivot=[0.5,1]] - Pivot point [x,y] (0-1 range)
     */
    render(ctx, sprite, x, y, width, height, options = {}) {
        const {
            facing = 1,
            invulnerable = false,
            alpha = 1,
            pivot = [0.5, 1]
        } = options;

        ctx.save();

        // Apply invulnerability flash effect
        if (invulnerable) {
            // Flash between full opacity and 50% based on time
            ctx.globalAlpha = Math.sin(Date.now() * 0.01) > 0 ? 1 : 0.5;
        } else if (alpha !== 1) {
            ctx.globalAlpha = alpha;
        }

        // Check if sprite is available
        if (sprite && sprite.img) {
            // Set up transform with pivot point
            // Pivot is at bottom-center of sprite by default [0.5, 1]
            ctx.translate(x + width * pivot[0], y + height * pivot[1]);

            // Flip horizontally if facing left
            if (facing === -1) {
                ctx.scale(-1, 1);
            }

            // Draw sprite with cropping
            const crop = sprite.crop;
            ctx.drawImage(
                sprite.img,
                crop[0], crop[1], crop[2], crop[3],  // Source rectangle
                -width * pivot[0], -height * pivot[1], width, height  // Destination rectangle
            );

            // Debug: Draw pivot point
            if (this.debugMode) {
                ctx.fillStyle = '#FF00FF';
                ctx.fillRect(-2, -2, 4, 4);
            }
        } else {
            // Fallback rendering - draw colored rectangle
            this.renderFallback(ctx, x, y, width, height, {
                color: invulnerable ? '#ff0000' : '#ffffff'
            });
        }

        ctx.restore();
    }

    /**
     * Render fallback rectangle when sprite is missing
     * Extracted from monolithic fallback rendering
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} options - Rendering options
     * @param {string} [options.color='#ffffff'] - Fill color
     */
    renderFallback(ctx, x, y, width, height, options = {}) {
        const { color = '#ffffff' } = options;

        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
    }

    /**
     * Render sprite with camera offset
     * Helper for rendering in game world with camera
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} sprite - Sprite data
     * @param {number} x - World x position
     * @param {number} y - World y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {Object} camera - Camera offset {x, y}
     * @param {Object} options - Rendering options
     */
    renderWithCamera(ctx, sprite, x, y, width, height, camera, options = {}) {
        const screenX = x - camera.x;
        const screenY = y - camera.y;

        this.render(ctx, sprite, screenX, screenY, width, height, options);
    }

    /**
     * Render sprite with rotation
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} sprite - Sprite data
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} rotation - Rotation in radians
     * @param {Object} options - Rendering options
     */
    renderRotated(ctx, sprite, x, y, width, height, rotation, options = {}) {
        ctx.save();

        // Translate to sprite center
        ctx.translate(x + width / 2, y + height / 2);

        // Apply rotation
        ctx.rotate(rotation);

        // Render sprite centered at origin
        this.render(ctx, sprite, -width / 2, -height / 2, width, height, {
            ...options,
            pivot: [0, 0]  // Override pivot since we're already centered
        });

        ctx.restore();
    }

    /**
     * Render sprite with scale
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} sprite - Sprite data
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} scaleX - Horizontal scale
     * @param {number} scaleY - Vertical scale
     * @param {Object} options - Rendering options
     */
    renderScaled(ctx, sprite, x, y, width, height, scaleX, scaleY, options = {}) {
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        this.render(ctx, sprite, x, y, scaledWidth, scaledHeight, options);
    }

    /**
     * Render sprite with tint color
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} sprite - Sprite data
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} tintColor - Tint color (CSS color)
     * @param {Object} options - Rendering options
     */
    renderTinted(ctx, sprite, x, y, width, height, tintColor, options = {}) {
        ctx.save();

        // Render sprite normally first
        this.render(ctx, sprite, x, y, width, height, options);

        // Apply tint overlay
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = tintColor;
        ctx.fillRect(x, y, width, height);

        ctx.restore();
    }

    /**
     * Get sprite from sheet and mapping
     * Extracted from monolithic Player.getSprite()
     *
     * @param {Object} sheet - Sprite sheet object {img, cells}
     * @param {Object} mapping - Sprite cell mapping {crop, pivot}
     * @returns {Object|null} Sprite data or null if invalid
     */
    getSprite(sheet, mapping) {
        if (!sheet || !sheet.img || !mapping) {
            return null;
        }

        return {
            img: sheet.img,
            crop: mapping.crop,
            pivot: mapping.pivot || [0.5, 1]
        };
    }

    /**
     * Enable debug rendering (shows pivot points, bounds, etc.)
     */
    enableDebug() {
        this.debugMode = true;
    }

    /**
     * Disable debug rendering
     */
    disableDebug() {
        this.debugMode = false;
    }

    /**
     * Render debug bounding box
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {string} [color='#00FF00'] - Box color
     */
    renderDebugBox(ctx, x, y, width, height, color = '#00FF00') {
        if (!this.debugMode) return;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Draw center point
        ctx.fillStyle = color;
        ctx.fillRect(x + width / 2 - 1, y + height / 2 - 1, 2, 2);

        ctx.restore();
    }

    /**
     * Render debug text
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Text to render
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    renderDebugText(ctx, text, x, y) {
        if (!this.debugMode) return;

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.font = '10px monospace';

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore();
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton sprite renderer instance
 *
 * @returns {SpriteRenderer} Sprite renderer instance
 */
export function getSpriteRenderer() {
    if (!instance) {
        instance = new SpriteRenderer();
    }
    return instance;
}

/**
 * Reset sprite renderer singleton (mainly for testing)
 */
export function resetSpriteRenderer() {
    instance = null;
    return getSpriteRenderer();
}

export default SpriteRenderer;
