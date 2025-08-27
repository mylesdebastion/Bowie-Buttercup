/**
 * Items System - Pet Bowls and Interactive Objects
 * Extracted from monolithic index.html
 * Handles food bowls, water bowls, and other interactive items
 */

import { getAssetLoader } from '../core/asset-loader.js';

export class ItemSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.assetLoader = getAssetLoader();
        this.items = [];
        
        // Asset references
        this.foodBowlImg = null;
        this.waterBowlImg = null;
    }

    async initialize() {
        console.log('🍽️ Initializing Item System...');
        
        // Load bowl assets
        try {
            this.foodBowlImg = await this.assetLoader.loadImage('./pet_food_bowl.png');
            this.waterBowlImg = await this.assetLoader.loadImage('./pet_water_bowl.png');
            console.log('✅ Bowl assets loaded successfully');
        } catch (error) {
            console.warn('⚠️ Could not load bowl assets, using fallback rendering');
        }
    }

    /**
     * Create items for Level 5 - extracted from monolithic level setup
     */
    createLevel5Items() {
        this.items = [
            {
                type: 'water_bowl',
                x: 350,
                y: 370,
                width: 40,
                height: 20,
                isEmpty: false,  // starts full
                interacted: false
            },
            {
                type: 'food_bowl', 
                x: 450,
                y: 370,
                width: 40,
                height: 20,
                isEmpty: false,  // starts full
                interacted: false
            }
        ];
        
        console.log('🏠 Created Level 5 items (food and water bowls)');
    }

    /**
     * Update item interactions - extracted from monolithic collision logic
     */
    update(deltaTime) {
        const player = this.gameState.playerState;
        
        for (const item of this.items) {
            if (this.checkPlayerNearItem(player, item)) {
                this.handleItemInteraction(item);
            }
        }
        
        // Check win condition for Level 5
        if (this.gameState.currentLevel === 5) {
            const waterBowl = this.items.find(item => item.type === 'water_bowl');
            const foodBowl = this.items.find(item => item.type === 'food_bowl');
            
            if (waterBowl?.interacted && foodBowl?.interacted && !this.gameState.isVictory) {
                console.log('🎉 Cat has eaten and drunk - Level 5 complete!');
                this.gameState.victory();
            }
        }
    }

    /**
     * Check if player is near item - extracted from proximity detection
     */
    checkPlayerNearItem(player, item) {
        return Math.abs(player.x - item.x) < 40 && 
               Math.abs(player.y - item.y) < 40;
    }

    /**
     * Handle item interaction - extracted from interaction logic
     */
    handleItemInteraction(item) {
        if (item.interacted) return;
        
        switch (item.type) {
            case 'water_bowl':
                if (!item.isEmpty) {
                    console.log('💧 Cat drinks water');
                    item.isEmpty = true;
                    item.interacted = true;
                    this.gameState.addScore(20);
                }
                break;
                
            case 'food_bowl':
                if (!item.isEmpty) {
                    console.log('🍽️ Cat eats food');
                    item.isEmpty = true;
                    item.interacted = true;
                    this.gameState.addScore(20);
                }
                break;
        }
    }

    /**
     * Render all items
     */
    render(ctx) {
        for (const item of this.items) {
            this.renderItem(ctx, item);
        }
    }

    /**
     * Render individual item - extracted and improved from drawFoodBowl/drawWaterBowl
     */
    renderItem(ctx, item) {
        switch (item.type) {
            case 'food_bowl':
                this.drawFoodBowl(ctx, item.x, item.y, !item.isEmpty);
                break;
            case 'water_bowl':
                this.drawWaterBowl(ctx, item.x, item.y, !item.isEmpty);
                break;
        }
    }

    /**
     * Draw food bowl - extracted from monolithic drawFoodBowl method
     */
    drawFoodBowl(ctx, x, y, isFull) {
        if (this.foodBowlImg && this.foodBowlImg.complete) {
            // The image is 1024x1024 with two bowls side by side
            // Full bowl on left half (0-512), empty bowl on right half (512-1024)
            const sourceX = isFull ? 0 : 512; // Full bowl on left, empty on right
            const sourceY = 0;
            const sourceWidth = 512;  // Half the image width
            const sourceHeight = 1024; // Full image height
            
            // Draw the appropriate bowl state, scaled down to fit game
            ctx.drawImage(
                this.foodBowlImg,
                sourceX, sourceY, sourceWidth, sourceHeight, // source rectangle
                x - 6, y + 15, 12, 24      // destination rectangle (not stretched, proper aspect ratio)
            );
        } else {
            // Fallback to simple rectangle if image didn't load
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(x, y, 40, 20);
            if (isFull) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 8, y - 5, 24, 15);
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(x + 10, y - 3, 20, 11);
            }
        }
    }

    /**
     * Draw water bowl - extracted from monolithic drawWaterBowl method
     */
    drawWaterBowl(ctx, x, y, isFull) {
        if (this.waterBowlImg && this.waterBowlImg.complete) {
            // The image is 1024x1024 with two bowls side by side
            // Full bowl on left half (0-512), empty bowl on right half (512-1024)
            const sourceX = isFull ? 0 : 512; // Full bowl on left, empty on right
            const sourceY = 0;
            const sourceWidth = 512;  // Half the image width
            const sourceHeight = 1024; // Full image height
            
            // Draw the appropriate bowl state, same sizing as food bowl
            ctx.drawImage(
                this.waterBowlImg,
                sourceX, sourceY, sourceWidth, sourceHeight, // source rectangle
                x - 6, y + 15, 12, 24      // destination rectangle (same as food bowl)
            );
        } else {
            // Fallback to simple rectangle if image didn't load
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(x, y, 40, 20);
            if (isFull) {
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 4, y + 2, 32, 14);
            }
        }
    }

    /**
     * Get item by type
     */
    getItem(type) {
        return this.items.find(item => item.type === type);
    }

    /**
     * Get all items of a specific type
     */
    getItemsByType(type) {
        return this.items.filter(item => item.type === type);
    }

    /**
     * Reset all items to initial state
     */
    reset() {
        for (const item of this.items) {
            item.isEmpty = false;
            item.interacted = false;
        }
    }

    /**
     * Clear all items
     */
    clear() {
        this.items = [];
    }

    /**
     * Get interaction status for debugging
     */
    getStatus() {
        return {
            itemCount: this.items.length,
            interactions: this.items.map(item => ({
                type: item.type,
                interacted: item.interacted,
                isEmpty: item.isEmpty
            }))
        };
    }
}

export default ItemSystem;