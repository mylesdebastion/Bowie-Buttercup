# User Story: Slug Generation & Collision Handling

**Story ID**: VanityURL-002
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P0 - Business Critical
**Estimated Effort**: 4-6 hours
**Sprint**: Sprint 1 (Week 1)
**Dependencies**: Story 1 (Database Schema & Config API)

---

## User Story

**As a** SparkleClassic designer
**I want** an automatic slug generation system that creates unique, memorable URLs for each pet
**So that** customers with duplicate pet names (like "Fluffy") can each have their own unique game URL without collisions

---

## Business Context

The slug generation system is critical for scaling the business beyond early adopters. Consider this scenario:

- **Without collision handling**: First customer named "Fluffy" gets `/fluffy`, second customer gets error
- **With collision handling**: First gets `/fluffy-happy`, second gets `/fluffy-brave`, etc.

This enables:
- **Revenue Protection**: No lost sales due to duplicate pet names
- **Customer Experience**: Every customer gets a unique, shareable URL
- **Brand Consistency**: URLs read naturally (e.g., "fluffy is happy")
- **Scalability**: System supports 90+ customers per pet name

### Market Data
- "Max" is the #1 most popular pet name (8.7% of dogs)
- "Bella" is #2 (6.8% of dogs)
- "Fluffy" is common for cats
- **Need for 100+ unique URLs per popular name**

---

## Acceptance Criteria

### Safeword Pool

- [ ] **AC1.1**: Safeword pool contains exactly 90 words:
  - 50 personality traits (happy, brave, calm, clever, etc.)
  - 25 nature words (autumn, blossom, cloud, forest, etc.)
  - 15 color words (amber, azure, coral, crimson, etc.)

- [ ] **AC1.2**: All safewords are:
  - Lowercase only
  - Single English words
  - Positive/neutral connotation
  - Family-friendly (no profanity)
  - Easy to spell and pronounce
  - 4-10 characters long

- [ ] **AC1.3**: Safeword pool stored as constant:
  ```javascript
  const SAFEWORDS = [
    // Personality traits (50)
    'happy', 'brave', 'calm', 'clever', 'curious', 'gentle', 'playful',
    // ... (full list in implementation)
  ];
  ```

### Slug Generation Algorithm

- [ ] **AC2.1**: `generateSlug(petName)` function:
  - Converts pet name to lowercase
  - Removes special characters (only keeps alphanumeric)
  - Replaces spaces with hyphens
  - Selects random safeword from pool
  - Returns format: `[petname]-[safeword]`

- [ ] **AC2.2**: Pet name normalization examples:
  - "Fluffy" → "fluffy"
  - "Mr. Whiskers" → "mrwhiskers"
  - "Bella Rose" → "bellarose"
  - "Max-2000" → "max2000"

- [ ] **AC2.3**: Generated slugs meet validation rules:
  - 5-50 characters total
  - Alphanumeric + hyphen only
  - Does not start or end with hyphen
  - Single hyphen between pet name and safeword

### Collision Handling

- [ ] **AC3.1**: `generateUniqueSlug(petName)` function implements retry logic:
  1. Generate initial slug with random safeword
  2. Check database for uniqueness
  3. If taken, try different random safeword
  4. Repeat up to 10 attempts
  5. If all fail, append number: `[petname]-[safeword]-2`

- [ ] **AC3.2**: Collision resolution examples:
  - 1st Fluffy: `fluffy-happy` (random safeword)
  - 2nd Fluffy: `fluffy-brave` (different random safeword)
  - 91st Fluffy: `fluffy-calm-2` (safeword pool exhausted, append number)
  - 181st Fluffy: `fluffy-sunny-3` (continue numbering)

- [ ] **AC3.3**: Function never returns duplicate slug:
  - Uniqueness verified against database before returning
  - Transaction prevents race conditions
  - Returns error only if 100 attempts fail (extremely unlikely)

- [ ] **AC3.4**: Performance requirements:
  - Average generation time < 50ms
  - 99th percentile < 200ms
  - Handles 1000 concurrent generation requests

### Slug Validation & Blacklist

- [ ] **AC4.1**: `validateSlug(slug)` function checks:
  - Format: `/^[a-z0-9]+(-[a-z0-9]+)+$/` (must have at least one hyphen)
  - Length: 5-50 characters
  - Not in blacklist
  - Returns `{valid: true}` or `{valid: false, reason: "..."}`

- [ ] **AC4.2**: Blacklist prevents reserved/profane words:
  ```javascript
  const BLACKLIST = [
    // System routes
    'api', 'admin', 'auth', 'login', 'logout', 'signup',
    'dashboard', 'profile', 'settings', 'help', 'about',
    // Common patterns that could break routing
    'static', 'public', 'assets', 'images', 'fonts',
    // Profanity/offensive (list maintained separately)
    /* ... profanity list ... */
  ];
  ```

- [ ] **AC4.3**: Blacklist check applies to pet name portion only:
  - "admin-happy" → REJECTED (pet name is blacklisted)
  - "happy-admin" → ALLOWED (safeword can be any word)

### API Endpoint

- [ ] **AC5.1**: `POST /api/admin/configs/generate-slug` endpoint:
  - Requires JWT authentication (admin or designer role)
  - Request body: `{"petName": "Fluffy"}`
  - Response: `{"slug": "fluffy-happy", "available": true}`
  - Returns 400 if pet name invalid
  - Returns 429 if rate limit exceeded

- [ ] **AC5.2**: Response includes safeword separately for UI display:
  ```json
  {
    "slug": "fluffy-happy",
    "petName": "fluffy",
    "safeword": "happy",
    "available": true,
    "alternatives": ["fluffy-brave", "fluffy-sunny"]
  }
  ```

- [ ] **AC5.3**: Endpoint optionally returns alternative slugs:
  - Generates 3 additional slug options
  - Useful for designer to choose preferred option
  - All alternatives verified as available

### Manual Override Support

- [ ] **AC6.1**: Designer can provide custom slug via admin dashboard
- [ ] **AC6.2**: Custom slug must pass same validation as generated slugs
- [ ] **AC6.3**: Custom slug checked for availability before allowing
- [ ] **AC6.4**: System logs whether slug was auto-generated or manual

---

## Technical Implementation Notes

### Slug Generation Service

```javascript
// services/slugGenerator.js
const crypto = require('crypto');
const { Pool } = require('pg');

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

const BLACKLIST = [
  'api', 'admin', 'auth', 'login', 'logout', 'signup',
  'dashboard', 'profile', 'settings', 'help', 'about',
  'static', 'public', 'assets', 'images', 'fonts'
  // Add profanity list from external file
];

class SlugGenerator {
  constructor(dbPool) {
    this.db = dbPool;
  }

  normalizePetName(petName) {
    return petName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .slice(0, 30); // Limit length
  }

  getRandomSafeword() {
    const randomIndex = crypto.randomInt(0, SAFEWORDS.length);
    return SAFEWORDS[randomIndex];
  }

  validateSlug(slug) {
    // Format check
    if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(slug)) {
      return { valid: false, reason: 'Invalid format' };
    }

    // Length check
    if (slug.length < 5 || slug.length > 50) {
      return { valid: false, reason: 'Length must be 5-50 characters' };
    }

    // Blacklist check (pet name portion only)
    const petNamePortion = slug.split('-')[0];
    if (BLACKLIST.includes(petNamePortion)) {
      return { valid: false, reason: 'Pet name contains reserved word' };
    }

    return { valid: true };
  }

  async checkAvailability(slug) {
    const result = await this.db.query(
      'SELECT id FROM game_configs WHERE slug = $1',
      [slug]
    );
    return result.rows.length === 0;
  }

  async generateUniqueSlug(petName, maxAttempts = 10) {
    const normalizedName = this.normalizePetName(petName);

    // Validate normalized name
    if (!normalizedName || normalizedName.length < 2) {
      throw new Error('Pet name too short after normalization');
    }

    if (BLACKLIST.includes(normalizedName)) {
      throw new Error('Pet name contains reserved word');
    }

    // Try random safewords first
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const safeword = this.getRandomSafeword();
      const slug = `${normalizedName}-${safeword}`;

      const validation = this.validateSlug(slug);
      if (!validation.valid) {
        continue; // Try different safeword
      }

      const available = await this.checkAvailability(slug);
      if (available) {
        return {
          slug,
          petName: normalizedName,
          safeword,
          available: true,
          attempts: attempt + 1
        };
      }
    }

    // If all random attempts fail, try sequential numbering
    for (let number = 2; number <= 100; number++) {
      const safeword = this.getRandomSafeword();
      const slug = `${normalizedName}-${safeword}-${number}`;

      const available = await this.checkAvailability(slug);
      if (available) {
        return {
          slug,
          petName: normalizedName,
          safeword: `${safeword}-${number}`,
          available: true,
          attempts: maxAttempts + number
        };
      }
    }

    throw new Error('Unable to generate unique slug after 100 attempts');
  }

  async generateAlternatives(petName, count = 3) {
    const alternatives = [];
    const normalizedName = this.normalizePetName(petName);

    let attempts = 0;
    while (alternatives.length < count && attempts < 50) {
      const safeword = this.getRandomSafeword();
      const slug = `${normalizedName}-${safeword}`;

      // Skip if already in alternatives
      if (alternatives.includes(slug)) {
        attempts++;
        continue;
      }

      const available = await this.checkAvailability(slug);
      if (available) {
        alternatives.push(slug);
      }
      attempts++;
    }

    return alternatives;
  }
}

module.exports = SlugGenerator;
```

### API Endpoint Implementation

```javascript
// routes/admin.js
const express = require('express');
const SlugGenerator = require('../services/slugGenerator');
const { authenticateJWT, requireRole } = require('../middleware/auth');

const router = express.Router();
const slugGenerator = new SlugGenerator(dbPool);

router.post('/api/admin/configs/generate-slug',
  authenticateJWT,
  requireRole(['admin', 'designer']),
  async (req, res) => {
    try {
      const { petName } = req.body;

      if (!petName || typeof petName !== 'string') {
        return res.status(400).json({
          error: 'Pet name is required',
          code: 'INVALID_PET_NAME'
        });
      }

      // Generate primary slug
      const result = await slugGenerator.generateUniqueSlug(petName);

      // Generate alternatives
      const alternatives = await slugGenerator.generateAlternatives(petName, 3);

      res.json({
        slug: result.slug,
        petName: result.petName,
        safeword: result.safeword,
        available: true,
        alternatives,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Slug generation error:', error);

      if (error.message.includes('reserved word')) {
        return res.status(400).json({
          error: error.message,
          code: 'RESERVED_WORD'
        });
      }

      res.status(500).json({
        error: 'Failed to generate slug',
        code: 'GENERATION_ERROR'
      });
    }
  }
);
```

---

## Test Scenarios

### Scenario 1: First Pet with Common Name

**Given**: No existing configs with pet name "Fluffy"
**When**: Generate slug for "Fluffy"
**Then**:
- Returns slug like "fluffy-happy" (random safeword)
- Slug is available in database
- Response includes safeword and alternatives
- Generation time < 50ms

### Scenario 2: Collision with Existing Slug

**Given**: "fluffy-happy" already exists in database
**When**: Generate slug for "Fluffy"
**Then**:
- Algorithm tries random safewords until finding available one
- Returns different slug like "fluffy-brave"
- Does NOT return "fluffy-happy"
- Uniqueness verified in database

### Scenario 3: Exhausted Safeword Pool

**Given**: 90 configs exist for pet name "Max" (all safewords used)
**When**: Generate slug for 91st "Max"
**Then**:
- Algorithm falls back to numbering
- Returns slug like "max-happy-2"
- Number appended to random safeword
- Slug is unique and available

### Scenario 4: Special Characters in Pet Name

**Given**: Pet name is "Mr. Whiskers!"
**When**: Generate slug
**Then**:
- Normalizes to "mrwhiskers"
- Removes periods and exclamation marks
- Generates valid slug like "mrwhiskers-clever"
- Validation passes

### Scenario 5: Multi-Word Pet Name

**Given**: Pet name is "Bella Rose"
**When**: Generate slug
**Then**:
- Normalizes to "bellarose" (no hyphen between words)
- Generates slug like "bellarose-sunny"
- Hyphen only between pet name and safeword

### Scenario 6: Blacklisted Pet Name

**Given**: Pet name is "admin"
**When**: Generate slug
**Then**:
- Returns 400 error
- Error message: "Pet name contains reserved word"
- No database query made
- Suggests user choose different name

### Scenario 7: Very Long Pet Name

**Given**: Pet name is "SuperFluffyMcFlufferson"
**When**: Generate slug
**Then**:
- Truncates to first 30 characters: "superfluffymcflufferson"
- Generates slug like "superfluffymcflufferson-brave"
- Total length within 50 character limit

### Scenario 8: Empty or Invalid Pet Name

**Given**: Pet name is "" or "@@@@"
**When**: Generate slug
**Then**:
- Returns 400 error
- Error message: "Pet name too short after normalization"
- No database query made

### Scenario 9: Request with Alternatives

**Given**: Pet name is "Luna"
**When**: Call endpoint with alternatives requested
**Then**:
- Returns primary slug: "luna-gentle"
- Returns 3 alternatives: ["luna-starry", "luna-moonlight", "luna-silver"]
- All 4 options verified as available
- Designer can choose preferred option

### Scenario 10: Concurrent Slug Generation

**Given**: Two designers generate slugs for "Max" simultaneously
**When**: Both requests hit API at same time
**Then**:
- Transaction isolation prevents race condition
- Both get unique slugs (e.g., "max-brave" and "max-clever")
- No duplicate slugs returned
- Database uniqueness constraint enforced

---

## Integration Points

### Depends On

- **Story 1 (Database Schema)**: Needs `game_configs` table to check uniqueness

### Enables

- **Story 3 (URL Routing)**: URLs use generated slugs
- **Story 4 (Client Loading)**: Client fetches config by slug
- **Story 7 (Designer Dashboard)**: Dashboard calls this API to generate slugs
- **Story 8 (Email Delivery)**: Email includes generated slug

### External Systems

- **PostgreSQL Database**: Queries for slug uniqueness
- **Crypto Module**: Secure random number generation for safeword selection

---

## Security Considerations

### Input Validation

- ✅ Pet name sanitized to prevent SQL injection
- ✅ Length limits prevent DoS attacks
- ✅ Blacklist prevents route collisions
- ✅ Profanity filter applied

### Rate Limiting

- ✅ Endpoint limited to 60 requests/minute per designer
- ✅ Prevents abuse of slug generation
- ✅ Database queries optimized with indexes

### Race Conditions

- ✅ Database uniqueness constraint prevents duplicates
- ✅ Transaction isolation (READ COMMITTED level)
- ✅ Retry logic handles concurrent conflicts

### Randomness

- ✅ Uses crypto.randomInt() for cryptographically secure random
- ✅ Not predictable by attackers
- ✅ No bias in safeword selection

---

## Definition of Done

- [ ] All acceptance criteria met and verified
- [ ] SlugGenerator service implemented and tested
- [ ] API endpoint functional
- [ ] Unit tests for normalization, validation, collision handling
- [ ] Integration tests with database
- [ ] Load tests demonstrate 1000 concurrent generations
- [ ] Code reviewed and approved
- [ ] Documentation updated with slug format examples
- [ ] Pull request merged

---

## Risks & Mitigation

### Risk 1: Popular Pet Names Exhaust Pool

**Probability**: Low
**Impact**: Medium
**Mitigation**:
- 90-word pool supports 90 unique games per name
- Numbering fallback supports unlimited games
- Monitor pool usage via analytics (Story 10)

### Risk 2: Slow Database Lookups

**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Index on `slug` column (Story 1)
- Cache recently checked slugs in memory
- Limit to 10 database queries per generation

---

## Development Checklist

### Implementation (2-3 hours)

- [ ] Create `services/slugGenerator.js` file
- [ ] Implement safeword pool constant
- [ ] Implement blacklist constant
- [ ] Implement `normalizePetName()` method
- [ ] Implement `getRandomSafeword()` method
- [ ] Implement `validateSlug()` method
- [ ] Implement `checkAvailability()` method
- [ ] Implement `generateUniqueSlug()` method
- [ ] Implement `generateAlternatives()` method
- [ ] Add API endpoint to admin routes

### Testing (1-2 hours)

- [ ] Unit tests for normalization edge cases
- [ ] Unit tests for validation rules
- [ ] Integration tests for collision handling
- [ ] Load tests for concurrent generation
- [ ] Test blacklist enforcement

### Deployment (1 hour)

- [ ] Deploy to staging
- [ ] Generate 100 test slugs
- [ ] Verify no duplicates
- [ ] Test in designer dashboard (Story 7)

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Dependencies**: Story 1 (Database Schema)
**Next Story**: Story 3 (URL Routing)
