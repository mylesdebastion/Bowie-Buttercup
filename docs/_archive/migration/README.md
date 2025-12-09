# Archived: Migration Documentation

**Archived:** 2025-12-08
**Reason:** Migration workflow was part of the modularization approach that was deprioritized in favor of MVP fast-track

## Context

These docs were created for the `feature/bmad-modularization` branch effort to refactor the monolithic `index.html` into modular ES6 modules.

**Strategic decision (2025-11-29 brainstorming session):**
- Pivoted to ship MVP with monolithic game + vanity URLs
- Modularization work frozen on `feature/bmad-modularization` branch
- MVP validation prioritized over architectural refactoring

## Files

- `migration-workflow.md` - Daily workflow for controlled migration
- `feature-audit.md` - Feature parity tracking between monolithic and modular

## Current Approach

Instead of migration, we use **dynamic config loading**:
- Single `index.html` serves all pet games
- Config files at `configs/<petname>.json`
- No modular refactoring needed for MVP

See `CLAUDE.md` for current development workflow.
