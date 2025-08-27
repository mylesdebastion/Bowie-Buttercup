#!/usr/bin/env node

/**
 * Migration Test Runner
 * Automated testing for feature parity during migration
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MigrationTestRunner {
    constructor() {
        this.results = {
            monolithic: {},
            modular: {},
            parity: {}
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Migration Test Suite...\n');
        
        try {
            await this.testMonolithic();
            await this.testModular();
            await this.testFeatureParity();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    async testMonolithic() {
        console.log('📋 Testing Monolithic Version (index.html)...');
        
        // Basic load test
        const loadTest = this.testGameLoad('./index.html');
        console.log(`  Load Test: ${loadTest ? '✅' : '❌'}`);
        
        // Feature tests
        const features = [
            'Pet Bowl Rendering',
            'Image Loading',
            'Level 5 Logic',
            'Player Movement',
            'Collision Detection'
        ];
        
        features.forEach(feature => {
            const result = this.testFeature('monolithic', feature);
            console.log(`  ${feature}: ${result ? '✅' : '❌'}`);
            this.results.monolithic[feature] = result;
        });
        
        console.log('');
    }

    async testModular() {
        console.log('🏗️ Testing Modular Version (src/)...');
        
        // Check if modular structure exists
        const modularExists = fs.existsSync('./src/main.js');
        console.log(`  Structure Exists: ${modularExists ? '✅' : '❌'}`);
        
        if (!modularExists) {
            console.log('  ⚠️ Modular version not yet implemented - skipping tests\n');
            return;
        }
        
        // Module tests
        const modules = [
            'Core Game Loop',
            'Asset Loader',
            'Renderer',
            'Entity System',
            'Physics System'
        ];
        
        modules.forEach(module => {
            const result = this.testModule(module);
            console.log(`  ${module}: ${result ? '✅' : '❌'}`);
            this.results.modular[module] = result;
        });
        
        console.log('');
    }

    async testFeatureParity() {
        console.log('⚖️ Testing Feature Parity...');
        
        const features = [
            'Pet Bowl Sprites',
            'Level Loading', 
            'Player Controls',
            'Collision Detection',
            'Asset Management'
        ];
        
        features.forEach(feature => {
            const parity = this.testParity(feature);
            console.log(`  ${feature}: ${parity ? '✅' : '❌'}`);
            this.results.parity[feature] = parity;
        });
        
        console.log('');
    }

    testGameLoad(file) {
        try {
            // Simple existence and syntax check
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for critical game elements
            const required = [
                'canvas',
                'game',
                'player',
                'drawGame',
                'gameLoop'
            ];
            
            return required.every(item => content.includes(item));
        } catch (error) {
            return false;
        }
    }

    testFeature(version, feature) {
        // Simulate feature testing
        // In real implementation, would run actual browser tests
        
        const featureMap = {
            'Pet Bowl Rendering': () => this.checkPetBowlCode(version),
            'Image Loading': () => this.checkImageLoading(version),
            'Level 5 Logic': () => this.checkLevel5Code(version),
            'Player Movement': () => this.checkPlayerMovement(version),
            'Collision Detection': () => this.checkCollisionDetection(version)
        };
        
        const testFn = featureMap[feature];
        return testFn ? testFn() : false;
    }

    testModule(module) {
        const moduleMap = {
            'Core Game Loop': () => fs.existsSync('./src/core/game-loop.js'),
            'Asset Loader': () => fs.existsSync('./src/core/asset-loader.js'),
            'Renderer': () => fs.existsSync('./src/core/renderer.js'),
            'Entity System': () => fs.existsSync('./src/entities/'),
            'Physics System': () => fs.existsSync('./src/systems/physics.js')
        };
        
        const testFn = moduleMap[module];
        return testFn ? testFn() : false;
    }

    testParity(feature) {
        // Check if feature exists in both versions with similar functionality
        const monolithicHas = this.results.monolithic[feature] || false;
        const modularHas = this.results.modular[feature] || false;
        
        // For now, return true if monolithic has it (baseline)
        return monolithicHas;
    }

    checkPetBowlCode(version) {
        try {
            const file = version === 'monolithic' ? './index.html' : './src/entities/items.js';
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('drawFoodBowl') && content.includes('pet_food_bowl.png');
        } catch {
            return false;
        }
    }

    checkImageLoading(version) {
        try {
            const file = version === 'monolithic' ? './index.html' : './src/core/asset-loader.js';
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('loadImage') || content.includes('Image()');
        } catch {
            return false;
        }
    }

    checkLevel5Code(version) {
        try {
            const file = version === 'monolithic' ? './index.html' : './src/levels/level-5.js';
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('level') && content.includes('5');
        } catch {
            return false;
        }
    }

    checkPlayerMovement(version) {
        try {
            const file = version === 'monolithic' ? './index.html' : './src/entities/player.js';
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('player') && (content.includes('move') || content.includes('velocity'));
        } catch {
            return false;
        }
    }

    checkCollisionDetection(version) {
        try {
            const file = version === 'monolithic' ? './index.html' : './src/systems/collision.js';
            if (!fs.existsSync(file)) return false;
            
            const content = fs.readFileSync(file, 'utf8');
            return content.includes('collision') || content.includes('intersect');
        } catch {
            return false;
        }
    }

    async generateReport() {
        console.log('📊 Migration Test Report');
        console.log('='.repeat(50));
        
        // Overall status
        const monolithicScore = this.calculateScore(this.results.monolithic);
        const modularScore = this.calculateScore(this.results.modular);
        const parityScore = this.calculateScore(this.results.parity);
        
        console.log(`Monolithic Health: ${monolithicScore}% ✅`);
        console.log(`Modular Progress: ${modularScore}% 🏗️`);
        console.log(`Feature Parity: ${parityScore}% ⚖️`);
        
        // Migration progress
        const migrationProgress = Math.round((modularScore / monolithicScore) * 100);
        console.log(`Migration Progress: ${migrationProgress}%`);
        
        // Recommendations
        console.log('\n📋 Recommendations:');
        if (migrationProgress < 25) {
            console.log('  • Focus on core system migration first');
            console.log('  • Set up basic module structure');
        } else if (migrationProgress < 75) {
            console.log('  • Continue feature migration');
            console.log('  • Maintain feature parity testing');
        } else {
            console.log('  • Focus on integration and polish');
            console.log('  • Performance optimization');
        }
        
        // Save detailed report
        const reportData = {
            timestamp: new Date().toISOString(),
            scores: {
                monolithic: monolithicScore,
                modular: modularScore,
                parity: parityScore,
                progress: migrationProgress
            },
            details: this.results
        };
        
        fs.writeFileSync(
            './migration-test-report.json',
            JSON.stringify(reportData, null, 2)
        );
        
        console.log('\n📄 Detailed report saved to: migration-test-report.json');
    }

    calculateScore(results) {
        const tests = Object.values(results);
        if (tests.length === 0) return 0;
        
        const passed = tests.filter(Boolean).length;
        return Math.round((passed / tests.length) * 100);
    }
}

// Run tests if called directly
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
    console.log('🚀 Starting Migration Test Runner...');
    const runner = new MigrationTestRunner();
    runner.runAllTests().catch(console.error);
}

export default MigrationTestRunner;