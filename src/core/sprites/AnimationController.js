/**
 * Animation Controller Module - E002.1-001
 *
 * Extracted from monolithic index.html Player animation logic
 * Manages animation states, frame timing, and state transitions
 *
 * Features:
 * - Frame timing and cycling
 * - Animation state management
 * - Variable speed animations (run vs idle)
 * - Frame count tracking
 */

/**
 * Animation speed constants (milliseconds per frame)
 */
export const ANIMATION_SPEEDS = {
    RUN: 100,      // Fast animation for running
    IDLE: 150,     // Slower animation for idle
    DEFAULT: 150   // Default animation speed
};

/**
 * Frame counts for different animation states
 */
export const FRAME_COUNTS = {
    run: 3,         // 3-frame run cycle
    dodge_roll: 1,  // Single frame dodge
    idle_sit: 1,    // Single frame idle
    idle_sit_front: 1,
    jump_up: 1,
    fall_down: 1,
    crouch: 1
};

/**
 * AnimationController class
 * Manages animation timing and state for sprite-based entities
 */
export class AnimationController {
    constructor() {
        this.animFrame = 0;
        this.animTimer = 0;
        this.currentState = 'idle_sit';
        this.previousState = null;
    }

    /**
     * Update animation frame timing
     * Extracted from monolithic Player.updateAnimation()
     *
     * @param {number} deltaTime - Time elapsed since last update (ms)
     * @param {string} state - Current animation state
     */
    update(deltaTime, state = null) {
        // Update state if provided
        if (state && state !== this.currentState) {
            this.setState(state);
        }

        // Increment timer
        this.animTimer += deltaTime;

        // Get animation speed for current state
        const animSpeed = this.getAnimationSpeed(this.currentState);

        // Check if frame should advance
        if (this.animTimer >= animSpeed) {
            this.animTimer = 0;
            this.animFrame++;

            // Get frame count for current state
            const frameCount = this.getFrameCount(this.currentState);

            // Loop animation
            if (this.animFrame >= frameCount) {
                this.animFrame = 0;
            }
        }
    }

    /**
     * Set animation state
     *
     * @param {string} state - New animation state
     * @param {boolean} [resetFrame=true] - Reset frame to 0 on state change
     */
    setState(state, resetFrame = true) {
        if (state !== this.currentState) {
            this.previousState = this.currentState;
            this.currentState = state;

            if (resetFrame) {
                this.animFrame = 0;
                this.animTimer = 0;
            }
        }
    }

    /**
     * Get animation speed for a state
     * Extracted from monolithic animation speed logic
     *
     * @param {string} state - Animation state
     * @returns {number} Animation speed in milliseconds
     */
    getAnimationSpeed(state) {
        if (state === 'run') {
            return ANIMATION_SPEEDS.RUN;
        }
        return ANIMATION_SPEEDS.IDLE;
    }

    /**
     * Get frame count for animation state
     * Extracted from monolithic Player.getFrameCount()
     *
     * @param {string} state - Animation state
     * @returns {number} Number of frames in animation
     */
    getFrameCount(state) {
        return FRAME_COUNTS[state] || 1;
    }

    /**
     * Get current animation frame
     *
     * @returns {number} Current frame index
     */
    getCurrentFrame() {
        return this.animFrame;
    }

    /**
     * Get current animation state
     *
     * @returns {string} Current state
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Get previous animation state
     *
     * @returns {string|null} Previous state or null
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Get animation timer value
     *
     * @returns {number} Current timer in milliseconds
     */
    getTimer() {
        return this.animTimer;
    }

    /**
     * Reset animation to initial state
     */
    reset() {
        this.animFrame = 0;
        this.animTimer = 0;
        this.currentState = 'idle_sit';
        this.previousState = null;
    }

    /**
     * Set specific frame (useful for testing or forced synchronization)
     *
     * @param {number} frame - Frame index to set
     */
    setFrame(frame) {
        const frameCount = this.getFrameCount(this.currentState);
        this.animFrame = Math.max(0, Math.min(frame, frameCount - 1));
    }

    /**
     * Check if animation has completed one full cycle since last check
     *
     * @returns {boolean} True if animation just looped
     */
    hasLooped() {
        // Animation looped if frame is 0 and timer just reset
        return this.animFrame === 0 && this.animTimer < 50;
    }

    /**
     * Get animation progress (0-1)
     *
     * @returns {number} Progress through current animation
     */
    getProgress() {
        const frameCount = this.getFrameCount(this.currentState);
        const animSpeed = this.getAnimationSpeed(this.currentState);

        const frameProgress = this.animFrame / frameCount;
        const timerProgress = (this.animTimer / animSpeed) / frameCount;

        return frameProgress + timerProgress;
    }

    /**
     * Serialize animation state
     *
     * @returns {Object} Serialized state
     */
    serialize() {
        return {
            animFrame: this.animFrame,
            animTimer: this.animTimer,
            currentState: this.currentState,
            previousState: this.previousState
        };
    }

    /**
     * Deserialize animation state
     *
     * @param {Object} data - Serialized state data
     */
    deserialize(data) {
        this.animFrame = data.animFrame || 0;
        this.animTimer = data.animTimer || 0;
        this.currentState = data.currentState || 'idle_sit';
        this.previousState = data.previousState || null;
    }

    /**
     * Clone this animation controller
     *
     * @returns {AnimationController} New instance with same state
     */
    clone() {
        const cloned = new AnimationController();
        cloned.deserialize(this.serialize());
        return cloned;
    }
}

/**
 * Create animation controller with initial state
 *
 * @param {string} [initialState='idle_sit'] - Initial animation state
 * @returns {AnimationController} New animation controller
 */
export function createAnimationController(initialState = 'idle_sit') {
    const controller = new AnimationController();
    controller.setState(initialState);
    return controller;
}

export default AnimationController;
