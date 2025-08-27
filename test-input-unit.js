#!/usr/bin/env node

/**
 * Input Manager Unit Tests
 * US-004: Input Management System
 * 
 * Unit tests to validate InputManager core functionality
 * without requiring browser automation.
 */

import { InputManager } from './src/core/InputManager.js';
import assert from 'assert';
import { fileURLToPath } from 'url';

// Mock canvas element for testing
class MockCanvas {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.addEventListener = () => {};
        this.removeEventListener = () => {};
    }
}

// Mock document and window for Node.js environment
global.document = {
    createElement: (tag) => ({
        id: '',
        innerHTML: '',
        style: {},
        className: '',
        classList: {
            add: () => {},
            remove: () => {},
            toggle: () => {}
        },
        addEventListener: () => {},
        removeEventListener: () => {},
        appendChild: () => {},
        remove: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        querySelectorAll: () => [],
        querySelector: () => null
    }),
    getElementById: () => null,
    body: {
        appendChild: () => {},
        classList: {
            add: () => {}
        }
    },
    head: {
        appendChild: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {}
};

global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    keys: {}
};

global.navigator = {
    userAgent: 'Node.js Test Environment',
    vibrate: false,
    maxTouchPoints: 0
};

async function runInputManagerTests() {
    console.log('🧪 Starting InputManager unit tests...');
    
    let testCount = 0;
    let passedTests = 0;
    
    function test(name, testFn) {
        testCount++;
        try {
            testFn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.error(`❌ ${name}: ${error.message}`);
        }
    }
    
    // Test 1: InputManager Initialization
    test('InputManager initialization', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        assert(inputManager instanceof InputManager, 'InputManager should be instantiated');
        assert(inputManager.keys, 'InputManager should have keys object');
        assert(inputManager.keyMap, 'InputManager should have keyMap object');
        assert(typeof inputManager.isKeyPressed === 'function', 'InputManager should have isKeyPressed method');
    });
    
    // Test 2: Key Mapping Configuration
    test('Key mapping configuration', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // Test default key mappings
        assert(Array.isArray(inputManager.keyMap.left), 'Left action should have key array');
        assert(inputManager.keyMap.left.includes('ArrowLeft'), 'Left should include ArrowLeft');
        assert(inputManager.keyMap.left.includes('a'), 'Left should include a');
        assert(inputManager.keyMap.left.includes('A'), 'Left should include A');
        
        assert(Array.isArray(inputManager.keyMap.jump), 'Jump action should have key array');
        assert(inputManager.keyMap.jump.includes(' '), 'Jump should include space');
        assert(inputManager.keyMap.jump.includes('w'), 'Jump should include w');
        assert(inputManager.keyMap.jump.includes('ArrowUp'), 'Jump should include ArrowUp');
    });
    
    // Test 3: Input State Management
    test('Input state management', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // Simulate key press
        inputManager.keys['a'] = true;
        assert(inputManager.isKeyPressed('left'), 'Left action should be pressed when a is pressed');
        
        // Simulate key release
        inputManager.keys['a'] = false;
        assert(!inputManager.isKeyPressed('left'), 'Left action should not be pressed when a is released');
    });
    
    // Test 4: Jump Buffering
    test('Jump buffering system', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // Test jump buffer
        inputManager.jumpBufferTime = Date.now();
        assert(inputManager.isJumpBuffered(), 'Jump should be buffered immediately after setting');
        
        inputManager.clearJumpBuffer();
        assert(!inputManager.isJumpBuffered(), 'Jump buffer should be cleared');
    });
    
    // Test 5: Mobile Detection
    test('Mobile detection', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // In Node.js environment, should detect as non-mobile
        assert(!inputManager.isMobile, 'Should detect Node.js environment as non-mobile');
    });
    
    // Test 6: Key Edge Detection
    test('Key edge detection (down/up)', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // Set up initial state
        inputManager.keys['w'] = false;
        inputManager.previousKeys['w'] = false;
        inputManager.update(); // Sync previous state
        
        // Simulate key press
        inputManager.keys['w'] = true;
        assert(inputManager.isKeyDown('jump'), 'Jump should be detected as "down" on first frame');
        
        // Update to next frame
        inputManager.update();
        assert(!inputManager.isKeyDown('jump'), 'Jump should not be "down" on second frame');
        assert(inputManager.isKeyPressed('jump'), 'Jump should still be pressed');
        
        // Simulate key release
        inputManager.keys['w'] = false;
        assert(inputManager.isKeyUp('jump'), 'Jump should be detected as "up" on release frame');
    });
    
    // Test 7: Multiple Key Support
    test('Multiple key support for actions', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        // Test multiple keys for same action
        inputManager.keys['ArrowLeft'] = true;
        assert(inputManager.isKeyPressed('left'), 'Left should work with ArrowLeft');
        
        inputManager.keys['ArrowLeft'] = false;
        inputManager.keys['a'] = true;
        assert(inputManager.isKeyPressed('left'), 'Left should work with a');
        
        inputManager.keys['a'] = false;
        inputManager.keys['A'] = true;
        assert(inputManager.isKeyPressed('left'), 'Left should work with A');
    });
    
    // Test 8: Input History
    test('Input history tracking', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        inputManager.update();
        assert(inputManager.inputHistory.length > 0, 'Input history should track updates');
        
        const firstEntry = inputManager.inputHistory[0];
        assert(firstEntry.timestamp, 'History entry should have timestamp');
        assert(typeof firstEntry.keys === 'object', 'History entry should have keys object');
        assert(typeof firstEntry.actions === 'object', 'History entry should have actions object');
    });
    
    // Test 9: Custom Key Mapping
    test('Custom key mapping', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        inputManager.setKeyMapping('custom', ['x', 'X']);
        assert(Array.isArray(inputManager.keyMap.custom), 'Custom mapping should be array');
        assert(inputManager.keyMap.custom.includes('x'), 'Custom mapping should include x');
        assert(inputManager.keyMap.custom.includes('X'), 'Custom mapping should include X');
        
        inputManager.keys['x'] = true;
        assert(inputManager.isKeyPressed('custom'), 'Custom action should work with mapped key');
    });
    
    // Test 10: Debug Information
    test('Debug information', () => {
        const canvas = new MockCanvas();
        const inputManager = new InputManager(canvas);
        
        const debugInfo = inputManager.getDebugInfo();
        assert(typeof debugInfo.keys === 'object', 'Debug info should have keys object');
        assert(typeof debugInfo.keyMap === 'object', 'Debug info should have keyMap object');
        assert(typeof debugInfo.jumpBuffered === 'boolean', 'Debug info should have jumpBuffered boolean');
        assert(typeof debugInfo.mobile === 'boolean', 'Debug info should have mobile boolean');
    });
    
    // Test Results
    console.log('\n📊 Test Results:');
    console.log(`   Tests run: ${testCount}`);
    console.log(`   Tests passed: ${passedTests}`);
    console.log(`   Tests failed: ${testCount - passedTests}`);
    console.log(`   Success rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);
    
    if (passedTests === testCount) {
        console.log('\n🎉 All InputManager unit tests passed!');
        console.log('✅ US-004: Input Management System - Core functionality validated');
        return true;
    } else {
        console.log('\n❌ Some tests failed. InputManager implementation needs fixes.');
        return false;
    }
}

// Run tests if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runInputManagerTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Test execution failed:', error);
            process.exit(1);
        });
}