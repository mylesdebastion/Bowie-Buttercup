# User Story: URL Routing (Development & Production)

**Story ID**: VanityURL-003
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P0 - Business Critical
**Estimated Effort**: 4-6 hours
**Sprint**: Sprint 1 (Week 1)
**Dependencies**: Story 1 (Config API), Story 2 (Slug Generation)

---

## User Story

**As a** SparkleClassic customer
**I want** to access my personalized game by visiting `sparkleclassic.com/fluffy-happy`
**So that** I have a clean, memorable URL to share with friends and family without ugly query parameters

---

## Business Context

Clean vanity URLs are critical for:
- **Social sharing**: "Check out sparkleclassic.com/fluffy-happy" looks professional
- **Word of mouth**: Easy to remember and type
- **SEO**: Search engines favor clean URL structures
- **Brand perception**: Shows technical sophistication

### Customer Pain Point (Before)
- ❌ Query params: `sparkleclassic.com/src/index.html?pet=fluffy`
- ❌ Difficult to remember
- ❌ Not shareable on social media
- ❌ Looks unprofessional

### Customer Delight (After)
- ✅ Clean URL: `sparkleclassic.com/fluffy-happy`
- ✅ Easy to remember ("Fluffy is happy!")
- ✅ Shareable everywhere
- ✅ Professional brand image

---

## Acceptance Criteria

### Development Environment (Vite)

- [ ] **AC1.1**: Vite middleware rewrites vanity URLs to index.html:
  - `/fluffy-happy` → `/src/index.html`
  - `/max-brave` → `/src/index.html`
  - Pattern: Any `/:slug` matching `^[a-z0-9-]{5,50}$`

- [ ] **AC1.2**: API routes NOT rewritten:
  - `/api/configs/:slug` → NOT rewritten (stays as API call)
  - `/api/admin/*` → NOT rewritten
  - Pattern: `/api/*` bypasses middleware

- [ ] **AC1.3**: Static assets NOT rewritten:
  - `/src/styles/main.css` → NOT rewritten
  - `/src/core/Game.js` → NOT rewritten
  - `/assets/*` → NOT rewritten
  - Pattern: Paths with file extensions bypass middleware

- [ ] **AC1.4**: Development server starts without errors:
  ```bash
  npm run dev
  # Server starts on http://localhost:3000
  # No console errors
  ```

- [ ] **AC1.5**: Manual testing in dev:
  - Navigate to `http://localhost:3000/fluffy-happy`
  - Game loads (no 404 error)
  - Browser URL stays as `/fluffy-happy`
  - Console shows "Parsed slug: fluffy-happy"

### Production Environment (Vercel)

- [ ] **AC2.1**: `vercel.json` configuration created with rewrites:
  ```json
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
    ]
  }
  ```

- [ ] **AC2.2**: Rewrites apply in correct order:
  1. API routes preserved first
  2. Vanity URLs rewritten second
  3. Static assets served by default

- [ ] **AC2.3**: Production deployment successful:
  ```bash
  vercel deploy --prod
  # Deployment succeeds
  # No build errors
  # Routing works on Vercel URL
  ```

- [ ] **AC2.4**: Manual testing in production:
  - Navigate to `https://sparkleclassic.com/fluffy-happy`
  - Game loads correctly
  - Browser URL stays as `/fluffy-happy`
  - No redirect to `/index.html` visible to user

### Security Headers

- [ ] **AC3.1**: Security headers configured in `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Content-Security-Policy` with appropriate directives

- [ ] **AC3.2**: CSP allows game assets:
  - `default-src 'self'`
  - `img-src 'self' https://storage.googleapis.com`
  - `script-src 'self' 'unsafe-inline'` (for inline game code)
  - `style-src 'self' 'unsafe-inline'` (for inline styles)

- [ ] **AC3.3**: CSP blocks external scripts:
  - Attempting to load script from `https://malicious.com` fails
  - Console shows CSP violation error

### Error Handling

- [ ] **AC4.1**: Invalid slug format returns 404:
  - `/test@invalid!` → 404 page
  - `/` → Homepage (not 404)
  - `/about` → About page (if exists) or 404

- [ ] **AC4.2**: Non-existent slug shows user-friendly error:
  - Navigate to `/nonexistent-slug-12345`
  - Game loads but shows error: "Game not found. Check your URL."
  - No ugly 500 error or blank page

- [ ] **AC4.3**: API errors don't break routing:
  - If API is down, fallback config loads (Story 4)
  - User still sees game (with default Bowie Cat)
  - Error logged but not displayed prominently

### Deployment Documentation

- [ ] **AC5.1**: Deployment guide created in `/docs/deployment/`:
  - Step-by-step Vercel setup instructions
  - Environment variables required
  - DNS configuration for custom domain
  - Rollback procedure

- [ ] **AC5.2**: Deployment checklist includes:
  - [ ] Database migrated
  - [ ] Environment variables set
  - [ ] `vercel.json` committed
  - [ ] Build succeeds locally
  - [ ] Staging deployment tested
  - [ ] Production deployment approved

---

## Technical Implementation Notes

### Vite Middleware Configuration

**File**: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },

  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,

    // Custom middleware for vanity URL routing
    middlewares: [
      (req, res, next) => {
        const url = req.url;

        // Skip API routes
        if (url.startsWith('/api/')) {
          return next();
        }

        // Skip static assets (has file extension)
        if (url.includes('.')) {
          return next();
        }

        // Skip root
        if (url === '/') {
          return next();
        }

        // Rewrite vanity URLs to index.html
        if (/^\/[a-z0-9-]+$/.test(url)) {
          console.log(`🔀 Rewriting ${url} → /src/index.html`);
          req.url = '/src/index.html';
        }

        next();
      }
    ]
  },

  preview: {
    port: 3001,
    open: true
  }
})
```

**Why This Approach:**
- ✅ Simple and explicit
- ✅ No external dependencies
- ✅ Easy to debug
- ✅ Works with Vite HMR

**Alternative Considered:** Vite plugin
- ❌ More complex
- ❌ Overkill for simple routing
- ✅ More reusable if we need it elsewhere

### Vercel Configuration

**File**: `vercel.json`

```json
{
  "version": 2,
  "name": "sparkleclassic",
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/:slug([a-z0-9-]{5,50})",
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
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' https://storage.googleapis.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://api.sparkleclassic.com"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Key Features:**
- ✅ Regex pattern for slug validation
- ✅ API routes preserved
- ✅ Security headers on all pages
- ✅ CORS headers on API routes only
- ✅ Filesystem handler for static assets

### Testing Middleware Locally

**Script**: `scripts/test-routing.js`

```javascript
#!/usr/bin/env node

const http = require('http');

const testCases = [
  { url: '/fluffy-happy', expected: 'index.html' },
  { url: '/max-brave', expected: 'index.html' },
  { url: '/api/configs/fluffy-happy', expected: 'api response' },
  { url: '/src/styles/main.css', expected: 'css file' },
  { url: '/', expected: 'index.html' }
];

async function testRoute(url) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${url}`, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type']
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing URL routing...\n');

  for (const test of testCases) {
    const result = await testRoute(test.url);
    const pass = result.status === 200 ? '✅' : '❌';
    console.log(`${pass} ${test.url} → ${result.status} (${result.contentType})`);
  }
}

runTests();
```

**Usage**:
```bash
npm run dev &  # Start dev server
node scripts/test-routing.js
```

---

## Test Scenarios

### Scenario 1: Vanity URL in Development

**Given**: Vite dev server running on `http://localhost:3000`
**When**: Navigate to `http://localhost:3000/fluffy-happy`
**Then**:
- Page loads without 404 error
- URL in browser stays as `/fluffy-happy`
- Game initializes and loads config
- Console logs: "🔀 Rewriting /fluffy-happy → /src/index.html"

### Scenario 2: API Route Not Rewritten

**Given**: Vite dev server running
**When**: Fetch `http://localhost:3000/api/configs/fluffy-happy`
**Then**:
- Request hits API endpoint (not rewritten)
- Returns JSON config (not HTML)
- Response has `Content-Type: application/json`

### Scenario 3: Static Asset Served

**Given**: Vite dev server running
**When**: Browser requests `http://localhost:3000/src/styles/main.css`
**Then**:
- CSS file served (not rewritten to index.html)
- Response has `Content-Type: text/css`
- Styles apply to page

### Scenario 4: Invalid URL Format

**Given**: Vite dev server running
**When**: Navigate to `http://localhost:3000/test@invalid!`
**Then**:
- Returns 404 (not rewritten)
- No middleware rewriting applied
- Browser shows 404 page

### Scenario 5: Production Deployment to Vercel

**Given**: `vercel.json` configured correctly
**When**: Run `vercel deploy --prod`
**Then**:
- Build succeeds without errors
- Deployment URL provided
- Navigate to `https://<vercel-url>/fluffy-happy`
- Game loads correctly
- Security headers present in response

### Scenario 6: Security Headers Applied

**Given**: Production deployment on Vercel
**When**: Navigate to `https://sparkleclassic.com/fluffy-happy`
**Then**:
- Response includes `X-Frame-Options: DENY`
- Response includes `X-Content-Type-Options: nosniff`
- Response includes `Content-Security-Policy: ...`
- Browser devtools Network tab shows headers

### Scenario 7: CSP Blocks External Scripts

**Given**: Production game loaded
**When**: Attempt to inject external script:
```javascript
const script = document.createElement('script');
script.src = 'https://malicious.com/evil.js';
document.body.appendChild(script);
```
**Then**:
- Script blocked by CSP
- Console error: "Refused to load script from 'https://malicious.com/evil.js' because it violates Content-Security-Policy"
- No external script executes

### Scenario 8: Vercel Preview Deployment

**Given**: Pull request opened with routing changes
**When**: Vercel creates preview deployment
**Then**:
- Preview URL accessible: `https://<branch>-sparkleclassic.vercel.app`
- Test slug: `https://<branch>-sparkleclassic.vercel.app/test-slug`
- Routing works identically to production
- Can test before merging

### Scenario 9: Custom Domain Configuration

**Given**: Domain `sparkleclassic.com` configured in Vercel
**When**: Navigate to `https://sparkleclassic.com/fluffy-happy`
**Then**:
- Game loads on custom domain
- No redirect to vercel.app domain
- SSL certificate valid
- Security headers present

### Scenario 10: Rollback Deployment

**Given**: New deployment breaks routing
**When**: Run `vercel rollback`
**Then**:
- Previous working deployment restored
- Routing works again
- Downtime < 1 minute

---

## Integration Points

### Depends On

- **Story 1 (Config API)**: API routes must not be rewritten
- **Story 2 (Slug Generation)**: Slugs must match routing regex pattern

### Enables

- **Story 4 (Client Loading)**: Client parses slug from URL
- **Story 7 (Designer Dashboard)**: Designers test generated URLs
- **Story 8 (Email Delivery)**: Emails contain working URLs

### External Systems

- **Vite Dev Server**: Middleware for development routing
- **Vercel Edge Network**: Production URL rewrites
- **DNS Provider**: Custom domain configuration

---

## Security Considerations

### Content Security Policy (CSP)

- ✅ Prevents XSS attacks by restricting script sources
- ✅ Blocks inline event handlers (`onclick`, etc.)
- ✅ Allows inline styles (game uses inline canvas styles)
- ✅ Restricts image loading to known origins

### Frame Options

- ✅ `X-Frame-Options: DENY` prevents clickjacking
- ✅ Game cannot be embedded in iframe on other sites
- ✅ Protects against UI redressing attacks

### MIME Type Sniffing

- ✅ `X-Content-Type-Options: nosniff` prevents MIME confusion
- ✅ Browser won't interpret files as different type
- ✅ Prevents polyglot file attacks

### HTTPS Enforcement

- ✅ Vercel automatically provides SSL certificate
- ✅ HTTP requests redirect to HTTPS
- ✅ HSTS header sets max-age for browser caching

### CORS Configuration

- ✅ API routes allow cross-origin requests (if needed)
- ✅ Game routes do NOT allow framing
- ✅ Separate CORS policies for API vs. game

---

## Definition of Done

- [ ] All acceptance criteria met and verified
- [ ] Vite middleware implemented and tested in development
- [ ] `vercel.json` created and committed to repo
- [ ] Security headers configured
- [ ] Manual testing in development passes
- [ ] Manual testing in Vercel staging passes
- [ ] Manual testing in production passes
- [ ] Security scan passes (Story 5)
- [ ] Deployment documentation written
- [ ] Code reviewed and approved
- [ ] Pull request merged

---

## Risks & Mitigation

### Risk 1: Routing Breaks in Production

**Probability**: Medium
**Impact**: Critical
**Mitigation**:
- Test on Vercel staging environment first
- Use preview deployments for every PR
- Have rollback command ready: `vercel rollback`
- Monitor error rates in first hour post-deployment

### Risk 2: CSP Too Restrictive

**Probability**: Medium
**Impact**: High
**Mitigation**:
- Test CSP in staging with all game features
- Use `Content-Security-Policy-Report-Only` initially
- Monitor CSP violation reports
- Iteratively relax policy if needed

### Risk 3: Vite Middleware Conflicts

**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Place middleware early in chain (before other plugins)
- Test with HMR (hot module replacement)
- Verify no console warnings
- Consider alternative: Vite plugin if issues arise

---

## Development Checklist

### Setup (30 minutes)

- [ ] Create `vercel.json` in project root
- [ ] Update `vite.config.js` with middleware
- [ ] Test Vite dev server starts without errors

### Implementation (2-3 hours)

- [ ] Implement Vite middleware with regex pattern
- [ ] Configure Vercel rewrites in correct order
- [ ] Add security headers to `vercel.json`
- [ ] Add CSP with appropriate directives
- [ ] Test middleware logic with various URL patterns

### Testing (1-2 hours)

- [ ] Manual test all routing scenarios in dev
- [ ] Create automated routing test script
- [ ] Deploy to Vercel staging
- [ ] Manual test all scenarios in staging
- [ ] Run security header verification

### Deployment (1 hour)

- [ ] Deploy to production with approval
- [ ] Verify custom domain routing
- [ ] Monitor error rates for 1 hour
- [ ] Document any issues and resolutions

---

## Deployment Guide

### Initial Vercel Setup

1. **Install Vercel CLI**:
```bash
npm i -g vercel
vercel login
```

2. **Link Project**:
```bash
vercel link
# Follow prompts to link to Vercel project
```

3. **Set Environment Variables**:
```bash
vercel env add DATABASE_URL production
# Paste PostgreSQL connection string
vercel env add JWT_SECRET production
# Paste JWT secret key
```

4. **Deploy to Staging**:
```bash
vercel
# Vercel creates preview deployment
# Test URL: https://<unique-id>.vercel.app
```

5. **Deploy to Production**:
```bash
vercel --prod
# Deploys to production domain
```

### Custom Domain Configuration

1. **Add Domain in Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add `sparkleclassic.com`

2. **Configure DNS**:
   - Add CNAME record: `sparkleclassic.com` → `cname.vercel-dns.com`
   - Add A records for apex domain (provided by Vercel)

3. **Wait for DNS Propagation** (10-60 minutes)

4. **Test Custom Domain**:
```bash
curl -I https://sparkleclassic.com/fluffy-happy
# Should return 200 OK with security headers
```

### Rollback Procedure

**If deployment breaks:**
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-id>

# Or use instant rollback
vercel rollback
```

**Expected downtime**: < 1 minute

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Dependencies**: Story 1 (Config API), Story 2 (Slug Generation)
**Next Story**: Story 4 (Client-Side Config Loading)
