/**
 * Level System Index
 * 
 * Provides centralized exports for the entire level system.
 * Makes it easy to import and register all levels with the Level Manager.
 * 
 * Epic E003: Level System Implementation
 */

// Core level system
import { Level } from './Level.js';
import { LevelManager } from './LevelManager.js';

export { Level, LevelManager };

// Individual levels
import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';
import { Level4 } from './Level4.js';
import { Level5 } from './Level5.js';

export { Level1, Level2, Level3, Level4, Level5 };

// Level registration helper
export function registerAllLevels(levelManager) {
    levelManager.registerLevel('level1', Level1, { 
        name: 'Fireball Platformer',
        difficulty: 1 
    });
    
    levelManager.registerLevel('level2', Level2, { 
        name: 'Mouse Catching Arena',
        difficulty: 2 
    });
    
    levelManager.registerLevel('level3', Level3, { 
        name: 'Challenge Arena',
        difficulty: 3 
    });
    
    levelManager.registerLevel('level4', Level4, { 
        name: 'Dog Bounce Level',
        difficulty: 4 
    });
    
    levelManager.registerLevel('level5', Level5, { 
        name: 'Victory Feast',
        difficulty: 5 
    });
    
    console.log('✅ All levels registered with Level Manager');
}

// ES6 module export for easier importing
export default {
    Level,
    LevelManager,
    Level1,
    Level2,
    Level3,
    Level4,
    Level5,
    registerAllLevels
};