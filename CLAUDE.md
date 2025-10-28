# SparkleClassic - Claude Development Guide

## Project Overview
AI-powered platform where users upload pet photos → generates pixel art → creates personalized platformer games at custom URLs (sparkleclassic.com/[petname]). Targeting $259k Year 1 revenue with $14.99-24.99 game purchases.

## Project Scale & Testing Philosophy

**Scale:** Small-to-medium creative coding project (solo developer/small team)

**Testing Approach:**
- **Manual testing** with human-in-the-loop verification (NOT automated test suites)
- Browser DevTools for debugging and performance monitoring
- Visual/interactive inspection of module behavior across views
- Git history + development records as implementation verification

**What We DON'T Use:**
- ❌ Automated unit test frameworks (Vitest, Jest, etc.)
- ❌ Integration test suites or E2E test frameworks
- ❌ Code coverage metrics or test coverage requirements
- ❌ CI/CD test pipelines
- ❌ Formal QA department sign-offs

**Exception - Playwright Skill for Visual Verification:**
- ✅ **ONLY when explicitly requested by user**: Use the `playwright-skill` for automated visual regression testing
- Use case: Comparing visual output between modular and monolithic game versions
- This is an on-demand tool, NOT part of the standard development workflow
- Visual tests are run at user request, not automatically for every feature

**BMAD Workflow Adaptation:**
- Architecture documents include **"Manual Verification Steps"** not "Test Suites"
- Stories focus on **"Verification Checklist"** not "Test Coverage %"
- Dev records document **manual testing performed**, not tests written
- "Testing Strategy" sections describe **browser-based verification workflows**

**Quality Assurance:**
- Developer manually tests features in browser during development
- Interactive behavior verified by direct interaction
- Responsive design tested via browser DevTools (mobile/tablet/desktop)
- Hardware integration (if applicable) tested with physical devices when available

## Current Status: Migration Phase - Controlled Transition
✅ **Planning Complete**: PRD, Architecture, Frontend Spec validated  
🔄 **Active Phase**: Migrating monolithic game to modular structure  
🔒 **File Lock Active**: `/index.html` locked, development in `/src/` only  
📁 **Migration Docs**: See `/docs/migration/` for workflow and progress

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
- **Migration Workflow**: `/docs/migration/migration-workflow.md` (current active workflow)
- **Feature Audit**: `/docs/migration/feature-audit.md` (migration progress tracking)  
- **Epic Stories**: `/docs/stories-web-platform/` and `/docs/stories-game-dev/`
- **QA Guidelines**: `/docs/qa/` (testing strategies and risk assessments)
- **BMad Methodology**: `/docs/bmad/` (AI-driven development process)

## Quick Start Commands

### Current Migration Commands
```bash
# Setup migration workflow (run once)
./setup-hooks.sh              # Configure git hooks for file lock

# Development (modular structure only)
open src/index.html            # Modular game development
code src/                      # Work in modular structure

# Migration tooling
node scripts/migration/feature-extractor.js     # Extract features

# Emergency overrides (use sparingly)
git commit --no-verify        # Bypass file lock for emergencies
MIGRATION=true git commit      # Override for migration work
```

### Platform Development Commands
```bash
# Start platform development
pnpm dev --filter=web          # Next.js platform app
pnpm dev --filter=api          # Node.js backend API

# Start game development
pnpm dev --filter=pet-platformer  # Game template development

# Code quality checks
pnpm lint                      # Run ESLint
pnpm format                    # Run Prettier
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

## BMaD Command Enforcement - MANDATORY PROCESS

**🚨 CRITICAL: Prevent False Completion Claims**

### **MANDATORY BMaD Commands at Each Transition:**

**Epic Start:**
```bash
/bmad epic-start E001 --capture-baseline
```

**Progress Checkpoints:**
```bash
/bmad checkpoint --visual-test
/bmad validate-progress --compare-baseline
```

**Before ANY Completion Claims:**
```bash
/bmad qa-gate --epic E001 --require-visual-match
/bmad validate-completion --epic E001
```

**Documentation Updates (ONLY after passing validation):**
```bash
/bmad mark-complete E001
```

### **🔒 QA Gate Rules:**
1. **NEVER** update completion docs without `/bmad qa-gate` passing
2. **ALWAYS** run visual verification before claiming "complete"
3. **MANDATORY** baseline comparison for each epic
4. **BLOCK** progression if visual verification fails

### **Visual Verification Command:**
```bash
/bmad visual-verify
```
- Captures modular version screenshot
- Compares to monolithic baseline
- **FAILS epic if no visual match**
- Required before any completion claims
- **Note**: Can use `playwright-skill` for automated visual comparison when explicitly requested by user

### When Working on Web Platform
- Reference `/docs/planning/prd-web-platform.md` for requirements
- Follow architecture in `/docs/planning/architecture-web-platform.md`
- Check epic breakdown in `/docs/epics-web-platform/epic-e00X-*.md`
- Use stories in `/docs/stories-web-platform/` for implementation details

### 🚨 Current Migration Workflow (ACTIVE)
**ALL GAME DEVELOPMENT MUST USE MODULAR STRUCTURE**

#### File Lock Status
- ❌ `/index.html` is **LOCKED** - no direct modifications allowed
- ✅ `/src/` structure is the **ONLY** development target
- 🔧 Use migration tools for extracting features from monolithic file

#### Daily Development Process
1. **New Features**: Implement in `/src/` modular structure only
2. **Bug Fixes**: Fix in `/src/` if possible, emergency override for `/index.html`
3. **Migration Work**: Use `MIGRATION=true git commit` for moving features
4. **Verification**: Manually test in browser after changes

#### Migration Guidelines
- Reference `/docs/migration/migration-workflow.md` for complete workflow
- Use feature extraction tools in `/scripts/migration/`
- Follow modular architecture patterns in `/src/`
- Maintain feature parity during transition

### When Working on Web Platform
- Reference `/docs/planning/prd-web-platform.md` for requirements
- Follow architecture in `/docs/planning/architecture-web-platform.md`
- Check epic breakdown in `/docs/epics-web-platform/epic-e00X-*.md`
- Use stories in `/docs/stories-web-platform/` for implementation details

### Code Quality Standards
- TypeScript strict mode for all new code
- Manual verification in browser for functionality testing
- Browser DevTools for debugging and performance monitoring
- ESLint + Prettier for code formatting
- Git workflow with manual code review before merging

## Critical Success Factors
1. **Speed to Market**: Manual pixel art for first 20 users to validate market
2. **Lean Games**: Single file exports, offline-capable, <2MB size
3. **User Experience**: Seamless upload → game generation → play flow
4. **Business Model**: Clear path to $14.99-24.99 revenue per user

---

## Migration Progress Tracking

### Week 1 Status (Jan 26 - Feb 2, 2025)
- ✅ File lock implemented and active
- ✅ Migration tooling created
- ✅ Feature audit completed
- 🔄 Core system extraction in progress

### Important Files During Migration
- **Migration Status**: `/docs/migration/feature-audit.md`
- **Daily Workflow**: `/docs/migration/migration-workflow.md`
- **Hook Setup**: `./setup-hooks.sh`
- **Browser Verification**: Manual testing in development server

---
*Last Updated: 2025-01-26*  
*Migration Phase Active - See `/docs/migration/` for current workflow*