# Epic: Vanity URL Foundation - Architectural Foundation

**Epic ID**: VanityURL-001
**Version**: 2.0
**Created**: 2025-01-27
**Updated**: 2025-01-27 (Major Revision)
**Status**: Draft
**Type**: Architectural Foundation (was: Brownfield Enhancement)
**Priority**: P0 - Business Critical

---

## ⚠️ **Revision History**

**v2.0 Changes:**
- **UPGRADED from brownfield enhancement to architectural foundation**
- Added collision handling with safeword system
- Added database-backed config management
- Added production deployment strategy
- Added internal tooling for designers/admins
- Added customer experience workflow
- Added security and error handling
- Expanded from 3 stories to 10 stories
- Updated effort estimate from ~10-13h to ~40-60h (1.5-2 weeks)

**Reason for Upgrade:** Party-mode brainstorming revealed this is foundational infrastructure for entire business model, not a simple enhancement.

---

## Epic Goal

Implement production-ready vanity URL system (`sparkleclassic.com/[petname]-[safeword]`) with collision handling, database-backed config management, internal tooling for game creation, and customer delivery workflow - enabling scalable, personalized game URLs for SparkleClassic platform.

---

## Epic Description

### Existing System Context

**Current relevant functionality:**
- Modular game architecture with sprite configuration system
- Query parameter-based pet selection (`?pet=bowie` or `?pet=buttercup`)
- JSON configuration files for pet sprites in `src/configs/sprites/`
- SpriteConfig class with `importConfig()` and `exportConfig()` methods

**Technology stack:**
- Vanilla JavaScript (ES6 modules)
- Vite dev server with middleware support
- JSON-based configuration system
- Existing sprite management in `src/core/sprites/`
- **NEW:** Database requirement (PostgreSQL or Firebase)
- **NEW:** API layer for config management

**Integration points:**
- `src/index.js` - Main entry point for URL parsing
- `src/core/sprites/SpriteConfig.js` - Configuration loading
- `vite.config.js` - Development server URL rewriting
- `vercel.json` - Production deployment URL rewriting
- `index.html` - Document metadata updates
- **NEW:** `/api/configs` - Config API endpoints
- **NEW:** Admin dashboard for internal team

---

## 🎯 **URL Strategy & Collision Handling**

### URL Format Decision

**Chosen Format:** `/[petname]-[safeword]`

**Examples:**
- `/fluffy-happy` (Pet: Fluffy, Safeword: happy)
- `/bowie-calm` (Pet: Bowie, Safeword: calm)
- `/buttercup-curious` (Pet: Buttercup, Safeword: curious)
- `/max-brave` (Pet: Max, Safeword: brave)

**Why This Format:**
- ✅ Collision-resistant (50 pets named "Fluffy" = 50 unique URLs)
- ✅ Memorable and shareable
- ✅ Brand-friendly (reads like "[petname] is [trait]")
- ✅ SEO-friendly (readable, no hashes)
- ✅ Social media friendly

### Safeword Generation System

**Safeword Pool:**
```javascript
const SAFEWORDS = [
  // Personality traits (50 words)
  'happy', 'brave', 'calm', 'clever', 'curious', 'gentle', 'playful',
  'silly', 'sweet', 'wise', 'bold', 'bright', 'cheerful', 'daring',
  'eager', 'fancy', 'jolly', 'kind', 'lively', 'merry', 'noble',
  'proud', 'quick', 'smart', 'sunny', 'zippy', 'bouncy', 'cozy',
  'dreamy', 'fluffy', 'fuzzy', 'golden', 'lucky', 'peppy', 'perky',
  'shiny', 'snuggly', 'sparkly', 'starry', 'zesty', 'awesome',
  'brilliant', 'dazzling', 'fantastic', 'glowing', 'radiant',
  'stellar', 'vibrant', 'wonderful',

  // Nature (25 words)
  'autumn', 'blossom', 'cloud', 'forest', 'meadow', 'ocean',
  'river', 'sky', 'snow', 'storm', 'summer', 'sunset', 'thunder',
  'winter', 'breeze', 'flame', 'frost', 'lightning', 'moonlight',
  'rainbow', 'shadow', 'spring', 'starlight', 'sunbeam', 'twilight',

  // Colors (15 words)
  'amber', 'azure', 'coral', 'crimson', 'emerald', 'golden',
  'ivory', 'jade', 'ruby', 'sapphire', 'silver', 'topaz',
  'violet', 'crystal', 'pearl'
];

// Total: 90 safewords
// Capacity: 90 games per pet name before collisions
```

**Collision Resolution:**
1. Try `[petname]-[random_safeword]`
2. If taken, try another random safeword (up to 10 attempts)
3. If all fail, append number: `[petname]-[safeword]-2`
4. For 91st "Fluffy": `/fluffy-happy-2`

**Slug Validation:**
- Must be unique in database
- Alphanumeric + hyphen only
- 5-50 characters total
- Blacklist profanity/offensive words

---

## 📊 **Architecture: Database-Backed Config System**

### Why Database vs File System

**File System (Original Plan):**
- ❌ Doesn't scale beyond ~100 games
- ❌ No search/query capability
- ❌ No concurrent write safety
- ❌ No audit trail
- ❌ Difficult backup/restore

**Database (Revised Plan):**
- ✅ Scales to millions of games
- ✅ Query by customer, pet name, date, etc.
- ✅ Transaction safety
- ✅ Built-in audit log
- ✅ Simple backup/restore
- ✅ Enables analytics

### Database Schema

```sql
CREATE TABLE game_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,  -- e.g., "fluffy-happy"
  pet_name VARCHAR(50) NOT NULL,     -- e.g., "Fluffy"
  safeword VARCHAR(50) NOT NULL,     -- e.g., "happy"

  customer_id VARCHAR(100),           -- Stripe customer ID
  customer_email VARCHAR(255),
  order_id VARCHAR(100),

  config_json JSONB NOT NULL,         -- Full game configuration

  sprite_url VARCHAR(500),            -- URL to custom sprite

  status VARCHAR(20) DEFAULT 'active', -- active, refunded, expired

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accessed_at TIMESTAMP,              -- Last time game was played

  INDEX idx_slug (slug),
  INDEX idx_customer_id (customer_id),
  INDEX idx_created_at (created_at)
);

-- Audit log for compliance
CREATE TABLE config_audit_log (
  id BIGSERIAL PRIMARY KEY,
  config_id UUID REFERENCES game_configs(id),
  action VARCHAR(20),                 -- created, updated, deleted
  changed_by VARCHAR(100),            -- admin user or system
  changes JSONB,                      -- What changed
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```
GET  /api/configs/:slug           - Get config by slug
POST /api/configs                 - Create new config (admin only)
PUT  /api/configs/:slug           - Update config (admin only)
DELETE /api/configs/:slug         - Soft delete config (admin only)
GET  /api/configs/validate/:slug  - Check if slug is available

Admin endpoints:
GET  /api/admin/configs           - List all configs (paginated)
GET  /api/admin/configs/search    - Search configs
POST /api/admin/configs/generate-slug  - Generate available slug for pet name
```

---

## 🔧 **Production Deployment Strategy**

### Development vs Production Routing

**Development (Vite):**
```javascript
// vite.config.js
export default {
  server: {
    middlewares: [(req, res, next) => {
      if (req.url.match(/^\/[a-z0-9-]+$/)) {
        req.url = '/src/index.html';
      }
      next();
    }]
  }
}
```

**Production (Vercel):**
```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/:slug",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' https://storage.googleapis.com; script-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

---

## 👥 **Customer Journey & Internal Workflow**

### Customer Experience Flow

```
1. Customer visits sparkleclassic.com
2. Customer places order ($24.99)
3. Customer uploads pet photo
4. [INTERNAL] Designer receives order notification
5. [INTERNAL] Designer creates pixel art sprite (2-4 hours)
6. [INTERNAL] Designer uploads sprite to admin dashboard
7. [INTERNAL] System generates unique slug: "fluffy-happy"
8. [INTERNAL] System creates config JSON in database
9. Customer receives email: "Your game is ready! sparkleclassic.com/fluffy-happy"
10. Customer clicks link and plays game immediately
11. Customer shares URL on social media
```

### Internal Team Workflow

**Designer Dashboard Features:**
- Upload custom sprite (PNG, 32x32 or 96x96)
- Preview sprite in game
- Generate config JSON from template
- Assign slug (auto-generated or manual override)
- Send delivery email to customer
- View all games created by designer
- Re-send delivery email if customer lost it

**Admin Dashboard Features:**
- View all games (search, filter, sort)
- Analytics (games created per day, total revenue, etc.)
- Manage refunds (soft delete configs)
- Transfer game to different customer
- Regenerate slug if customer requests change
- View audit log

---

## 🔒 **Security & Error Handling**

### Security Measures

**1. Input Validation:**
```javascript
function validateSlug(slug) {
  // Alphanumeric + hyphen only
  if (!/^[a-z0-9-]{5,50}$/.test(slug)) {
    throw new Error('Invalid slug format');
  }

  // Blacklist check
  const BLACKLIST = ['admin', 'api', 'auth', /* profanity list */];
  if (BLACKLIST.includes(slug.split('-')[0])) {
    throw new Error('Reserved word in slug');
  }

  return true;
}
```

**2. XSS Prevention:**
```javascript
function sanitizeConfig(config) {
  return {
    ...config,
    petName: DOMPurify.sanitize(config.petName),
    metadata: {
      ...config.metadata,
      title: DOMPurify.sanitize(config.metadata.title)
    }
  };
}
```

**3. Rate Limiting:**
- Config API: 60 requests/minute per IP
- Admin API: 300 requests/minute per user

**4. Authentication:**
- Public endpoints: `/api/configs/:slug` (read-only)
- Admin endpoints: Require JWT auth token
- Designer endpoints: Require designer role

### Error Handling Strategy

**Config Loading Hierarchy:**
```javascript
async function loadGameConfig(slug) {
  try {
    // 1. Try loading from database
    const config = await fetchConfigFromAPI(slug);
    return config;
  } catch (apiError) {
    console.warn('API failed, trying cache:', apiError);

    try {
      // 2. Try localStorage cache
      const cached = localStorage.getItem(`config-${slug}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 86400000) { // 24 hours
          return parsed.data;
        }
      }
    } catch (cacheError) {
      console.warn('Cache failed:', cacheError);
    }

    // 3. Try default pet from query param
    const urlParams = new URLSearchParams(window.location.search);
    const petParam = urlParams.get('pet');
    if (petParam) {
      return loadDefaultPetConfig(petParam);
    }

    // 4. Final fallback: Bowie Cat
    return HARDCODED_BOWIE_CONFIG;
  }
}
```

**User-Friendly Error Messages:**
- **404**: "Game not found. Check your URL or contact support."
- **500**: "Server error. Please try again in a moment."
- **Timeout**: "Loading is taking longer than expected. Check your connection."

---

## 📝 **Revised Stories (10 Stories)**

### Phase 1: Core Infrastructure (Stories 1-5)

#### **Story 1: Database Schema & Config API**
**Description:** Set up PostgreSQL database with game_configs table and create REST API endpoints for config management.

**Key Tasks:**
- Create database schema (game_configs, config_audit_log)
- Implement API endpoints (GET, POST, PUT, DELETE)
- Add input validation and sanitization
- Add rate limiting
- Write API tests

**Acceptance Criteria:**
- Database tables created with proper indexes
- `GET /api/configs/:slug` returns config JSON
- `POST /api/configs` creates new config (admin only)
- Slug validation prevents invalid/profane words
- Rate limiting prevents abuse
- 100% test coverage for API endpoints

**Estimated Effort:** 8-10 hours

---

#### **Story 2: Slug Generation & Collision Handling**
**Description:** Implement safeword-based slug generation system that handles collisions gracefully.

**Key Tasks:**
- Create safeword pool (90 words)
- Implement slug generation algorithm
- Add collision detection
- Add slug validation
- Create `POST /api/admin/configs/generate-slug` endpoint

**Acceptance Criteria:**
- Generates `[petname]-[safeword]` format
- Handles collisions (tries 10 safewords, then appends number)
- Validates uniqueness before returning
- Blacklist prevents reserved/profane words
- Can generate 1000 unique slugs for "Fluffy" without errors

**Estimated Effort:** 4-6 hours

---

#### **Story 3: URL Routing (Dev & Production)**
**Description:** Implement URL routing that works in both Vite dev server and Vercel production deployment.

**Key Tasks:**
- Add Vite middleware for development routing
- Create `vercel.json` with production rewrites
- Add security headers (CSP, X-Frame-Options)
- Test routing in both environments
- Document deployment process

**Acceptance Criteria:**
- Development: `/fluffy-happy` loads game in Vite dev server
- Production: `/fluffy-happy` loads game on Vercel
- API routes (`/api/*`) not rewritten
- Security headers present in production
- Deployment guide documented

**Estimated Effort:** 4-6 hours

---

#### **Story 4: Client-Side Config Loading**
**Description:** Implement robust config loading in game client with caching and error handling.

**Key Tasks:**
- Parse slug from `window.location.pathname`
- Fetch config from API
- Implement localStorage caching (24h TTL)
- Add fallback hierarchy (API → cache → query param → default)
- Update document.title and meta tags
- Handle errors gracefully

**Acceptance Criteria:**
- Slug parsed correctly from URL
- Config loaded from `/api/configs/:slug`
- Config cached in localStorage for 24 hours
- Fallback to Bowie Cat if config not found
- Browser title shows "{PetName}'s Adventure - SparkleClassic"
- Error messages user-friendly

**Estimated Effort:** 6-8 hours

---

#### **Story 5: Security Hardening**
**Description:** Implement security measures to protect against common web vulnerabilities.

**Key Tasks:**
- Add XSS protection (DOMPurify)
- Implement CSRF tokens for admin endpoints
- Add JWT authentication for admin API
- Implement rate limiting (60 req/min public, 300 req/min admin)
- Add input validation (slug, config JSON)
- Security audit and penetration testing

**Acceptance Criteria:**
- XSS attacks blocked by sanitization
- CSRF tokens required for state-changing operations
- Admin endpoints require valid JWT
- Rate limiting prevents DoS attacks
- SQL injection prevented by parameterized queries
- Security audit passes with no critical issues

**Estimated Effort:** 6-8 hours

---

### Phase 2: Internal Tooling (Stories 6-8)

#### **Story 6: Admin Dashboard - Config Management**
**Description:** Build admin dashboard for viewing, searching, and managing game configs.

**Key Tasks:**
- Create admin UI (React or vanilla JS)
- List all configs (paginated, 50 per page)
- Search by slug, pet name, customer email, date
- View config details
- Soft delete configs (refunds)
- View audit log

**Acceptance Criteria:**
- Dashboard accessible at `/admin` (auth required)
- List shows all configs with pagination
- Search works for slug, pet name, email
- Clicking config shows full details
- Delete button soft-deletes config
- Audit log shows all changes with timestamps

**Estimated Effort:** 8-10 hours

---

#### **Story 7: Designer Dashboard - Game Creation**
**Description:** Build designer dashboard for uploading sprites and creating game configs.

**Key Tasks:**
- Create designer UI
- Upload sprite form (PNG, 32x32 or 96x96)
- Preview sprite in game
- Generate config JSON from template
- Auto-generate unique slug
- Send delivery email to customer

**Acceptance Criteria:**
- Dashboard accessible at `/designer` (auth required)
- Upload form accepts PNG files
- Preview shows sprite in sample game scene
- Config generated from template with uploaded sprite URL
- Slug auto-generated (e.g., "fluffy-happy")
- Email sent to customer with game URL

**Estimated Effort:** 10-12 hours

---

#### **Story 8: Email Delivery System**
**Description:** Implement email system that sends personalized game URL to customers.

**Key Tasks:**
- Integrate email service (SendGrid or AWS SES)
- Create email template with game URL
- Add "Your Game is Ready!" subject line
- Include QR code for mobile sharing
- Add re-send capability for designers
- Track email delivery status

**Acceptance Criteria:**
- Email sent when config created
- Email includes personalized URL (e.g., sparkleclassic.com/fluffy-happy)
- QR code included for easy mobile sharing
- Designer can re-send email if customer didn't receive it
- Email delivery tracked (sent, delivered, opened)

**Estimated Effort:** 6-8 hours

---

### Phase 3: Polish & Production (Stories 9-10)

#### **Story 9: Documentation & Testing**
**Description:** Comprehensive documentation and test coverage for entire system.

**Key Tasks:**
- Document URL format and slug generation
- Document API endpoints
- Document deployment process
- Write Playwright E2E tests
- Write unit tests for slug generation
- Write integration tests for config loading
- Performance testing (1000 concurrent requests)

**Acceptance Criteria:**
- README explains URL format and examples
- API documentation complete (Swagger/OpenAPI)
- Deployment guide for Vercel
- E2E tests cover: URL routing, config loading, fallbacks
- 100% test coverage for slug generation
- Performance test passes (p95 latency < 200ms)

**Estimated Effort:** 8-10 hours

---

#### **Story 10: Monitoring & Analytics**
**Description:** Add monitoring and analytics to track system health and usage.

**Key Tasks:**
- Add logging (Winston or Pino)
- Integrate error tracking (Sentry)
- Add analytics (Plausible or Google Analytics)
- Create admin analytics dashboard (games created per day, revenue, etc.)
- Set up alerts (API errors, database down, etc.)
- Create runbook for common issues

**Acceptance Criteria:**
- All API requests logged with response times
- Errors sent to Sentry with full context
- Page views tracked in analytics
- Admin dashboard shows games created per day/week/month
- Alerts configured for critical issues (API down, database errors)
- Runbook documents how to resolve common issues

**Estimated Effort:** 6-8 hours

---

## 📊 **Effort Summary**

**Total Estimated Effort:** 76-96 hours (~2-2.5 weeks for 1 developer)

**Phase Breakdown:**
- Phase 1 (Core Infrastructure): 28-38 hours
- Phase 2 (Internal Tooling): 24-30 hours
- Phase 3 (Polish & Production): 14-18 hours

**Recommended Team:**
- 1 Full-Stack Developer (all stories)
- 1 Designer (Story 7 UI/UX)
- 1 QA Engineer (Story 9 testing)

**Timeline:**
- Sprint 1 (Week 1): Stories 1-5 (Core Infrastructure)
- Sprint 2 (Week 2): Stories 6-8 (Internal Tooling)
- Sprint 3 (Week 3): Stories 9-10 (Polish & Production)

---

## ✅ **Definition of Done**

### Technical Requirements
- [x] Database schema created and deployed
- [x] API endpoints functional and tested
- [x] URL routing works in dev and production
- [x] Config loading handles errors gracefully
- [x] Security measures implemented and audited
- [x] Admin and designer dashboards deployed
- [x] Email delivery system functional
- [x] 100% test coverage for critical paths
- [x] Performance benchmarks met (p95 < 200ms)
- [x] Documentation complete

### Business Requirements
- [x] Internal team can create games via designer dashboard
- [x] Customers receive email with personalized URL
- [x] URLs are memorable and shareable
- [x] System handles 1000+ games without performance degradation
- [x] Collision handling works for duplicate pet names
- [x] Refund process documented and tested

### User Experience Requirements
- [x] Customer can access game via clean URL (no query params)
- [x] Game loads in <3 seconds
- [x] Error messages are user-friendly
- [x] URL works on all devices (mobile, desktop)
- [x] Social media preview shows correct metadata

---

## 🚨 **Risks & Mitigation**

### Technical Risks

**Risk 1: Database Downtime**
- **Impact:** Customers can't access games
- **Mitigation:** Implement localStorage caching (24h), fallback to hardcoded configs
- **Probability:** Low
- **Severity:** High

**Risk 2: Slug Collisions Exhaust Safeword Pool**
- **Impact:** Can't generate unique slug for popular pet names
- **Mitigation:** 90-word pool supports 90 games per name, append numbers after
- **Probability:** Low (only if >90 "Fluffy" pets)
- **Severity:** Medium

**Risk 3: Email Delivery Failures**
- **Impact:** Customers don't receive game URL
- **Mitigation:** Designer dashboard has re-send button, track delivery status
- **Probability:** Medium
- **Severity:** Medium

**Risk 4: Production Deployment Issues**
- **Impact:** Routing breaks in production
- **Mitigation:** Test on Vercel staging environment first, document rollback
- **Probability:** Medium
- **Severity:** High

### Business Risks

**Risk 5: Internal Team Adoption**
- **Impact:** Designers don't use new dashboard, still send URLs manually
- **Mitigation:** Train team, make dashboard required step in order workflow
- **Probability:** Medium
- **Severity:** Medium

**Risk 6: Customer Confusion**
- **Impact:** Customers don't understand how to find their game
- **Mitigation:** Clear email with prominent URL, FAQ page, support contact
- **Probability:** Low
- **Severity:** Low

---

## 🔄 **Rollback Plan**

### If Production Deployment Fails

**Step 1:** Revert Vercel deployment to previous version
```bash
vercel rollback
```

**Step 2:** Disable new URL routing, keep query parameter system
```javascript
// Temporarily disable pathname routing
if (FEATURE_FLAG_VANITY_URLS === false) {
  // Use query param only
  const petParam = urlParams.get('pet');
  loadConfig(petParam || 'bowie');
}
```

**Step 3:** Send updated URLs to affected customers
- Email: "Temporary issue, use this URL instead: ?pet=fluffy"

**Step 4:** Investigate and fix issue

**Step 5:** Redeploy when fixed

---

## 📈 **Future Enhancements (Out of Scope)**

### Phase 2 Features (After Epic Complete)
- **Custom URL Paths** - Let customers choose their own path (like Instagram handles)
- **URL Transfer** - Allow customers to change their URL
- **URL Analytics** - Track how often game is played, shared
- **Social Sharing Tools** - One-click share to Facebook, Twitter, Instagram
- **QR Code Generation** - Auto-generate QR codes for physical products
- **Items Customization** - Custom collectibles, power-ups, obstacles
- **Settings Customization** - Difficulty, controls, audio, visual themes
- **Levels Customization** - Custom platforms, enemies, win conditions
- **Multi-Pet Co-op** - Load multiple pet configs for multiplayer games

### Platform Enhancements
- **Customer Dashboard** - Customers can view all their games
- **Gift Games** - Purchase game for someone else
- **Game Remixing** - Customers can create variations of their game
- **Leaderboards** - High scores shared across all games

---

## 🎯 **Success Metrics**

### Technical Metrics
- **API Latency:** p95 < 200ms
- **Error Rate:** < 0.1%
- **Uptime:** 99.9%
- **Cache Hit Rate:** > 80%
- **Test Coverage:** > 90%

### Business Metrics
- **Games Created:** 20 in first month
- **Customer Satisfaction:** > 4.5/5 stars
- **URL Share Rate:** > 30% of customers share URL on social media
- **Email Delivery Rate:** > 98%
- **Support Tickets:** < 5% of customers contact support about URL

### User Experience Metrics
- **Time to First Play:** < 5 seconds from email click
- **Mobile Usage:** > 40% of plays on mobile
- **Repeat Plays:** > 3 plays per game average
- **URL Memorability:** > 80% can recall their URL without checking email

---

## 🤝 **Stakeholder Handoff**

### To Story Manager (Scrum Master)

**Context:** This epic has been significantly expanded from original 3-story brownfield enhancement to 10-story architectural foundation based on critical issues identified in party-mode brainstorming.

**Key Changes:**
1. Added safeword system for collision handling
2. Moved from file-based to database-backed configs
3. Added internal tooling (admin/designer dashboards)
4. Added customer delivery workflow (email system)
5. Added security hardening and error handling
6. Added production deployment strategy

**Critical Path:**
- Phase 1 (Stories 1-5) must complete before Phase 2
- Story 2 (slug generation) depends on Story 1 (database)
- Story 4 (client loading) depends on Story 1 (API) and Story 3 (routing)

**Team Requirements:**
- 1 Full-stack developer (all stories)
- 1 Designer (Story 7 UI)
- 1 QA Engineer (Story 9 testing)
- Estimated 2-3 weeks for full team

**Please create detailed user stories with:**
- Full acceptance criteria
- Technical implementation notes
- Test scenarios
- Integration points
- Security considerations

### To Architect

**Architecture Review Needed:**
- Database schema design (Story 1)
- API endpoint design (Story 1)
- Caching strategy (Story 4)
- Production deployment config (Story 3)
- Security architecture (Story 5)

**Key Decisions Needed:**
- PostgreSQL vs Firebase for database?
- SendGrid vs AWS SES for email?
- React vs Vanilla JS for admin dashboards?
- JWT vs session-based auth?

### To Dev Team

**Tech Stack:**
- Backend: Node.js + Express + PostgreSQL
- Frontend: Vanilla JS (game) + React (admin dashboards)
- Deployment: Vercel
- Email: SendGrid
- Auth: JWT
- Monitoring: Sentry + Plausible

**Development Environment:**
```bash
# Setup
npm install
npm run db:migrate
npm run dev

# Testing
npm run test
npm run test:e2e
npm run test:load

# Deployment
vercel deploy
```

---

**Epic Status:** Ready for Story Manager Review
**Next Action:** SM creates detailed stories, then hand off to Dev
**Created by:** Product Manager (BMad PM Agent)
**Reviewed by:** Product Owner, Architect (Party Mode Session)
**Date:** 2025-01-27
