# User Story: Client-Side Config Loading

**Story ID**: VanityURL-004
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P0 - Business Critical
**Estimated Effort**: 6-8 hours
**Sprint**: Sprint 1 (Week 1)
**Dependencies**: Story 1 (Config API), Story 3 (URL Routing)

---

## User Story

**As a** game client loading in the browser
**I want** to extract the slug from the URL, fetch the config from the API, and load the personalized game
**So that** customers see their custom pet and game experience when visiting their vanity URL

---

## Business Context

This story brings the entire vanity URL system to life. Without this, customers would see a broken game or default experience despite having a custom URL.

### Customer Journey Completion
1. ✅ Customer receives email: "Your game is ready at sparkleclassic.com/fluffy-happy"
2. ✅ Customer clicks link
3. **→ THIS STORY**: Game loads with Fluffy's custom sprite and personalized settings
4. ✅ Customer plays and shares URL

### Technical Requirements
- Parse slug from `window.location.pathname`
- Fetch config from `GET /api/configs/:slug`
- Cache config in localStorage (24h TTL)
- Fallback hierarchy for resilience
- Update document metadata for SEO/sharing

---

## Acceptance Criteria

### URL Parsing

- [ ] **AC1.1**: Extract slug from pathname:
  ```javascript
  // URL: https://sparkleclassic.com/fluffy-happy
  const slug = window.location.pathname.slice(1); // "fluffy-happy"
  ```

- [ ] **AC1.2**: Handle edge cases:
  - Root path `/` → no slug, use default
  - Path with trailing slash `/fluffy-happy/` → strip slash
  - Nested paths `/fluffy-happy/level2` → use first segment only
  - Query params `/fluffy-happy?debug=true` → ignore query, extract slug

- [ ] **AC1.3**: Validate slug format before API call:
  - Must match `/^[a-z0-9-]{5,50}$/`
  - Invalid format → skip API call, use default config

### API Integration

- [ ] **AC2.1**: Fetch config from API:
  ```javascript
  const response = await fetch(`/api/configs/${slug}`);
  const config = await response.json();
  ```

- [ ] **AC2.2**: Handle HTTP status codes:
  - 200: Success → use config
  - 404: Not found → fallback to default
  - 403: Deleted/inactive → show user-friendly error
  - 500/503: Server error → fallback to cache or default
  - Network error: → fallback to cache or default

- [ ] **AC2.3**: Set timeout for API request:
  - Timeout after 5 seconds
  - Show loading indicator while waiting
  - Fallback if timeout exceeded

### Caching Strategy

- [ ] **AC3.1**: Cache successful config in localStorage:
  ```javascript
  localStorage.setItem(`config-${slug}`, JSON.stringify({
    data: config,
    timestamp: Date.now()
  }));
  ```

- [ ] **AC3.2**: Check cache before API call:
  - If cache exists and < 24 hours old → use cached config
  - If cache expired → fetch from API, update cache
  - Cache miss → fetch from API

- [ ] **AC3.3**: Cache invalidation:
  - User can force refresh with `Ctrl+Shift+R`
  - Query param `?nocache=true` bypasses cache
  - Cache cleared on config update (Story 6)

### Fallback Hierarchy

- [ ] **AC4.1**: Implement 4-tier fallback system:
  ```
  1. API fetch (primary)
  2. localStorage cache (if API fails)
  3. Query param fallback (?pet=bowie)
  4. Hardcoded default (Bowie Cat)
  ```

- [ ] **AC4.2**: Log which fallback was used:
  ```javascript
  console.log('✅ Config loaded from: API');
  // or "cache", "query-param", "default"
  ```

- [ ] **AC4.3**: Show user-friendly message for non-API sources:
  - Cache: "Playing offline with cached game"
  - Default: "Game not found. Playing default game."

### Document Metadata Updates

- [ ] **AC5.1**: Update page title:
  ```javascript
  document.title = `${config.petName}'s Adventure - SparkleClassic`;
  // Example: "Fluffy's Adventure - SparkleClassic"
  ```

- [ ] **AC5.2**: Update Open Graph meta tags for social sharing:
  ```html
  <meta property="og:title" content="Fluffy's Adventure - SparkleClassic">
  <meta property="og:description" content="Play Fluffy's personalized platformer game!">
  <meta property="og:image" content="https://storage.googleapis.com/sprites/fluffy-preview.png">
  <meta property="og:url" content="https://sparkleclassic.com/fluffy-happy">
  ```

- [ ] **AC5.3**: Update Twitter Card meta tags:
  ```html
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Fluffy's Adventure">
  <meta name="twitter:description" content="Play Fluffy's personalized platformer game!">
  <meta name="twitter:image" content="https://storage.googleapis.com/sprites/fluffy-preview.png">
  ```

### Game Integration

- [ ] **AC6.1**: Pass config to game initialization:
  ```javascript
  const game = new Game(canvas);
  await game.loadConfig(config);
  await game.init();
  game.start();
  ```

- [ ] **AC6.2**: Config applied to game:
  - Custom sprite loaded from `config.spriteUrl`
  - Pet name displayed in UI
  - Custom settings applied (difficulty, theme, etc.)

- [ ] **AC6.3**: Game starts within 3 seconds of page load:
  - Show loading indicator immediately
  - Display progress: "Loading Fluffy's game..."
  - Hide loading indicator when game ready

---

## Technical Implementation Notes

### Config Loader Service

**File**: `src/core/ConfigLoader.js`

```javascript
export class ConfigLoader {
  constructor() {
    this.cachePrefix = 'config-';
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
  }

  extractSlug() {
    let pathname = window.location.pathname;

    // Remove leading/trailing slashes
    pathname = pathname.replace(/^\/|\/$/g, '');

    // Handle root or empty
    if (!pathname) {
      return null;
    }

    // Take first segment only
    const slug = pathname.split('/')[0];

    // Validate format
    if (!/^[a-z0-9-]{5,50}$/.test(slug)) {
      console.warn(`Invalid slug format: ${slug}`);
      return null;
    }

    return slug;
  }

  async fetchFromAPI(slug) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`/api/configs/${slug}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 404) {
        console.warn(`Config not found for slug: ${slug}`);
        return null;
      }

      if (response.status === 403) {
        throw new Error('Game no longer available');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const config = await response.json();
      console.log('✅ Config loaded from: API');

      return config;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('API request timed out');
      } else {
        console.error('API fetch failed:', error);
      }
      return null;
    }
  }

  getCached(slug) {
    try {
      const key = `${this.cachePrefix}${slug}`;
      const cached = localStorage.getItem(key);

      if (!cached) {
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > this.cacheTTL) {
        console.log('Cache expired, removing...');
        localStorage.removeItem(key);
        return null;
      }

      console.log('✅ Config loaded from: cache');
      return data;
    } catch (error) {
      console.error('Cache read failed:', error);
      return null;
    }
  }

  setCache(slug, config) {
    try {
      const key = `${this.cachePrefix}${slug}`;
      const value = JSON.stringify({
        data: config,
        timestamp: Date.now()
      });

      localStorage.setItem(key, value);
      console.log('✅ Config cached');
    } catch (error) {
      console.error('Cache write failed:', error);
    }
  }

  getQueryParamPet() {
    const urlParams = new URLSearchParams(window.location.search);
    const petParam = urlParams.get('pet');

    if (petParam) {
      console.log('✅ Config loaded from: query-param');

      // Map pet param to config
      if (petParam.toLowerCase() === 'buttercup' || petParam === 'B') {
        return this.getDefaultConfig('B');
      }
      return this.getDefaultConfig('A');
    }

    return null;
  }

  getDefaultConfig(petId = 'A') {
    console.log('✅ Config loaded from: default');

    return {
      slug: 'default',
      petName: petId === 'A' ? 'Bowie' : 'Buttercup',
      configJson: {
        spritesheet: `/src/assets/sprites/pet-${petId}-spritesheet.png`,
        metadata: {
          title: `${petId === 'A' ? 'Bowie' : 'Buttercup'} Cat`,
          description: petId === 'A' ? 'Calm gray tabby' : 'Curious cream cat'
        }
      },
      spriteUrl: `/src/assets/sprites/pet-${petId}-spritesheet.png`
    };
  }

  async loadConfig() {
    const slug = this.extractSlug();

    // No slug → use default
    if (!slug) {
      return this.getDefaultConfig();
    }

    // Check for nocache param
    const urlParams = new URLSearchParams(window.location.search);
    const nocache = urlParams.get('nocache');

    // Try cache first (unless nocache=true)
    if (!nocache) {
      const cached = this.getCached(slug);
      if (cached) {
        return cached;
      }
    }

    // Try API
    const apiConfig = await this.fetchFromAPI(slug);
    if (apiConfig) {
      this.setCache(slug, apiConfig);
      return apiConfig;
    }

    // Fallback to cache even if expired (offline mode)
    const staleCache = this.getCached(slug);
    if (staleCache) {
      console.log('⚠️ Using stale cache (offline mode)');
      return staleCache;
    }

    // Try query param
    const queryConfig = this.getQueryParamPet();
    if (queryConfig) {
      return queryConfig;
    }

    // Final fallback
    return this.getDefaultConfig();
  }

  updateMetadata(config) {
    // Update title
    document.title = `${config.petName}'s Adventure - SparkleClassic`;

    // Update or create meta tags
    this.setMetaTag('og:title', `${config.petName}'s Adventure - SparkleClassic`);
    this.setMetaTag('og:description', `Play ${config.petName}'s personalized platformer game!`);
    this.setMetaTag('og:image', config.spriteUrl || '/default-og-image.png');
    this.setMetaTag('og:url', window.location.href);

    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', `${config.petName}'s Adventure`);
    this.setMetaTag('twitter:description', `Play ${config.petName}'s personalized platformer game!`);
    this.setMetaTag('twitter:image', config.spriteUrl || '/default-twitter-image.png');
  }

  setMetaTag(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`) ||
                document.querySelector(`meta[name="${property}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      if (property.startsWith('og:')) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', property);
      }
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
  }
}
```

### Integration in src/index.js

```javascript
import { Game } from './core/Game.js';
import { ConfigLoader } from './core/ConfigLoader.js';
import { PetSelector } from './ui/PetSelector.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initializeGame();
});

async function initializeGame() {
  try {
    console.log('🎮 Initializing Cat Platformer...');

    // Show loading indicator
    showLoadingIndicator();

    // Get or create canvas
    let canvas = document.getElementById('gameCanvas');
    if (!canvas) {
      canvas = createCanvas();
    }

    // Load config from URL
    const configLoader = new ConfigLoader();
    const config = await configLoader.loadConfig();

    console.log(`🐱 Loaded config for: ${config.petName}`);

    // Update page metadata
    configLoader.updateMetadata(config);

    // Create game
    const game = new Game(canvas);

    // Apply config
    game.loadConfig(config.configJson);

    // Initialize and start
    await game.init();
    game.start();

    // Hide loading indicator
    hideLoadingIndicator();

    console.log('✅ Game loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load game:', error);
    showErrorMessage('Failed to load game. Please try refreshing.');
  }
}

function showLoadingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'loadingIndicator';
  indicator.innerHTML = `
    <div class="spinner"></div>
    <p>Loading your game...</p>
  `;
  document.body.appendChild(indicator);
}

function hideLoadingIndicator() {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

function showErrorMessage(message) {
  alert(message); // Replace with better UI in production
}
```

---

## Test Scenarios

### Scenario 1: Fresh Load from API

**Given**: Visiting `/fluffy-happy` for the first time
**When**: Page loads
**Then**:
- Slug "fluffy-happy" extracted from URL
- API call to `/api/configs/fluffy-happy`
- Config returned with Fluffy's sprite
- Config cached in localStorage
- Document title: "Fluffy's Adventure - SparkleClassic"
- Game loads with custom sprite

### Scenario 2: Cached Load (Offline)

**Given**: Config for "fluffy-happy" cached less than 24h ago
**And**: API is unreachable (offline)
**When**: Page loads
**Then**:
- Cache hit in localStorage
- No API call made
- Cached config used
- Console: "✅ Config loaded from: cache"
- Game loads normally

### Scenario 3: Expired Cache

**Given**: Config cached more than 24 hours ago
**When**: Page loads
**Then**:
- Cache expired, removed from localStorage
- API call made to fetch fresh config
- New config cached
- Console: "✅ Config loaded from: API"

### Scenario 4: Config Not Found (404)

**Given**: Visiting `/nonexistent-slug`
**When**: Page loads
**Then**:
- API returns 404
- Fallback to default config (Bowie Cat)
- Console: "✅ Config loaded from: default"
- User sees message: "Game not found. Playing default game."

### Scenario 5: Config Deleted (403)

**Given**: Game was refunded, config soft-deleted
**When**: Visiting `/refunded-game`
**Then**:
- API returns 403
- Error message: "Game no longer available"
- Fallback to default config
- Customer service link displayed

### Scenario 6: API Timeout

**Given**: API is slow (>5 seconds)
**When**: Page loads
**Then**:
- Request aborted after 5 seconds
- Fallback to cache (if available)
- If no cache, fallback to default
- Console: "API request timed out"

### Scenario 7: Query Param Fallback

**Given**: Visiting `/invalid@slug?pet=buttercup`
**When**: Page loads
**Then**:
- Slug validation fails
- Query param detected: `pet=buttercup`
- Loads Buttercup Cat config
- Console: "✅ Config loaded from: query-param"

### Scenario 8: Social Media Share

**Given**: Config loaded for "fluffy-happy"
**When**: User shares URL on Facebook
**Then**:
- Facebook scrapes Open Graph tags
- Preview shows: "Fluffy's Adventure - SparkleClassic"
- Image shows Fluffy's sprite
- Link works: `https://sparkleclassic.com/fluffy-happy`

### Scenario 9: Force Refresh (nocache)

**Given**: Visiting `/fluffy-happy?nocache=true`
**When**: Page loads
**Then**:
- Cache bypassed
- Fresh API call made
- New config cached
- Old cache overwritten

### Scenario 10: Multiple Tabs

**Given**: Game open in Tab 1
**When**: Open `/fluffy-happy` in Tab 2
**Then**:
- Tab 2 uses cache from Tab 1
- No duplicate API calls
- Both tabs show same config
- Cache shared across tabs

---

## Integration Points

### Depends On

- **Story 1 (Config API)**: Needs API endpoint to fetch configs
- **Story 3 (URL Routing)**: Needs routing to work for slug extraction

### Enables

- **Story 6 (Admin Dashboard)**: Admins can test config loading
- **Story 7 (Designer Dashboard)**: Designers verify their created configs
- **Story 8 (Email Delivery)**: Email URLs actually load games

---

## Definition of Done

- [ ] ConfigLoader service implemented
- [ ] All acceptance criteria met
- [ ] Unit tests for slug extraction, caching, fallback
- [ ] Integration tests with mock API
- [ ] E2E tests with real API
- [ ] Loading indicator functional
- [ ] Metadata updates verified
- [ ] Social media previews tested
- [ ] Code reviewed and merged

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 5 (Security Hardening)
