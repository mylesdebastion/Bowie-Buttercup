# Game Development Epics - PetPixel Games

This directory contains all epics for the lean game template development.

## Epic Overview

### Phase 2: Game Engine Foundation (Weeks 7-10)
- **[E001: Foundation](./epic-e001-foundation.md)** - Game build system and core architecture
- **[E002: Entity System](./epic-e002-entity-system.md)** - Player, enemies, and physics
- **[E003: Level System](./epic-e003-level-system.md)** - Level loading and progression
- **[E004: UI System](./epic-e004-ui-system.md)** - Game interface and mobile controls

### Phase 3: Game Polish & Optimization (Weeks 11-12)
- **[E005: Testing & QA](./epic-e005-testing-qa.md)** - Comprehensive testing framework
- **[E006: Performance Optimization](./epic-e006-performance-optimization.md)** - Bundle size and runtime optimization

## Game Architecture Strategy

**Target**: Lean, single HTML file exports (<2MB, offline-capable)
- **Content-Driven**: JSON levels, themes, and customization
- **Template-Based**: Reusable game engine with dynamic content
- **Platform Integration**: Seamless embedding in web platform

## Development Priority

1. **Prerequisites**: Complete web platform E001-E004 first
2. **Foundation**: Start with game template architecture
3. **Integration**: Connect with platform game generation system
4. **Polish**: Optimize for size and performance

## Success Criteria

- Single HTML file exports under 2MB
- Offline functionality 
- 60 FPS performance on target devices
- JSON-driven content system
- Platform integration via iframe + postMessage

## Related Documentation

- **Platform Integration**: `/docs/architecture/platform-game-integration.md`
- **Lean Architecture**: `/docs/architecture/lean-game-architecture.md`
- **Stories**: `/docs/stories-game-dev-legacy/` (detailed implementation stories)
- **Web Platform**: `/docs/epics-web-platform/` (prerequisite epics)