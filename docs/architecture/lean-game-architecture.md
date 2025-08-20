# Lean Game Architecture - Exportable & Offline-Capable

## Core Principle: Content-Code Separation

**Games = Lean Engine + Dynamic Content**
- Game templates: Lightweight, single-file exports
- Content: JSON-driven levels, themes, and customizations
- Editor: Internal development tool (not user-facing)

## Architecture Overview

```
Platform Generation Flow:
User Pet Image → Content Generation → Game Template + Content → Single HTML Export

Runtime Flow:
game.html + pet-data.json + levels.json → Fully Functional Offline Game
```

## Game Template Structure

### Single File Export Target
```html
<!-- pet-platformer-game.html -->
<!DOCTYPE html>
<html>
<head>
    <title>{{PET_NAME}}'s Adventure</title>
    <style>/* Inlined CSS */</style>
</head>
<body>
    <canvas id="game"></canvas>
    <script>
        // Inlined Phaser 3 (minified)
        // Inlined game engine
        // Embedded content data
        const GAME_CONFIG = {
            petData: {{PET_DATA}},
            levels: {{LEVELS_DATA}},
            theme: {{THEME_DATA}}
        };
        
        // Game initialization
        new PetPlatformerGame(GAME_CONFIG).start();
    </script>
</body>
</html>
```

### Game Template Development Structure
```
game-templates/pet-platformer/
├── src/
│   ├── core/
│   │   ├── Game.js              # Main game class
│   │   ├── Player.js            # Player entity with pet customization
│   │   ├── Level.js             # Level loader (JSON-driven)
│   │   └── Physics.js           # Game physics
│   ├── systems/
│   │   ├── InputSystem.js       # Input handling
│   │   ├── CollisionSystem.js   # Collision detection
│   │   └── AudioSystem.js       # Sound management
│   ├── utils/
│   │   ├── AssetLoader.js       # Dynamic asset loading
│   │   └── ConfigParser.js      # Parse embedded JSON config
│   └── main.js                  # Entry point & initialization
├── build/
│   ├── bundle.js                # Webpack bundled game
│   ├── template.html            # HTML template for export
│   └── export/                  # Generated single-file games
│       ├── fluffy-adventure.html
│       └── max-platformer.html
├── webpack.config.js            # Build configuration
└── package.json
```

## Content Structure (JSON-Driven)

### Level Definition
```json
// game-content/levels/pet-platformer/level-1.json
{
  "id": "level-1",
  "name": "Garden Adventure",
  "width": 1920,
  "height": 1080,
  "background": "garden",
  "music": "cheerful-tune",
  "platforms": [
    {
      "x": 100,
      "y": 500,
      "width": 200,
      "height": 32,
      "type": "grass"
    }
  ],
  "collectibles": [
    {
      "x": 150,
      "y": 450,
      "type": "treat",
      "points": 100
    }
  ],
  "enemies": [
    {
      "x": 400,
      "y": 460,
      "type": "squirrel",
      "pattern": "patrol",
      "range": 100
    }
  ],
  "startPosition": { "x": 50, "y": 400 },
  "endPosition": { "x": 1800, "y": 400 },
  "requirements": {
    "collectibles": 5,
    "timeLimit": 120
  }
}
```

### Pet Configuration
```json
// Generated per user from their pet image
{
  "petData": {
    "name": "Fluffy",
    "sprite": "data:image/png;base64,iVBORw0KGgoAAAANS...", // Base64 pet sprite
    "animations": {
      "idle": { "frames": [0, 1], "frameRate": 2 },
      "run": { "frames": [2, 3, 4, 5], "frameRate": 8 },
      "jump": { "frames": [6, 7], "frameRate": 4 }
    },
    "physics": {
      "jumpHeight": 300,
      "speed": 150,
      "gravity": 800
    },
    "sounds": {
      "jump": "pet-jump.mp3",
      "collect": "pet-happy.mp3"
    }
  }
}
```

### Theme Configuration
```json
// game-content/themes/forest/theme.json
{
  "id": "forest",
  "name": "Enchanted Forest",
  "assets": {
    "background": "forest-bg.jpg",
    "tileset": "forest-tiles.png",
    "music": "forest-ambient.mp3"
  },
  "colors": {
    "primary": "#2d5a2d",
    "secondary": "#4a7c4a",
    "accent": "#7fb069"
  },
  "particles": {
    "leaves": {
      "texture": "leaf-particle.png",
      "quantity": 20,
      "speed": { "min": 10, "max": 30 }
    }
  }
}
```

## Game Generation Pipeline

### Platform-Side Generation
```typescript
// services/api/src/services/GameGenerator.ts
export class GameGenerator {
  async generatePersonalizedGame(
    userId: string, 
    gameTemplate: string, 
    customization: GameCustomization
  ): Promise<string> {
    
    // 1. Load game template
    const template = await this.loadTemplate(gameTemplate);
    
    // 2. Generate pet sprite from user's image
    const petData = await this.generatePetData(userId, customization.petImage);
    
    // 3. Select levels based on difficulty
    const levels = await this.selectLevels(gameTemplate, customization.difficulty);
    
    // 4. Apply theme
    const theme = await this.loadTheme(customization.theme);
    
    // 5. Bundle everything into single HTML file
    const gameHtml = await this.bundleGame(template, {
      petData,
      levels,
      theme,
      playerName: customization.playerName
    });
    
    // 6. Store and return download URL
    const gameUrl = await this.storeGame(userId, gameHtml);
    return gameUrl;
  }

  private async bundleGame(template: GameTemplate, config: GameConfig): Promise<string> {
    // Read HTML template
    let html = await fs.readFile(template.htmlPath, 'utf8');
    
    // Inline all assets
    html = html.replace('{{PHASER_JS}}', await this.inlinePhaser());
    html = html.replace('{{GAME_JS}}', await this.inlineGameCode(template));
    html = html.replace('{{GAME_CONFIG}}', JSON.stringify(config));
    html = html.replace('{{PET_NAME}}', config.petData.name);
    
    // Inline CSS and assets
    html = await this.inlineAssets(html, config.theme);
    
    return html;
  }
}
```

### Build Process
```javascript
// game-templates/pet-platformer/webpack.config.js
module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'game.bundle.js',
    path: path.resolve(__dirname, 'build'),
    library: 'PetPlatformerGame',
    libraryTarget: 'var'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: { drop_console: true },
        format: { comments: false }
      }
    })]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ]
};
```

## Editor Architecture (Internal Tool Only)

### Separate Editor Application
```
game-editor/
├── src/
│   ├── components/
│   │   ├── LevelEditor.tsx      # Visual level editor
│   │   ├── AssetManager.tsx     # Asset upload/management
│   │   ├── GamePreview.tsx      # Live game preview
│   │   └── ThemeEditor.tsx      # Theme customization
│   ├── tools/
│   │   ├── LevelValidator.js    # Validate level JSON
│   │   ├── AssetOptimizer.js    # Optimize game assets
│   │   └── ExportTool.js        # Export level/theme JSON
│   └── preview/
│       ├── GameEmulator.tsx     # Test games in editor
│       └── PerformanceMonitor.tsx # Monitor game performance
├── public/
│   └── templates/               # Game template previews
└── package.json
```

### Editor Features
- **Visual Level Designer**: Drag-and-drop level creation
- **Asset Pipeline**: Upload, optimize, and organize game assets
- **Theme Creator**: Design visual themes with live preview
- **Game Testing**: Test levels and games within editor
- **Export Tools**: Generate JSON files for game content
- **Performance Monitoring**: Ensure games meet size/performance targets

## Content Management

### Dynamic Level Loading
```javascript
// In game template
class LevelManager {
  constructor(levelsData) {
    this.levels = levelsData;
    this.currentLevel = 0;
  }

  loadLevel(levelId) {
    const levelData = this.levels.find(l => l.id === levelId);
    if (!levelData) throw new Error(`Level ${levelId} not found`);
    
    // Parse JSON level data into game objects
    return this.parseLevel(levelData);
  }

  parseLevel(data) {
    const level = new Level(data.width, data.height);
    
    // Add platforms
    data.platforms.forEach(platform => {
      level.addPlatform(new Platform(platform));
    });
    
    // Add collectibles
    data.collectibles.forEach(item => {
      level.addCollectible(new Collectible(item));
    });
    
    return level;
  }
}
```

### Custom Level Generation
```typescript
// Platform can generate custom levels
export class LevelGenerator {
  generateCustomLevel(difficulty: number, theme: string, petAbilities: string[]): LevelData {
    const level = {
      id: `custom-${Date.now()}`,
      name: `Custom Adventure`,
      difficulty,
      theme,
      platforms: this.generatePlatforms(difficulty),
      collectibles: this.generateCollectibles(difficulty),
      enemies: this.generateEnemies(difficulty, petAbilities)
    };
    
    return this.validateLevel(level);
  }
}
```

## Deployment & Distribution

### Single File Benefits
- **Offline Play**: No internet required after download
- **Easy Sharing**: Send single HTML file via email/messaging
- **No Installation**: Works in any browser
- **Self-Contained**: All assets embedded
- **Fast Loading**: Everything cached in single request

### File Size Optimization
- **Target Size**: <2MB per game (including assets)
- **Phaser 3 Custom Build**: Only include needed features (~200KB)
- **Image Optimization**: WebP format, optimized sprites
- **Audio**: Compressed MP3/OGG, minimal sound effects
- **Code Minification**: Aggressive compression and tree-shaking

### Export Options
```typescript
export interface ExportOptions {
  format: 'html' | 'zip' | 'app'; // Future: PWA, Electron app
  quality: 'high' | 'medium' | 'low'; // Asset quality vs file size
  features: {
    audio: boolean;
    achievements: boolean;
    leaderboard: boolean; // Requires online
  };
  customization: {
    playerName: string;
    difficulty: number;
    levelCount: number;
  };
}
```

This lean architecture provides:
- ✅ Single HTML file exports with offline capability
- ✅ Lightweight games (<2MB) with full functionality  
- ✅ Easy customization through JSON content
- ✅ Separation of editor tools from user-facing games
- ✅ Modular content system for adding levels/themes
- ✅ Platform integration while maintaining game independence

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "PM: Create PRD from project brief", "status": "completed", "id": "1"}, {"content": "UX Expert: Create Front End Spec", "status": "completed", "id": "2"}, {"content": "Architect: Create Architecture from PRD + UX Spec", "status": "completed", "id": "3"}, {"content": "QA: Early Test Architecture Input on High-Risk Areas", "status": "completed", "id": "4"}, {"content": "PO: Run Master Checklist", "status": "completed", "id": "5"}, {"content": "PO: Document Sharding (if checklist passes)", "status": "completed", "id": "6"}, {"content": "Resolve multi-repo architecture decision for web platform + game modules", "status": "completed", "id": "7"}, {"content": "Create development structure setup guide", "status": "completed", "id": "8"}, {"content": "Document integration strategy between platform and games", "status": "completed", "id": "9"}, {"content": "Revise architecture for lean, exportable games with content separation", "status": "completed", "id": "10"}]