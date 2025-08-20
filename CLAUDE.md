# PetPixel Games Platform - Claude Development Guide

## Project Overview
AI-powered platform where users upload pet photos → generates pixel art → creates personalized platformer games. Targeting $259k Year 1 revenue with $14.99-24.99 game purchases.

## Current Status: Post-Planning, Pre-Implementation
✅ **Planning Complete**: PRD, Architecture, Frontend Spec validated  
🎯 **Next Phase**: Begin web platform development (manual pixel art for first 20 users)  
📁 **All Planning**: See `/docs/planning/` for complete artifacts

## Architecture Decision
**Lean Monorepo → Multi-Repo Evolution**
- Start: Single repo for rapid MVP development
- Games: Lightweight, single HTML file exports (<2MB, offline-capable)
- Content: JSON-driven levels/themes separate from game code
- Platform: Next.js web app + Node.js API + PostgreSQL

## Development Priority Order
1. **Web Platform Core** (apps/web + services/api) - User auth, basic UI, file uploads
2. **Game Template Foundation** (game-templates/pet-platformer) - Lean game engine
3. **Platform-Game Integration** - Generate personalized games
4. **Content Pipeline** - Level/theme management (manual pixel art initially)

## Key Documentation Locations

### Planning & Requirements
- **Master PRD**: `/docs/planning/prd-web-platform.md` (comprehensive requirements)
- **Architecture**: `/docs/planning/architecture-web-platform.md` (complete technical design)
- **Frontend Spec**: `/docs/planning/frontend-spec-web-platform.md` (UX/UI specification)

### Implementation Guidance
- **Web Platform Epics**: `/docs/epics-web-platform/` (8 epics for platform development)
- **Game Development Epics**: `/docs/epics-game-dev/` (6 epics for game engine)
- **Repository Structure**: `/docs/architecture/repo-structure-guide.md`
- **Integration Strategy**: `/docs/architecture/platform-game-integration.md`

### Development Workflow
- **Epic Stories**: `/docs/stories-web-platform/` and `/docs/stories-game-dev/`
- **QA Guidelines**: `/docs/qa/` (testing strategies and risk assessments)
- **BMad Methodology**: `/docs/bmad/` (AI-driven development process)

## Quick Start Commands
```bash
# Start platform development
pnpm dev --filter=web          # Next.js platform app
pnpm dev --filter=api          # Node.js backend API

# Start game development  
pnpm dev --filter=pet-platformer  # Game template development

# Run tests
pnpm test                      # All tests
pnpm test --filter=web         # Platform tests only
```

## Epic Development Order

### Phase 1: Web Platform Foundation (4-6 weeks)
1. **E001-User-Auth**: Authentication system and user management
2. **E002-File-Upload**: Photo upload with validation and storage
3. **E003-Game-Generation**: Generate personalized games (manual pixel art)
4. **E004-User-Dashboard**: User management and game library

### Phase 2: Game Engine & Integration (3-4 weeks)  
5. **E005-Game-Template**: Lean platformer game template
6. **E006-Platform-Integration**: Embed games in platform
7. **E007-Content-Management**: Level/theme management system

### Phase 3: Business Features (2-3 weeks)
8. **E008-Payment-Processing**: Stripe integration and purchase flow

### Future Phases
- **AI Image Processing**: Automated pixel art generation (post-MVP)
- **Multi-Game Support**: Additional game templates
- **Social Features**: Sharing, leaderboards, community

## Development Guidelines

### When Working on Web Platform
- Reference `/docs/planning/prd-web-platform.md` for requirements
- Follow architecture in `/docs/planning/architecture-web-platform.md`
- Check epic breakdown in `/docs/epics-web-platform/epic-e00X-*.md`
- Use stories in `/docs/stories-web-platform/` for implementation details

### When Working on Game Development
- Reference game-specific epics in `/docs/epics-game-dev/`
- Follow lean architecture in `/docs/architecture/lean-game-architecture.md`
- Focus on single HTML file export capability
- Ensure offline functionality and <2MB file size

### Code Quality Standards
- TypeScript strict mode for all new code
- Jest tests for business logic
- Playwright E2E tests for critical user flows
- ESLint + Prettier for code formatting
- Automated CI/CD with GitHub Actions

## Critical Success Factors
1. **Speed to Market**: Manual pixel art for first 20 users to validate market
2. **Lean Games**: Single file exports, offline-capable, <2MB size
3. **User Experience**: Seamless upload → game generation → play flow
4. **Business Model**: Clear path to $14.99-24.99 revenue per user

---
*Last Updated: 2025-01-20*  
*For detailed technical information, see planning documents in `/docs/planning/`*