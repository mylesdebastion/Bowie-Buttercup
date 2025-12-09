# Project Overview - SparkleClassic

**Generated:** 2025-11-29
**Project Type:** HTML5 Platformer Game
**Architecture:** Modular JavaScript (ES2020)

## Executive Summary

SparkleClassic is an AI-powered platform where users upload pet photos to generate personalized pixel art platformer games hosted at custom vanity URLs (spark leclassic.com/[petname]).

**Business Model:** $14.99-24.99 game purchases
**Year 1 Target:** $259k revenue
**Strategy:** Manual pixel art for first 20 users (fast market validation)

## Project Structure

**Repository Type:** Monolith
**Primary Language:** JavaScript (ES2020)
**Architecture Pattern:** Modular game architecture

## Technology Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| Language | JavaScript ES2020 | Core language |
| Build Tool | Vite 5.0 | Fast dev server & bundler |
| Testing | Vitest + Playwright | Unit + E2E testing |
| Rendering | HTML5 Canvas | 2D game rendering |
| State Management | Custom (StateManager) | Centralized state |
| Architecture | Modular ES6 | Component-based |

## Quick Reference

### Tech Stack
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Build:** Vite 5.0 with Rollup
- **Testing:** Vitest (unit), Playwright (E2E)
- **Minification:** Terser
- **Linting:** ESLint (standard config)

### Entry Points
- `src/main.js` - Main game (vanity URL support)
- `src/index.js` - Alternative with Pet Selector UI

### Architecture Type
- **Pattern:** Modular game architecture
- **Style:** Entity-Component-like
- **State:** Centralized StateManager with pub/sub
- **Rendering:** Canvas 2D with sprite system

## Repository Structure

```
SparkleClassic/
├── src/           # Modular game source
├── docs/          # Extensive documentation
├── public/        # Game assets
└── .bmad/         # BMad Method framework
```

## Current Status

**Phase:** Migration & Enhancement
**Active Work:** Migrating monolithic game to modular architecture
**Migration Status:** Core systems complete, adding features

### Completed
- ✅ Core game engine (modular)
- ✅ State management system
- ✅ Sprite system with animation
- ✅ Entity system (player, enemies, items)
- ✅ Level system (5 levels)
- ✅ UI components (HUD, Settings, Pet Selector)
- ✅ Performance monitoring
- ✅ Vanity URL routing

### In Progress
- 🔄 Platform development (Next.js + API)
- 🔄 Additional game features
- 🔄 AI pixel art generation (post-MVP)

## Development Phases

### Phase 1: Web Platform Foundation (4-6 weeks)
1. E001-User-Auth - Authentication system
2. E002-File-Upload - Photo upload
3. E003-Game-Generation - Generate games
4. E004-User-Dashboard - User management

### Phase 2: Game Engine & Integration (3-4 weeks)
5. E005-Game-Template - Platformer template
6. E006-Platform-Integration - Embed games
7. E007-Content-Management - Levels/themes

### Phase 3: Business Features (2-3 weeks)
8. E008-Payment-Processing - Stripe integration

## Key Features

### Game Features
- 5-level platformer campaign
- Pet character customization (Bowie Cat, Buttercup Cat)
- Sprite animation system
- Physics engine with platforming mechanics
- Performance monitoring
- Mobile touch controls
- Accessibility settings

### Platform Features (Planned)
- Vanity URL games (sparkleclassic.com/[petname])
- User authentication
- Photo upload & processing
- Game generation pipeline
- Payment processing

## Documentation

### Planning
- PRD: `docs/planning/prd-web-platform.md`
- Architecture: `docs/planning/architecture-web-platform.md`
- Frontend Spec: `docs/planning/frontend-spec-web-platform.md`

### Implementation
- Epics: `docs/epics-web-platform/`, `docs/epics-game-dev/`
- Stories: `docs/stories-web-platform/`, `docs/stories-game-dev/`
- Migration: `docs/migration/`

### Technical
- State Management: `docs/state-management-patterns.md`
- UI Components: `docs/ui-component-inventory.md`
- Assets: `docs/asset-inventory.md`
- Source Tree: `docs/bmm-source-tree-analysis.md`

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Quick Start
```bash
npm install
npm run dev        # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Development
- Dev Server: `http://localhost:3000`
- Modular Game: `http://localhost:3000/src/index.html`

## Architecture Highlights

### Modular Design
- Clean separation of concerns
- ES6 module system
- Singleton pattern for managers
- Factory pattern for entities
- Pub/sub for state changes

### Performance
- Fixed timestep physics
- Request AnimationFrame loop
- Sprite batching
- Memory management
- Performance monitoring

### Accessibility
- High contrast mode
- Reduced motion
- Customizable controls
- Scalable UI

## Links to Detailed Docs

- **Architecture:** See `docs/architecture/`
- **Planning:** See `docs/planning/`
- **Migration:** See `docs/migration/`
- **QA:** See `docs/qa/`

## Contact & Support

**Repository:** https://github.com/mylesdebastion/Bowie-Buttercup
**Framework:** BMad Method for AI-assisted development
