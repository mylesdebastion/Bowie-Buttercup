# Brownfield to Greenfield Migration Plan

## Current State Analysis
- **Monolithic Structure**: 2000+ line single HTML file
- **Working Features**: 5 playable levels, sprite editor, physics system
- **Technical Debt**: Tightly coupled code, no modularity

## Migration Strategy

### Phase 1: Setup BMad Structure (Current)
✅ Created PRD from game design doc
✅ Created Architecture document
- Install BMad Method
- Configure for existing codebase

### Phase 2: Code Extraction
Break down `index.html` into modules:

1. **Core Systems** (Priority 1)
   - Extract Player class → `src/entities/Player.js`
   - Extract Game class → `src/engine/Game.js`
   - Extract Physics → `src/engine/Physics.js`

2. **Entities** (Priority 2)
   - Extract Fireball → `src/entities/Fireball.js`
   - Extract Dog → `src/entities/Dog.js`
   - Extract Mouse → `src/entities/Mouse.js`
   - Extract Particle → `src/entities/Particle.js`

3. **Level System** (Priority 3)
   - Extract level data → `src/levels/levelData.js`
   - Create LevelManager → `src/levels/LevelManager.js`

4. **UI Components** (Priority 4)
   - Extract sprite editor → `src/ui/SpriteEditor.js`
   - Extract controls panel → `src/ui/ControlsPanel.js`
   - Extract HUD → `src/ui/HUD.js`

### Phase 3: Build System
```bash
# Project structure
cat-platformer/
├── .bmad-core/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── epics/
│   └── stories/
├── src/
│   ├── index.js         # Entry point
│   ├── engine/
│   ├── entities/
│   ├── levels/
│   ├── sprites/
│   └── ui/
├── assets/
│   └── sprites/
├── dist/
│   └── index.html       # Built game
├── package.json
└── vite.config.js
```

### Phase 4: Testing & Validation
- Ensure all 5 levels work
- Verify sprite editor functionality
- Test physics parameters
- Validate save/load features

## BMad Workflow Integration

### Story Example
```markdown
# Story: Refactor Player Class
As a developer, I want to extract the Player class into a module
so that it follows single responsibility principle.

## Acceptance Criteria
- [ ] Player class in separate file
- [ ] Proper ES6 module exports
- [ ] All player methods preserved
- [ ] Animation states working
- [ ] Physics interactions maintained
```

### Development Cycle
1. **SM**: Draft refactoring story
2. **QA**: Risk assessment for breaking changes
3. **Dev**: Extract and modularize code
4. **QA**: Test all player interactions
5. **Commit**: With proper message format

## Configuration Files

### package.json
```json
{
  "name": "cat-platformer",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true
      }
    }
  }
});
```

## Preservation Strategy
- Keep original `index.html` as `index-legacy.html`
- Maintain all game mechanics exactly
- Preserve sprite configurations
- Keep localStorage keys compatible

## Success Criteria
- [ ] All 5 levels playable
- [ ] Sprite editor fully functional
- [ ] No regression in physics
- [ ] Improved code maintainability
- [ ] BMad workflow integrated
- [ ] Tests passing