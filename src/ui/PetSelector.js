/**
 * Pet Selector UI Component - E002.1-002
 *
 * Provides UI for players to choose between different cat sprites
 * - Radio button selection between Pet A (Bowie Cat) and Pet B (Buttercup Cat)
 * - Live preview animation of selected pet
 * - localStorage persistence across sessions
 * - Immediate runtime pet switching
 */

import { getSpriteSystem } from '../core/sprites/index.js';

export class PetSelector {
    constructor(containerElement, game) {
        this.container = containerElement;
        this.game = game;
        this.spriteSystem = getSpriteSystem();

        // Current selection
        this.currentPet = this.loadSelection();

        // Preview animation
        this.previewCanvas = null;
        this.previewContext = null;
        this.animationTimer = 0;
        this.animationFrame = 0;
        this.lastFrameTime = 0;
        this.animating = false;

        // Pet metadata
        this.pets = {
            'A': {
                id: 'A',
                name: 'Bowie Cat',
                description: 'Gray tabby - calm and collected',
                sheet: 'A'
            },
            'B': {
                id: 'B',
                name: 'Buttercup Cat',
                description: 'Cream cat - cheerful and energetic',
                sheet: 'B'
            }
        };
    }

    /**
     * Load pet selection from localStorage
     */
    loadSelection() {
        try {
            const saved = localStorage.getItem('selectedPet');
            if (saved && (saved === 'A' || saved === 'B')) {
                return saved;
            }
        } catch (error) {
            console.warn('Failed to load pet selection from localStorage:', error);
        }
        return 'A'; // Default to Pet A (Bowie Cat)
    }

    /**
     * Save pet selection to localStorage
     */
    saveSelection(petId) {
        try {
            localStorage.setItem('selectedPet', petId);
            console.log(`💾 Saved pet selection: ${this.pets[petId].name}`);
        } catch (error) {
            console.warn('Failed to save pet selection to localStorage:', error);
        }
    }

    /**
     * Render the pet selector UI
     */
    render() {
        // Clear container
        this.container.innerHTML = '';

        // Create section wrapper
        const section = document.createElement('div');
        section.className = 'pet-selector-section';
        section.innerHTML = `
            <h3>Choose Your Cat</h3>
            <div class="pet-selector-options">
                ${Object.values(this.pets).map(pet => `
                    <label class="pet-option">
                        <input
                            type="radio"
                            name="petSelection"
                            value="${pet.id}"
                            ${this.currentPet === pet.id ? 'checked' : ''}
                        />
                        <span class="pet-name">${pet.name}</span>
                        <span class="pet-description">${pet.description}</span>
                    </label>
                `).join('')}
            </div>
            <div class="pet-preview-container">
                <label>Preview:</label>
                <canvas id="petPreviewCanvas" width="64" height="64"></canvas>
            </div>
        `;

        this.container.appendChild(section);

        // Set up preview canvas
        this.previewCanvas = document.getElementById('petPreviewCanvas');
        this.previewContext = this.previewCanvas.getContext('2d');

        // Add event listeners
        const radioButtons = section.querySelectorAll('input[name="petSelection"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePetChange(e.target.value));
        });

        // Start preview animation
        this.startPreviewAnimation();

        console.log(`🐱 Pet Selector initialized: ${this.pets[this.currentPet].name}`);
    }

    /**
     * Handle pet selection change
     */
    handlePetChange(newPetId) {
        if (this.currentPet === newPetId) return;

        console.log(`🔄 Switching pet from ${this.pets[this.currentPet].name} to ${this.pets[newPetId].name}`);

        this.currentPet = newPetId;
        this.saveSelection(newPetId);

        // Reset preview animation
        this.animationFrame = 0;
        this.animationTimer = 0;

        // Notify game of pet change
        if (this.game && this.game.changePet) {
            this.game.changePet(newPetId);
        }

        console.log(`✅ Pet changed successfully to ${this.pets[newPetId].name}`);
    }

    /**
     * Start preview animation loop
     */
    startPreviewAnimation() {
        if (this.animating) return;

        this.animating = true;
        this.lastFrameTime = performance.now();

        const animate = (timestamp) => {
            if (!this.animating) return;

            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;

            this.updatePreview(deltaTime);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Stop preview animation
     */
    stopPreviewAnimation() {
        this.animating = false;
    }

    /**
     * Update preview canvas with animated sprite
     */
    updatePreview(deltaTime) {
        if (!this.previewCanvas || !this.previewContext) return;

        // Clear canvas
        this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        // Update animation timing (150ms per frame for idle animation)
        this.animationTimer += deltaTime;
        const FRAME_DURATION = 150;

        if (this.animationTimer >= FRAME_DURATION) {
            this.animationTimer -= FRAME_DURATION;
            // Use animationController.getFrameCount - E003.1-003
            const frameCount = this.spriteSystem.animationController?.getFrameCount('idle_sit') || 1;
            this.animationFrame = (this.animationFrame + 1) % frameCount;
        }

        // Get sprite for current pet's idle_sit animation
        this.spriteSystem.config.loadConfig(this.currentPet);
        const sprite = this.spriteSystem.getSpriteForState('idle_sit', this.animationFrame);

        // Render sprite centered in preview canvas
        const canvasSize = 64;
        const spriteSize = 48; // Larger sprite for visibility
        const x = (canvasSize - spriteSize) / 2;
        const y = (canvasSize - spriteSize) / 2;

        if (sprite && sprite.img) {
            this.spriteSystem.renderer.render(
                this.previewContext,
                sprite,
                x,
                y,
                spriteSize,
                spriteSize,
                { facing: 1, invulnerable: false }
            );
        } else {
            // Fallback: Draw colored rectangle
            const colors = { A: '#808080', B: '#FFF8DC' }; // Gray for Bowie, Cream for Buttercup
            this.previewContext.fillStyle = colors[this.currentPet] || '#FF6B35';
            this.previewContext.fillRect(x, y, spriteSize, spriteSize);
        }
    }

    /**
     * Get currently selected pet ID
     */
    getSelectedPet() {
        return this.currentPet;
    }

    /**
     * Set selected pet programmatically
     */
    setSelectedPet(petId) {
        if (this.pets[petId]) {
            this.currentPet = petId;
            this.saveSelection(petId);

            // Update UI if rendered
            const radio = this.container.querySelector(`input[value="${petId}"]`);
            if (radio) {
                radio.checked = true;
            }

            // Notify game
            if (this.game && this.game.changePet) {
                this.game.changePet(petId);
            }
        }
    }

    /**
     * Hide the pet selector panel - E003.1-002
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.stopPreviewAnimation();
            console.log('🙈 Pet selector hidden');
        }
    }

    /**
     * Show the pet selector panel - E003.1-002
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.startPreviewAnimation();
            console.log('👁️  Pet selector shown');
        }
    }

    /**
     * Check if panel is visible - E003.1-002
     */
    isVisible() {
        return this.container && this.container.style.display !== 'none';
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopPreviewAnimation();
        this.previewCanvas = null;
        this.previewContext = null;
        this.container.innerHTML = '';
    }
}

export default PetSelector;
