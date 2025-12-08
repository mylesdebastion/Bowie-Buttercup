# Project Documentation Index - SparkleClassic

**Generated:** 2025-11-29 via BMM document-project workflow
**Project:** SparkleClassic (HTML5 Platformer Game)
**Type:** Monolith - Game Project
**Architecture:** Modular JavaScript (ES2020)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 Quick Reference

**Project Type:** Game (HTML5 Canvas Platformer)
**Tech Stack:** Vanilla JavaScript + Vite + Vitest/Playwright
**Entry Point:** `src/main.js` or `src/index.js`
**Architecture Pattern:** Modular game architecture with centralized state

**Development Server:** `npm run dev` → `http://localhost:3000`
**Modular Game:** `http://localhost:3000/src/index.html`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 Generated Documentation (BMM Workflow)

### Core Technical Documentation

#### [Project Overview](./bmm-project-overview.md)
Executive summary, tech stack, project structure, current status

#### [Source Tree Analysis](./bmm-source-tree-analysis.md)
Complete directory structure, module dependencies, entry points, integration points

#### [State Management Patterns](./state-management-patterns.md)
StateManager architecture, event system, localStorage persistence, best practices

#### [UI Component Inventory](./ui-component-inventory.md)
All UI components (HUD, Mobile Controls, Settings, Pet Selector, Sprite Editor)

#### [Asset Inventory](./asset-inventory.md)
Game sprites, animations, assets organization, sprite configurations

#### [Development Guide](./bmm-development-guide.md)
Setup, common tasks, testing, debugging, code style, deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 Existing Project Documentation

### Planning & Requirements

#### [PRD - Web Platform](./planning/prd-web-platform.md)
Comprehensive product requirements for the SparkleClassic platform

#### [Frontend Specification](./planning/frontend-spec-web-platform.md)
UX/UI specification and design system

#### [Architecture - Web Platform](./planning/architecture-web-platform.md)
Technical architecture for the complete platform

#### [Product Brief](./bmad/pet-game-platform-brief.md)
Strategic product planning and vision

### Architecture Documentation

- [Component Architecture](./architecture/component-architecture.md)
- [Lean Game Architecture](./architecture/lean-game-architecture.md)
- [Data Flow](./architecture/data-flow.md)
- [Module Interfaces](./architecture/module-interfaces.md)
- [Platform-Game Integration](./architecture/platform-game-integration.md)
- [Repository Structure Guide](./architecture/repo-structure-guide.md)

### Implementation (Epics & Stories)

#### Game Development
- **Epics:** [docs/epics-game-dev/](./epics-game-dev/) (6 epics)
  - E001: Foundation
  - E002: Entity System
  - E003: Level System
  - E004: UI System
  - E005: Testing & QA
  - E006: Performance Optimization

- **Stories:** [docs/stories-game-dev/](./stories-game-dev/) (28 stories)

#### Web Platform
- **Epics:** [docs/epics-web-platform/](./epics-web-platform/) (5 epics)
  - E001: User Auth
  - E002: File Upload
  - IT001: Admin Dashboard
  - IT002: Game Template Engine
  - IT003: URL Management
  - IT004: Workflow Integration

- **Stories:** [docs/stories-web-platform/](./stories-web-platform/) (13 stories)

### Migration & QA

- [Migration Workflow](./migration/migration-workflow.md)
- [Feature Audit](./migration/feature-audit.md)
- [Test Design](./qa/assessments/modularization.test-design-20250118.md)
- [Early Test Architecture](./qa/assessments/modularization.early-test-architecture-20250118.md)

### Development Resources

- [CLAUDE.md](../CLAUDE.md) - Claude development guide and instructions
- [Sprite Configuration Docs](./sprite-configuration/)
- [BMad Method Artifacts](./bmad/)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 Getting Started for AI-Assisted Development

### For New Features (Brownfield PRD)

1. **Read Project Context:**
   - Start with [Project Overview](./bmm-project-overview.md)
   - Review [Source Tree Analysis](./bmm-source-tree-analysis.md)
   - Understand [State Management Patterns](./state-management-patterns.md)

2. **Check Existing Plans:**
   - Review [PRD](./planning/prd-web-platform.md) for requirements
   - Check [Epics](./epics-game-dev/) and [Epics](./epics-web-platform/) for planned work
   - Look for related [Stories](./stories-game-dev/) or [Stories](./stories-web-platform/)

3. **Understand Architecture:**
   - Review [Architecture docs](./architecture/)
   - Check [Component Architecture](./architecture/component-architecture.md)
   - Understand module boundaries

4. **Start Development:**
   - Follow [Development Guide](./bmm-development-guide.md)
   - Reference [UI Components](./ui-component-inventory.md) for reusable elements
   - Check [Asset Inventory](./asset-inventory.md) for available resources

### For Bug Fixes

1. **Locate Affected Code:**
   - Use [Source Tree Analysis](./bmm-source-tree-analysis.md) to find modules
   - Check [State Management](./state-management-patterns.md) if state-related

2. **Understand Context:**
   - Review related [Stories](./stories-game-dev/) for implementation history
   - Check [Test Design](./qa/assessments/) for test coverage

3. **Fix & Test:**
   - Follow [Development Guide](./bmm-development-guide.md) testing section
   - Verify against [PRD](./planning/prd-web-platform.md) requirements

### For Refactoring

1. **Analyze Current State:**
   - Review [Source Tree](./bmm-source-tree-analysis.md) for dependencies
   - Check [Architecture docs](./architecture/) for patterns
   - Understand [State Management](./state-management-patterns.md) integration

2. **Plan Changes:**
   - Reference [Component Architecture](./architecture/component-architecture.md)
   - Check [Module Interfaces](./architecture/module-interfaces.md)

3. **Execute Safely:**
   - Follow [Development Guide](./bmm-development-guide.md) best practices
   - Run full test suite after changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎮 Game-Specific Quick Links

### Core Systems
- **State Management:** [state-management-patterns.md](./state-management-patterns.md)
- **Entry Points:** `src/main.js`, `src/index.js`
- **Game Loop:** `src/core/game-loop.js`
- **Physics:** `src/entities/PhysicsSystem.js`

### Game Content
- **Levels:** `src/levels/Level1.js` through `Level5.js`
- **Entities:** `src/entities/` (Player, Dog, Mouse, Fireball, Items)
- **UI:** [ui-component-inventory.md](./ui-component-inventory.md)
- **Assets:** [asset-inventory.md](./asset-inventory.md)

### Sprite System
- **Configuration:** `src/configs/sprites/`
- **Animation:** `src/core/sprites/AnimationController.js`
- **Rendering:** `src/core/sprites/SpriteRenderer.js`
- **Assets:** [asset-inventory.md](./asset-inventory.md)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛠️ Development Workflow

### Daily Development

```bash
# Start development
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### File Organization

- **Source Code:** `src/` (modular structure)
- **Assets:** `public/` (sprites, images)
- **Tests:** Co-located `*.test.js` files
- **Docs:** `docs/` (you are here)
- **Configuration:** Root level config files

### Migration Note

**⚠️ File Lock Active:** `/index.html` is locked during migration
**✅ Active Development:** All work in `/src/` directory

See [Migration Workflow](./migration/migration-workflow.md) for details

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 Project Statistics

**Total Documentation Files:** 100+ markdown files
**Epics:** 15 (6 game dev + 5 web platform + 4 internal tools)
**Stories:** 41 (28 game dev + 13 web platform)
**Source Files:** 50+ JavaScript modules
**Assets:** 20+ sprite and image files
**Test Files:** Unit + Integration + E2E test suites

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 AI Development Best Practices

### When Starting New Work

1. **Load This Index First** - Get oriented
2. **Read Relevant Docs** - Understand context
3. **Check Existing Work** - Avoid duplication
4. **Follow Patterns** - Match existing architecture
5. **Test Thoroughly** - Run full test suite

### When Modifying Existing Code

1. **Read Source Tree** - Understand dependencies
2. **Check State Management** - Verify integration
3. **Review Tests** - Understand test coverage
4. **Update Docs** - Keep documentation current
5. **Run Tests** - Verify no regressions

### When Adding Features

1. **Check PRD** - Align with requirements
2. **Review Architecture** - Match patterns
3. **Plan Implementation** - Break into steps
4. **Write Tests First** - TDD when possible
5. **Document Changes** - Update relevant docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📞 Support & Resources

**Repository:** https://github.com/mylesdebastion/Bowie-Buttercup
**Framework:** BMad Method for AI-assisted development
**Main Guide:** [CLAUDE.md](../CLAUDE.md)

---

**Last Updated:** 2025-11-29
**Documentation Type:** Auto-generated via BMM document-project workflow
**Scan Level:** Exhaustive source analysis
**Status:** ✅ Complete - Ready for brownfield development
