# Resume Guide: MVP Branch Setup and Execution

**Created:** 2025-11-29
**Status:** Ready to execute
**Current Branch:** feature/bmad-modularization

---

## 🎯 Context Summary

### What Happened

During brainstorming session (2025-11-29), we discovered a critical insight:
- **Original plan:** Spend weeks refactoring to modular architecture, then build full platform
- **New insight:** Ship monolithic game + simple vanity URL in DAYS to validate business model
- **Decision:** Pursue both paths in parallel on separate branches

### Strategic Pivot

**OLD Strategy (15 epics, full platform):**
- Modular refactored game
- Full web app (Next.js + Stripe + user auth)
- "Manual pixel art" (assumed hand-drawn)

**NEW Strategy (3 priorities, fast MVP):**
- Monolithic game (already works on main branch)
- Simple vanity URL delivery (config injection)
- Etsy for payments (no Stripe needed)
- AI-assisted sprite workflow (ChatGPT/Google Nano)

### Branch Strategy

**Branch A: `feature/bmad-modularization`**
- Status: FROZEN (don't touch until after MVP validation)
- Contains: Modular refactor work, full platform docs, 15 epics
- Purpose: Full platform vision for post-validation

**Branch B: `feature/vanity-url-mvp`**
- Status: TO BE CREATED (next step)
- Contains: Monolithic game, MVP docs, 3 epics
- Purpose: Fast MVP to validate business model

**Goal:** Each branch has self-contained planning docs so AI agents get correct context per branch.

---

## 📋 Next Steps to Execute

### Step 1: Create MVP Branch (5 min)

```bash
# Ensure you're starting from main
git checkout main
git pull origin main

# Create new MVP branch
git checkout -b feature/vanity-url-mvp

# Verify you're on the new branch
git branch --show-current
# Should output: feature/vanity-url-mvp
```

**What this gives you:**
- Working monolithic game (index.html from main branch)
- Clean slate for MVP-specific docs

---

### Step 2: Cherry-Pick BMad v6 Framework (10 min)

```bash
# Cherry-pick the .bmad folder from modularization branch
git checkout feature/bmad-modularization -- .bmad

# Cherry-pick BMM documentation
git checkout feature/bmad-modularization -- docs/bmm-index.md
git checkout feature/bmad-modularization -- docs/bmm-project-overview.md
git checkout feature/bmad-modularization -- docs/bmm-source-tree-analysis.md
git checkout feature/bmad-modularization -- docs/bmm-development-guide.md
git checkout feature/bmad-modularization -- docs/state-management-patterns.md
git checkout feature/bmad-modularization -- docs/ui-component-inventory.md
git checkout feature/bmad-modularization -- docs/asset-inventory.md

# Cherry-pick brainstorming session results
git checkout feature/bmad-modularization -- docs/bmm-brainstorming-session-2025-11-29.md

# Cherry-pick workflow status
git checkout feature/bmad-modularization -- docs/bmm-workflow-status.yaml

# Commit the cherry-picked files
git add .bmad docs/bmm-*
git commit -m "Cherry-pick BMad v6 framework and documentation from modularization branch"
```

**What this gives you:**
- BMad v6 framework on MVP branch
- Brainstorming session results as reference
- Workflow tracking capability

---

### Step 3: Create MVP Planning Documents (30-45 min)

**Use the brainstorming session as source material:**
- Read: `docs/bmm-brainstorming-session-2025-11-29.md`
- Extract: Key insights, 3 priorities, MVP strategy

**Documents to create:**

#### A. MVP PRD: `docs/planning/prd-mvp-fast-track.md`

**Source sections from brainstorming doc:**
- Theme 1: Ship Fast, Validate Reality
- Theme 2: The Workflow is Already AI-Assisted
- Business Model Insights
- The Real MVP Model (Etsy + Vanity URL)

**Structure:**
```markdown
# Product Requirements Document - MVP Fast Track

## Vision
Validate SparkleClassic business model with minimal viable product.

## MVP Scope (NOT Full Platform)
- Monolithic HTML5 game (already working on main branch)
- Simple vanity URL delivery (sparkleclassic.com/petname)
- Etsy for payments and discovery
- AI-assisted sprite generation (ChatGPT/Google Nano)
- Manual backend workflow (no customer-facing app)

## Success Criteria
- ONE stranger pays $28.99 on Etsy
- AI sprite workflow averages 15-20 min per game
- Vanity URL delivery works reliably

## Out of Scope for MVP
- Modular refactored game
- Stripe integration
- User authentication
- Web app interface
- 15 platform epics (saved for post-validation)

## Reference
See: docs/bmm-brainstorming-session-2025-11-29.md
```

#### B. MVP Architecture: `docs/planning/architecture-mvp-monolithic.md`

**Source sections from brainstorming doc:**
- The Vanity URL Shortcut (lines 310-316)
- Technical Insights

**Structure:**
```markdown
# Architecture Document - MVP Monolithic Approach

## Technical Strategy
Use existing monolithic game with minimal modifications for vanity URL support.

## Approach
1. Config injection at top of index.html
2. Replace hardcoded sprite paths (lines 3375-3411)
3. Simple deployment (static files or basic server)

## Architecture Decisions
- NO refactoring required
- NO modular structure needed
- Deploy as-is with per-customer configuration

## Deployment Options
- Option A: Static files (Vercel/Netlify)
- Option B: Basic Node.js server
- Option C: Cloudflare Pages

## Reference
See: docs/bmm-brainstorming-session-2025-11-29.md (lines 307-316)
```

#### C. Create 3 MVP Epics in `docs/epics-mvp/`

**Epic 1: `epic-1-ai-workflow-validation.md`**
- Based on: Priority #1 from brainstorming doc
- Stories: AI sprite testing, timing validation, quality bar definition

**Epic 2: `epic-2-vanity-url-delivery.md`**
- Based on: Priority #2 from brainstorming doc
- Stories: Config injection, deployment setup, testing

**Epic 3: `epic-3-etsy-market-validation.md`**
- Based on: Priority #3 from brainstorming doc
- Stories: Etsy shop setup, listing creation, ad campaign, first sale

---

### Step 4: Update Workflow Status (5 min)

Edit: `docs/bmm-workflow-status.yaml`

```yaml
# Add note at top of file:
# NOTE: This branch (feature/vanity-url-mvp) uses MVP-specific planning docs
# - PRD: docs/planning/prd-mvp-fast-track.md
# - Architecture: docs/planning/architecture-mvp-monolithic.md
# - Epics: docs/epics-mvp/ (3 epics only)

# Update implementation-readiness status to point to MVP docs
  - id: implementation-readiness
    agent: architect
    command: /bmad:bmm:workflows:implementation-readiness
    phase: 2
    status: required
    note: "Validate MVP PRD + Architecture + 3 Epics alignment (fast-track strategy)"
```

---

### Step 5: Commit and Push (5 min)

```bash
# Stage all MVP planning docs
git add docs/planning/prd-mvp-fast-track.md
git add docs/planning/architecture-mvp-monolithic.md
git add docs/epics-mvp/
git add docs/bmm-workflow-status.yaml

# Commit
git commit -m "Add MVP fast-track planning documents

- Created MVP PRD focusing on monolithic + vanity URL approach
- Created MVP architecture for config injection strategy
- Created 3 epics matching brainstorming priorities
- Updated workflow status to reference MVP docs

Based on brainstorming session insights (2025-11-29)
Separate from full platform vision on modularization branch"

# Push to create remote branch
git push -u origin feature/vanity-url-mvp
```

---

## 📚 Key Reference Documents

**On this branch (feature/bmad-modularization):**
- Brainstorming session: `docs/bmm-brainstorming-session-2025-11-29.md`
  - Read sections: "Top 3 Priority Ideas" (lines 560-651)
  - Read sections: "Key Insights" (lines 274-334, 378-426)

**To be created on MVP branch:**
- MVP PRD: `docs/planning/prd-mvp-fast-track.md`
- MVP Architecture: `docs/planning/architecture-mvp-monolithic.md`
- MVP Epics: `docs/epics-mvp/epic-{1,2,3}-*.md`

---

## 🎯 After Setup Complete

**Next workflow to run:**
```bash
/bmad:bmm:workflows:implementation-readiness
```

**Purpose:** Validate that MVP PRD + Architecture + 3 Epics are aligned.

**Expected outcome:** Should pass because all docs are custom-built for fast-track MVP strategy.

**Then:**
```bash
/bmad:bmm:workflows:sprint-planning
```

**Purpose:** Create sprint status tracking for the 3 MVP epics.

---

## 🔄 Switching Between Strategies

**To work on MVP (fast validation):**
```bash
git checkout feature/vanity-url-mvp
# AI sees: MVP PRD, 3 epics, monolithic approach
```

**To work on full platform (post-validation):**
```bash
git checkout feature/bmad-modularization
# AI sees: Full PRD, 15 epics, modular architecture
```

**Clean separation = no AI confusion!**

---

## ⚠️ Important Notes

1. **DON'T merge modularization into MVP branch** - they're parallel strategies
2. **DON'T touch modularization branch** until MVP validates business model
3. **DO keep branches in sync with docs** - each branch = self-contained context
4. **DO reference brainstorming doc** when creating MVP planning docs

---

## 🚀 Success Criteria

**Setup complete when:**
- [ ] MVP branch created off main
- [ ] BMad v6 framework cherry-picked
- [ ] 3 MVP planning docs created (PRD, Architecture, Epics)
- [ ] Workflow status updated
- [ ] All changes committed and pushed
- [ ] Can run `/bmad:bmm:workflows:implementation-readiness` successfully

**Then you're ready to execute Priority #1: AI Workflow Testing with Aurelia!**

---

**Questions?** Reference the brainstorming doc or run `/bmad:bmm:workflows:workflow-status` to see current state.
