/**
 * AnimationController Tests - E002.1-001
 *
 * Unit tests for animation state and timing management
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
    AnimationController,
    createAnimationController,
    ANIMATION_SPEEDS,
    FRAME_COUNTS
} from './AnimationController.js';

describe('AnimationController', () => {
    let controller;

    beforeEach(() => {
        controller = new AnimationController();
    });

    describe('Initialization', () => {
        test('initializes with default values', () => {
            expect(controller.animFrame).toBe(0);
            expect(controller.animTimer).toBe(0);
            expect(controller.currentState).toBe('idle_sit');
            expect(controller.previousState).toBeNull();
        });
    });

    describe('update()', () => {
        test('increments animation timer', () => {
            controller.update(50);

            expect(controller.animTimer).toBe(50);
        });

        test('advances frame when timer exceeds speed threshold', () => {
            controller.setState('run');  // Run speed is 100ms
            controller.update(100);

            expect(controller.animFrame).toBe(1);
            expect(controller.animTimer).toBe(0);
        });

        test('loops animation when reaching frame count', () => {
            controller.setState('run');  // 3 frames
            controller.animFrame = 2;
            controller.update(100);

            expect(controller.animFrame).toBe(0);
        });

        test('uses correct animation speed for run state', () => {
            controller.setState('run');
            controller.update(99);  // Just below threshold

            expect(controller.animFrame).toBe(0);

            controller.update(1);  // Cross threshold

            expect(controller.animFrame).toBe(1);
        });

        test('uses correct animation speed for idle state', () => {
            // Note: controller already starts in 'idle_sit' state (single frame)
            // Single-frame animations don't advance frame, but timer still accumulates
            controller.update(149);  // Just below 150ms threshold

            expect(controller.animTimer).toBe(149);

            controller.update(1);  // Cross threshold, timer resets

            // For single-frame animations, frame stays at 0 but timer resets
            expect(controller.animFrame).toBe(0);
            expect(controller.animTimer).toBe(0);
        });

        test('updates state when provided', () => {
            controller.update(50, 'run');

            expect(controller.currentState).toBe('run');
        });

        test('accumulates timer correctly', () => {
            // Use run state which has 3 frames for proper accumulation testing
            controller.setState('run');  // 3 frames, 100ms speed
            controller.update(50);
            controller.update(40);

            expect(controller.animTimer).toBe(90);

            controller.update(10);  // Cross 100ms threshold

            expect(controller.animTimer).toBe(0);
            expect(controller.animFrame).toBe(1);
        });
    });

    describe('setState()', () => {
        test('changes animation state', () => {
            controller.setState('run');

            expect(controller.currentState).toBe('run');
        });

        test('resets frame and timer by default', () => {
            controller.animFrame = 2;
            controller.animTimer = 100;
            controller.setState('jump_up');

            expect(controller.animFrame).toBe(0);
            expect(controller.animTimer).toBe(0);
        });

        test('preserves frame and timer when resetFrame is false', () => {
            controller.animFrame = 2;
            controller.animTimer = 50;
            controller.setState('fall_down', false);

            expect(controller.animFrame).toBe(2);
            expect(controller.animTimer).toBe(50);
        });

        test('tracks previous state', () => {
            controller.setState('run');
            controller.setState('jump_up');

            expect(controller.previousState).toBe('run');
        });

        test('does not update if state is same', () => {
            controller.setState('run');
            controller.animFrame = 2;
            controller.setState('run');

            // Frame should remain because state didn't change
            expect(controller.animFrame).toBe(2);
        });
    });

    describe('getAnimationSpeed()', () => {
        test('returns RUN speed for run state', () => {
            const speed = controller.getAnimationSpeed('run');

            expect(speed).toBe(ANIMATION_SPEEDS.RUN);
            expect(speed).toBe(100);
        });

        test('returns IDLE speed for idle states', () => {
            const speed = controller.getAnimationSpeed('idle_sit');

            expect(speed).toBe(ANIMATION_SPEEDS.IDLE);
            expect(speed).toBe(150);
        });

        test('returns IDLE speed for other states', () => {
            const speed = controller.getAnimationSpeed('jump_up');

            expect(speed).toBe(ANIMATION_SPEEDS.IDLE);
        });
    });

    describe('getFrameCount()', () => {
        test('returns 3 frames for run state', () => {
            const count = controller.getFrameCount('run');

            expect(count).toBe(3);
        });

        test('returns 1 frame for single-frame animations', () => {
            expect(controller.getFrameCount('idle_sit')).toBe(1);
            expect(controller.getFrameCount('jump_up')).toBe(1);
            expect(controller.getFrameCount('fall_down')).toBe(1);
            expect(controller.getFrameCount('dodge_roll')).toBe(1);
        });

        test('returns 1 for unknown states', () => {
            const count = controller.getFrameCount('unknown_state');

            expect(count).toBe(1);
        });
    });

    describe('getCurrentFrame()', () => {
        test('returns current animation frame', () => {
            controller.animFrame = 2;

            expect(controller.getCurrentFrame()).toBe(2);
        });
    });

    describe('getCurrentState()', () => {
        test('returns current animation state', () => {
            controller.setState('run');

            expect(controller.getCurrentState()).toBe('run');
        });
    });

    describe('getPreviousState()', () => {
        test('returns previous animation state', () => {
            controller.setState('run');
            controller.setState('jump_up');

            expect(controller.getPreviousState()).toBe('run');
        });

        test('returns null when no previous state', () => {
            expect(controller.getPreviousState()).toBeNull();
        });
    });

    describe('getTimer()', () => {
        test('returns current animation timer', () => {
            controller.animTimer = 75;

            expect(controller.getTimer()).toBe(75);
        });
    });

    describe('reset()', () => {
        test('resets all animation properties', () => {
            controller.animFrame = 2;
            controller.animTimer = 100;
            controller.setState('run');

            controller.reset();

            expect(controller.animFrame).toBe(0);
            expect(controller.animTimer).toBe(0);
            expect(controller.currentState).toBe('idle_sit');
            expect(controller.previousState).toBeNull();
        });
    });

    describe('setFrame()', () => {
        test('sets specific animation frame', () => {
            controller.setState('run');
            controller.setFrame(2);

            expect(controller.getCurrentFrame()).toBe(2);
        });

        test('clamps frame to valid range', () => {
            controller.setState('run');  // 3 frames (0-2)
            controller.setFrame(5);  // Out of range

            expect(controller.getCurrentFrame()).toBe(2);
        });

        test('clamps negative frames to 0', () => {
            controller.setFrame(-1);

            expect(controller.getCurrentFrame()).toBe(0);
        });
    });

    describe('hasLooped()', () => {
        test('returns true when animation just looped', () => {
            controller.animFrame = 0;
            controller.animTimer = 10;  // Just reset

            expect(controller.hasLooped()).toBe(true);
        });

        test('returns false when not at start of loop', () => {
            controller.animFrame = 1;
            controller.animTimer = 10;

            expect(controller.hasLooped()).toBe(false);
        });

        test('returns false when timer is high', () => {
            controller.animFrame = 0;
            controller.animTimer = 100;

            expect(controller.hasLooped()).toBe(false);
        });
    });

    describe('getProgress()', () => {
        test('returns 0 at start of animation', () => {
            controller.setState('run');
            const progress = controller.getProgress();

            expect(progress).toBeGreaterThanOrEqual(0);
            expect(progress).toBeLessThan(1);
        });

        test('increases as animation progresses', () => {
            controller.setState('run');
            const progress1 = controller.getProgress();

            controller.update(50);
            const progress2 = controller.getProgress();

            expect(progress2).toBeGreaterThan(progress1);
        });
    });

    describe('serialize()', () => {
        test('serializes animation state', () => {
            controller.setState('run', false);  // Don't reset frame
            controller.animFrame = 2;  // Set manually after state change
            controller.animTimer = 75;

            const data = controller.serialize();

            expect(data.animFrame).toBe(2);
            expect(data.animTimer).toBe(75);
            expect(data.currentState).toBe('run');
            expect(data.previousState).toBe('idle_sit');
        });
    });

    describe('deserialize()', () => {
        test('restores animation state from data', () => {
            const data = {
                animFrame: 2,
                animTimer: 75,
                currentState: 'run',
                previousState: 'jump_up'
            };

            controller.deserialize(data);

            expect(controller.animFrame).toBe(2);
            expect(controller.animTimer).toBe(75);
            expect(controller.currentState).toBe('run');
            expect(controller.previousState).toBe('jump_up');
        });

        test('handles missing data with defaults', () => {
            controller.deserialize({});

            expect(controller.animFrame).toBe(0);
            expect(controller.animTimer).toBe(0);
            expect(controller.currentState).toBe('idle_sit');
            expect(controller.previousState).toBeNull();
        });
    });

    describe('clone()', () => {
        test('creates independent copy', () => {
            controller.setState('run', false);  // Don't reset frame
            controller.animFrame = 2;  // Set manually

            const cloned = controller.clone();

            expect(cloned.animFrame).toBe(controller.animFrame);
            expect(cloned.currentState).toBe(controller.currentState);

            // Modify original
            controller.animFrame = 0;

            // Clone should be unchanged
            expect(cloned.animFrame).toBe(2);
        });
    });

    describe('createAnimationController()', () => {
        test('creates controller with default initial state', () => {
            const ctrl = createAnimationController();

            expect(ctrl.getCurrentState()).toBe('idle_sit');
        });

        test('creates controller with custom initial state', () => {
            const ctrl = createAnimationController('run');

            expect(ctrl.getCurrentState()).toBe('run');
        });
    });

    describe('Animation Timing Integration', () => {
        test('run animation completes full cycle in expected time', () => {
            controller.setState('run');  // 3 frames, 100ms each

            // First frame (0)
            expect(controller.getCurrentFrame()).toBe(0);

            // Advance to frame 1
            controller.update(100);
            expect(controller.getCurrentFrame()).toBe(1);

            // Advance to frame 2
            controller.update(100);
            expect(controller.getCurrentFrame()).toBe(2);

            // Loop back to frame 0
            controller.update(100);
            expect(controller.getCurrentFrame()).toBe(0);
        });

        test('idle animation timing is slower than run', () => {
            // Compare run (100ms) vs idle (150ms) by checking timer progression
            controller.setState('run');
            controller.update(100);

            // Run should advance after 100ms (3-frame animation)
            expect(controller.getCurrentFrame()).toBe(1);

            controller.setState('idle_sit');
            controller.update(100);

            // Idle should NOT advance yet (needs 150ms, but it's single-frame so stays at 0)
            // Check timer instead of frame for single-frame animations
            expect(controller.animTimer).toBe(100);

            controller.update(50);

            // Timer should reset after crossing 150ms threshold
            expect(controller.animTimer).toBe(0);
        });
    });
});
