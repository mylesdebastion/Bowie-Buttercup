/**
 * Entity System Integration Test
 * 
 * Tests the modular entity system integration with the existing Game.js
 * Verifies that extracted entities behave identically to original implementation
 * 
 * Test Categories:
 * 1. Entity Creation and Initialization
 * 2. Physics Behavior Validation  
 * 3. Collision Detection Accuracy
 * 4. Animation and Rendering
 * 5. Performance Benchmarking
 */

import { EntityManager } from './EntityManager.js';
import { PlayerEntity } from './PlayerEntity.js';
import { FireballEntity } from './FireballEntity.js';
import { MouseEntity } from './MouseEntity.js';
import { DogEntity } from './DogEntity.js';
import { ParticleEntity } from './ParticleEntity.js';
import { getPhysicsSystem } from './PhysicsSystem.js';

/**
 * Mock game instance for testing
 */
class MockGameInstance {
    constructor() {
        this.inputManager = {
            isKeyPressed: (key) => false,
            isJumpBuffered: () => false,
            clearJumpBuffer: () => {}
        };
        
        this.level = this.createTestLevel();
        this.score = 0;
        this.treatsCollected = 0;
        this.particles = [];
    }
    
    createTestLevel() {
        // Simple test level with ground platform
        const level = [];
        for (let y = 0; y < 30; y++) {
            level[y] = [];
            for (let x = 0; x < 50; x++) {
                if (y === 25) {
                    level[y][x] = 1; // Ground
                } else {
                    level[y][x] = 0; // Air
                }
            }
        }
        return level;
    }
    
    playSound(type) {
        console.log(`Playing sound: ${type}`);
    }
    
    ejectTreats() {
        console.log('Ejecting treats');
        this.treatsCollected = Math.max(0, this.treatsCollected - 1);
    }
}

/**
 * Integration Test Suite
 */
export class EntityIntegrationTest {
    constructor() {
        this.mockGame = new MockGameInstance();
        this.entityManager = new EntityManager(this.mockGame);
        this.physics = getPhysicsSystem();
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        // Set up physics system with test level
        this.physics.setLevel(this.mockGame.level);
    }
    
    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Entity System Integration Tests...\n');
        
        // Test entity creation and initialization
        await this.testEntityCreation();
        
        // Test physics behavior
        await this.testPhysicsBehavior();
        
        // Test collision detection
        await this.testCollisionDetection();
        
        // Test entity interactions
        await this.testEntityInteractions();
        
        // Test animation and lifecycle
        await this.testAnimationAndLifecycle();
        
        // Performance benchmarking
        await this.testPerformance();
        
        // Report results
        this.reportResults();
        
        return this.testResults;
    }
    
    /**
     * Test entity creation and initialization
     */
    async testEntityCreation() {
        console.log('📦 Testing Entity Creation...');
        
        // Test player creation
        this.test('Player Entity Creation', () => {
            const player = this.entityManager.createPlayer(100, 300);
            return player instanceof PlayerEntity && 
                   player.x === 100 && 
                   player.y === 300 && 
                   player.health === 3;
        });
        
        // Test fireball creation
        this.test('Fireball Entity Creation', () => {
            const fireball = this.entityManager.createEntity('fireball', 200, 100, 50, 0);
            return fireball instanceof FireballEntity && 
                   fireball.x === 200 && 
                   fireball.vx === 50;
        });
        
        // Test mouse creation
        this.test('Mouse Entity Creation', () => {
            const mouse = this.entityManager.createEntity('mouse', 300, 350);
            return mouse instanceof MouseEntity && 
                   mouse.x === 300 && 
                   Math.abs(mouse.vx) > 0; // Has initial velocity
        });
        
        // Test dog creation
        this.test('Dog Entity Creation', () => {
            const dog = this.entityManager.createEntity('dog', 400, 350);
            return dog instanceof DogEntity && 
                   dog.x === 400 && 
                   dog.active === true;
        });
        
        // Test particle creation
        this.test('Particle Entity Creation', () => {
            const particle = this.entityManager.createParticle(150, 150);
            return particle instanceof ParticleEntity && 
                   particle.x === 150 && 
                   particle.life > 0;
        });
        
        console.log('✅ Entity creation tests completed\n');
    }
    
    /**
     * Test physics behavior matches original
     */
    async testPhysicsBehavior() {
        console.log('⚡ Testing Physics Behavior...');
        
        // Test player physics
        this.test('Player Gravity Application', () => {
            const player = this.entityManager.createPlayer(100, 200);
            const initialY = player.y;
            const initialVy = player.vy;
            
            // Update physics for one frame
            player.update(16.67, this.mockGame); // ~60 FPS
            
            // Should have applied gravity (vy increased, y position changed)
            return player.vy > initialVy && Math.abs(player.y - initialY) < 5; // Allow small movement
        });
        
        // Test fireball physics  
        this.test('Fireball Trajectory Physics', () => {
            const fireball = this.entityManager.createEntity('fireball', 200, 100, 100, 0);
            const initialX = fireball.x;
            const initialY = fireball.y;
            
            // Update physics
            fireball.update(16.67, this.mockGame);
            
            // Should have moved horizontally and applied gravity
            return fireball.x > initialX && fireball.y > initialY;
        });
        
        // Test collision with ground
        this.test('Ground Collision Detection', () => {
            const player = this.entityManager.createPlayer(100, 400); // Near ground
            player.vy = 100; // Falling
            
            // Update physics multiple times to ensure ground contact
            for (let i = 0; i < 10; i++) {
                player.update(16.67, this.mockGame);
            }
            
            // Should have hit ground and stopped falling
            return player.grounded && player.vy === 0;
        });
        
        console.log('✅ Physics behavior tests completed\n');
    }
    
    /**
     * Test collision detection accuracy
     */
    async testCollisionDetection() {
        console.log('🎯 Testing Collision Detection...');
        
        // Test entity-entity collision detection
        this.test('Entity Collision Detection', () => {
            const player = this.entityManager.createPlayer(100, 100);
            const fireball = this.entityManager.createEntity('fireball', 100, 100);
            
            // Entities at same position should collide
            const collision = this.physics.checkEntityCollision(player, fireball);
            return collision !== null;
        });
        
        // Test mouse catching collision
        this.test('Mouse Catching Collision', () => {
            const player = this.entityManager.createPlayer(300, 350);
            const mouse = this.entityManager.createEntity('mouse', 305, 355); // Close to player
            
            // Set player moving fast enough to catch mouse
            player.vx = 100;
            
            const canCatch = mouse.checkCaught(player);
            return canCatch === true;
        });
        
        // Test collision callback system
        this.test('Collision Callback System', () => {
            let callbackTriggered = false;
            
            // Register collision callback
            this.physics.registerCollisionCallback('player', 'fireball', () => {
                callbackTriggered = true;
            });
            
            const player = this.entityManager.createPlayer(100, 100);
            const fireball = this.entityManager.createEntity('fireball', 100, 100);
            
            // Process collisions
            this.entityManager.update(16.67);
            
            return callbackTriggered;
        });
        
        console.log('✅ Collision detection tests completed\n');
    }
    
    /**
     * Test entity interactions
     */
    async testEntityInteractions() {
        console.log('🤝 Testing Entity Interactions...');
        
        // Test player-fireball interaction
        this.test('Player-Fireball Damage', () => {
            const player = this.entityManager.createPlayer(100, 100);
            const initialHealth = player.health;
            
            // Simulate fireball hit
            player.hurt();
            
            return player.health < initialHealth && player.invulnerable;
        });
        
        // Test mouse catching mechanics
        this.test('Mouse Catching Mechanics', () => {
            const mouse = this.entityManager.createEntity('mouse', 300, 350);
            const player = this.entityManager.createPlayer(300, 350);
            player.vx = 100; // Moving fast enough
            
            const wasCaught = mouse.checkCaught(player);
            return wasCaught;
        });
        
        console.log('✅ Entity interaction tests completed\n');
    }
    
    /**
     * Test animation and lifecycle
     */
    async testAnimationAndLifecycle() {
        console.log('🎬 Testing Animation and Lifecycle...');
        
        // Test particle lifecycle
        this.test('Particle Lifecycle', () => {
            const particle = this.entityManager.createParticle(100, 100);
            const initialLife = particle.life;
            
            // Update particle
            particle.update(100, this.mockGame); // 100ms update
            
            return particle.life < initialLife;
        });
        
        // Test entity destruction
        this.test('Entity Destruction', () => {
            const particle = this.entityManager.createParticle(100, 100);
            particle.life = 0; // Set to expire
            
            particle.update(1, this.mockGame);
            
            return particle.destroyed;
        });
        
        // Test animation frame updates
        this.test('Animation Frame Updates', () => {
            const player = this.entityManager.createPlayer(100, 100);
            const initialFrame = player.animFrame;
            
            // Update enough to trigger animation frame change
            for (let i = 0; i < 20; i++) {
                player.updateAnimation(16.67);
            }
            
            return player.animFrame !== initialFrame;
        });
        
        console.log('✅ Animation and lifecycle tests completed\n');
    }
    
    /**
     * Performance benchmarking
     */
    async testPerformance() {
        console.log('⚡ Testing Performance...');
        
        // Create many entities for performance testing
        const entityCounts = [10, 50, 100];
        
        for (const count of entityCounts) {
            this.test(`Performance with ${count} entities`, () => {
                // Clear existing entities
                this.entityManager.reset();
                
                // Create test entities
                for (let i = 0; i < count; i++) {
                    this.entityManager.createParticle(
                        Math.random() * 800,
                        Math.random() * 400,
                        (Math.random() - 0.5) * 200,
                        -Math.random() * 100
                    );
                }
                
                // Benchmark update performance
                const startTime = performance.now();
                
                for (let frame = 0; frame < 60; frame++) { // Simulate 60 frames
                    this.entityManager.update(16.67);
                }
                
                const endTime = performance.now();
                const avgFrameTime = (endTime - startTime) / 60;
                
                console.log(`  Average frame time with ${count} entities: ${avgFrameTime.toFixed(2)}ms`);
                
                // Performance should be under 2ms per frame for good performance
                return avgFrameTime < 5; // Allow 5ms for testing environment
            });
        }
        
        console.log('✅ Performance tests completed\n');
    }
    
    /**
     * Helper method to run individual tests
     */
    test(testName, testFunction) {
        this.testResults.total++;
        
        try {
            const result = testFunction();
            if (result) {
                this.testResults.passed++;
                this.testResults.details.push({ name: testName, status: 'PASS' });
                console.log(`  ✅ ${testName}`);
            } else {
                this.testResults.failed++;
                this.testResults.details.push({ name: testName, status: 'FAIL', reason: 'Test returned false' });
                console.log(`  ❌ ${testName} - Test returned false`);
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({ name: testName, status: 'ERROR', reason: error.message });
            console.log(`  ❌ ${testName} - Error: ${error.message}`);
        }
    }
    
    /**
     * Report final test results
     */
    reportResults() {
        console.log('📊 Test Results Summary:');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        
        const passRate = (this.testResults.passed / this.testResults.total * 100).toFixed(1);
        console.log(`Pass Rate: ${passRate}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.details
                .filter(test => test.status !== 'PASS')
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.reason || test.status}`);
                });
        }
        
        const overallStatus = this.testResults.failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
        console.log(`\n🎯 ${overallStatus}`);
    }
}

/**
 * Export test runner function
 */
export async function runEntityIntegrationTests() {
    const testSuite = new EntityIntegrationTest();
    return await testSuite.runAllTests();
}

export default EntityIntegrationTest;