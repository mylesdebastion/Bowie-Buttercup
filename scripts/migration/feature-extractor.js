#!/usr/bin/env node

/**
 * Feature Extractor
 * Automated tool to extract features from monolithic index.html
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class FeatureExtractor {
    constructor() {
        this.monolithicFile = './index.html';
        this.srcDir = './src';
    }

    async extractFeature(featureName, startPattern, endPattern, targetModule) {
        console.log(`🔧 Extracting feature: ${featureName}`);
        
        try {
            const content = fs.readFileSync(this.monolithicFile, 'utf8');
            const extractedCode = this.findCodeBlock(content, startPattern, endPattern);
            
            if (!extractedCode) {
                console.log(`❌ Could not find feature: ${featureName}`);
                return false;
            }
            
            await this.createModule(targetModule, extractedCode, featureName);
            console.log(`✅ Feature extracted to: ${targetModule}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Error extracting ${featureName}:`, error.message);
            return false;
        }
    }

    findCodeBlock(content, startPattern, endPattern) {
        const startMatch = content.match(startPattern);
        if (!startMatch) return null;
        
        const startIndex = startMatch.index;
        const endMatch = content.substring(startIndex).match(endPattern);
        
        if (!endMatch) {
            // Try to find function end by brace counting
            return this.extractByBraceCount(content, startIndex);
        }
        
        const endIndex = startIndex + endMatch.index + endMatch[0].length;
        return content.substring(startIndex, endIndex);
    }

    extractByBraceCount(content, startIndex) {
        let braceCount = 0;
        let inFunction = false;
        let result = '';
        
        for (let i = startIndex; i < content.length; i++) {
            const char = content[i];
            result += char;
            
            if (char === '{') {
                braceCount++;
                inFunction = true;
            } else if (char === '}') {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    return result;
                }
            }
        }
        
        return result;
    }

    async createModule(targetModule, extractedCode, featureName) {
        const moduleDir = path.dirname(targetModule);
        
        // Ensure directory exists
        if (!fs.existsSync(moduleDir)) {
            fs.mkdirSync(moduleDir, { recursive: true });
        }
        
        // Generate module template
        const moduleContent = this.generateModuleTemplate(extractedCode, featureName);
        
        // Write or update module
        if (fs.existsSync(targetModule)) {
            await this.updateExistingModule(targetModule, extractedCode, featureName);
        } else {
            fs.writeFileSync(targetModule, moduleContent);
        }
    }

    generateModuleTemplate(extractedCode, featureName) {
        const className = this.toCamelCase(featureName) + 'System';
        
        return `/**
 * ${featureName} System
 * Extracted from monolithic index.html
 * Generated on: ${new Date().toISOString()}
 */

export class ${className} {
    constructor(renderer, assetLoader) {
        this.renderer = renderer;
        this.assetLoader = assetLoader;
        this.assets = {};
    }

    async initialize() {
        // Load required assets
        await this.loadAssets();
    }

    async loadAssets() {
        // Asset loading logic will be added here
    }

    // Extracted methods:
${this.indentCode(extractedCode)}

}`;
    }

    async updateExistingModule(targetModule, extractedCode, featureName) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question(`Module ${targetModule} exists. Update it? (y/n): `, (answer) => {
                rl.close();
                
                if (answer.toLowerCase() === 'y') {
                    const existingContent = fs.readFileSync(targetModule, 'utf8');
                    const updatedContent = existingContent + '\n\n' + 
                        `    // Added ${featureName} - ${new Date().toISOString()}\n` +
                        this.indentCode(extractedCode);
                    
                    fs.writeFileSync(targetModule, updatedContent);
                    console.log(`✅ Updated module: ${targetModule}`);
                } else {
                    console.log(`⏭️ Skipped updating: ${targetModule}`);
                }
                
                resolve();
            });
        });
    }

    indentCode(code) {
        return code.split('\n').map(line => '    ' + line).join('\n');
    }

    toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    async extractPetBowlSystem() {
        console.log('🍽️ Extracting Pet Bowl System...');
        
        const features = [
            {
                name: 'Food Bowl Drawing',
                pattern: /drawFoodBowl\s*\([^)]*\)\s*{/,
                endPattern: /^\s*}/m,
                module: './src/entities/items.js'
            },
            {
                name: 'Water Bowl Drawing', 
                pattern: /drawWaterBowl\s*\([^)]*\)\s*{/,
                endPattern: /^\s*}/m,
                module: './src/entities/items.js'
            },
            {
                name: 'Bowl Image Loading',
                pattern: /loadImage\('\.\/pet_.*_bowl\.png'\)/,
                endPattern: /\}\);/,
                module: './src/core/asset-loader.js'
            }
        ];

        for (const feature of features) {
            await this.extractFeature(
                feature.name,
                feature.pattern,
                feature.endPattern,
                feature.module
            );
        }
    }

    async extractCoreSystem() {
        console.log('⚙️ Extracting Core Systems...');
        
        const features = [
            {
                name: 'Game Loop',
                pattern: /function\s+gameLoop\s*\(/,
                endPattern: /^\s*}/m,
                module: './src/core/game-loop.js'
            },
            {
                name: 'Player Movement',
                pattern: /player\s*=\s*{/,
                endPattern: /^\s*};/m,
                module: './src/entities/player.js'
            },
            {
                name: 'Collision Detection',
                pattern: /function.*collision|collision.*function/i,
                endPattern: /^\s*}/m,
                module: './src/systems/collision.js'
            }
        ];

        for (const feature of features) {
            await this.extractFeature(
                feature.name,
                feature.pattern,
                feature.endPattern,
                feature.module
            );
        }
    }

    async runInteractiveExtraction() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('🎯 Interactive Feature Extraction');
        console.log('Available extractions:');
        console.log('1. Pet Bowl System');
        console.log('2. Core Systems');
        console.log('3. Custom extraction');
        console.log('4. Exit');

        rl.question('Choose extraction (1-4): ', async (choice) => {
            switch (choice) {
                case '1':
                    await this.extractPetBowlSystem();
                    break;
                case '2':
                    await this.extractCoreSystem();
                    break;
                case '3':
                    await this.customExtraction(rl);
                    break;
                case '4':
                    console.log('👋 Goodbye!');
                    rl.close();
                    return;
                default:
                    console.log('❌ Invalid choice');
                    break;
            }
            rl.close();
        });
    }

    async customExtraction(rl) {
        return new Promise((resolve) => {
            rl.question('Feature name: ', (name) => {
                rl.question('Start pattern (regex): ', (start) => {
                    rl.question('Target module path: ', async (module) => {
                        try {
                            const pattern = new RegExp(start);
                            await this.extractFeature(name, pattern, /^\s*}/m, module);
                        } catch (error) {
                            console.error('❌ Extraction failed:', error.message);
                        }
                        resolve();
                    });
                });
            });
        });
    }
}

// Run if called directly
if (require.main === module) {
    const extractor = new FeatureExtractor();
    
    if (process.argv[2] === 'interactive') {
        extractor.runInteractiveExtraction();
    } else if (process.argv[2] === 'pet-bowls') {
        extractor.extractPetBowlSystem();
    } else if (process.argv[2] === 'core') {
        extractor.extractCoreSystem();
    } else {
        console.log('Usage:');
        console.log('  node feature-extractor.js interactive');
        console.log('  node feature-extractor.js pet-bowls');
        console.log('  node feature-extractor.js core');
    }
}

module.exports = FeatureExtractor;