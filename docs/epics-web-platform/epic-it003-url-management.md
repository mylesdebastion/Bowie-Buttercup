# Epic IT003: URL Management & Hosting

**Epic ID**: IT003
**Epic Name**: Custom Game Hosting with Multi-Level Customization
**Priority**: P0 (Critical - Core Feature)
**Estimated Effort**: 2 weeks (increased scope)
**Sprint Allocation**: Weeks 6-7 of Phase 2
**Dependencies**: IT001 (Admin Dashboard), IT002 (Game Template Engine)

## Epic Description

Implement comprehensive customization system for hosting personalized pet games at memorable URLs (e.g., sparkleclassic.com/fluffyadventures, sparkleclassic.com/maxsleeps, sparkleclassic.com/bowieruns). Each game uses a shared template with custom sprites, items, settings, and levels loaded via JSON configuration files.

**Internal Tool Focus**: Creating fully customized games for friends/colleagues with personalized characters, unique items, custom difficulty, and tailored level layouts.

**Key Features**:
- ✅ Public access (no auth required)
- ✅ Shared game template (ONE 2MB file, not duplicated)
- ✅ JSON-based customization system (sprites, items, settings, levels)
- ✅ Vercel auto-deployment (push config + sprites → auto-deploy)
- ✅ Scalable: 100 games = ~3MB vs ~200MB duplication

**Customization Layers**:
1. **Character**: Custom pet sprite and visual properties
2. **Items**: Unique collectibles, power-ups, obstacles per game
3. **Settings**: Difficulty, theme, audio, controls
4. **Levels**: Custom layouts, platforms, enemies, win conditions

## Business Value

- **Brand Recognition**: Memorable URLs increase sharing and return visits
- **Professional Appearance**: Custom URLs enhance perceived value vs generic links
- **Marketing Advantage**: Easy-to-remember URLs for word-of-mouth marketing
- **Analytics Insights**: Track game engagement and customer behavior
- **Scalability**: Automated deployment supports unlimited game hosting
- **Customer Satisfaction**: Personalized URLs create emotional connection

## User Stories

### **Core URL Management Stories**

### Story IT003.1: Simple URL Input & Availability Check
**As a** game creator
**I want** to enter a simple URL slug and check if it's available
**So that** I can reserve memorable URLs for my friends' games

**Acceptance Criteria:**
- Manual URL input field in admin dashboard (e.g., "bowieruns")
- Real-time availability checking as user types
- Clear indication of available vs. taken URLs
- URL sanitization (lowercase, remove spaces/special chars)
- Suggestions shown if URL is taken (e.g., "bowieruns" → try "bowieadventures", "bowieleaps")
- No complex generation strategies - just simple collision suggestions
- URL validation: alphanumeric only, 3-50 characters

**Technical Requirements:**
- Simple database lookup for URL availability
- Basic slug sanitization (lowercase, alphanumeric)
- Collision handling with manual suggestions
- Real-time validation on input change

### Story IT003.2: URL Reservation System (Simplified)
**As a** game creator
**I want** to reserve a URL when I start a project
**So that** it stays available while I create the game

**Acceptance Criteria:**
- URL reserved automatically when project is created
- Reservation lasts until game is deployed or project deleted
- Visual indication of reserved status in admin dashboard
- Manual URL change option if needed before deployment
- Simple list view of all reserved vs. active URLs

**Technical Requirements:**
- Database field: url_slug on projects table
- Unique constraint to prevent duplicates
- Status tracking: reserved (project active) vs. deployed (game live)
- Simple CRUD operations for URL management

### Story IT003.3: Sprite Upload & Deployment (Efficient)
**As a** game creator
**I want** to upload just the custom sprite for each pet
**So that** new games go live instantly without duplicating the entire game

**Acceptance Criteria:**
- One-click "Deploy Game" button in admin dashboard
- Upload sprite PNG to /public/game/sprites/[petname].png (10KB)
- Game template stays shared (ONE file, not duplicated)
- Deployment status tracking (pending → deploying → live)
- Success/failure notifications
- No need to redeploy for bug fixes (all games use same template)

**Technical Requirements:**
- File upload: sprite PNG to /public/game/sprites/
- Database: store sprite URL and pet name
- NO file duplication - shared game template approach
- Git automation: commit sprite only (~10KB vs ~2MB per game)
- Vercel webhook integration for deployment status
- Landing page passes sprite URL via query param to game iframe

### Story IT003.4: Game Landing Pages (Shared Template)
**As a** friend/colleague
**I want** a clean landing page when I visit my custom game URL
**So that** I can play the game with my custom pet character

**Acceptance Criteria:**
- Simple landing page at sparkleclassic.com/[petname]
- Pet name displayed prominently as title
- Game loads in iframe with custom sprite via query params
- Landing page passes sprite URL to shared game template
- Basic instructions: "Use arrow keys to move, space to jump"
- Mobile-responsive (works on phones/tablets)
- Clean, minimal design - focus on gameplay

**Technical Requirements:**
- Next.js dynamic route: /[slug]/page.tsx
- Load project metadata from database by slug
- Embed game: `<iframe src="/game?pet=Bowie&sprite=bowie.png" />`
- Shared game template receives query params and loads custom sprite
- Responsive CSS with mobile-first design
- Basic meta tags for social sharing
- Simple analytics: page view tracking

**Example Flow:**
1. User visits: sparkleclassic.com/bowieruns
2. Next.js loads /[slug]/page.tsx with slug="bowieruns"
3. Database query: `SELECT * FROM projects WHERE url_slug='bowieruns'`
4. Returns: { petName: "Bowie", spriteUrl: "bowie.png" }
5. Render iframe: `/game?pet=Bowie&sprite=bowie.png`
6. Shared game template loads with Bowie's sprite

### Story IT003.5: Basic Analytics Dashboard (Simplified)
**As a** game creator
**I want** to see basic stats for my deployed games
**So that** I know if my friends are actually playing them

**Acceptance Criteria:**
- Simple analytics table in admin dashboard
- Per-game stats: total views, unique visitors, last played date
- Sort/filter by URL slug or pet name
- Simple chart showing plays over time (optional)
- Export to CSV for sharing with friends
- Manual delete/archive option for old games

**Technical Requirements:**
- Vercel Analytics integration (built-in) OR simple custom tracking
- Database table: game_analytics (url_slug, views, unique_visitors, last_played)
- Simple aggregation queries for dashboard
- Basic chart library (Recharts) for visualizations
- CSV export functionality
- CRUD operations for game management

---

### **Customization System Stories**

### Story IT003.6: JSON Config System & Schema
**As a** developer
**I want** a well-defined JSON schema for game customizations
**So that** I can configure sprites, items, settings, and levels per game

**Acceptance Criteria:**
- Define JSON schema for customization config files
- Support character customization (sprite, name, color)
- Support items customization (collectibles, powerups, obstacles)
- Support settings customization (difficulty, theme, audio, controls)
- Support levels customization (platforms, enemies, collectibles, win conditions)
- Schema validation on config file load
- Example configs for 3 different game types (simple, medium, complex)

**Technical Requirements:**
- JSON schema definition with TypeScript types
- Config validation library (Zod or JSON Schema)
- Store configs in /public/configs/[slug].json
- Config file size limit: 10KB max
- Documentation with example configs

### Story IT003.7: Game Template - Config Loading
**As a** game developer
**I want** the game template to dynamically load customizations from config
**So that** one template works for all customized games

**Acceptance Criteria:**
- Game template reads config from /configs/[slug].json
- Parse and validate config structure
- Load custom character sprite from config
- Load custom items (collectibles, powerups, obstacles) from config
- Apply settings (difficulty, theme, audio) from config
- Build levels dynamically from config data
- Graceful error handling for malformed configs

**Technical Requirements:**
- Modify existing game code to accept config parameter
- JSON parsing and validation
- Dynamic sprite loading from config
- Dynamic item spawning from config
- Dynamic level generation from config
- Error boundaries and fallback defaults

### Story IT003.8: Items Customization System
**As a** game creator
**I want** to define custom collectibles, power-ups, and obstacles
**So that** each friend's game has personalized items

**Acceptance Criteria:**
- Define custom collectibles with sprites and point values
- Define custom power-ups with sprites, effects, and duration
- Define custom obstacles with sprites and damage values
- Items render correctly from sprite URLs
- Item properties (points, duration, damage) work in gameplay
- Support 10+ different item types per game

**Technical Requirements:**
- Item sprite loader with validation
- Item behavior system (collect, activate, collide)
- Item properties applied from config
- Visual feedback for item interactions
- Store item sprites in /public/game/items/

### Story IT003.9: Settings Customization System
**As a** game creator
**I want** to customize difficulty, theme, audio, and controls
**So that** each game feels unique and tailored

**Acceptance Criteria:**
- Difficulty settings affect game speed, enemy behavior
- Theme settings change background colors, visual style
- Audio settings control music track, volume, effects
- Control settings allow custom key bindings
- Settings applied on game load
- Settings visible in landing page

**Technical Requirements:**
- Difficulty multipliers for speed, damage, enemy AI
- Theme CSS variables from config
- Audio manager with config-driven track selection
- Input manager with remappable controls
- Config-to-game-state mapping

### Story IT003.10: Level Customization System
**As a** game creator
**I want** to design custom level layouts with platforms, enemies, and collectibles
**So that** each friend gets a personalized gameplay experience

**Acceptance Criteria:**
- Define custom platforms (position, size, type)
- Place enemies (type, position, behavior pattern)
- Place collectibles (item type, position)
- Define win conditions (collect all, reach goal, defeat enemies)
- Support 5+ levels per game
- Levels load sequentially from config

**Technical Requirements:**
- Level builder parsing config data
- Platform generation from coordinates
- Enemy spawning with AI patterns
- Collectible placement system
- Win condition evaluator
- Level transition logic

### Story IT003.11: Config Generator Admin UI
**As a** game creator
**I want** a visual config generator in the admin dashboard
**So that** I don't have to manually write JSON files

**Acceptance Criteria:**
- Form UI for character customization
- Item builder UI (add/remove collectibles, powerups, obstacles)
- Settings editor UI (difficulty, theme, audio sliders)
- Level designer UI (visual platform placement - optional, can be JSON editor)
- Real-time config preview
- Export to JSON file
- Validation with helpful error messages

**Technical Requirements:**
- React forms with controlled components
- JSON preview/editor component
- File upload for sprite assets
- Config validation on submit
- Generate valid JSON matching schema
- Save to /public/configs/[slug].json

## Technical Architecture (Simplified)

### ⚡ Efficiency: Shared Template vs. Full Duplication

**🚫 ANTI-PATTERN (What we're NOT doing):**
```
/public/games/
  bowieruns/
    index.html          (2MB - full game duplicated)
    assets/             (500KB)
  fluffyadventures/
    index.html          (2MB - full game duplicated)
    assets/             (500KB)
  maxsleeps/
    index.html          (2MB - full game duplicated)
    assets/             (500KB)

Total: 3 games × 2.5MB = 7.5MB
100 games × 2.5MB = 250MB
```

**✅ CORRECT PATTERN (Shared Template):**
```
/public/game/
  index.html            (2MB - ONE shared template)
  assets/               (500KB - shared)
  sprites/
    bowie.png           (10KB)
    fluffy.png          (10KB)
    max.png             (10KB)

Total: 2.5MB + (3 × 10KB) = ~2.53MB
100 games: 2.5MB + (100 × 10KB) = ~3.5MB

Savings: 250MB → 3.5MB (98.6% reduction!)
```

**Benefits:**
- ✅ 100× smaller storage footprint
- ✅ Bug fixes update all games instantly
- ✅ New pet = 10KB sprite upload (not 2MB game deployment)
- ✅ Faster deployments (seconds vs. minutes)
- ✅ Easier maintenance (one codebase)

---

### Simple URL Validation
```typescript
interface URLInput {
  slug: string; // e.g., "bowieruns"
}

interface URLValidationResult {
  slug: string;
  available: boolean;
  sanitized: string;
  suggestions?: string[]; // shown if unavailable
}

const validateURL = async (input: string): Promise<URLValidationResult> => {
  // 1. Sanitize: lowercase, remove special chars
  const sanitized = input.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 2. Validate length (3-50 chars)
  if (sanitized.length < 3 || sanitized.length > 50) {
    throw new Error('URL must be 3-50 characters');
  }

  // 3. Check availability in database
  const available = await isSlugAvailable(sanitized);

  // 4. Generate suggestions if taken
  const suggestions = available ? [] : generateSuggestions(sanitized);

  return { slug: sanitized, available, sanitized, suggestions };
};

// Simple collision suggestions
const generateSuggestions = (slug: string): string[] => {
  const actions = ['adventures', 'runs', 'leaps', 'plays', 'jumps'];
  return actions.map(action => `${slug}${action}`);
};
```

### Database Schema (Simplified)
```sql
-- Projects table (already exists, add these fields)
ALTER TABLE projects ADD COLUMN url_slug VARCHAR(50) UNIQUE;
ALTER TABLE projects ADD COLUMN sprite_url VARCHAR(255); -- e.g., "bowie.png"
ALTER TABLE projects ADD COLUMN pet_name VARCHAR(100); -- e.g., "Bowie"
ALTER TABLE projects ADD COLUMN deployment_status VARCHAR(20) DEFAULT 'draft';
-- deployment_status: draft, deploying, deployed, failed

-- Simple analytics table
CREATE TABLE game_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  url_slug VARCHAR(50) NOT NULL,

  -- Basic metrics
  total_views BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  last_played_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Track individual page views (can start with Vercel Analytics instead)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_slug VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(255), -- Anonymous hash
  viewed_at TIMESTAMP DEFAULT NOW()
);
```

### Hosting Infrastructure (Efficient Template Approach)
```typescript
const hostingArchitecture = {
  storage: {
    gameTemplate: '/public/game/index.html (2MB - SINGLE shared template)',
    sprites: '/public/game/sprites/[petname].png (10KB each)',
    approach: 'One template + custom sprites (NOT full duplication)',
    efficiency: '100 games = 2MB + 1MB sprites vs 200MB duplicated'
  },

  gameLoading: {
    url: 'sparkleclassic.com/bowieruns',
    loads: '/game?pet=Bowie&sprite=bowie.png',
    pattern: 'Landing page → iframe with query params',
    customization: 'Query params pass pet name + sprite URL to shared game'
  },

  deployment: {
    newPet: 'Upload sprite PNG only (10KB) - NO full game deployment!',
    updates: 'Bug fixes update ONE game template → all pets benefit',
    storage: 'Massively reduced: ~3MB for 100 games vs ~200MB',
    vercel: 'Push sprite + config only, game template unchanged'
  },

  routing: {
    pattern: 'sparkleclassic.com/[slug] → /[slug]/page.tsx → iframe /game',
    dns: 'Managed by Vercel (sparkleclassic.com)',
    ssl: 'Automatic SSL via Vercel',
    cdn: 'Global edge network (Vercel CDN)'
  },

  monitoring: {
    analytics: 'Vercel Analytics (built-in) or custom tracking',
    errors: 'Console logs + optional Sentry',
    uptime: 'Vercel platform (99.99% SLA)'
  }
};
```

## Performance Requirements (Simplified)

- **URL Validation**: <200ms for availability check
- **Deployment**: <3 minutes from "Deploy" click to live URL
- **Page Load**: <2 seconds for game landing page (Vercel edge network)
- **Analytics**: Daily aggregation (real-time not required for MVP)
- **Availability**: 99.9% uptime (Vercel platform SLA)

## Security Requirements (Simplified)

- **URL Validation**: Alphanumeric only (prevent XSS)
- **Public Access**: No auth required, games are public
- **HTTPS**: Automatic SSL via Vercel
- **Analytics Privacy**: Minimal tracking (views only, no PII)
- **Admin Access**: Dashboard requires authentication (existing system)

## Testing Strategy (Simplified)

### Manual Testing (MVP Phase)
- URL validation with various inputs
- Availability checking with existing/new slugs
- End-to-end: Create project → Deploy → Visit URL
- Landing page responsive design (mobile/desktop)
- Analytics tracking verification

### Automated Tests (Future)
- Unit tests for URL sanitization
- Integration test: Full deployment flow
- E2E test: Playwright for landing page load

## Dependencies

- **Internal**: IT001 (Admin Dashboard), IT002 (Game Template Engine)
- **Platform**: Vercel (already configured)
- **Domain**: sparkleclassic.com (already owned and deployed)
- **Database**: PostgreSQL (existing)

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| URL collision | Low | Manual suggestions, small user base |
| Deployment failures | Medium | Manual retry, git revert for rollback |
| Vercel downtime | Low | Platform SLA 99.99%, acceptable for MVP |

## Definition of Done

**URL Management:**
- [ ] Simple URL input with real-time availability check
- [ ] URL reservation on project creation (unique constraint)
- [ ] One-click deployment working (configs + sprites → git → Vercel)

**Customization System:**
- [ ] JSON config schema defined and documented
- [ ] Game template loads and parses config files
- [ ] Custom sprites rendering correctly
- [ ] Custom items system working (collectibles, powerups, obstacles)
- [ ] Settings customization applied (difficulty, theme, audio)
- [ ] Level customization working (platforms, enemies, win conditions)
- [ ] Config generator UI in admin dashboard

**Deployment & Testing:**
- [ ] Landing page at sparkleclassic.com/[slug] responsive on mobile/desktop
- [ ] Basic analytics dashboard showing views per game
- [ ] 3 example games deployed with different customization levels
- [ ] Manual testing complete for all customization features
- [ ] Documentation: Config schema and customization guide

## Success Metrics

**Performance:**
- **URL Validation Speed**: <200ms availability check
- **Config Load Time**: <500ms to parse and load customizations
- **Deployment Success**: 95%+ successful deployments
- **Page Performance**: <2s landing page load
- **Game Load Time**: <3s with full customizations

**Customization:**
- **Config File Size**: <10KB per game (avg ~5KB)
- **Storage Efficiency**: 100 games <5MB total
- **Item Variety**: 10+ unique items per game supported
- **Level Complexity**: 5+ custom levels per game

**User Satisfaction:**
- **URL Memorability**: Friends/colleagues can easily remember URLs
- **Customization Flexibility**: Creators happy with personalization options
- **Admin UX**: Config generator is intuitive to use

---

**Epic Owner**: Development Team  
**Stakeholders**: Artists, Operations, Customers  
**Next Epic**: IT004 - Workflow Integration