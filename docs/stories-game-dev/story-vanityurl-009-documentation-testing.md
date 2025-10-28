# User Story: Documentation & Testing

**Story ID**: VanityURL-009
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P1 - High
**Estimated Effort**: 8-10 hours
**Sprint**: Sprint 3 (Week 3)
**Dependencies**: All previous stories (1-8)

---

## User Story

**As a** development team member
**I want** comprehensive documentation and automated tests for the vanity URL system
**So that** the system is maintainable, reliable, and new team members can understand and contribute effectively

---

## Business Context

Documentation and testing prevent:
- **Production Incidents**: Bugs caught before deployment
- **Knowledge Loss**: System understandable without original developers
- **Slow Onboarding**: New developers productive quickly
- **Support Burden**: Clear docs reduce questions

---

## Acceptance Criteria

### System Documentation

- [ ] **AC1.1**: README.md updated with:
  - URL format explanation (`/[petname]-[safeword]`)
  - Examples of valid URLs
  - How collision handling works
  - Architecture overview diagram

- [ ] **AC1.2**: API documentation (Swagger/OpenAPI):
  - All endpoints documented
  - Request/response examples
  - Authentication requirements
  - Error codes explained
  - Interactive API explorer at `/api/docs`

- [ ] **AC1.3**: Developer guide (`docs/developer-guide.md`):
  - Local setup instructions
  - Environment variables required
  - Database migration process
  - Running tests locally
  - Debugging tips

- [ ] **AC1.4**: Deployment guide (`docs/deployment-guide.md`):
  - Vercel deployment steps
  - Database setup (Railway/Vercel Postgres)
  - Environment variable configuration
  - Custom domain setup
  - Rollback procedure

### Unit Tests

- [ ] **AC2.1**: Slug generation tests (100% coverage):
  - Pet name normalization edge cases
  - Safeword randomness distribution
  - Collision handling logic
  - Blacklist enforcement

- [ ] **AC2.2**: Config validation tests:
  - Valid config accepted
  - Invalid JSON rejected
  - XSS payloads sanitized
  - SQL injection blocked

- [ ] **AC2.3**: API endpoint tests:
  - GET /api/configs/:slug success and 404
  - POST /api/configs authorization
  - Rate limiting enforcement
  - Error response formats

- [ ] **AC2.4**: Client-side tests:
  - Slug parsing from URL
  - Config caching logic
  - Fallback hierarchy
  - Metadata updates

- [ ] **AC2.5**: Test coverage > 90% (measured by Jest)

### Integration Tests

- [ ] **AC3.1**: Database integration tests:
  - Config CRUD operations
  - Transaction rollback on error
  - Unique constraint enforcement
  - Audit log creation

- [ ] **AC3.2**: API integration tests:
  - Full request/response cycle
  - Authentication flow
  - Rate limiting across requests
  - Error handling

- [ ] **AC3.3**: Email integration tests (with mocks):
  - Email sent on game creation
  - Delivery tracking updates
  - Resend functionality

### End-to-End Tests (Playwright)

- [ ] **AC4.1**: Customer journey test:
  ```javascript
  test('Customer accesses game via vanity URL', async ({ page }) => {
    // Navigate to vanity URL
    await page.goto('http://localhost:3000/fluffy-happy');

    // Verify game loads
    await expect(page.locator('canvas#gameCanvas')).toBeVisible();

    // Verify page title
    await expect(page).toHaveTitle(/Fluffy's Adventure/);

    // Verify game starts
    await page.waitForTimeout(2000);
    const gameState = await page.evaluate(() => window.game.isRunning);
    expect(gameState).toBe(true);
  });
  ```

- [ ] **AC4.2**: Designer workflow test:
  - Login to designer dashboard
  - Upload sprite
  - Generate slug
  - Create game
  - Verify email sent
  - Verify game accessible

- [ ] **AC4.3**: Admin workflow test:
  - Login to admin dashboard
  - Search for config
  - View details
  - Process refund (soft delete)
  - Verify game returns 403

- [ ] **AC4.4**: Error handling test:
  - Non-existent slug shows friendly error
  - Invalid slug format handled gracefully
  - API timeout falls back to cache

### Performance Tests

- [ ] **AC5.1**: Load test with k6:
  ```javascript
  import http from 'k6/http';
  import { check } from 'k6';

  export const options = {
    vus: 100, // 100 virtual users
    duration: '30s'
  };

  export default function () {
    const res = http.get('https://sparkleclassic.com/fluffy-happy');

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.duration < 200
    });
  }
  ```

- [ ] **AC5.2**: Performance requirements met:
  - p95 latency < 200ms for GET /api/configs/:slug
  - p95 latency < 500ms for game page load
  - 1000 concurrent users handled without errors
  - No memory leaks over 10,000 requests

- [ ] **AC5.3**: Database query performance:
  - Slug lookup < 10ms (indexed)
  - Config list (paginated) < 50ms
  - Search queries < 100ms

### Security Testing

- [ ] **AC6.1**: OWASP Top 10 testing:
  - SQL injection attempts blocked
  - XSS payloads sanitized
  - CSRF tokens enforced
  - Authentication bypasses prevented

- [ ] **AC6.2**: Penetration testing checklist:
  - Rate limit bypass attempts fail
  - JWT token forgery fails
  - Path traversal attacks blocked
  - File upload restrictions enforced

- [ ] **AC6.3**: Security scan with OWASP ZAP or Burp Suite:
  - No critical vulnerabilities
  - No sensitive data in logs
  - No exposed secrets in client code

### Visual Regression Testing

- [ ] **AC7.1**: Screenshot comparison tests:
  - Game page renders consistently
  - Admin dashboard layout stable
  - Designer dashboard layout stable
  - Email template renders correctly

- [ ] **AC7.2**: Cross-browser testing:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
  - Mobile Safari (iOS)
  - Mobile Chrome (Android)

---

## Technical Implementation

### Test Framework Setup

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0",
    "k6": "^0.47.0",
    "supertest": "^6.3.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:load": "k6 run tests/load/api-load-test.js",
    "test:security": "npm run test && npm run test:e2e && echo 'Run OWASP ZAP manually'",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

### Example Unit Test

```javascript
// tests/unit/slugGenerator.test.js
const SlugGenerator = require('../../src/services/slugGenerator');

describe('SlugGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new SlugGenerator(mockDbPool);
  });

  describe('normalizePetName', () => {
    test('converts to lowercase', () => {
      expect(generator.normalizePetName('Fluffy')).toBe('fluffy');
    });

    test('removes special characters', () => {
      expect(generator.normalizePetName('Mr. Whiskers!')).toBe('mrwhiskers');
    });

    test('removes spaces', () => {
      expect(generator.normalizePetName('Bella Rose')).toBe('bellarose');
    });

    test('truncates to 30 characters', () => {
      const longName = 'a'.repeat(50);
      expect(generator.normalizePetName(longName)).toHaveLength(30);
    });
  });

  describe('validateSlug', () => {
    test('accepts valid slug', () => {
      const result = generator.validateSlug('fluffy-happy');
      expect(result.valid).toBe(true);
    });

    test('rejects slug without hyphen', () => {
      const result = generator.validateSlug('fluffy');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('format');
    });

    test('rejects blacklisted pet name', () => {
      const result = generator.validateSlug('admin-happy');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('reserved');
    });
  });

  describe('generateUniqueSlug', () => {
    test('generates slug with random safeword', async () => {
      mockDbPool.query.mockResolvedValueOnce({ rows: [] }); // Slug available

      const result = await generator.generateUniqueSlug('Fluffy');

      expect(result.slug).toMatch(/^fluffy-[a-z]+$/);
      expect(result.available).toBe(true);
    });

    test('retries on collision', async () => {
      mockDbPool.query
        .mockResolvedValueOnce({ rows: [{ id: '123' }] }) // First slug taken
        .mockResolvedValueOnce({ rows: [] }); // Second slug available

      const result = await generator.generateUniqueSlug('Fluffy');

      expect(result.attempts).toBeGreaterThan(1);
      expect(result.available).toBe(true);
    });
  });
});
```

### Example E2E Test

```javascript
// tests/e2e/vanity-url.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Vanity URL System', () => {
  test('Customer can access game via vanity URL', async ({ page }) => {
    // Setup: Create test config in database
    await setupTestConfig({
      slug: 'test-fluffy-happy',
      petName: 'Fluffy',
      customerEmail: 'test@example.com'
    });

    // Navigate to vanity URL
    await page.goto('http://localhost:3000/test-fluffy-happy');

    // Verify page loads
    await expect(page).toHaveTitle(/Fluffy's Adventure/);

    // Verify canvas renders
    const canvas = page.locator('canvas#gameCanvas');
    await expect(canvas).toBeVisible();

    // Verify game starts
    await page.waitForTimeout(2000);

    // Check game state
    const isRunning = await page.evaluate(() => {
      return window.game && window.game.isRunning;
    });
    expect(isRunning).toBe(true);

    // Cleanup
    await cleanupTestConfig('test-fluffy-happy');
  });

  test('Non-existent slug shows friendly error', async ({ page }) => {
    await page.goto('http://localhost:3000/nonexistent-slug-12345');

    // Should load page (not 404)
    await expect(page.locator('canvas#gameCanvas')).toBeVisible();

    // Should show error message
    await expect(page.locator('text=Game not found')).toBeVisible();

    // Should fallback to default game
    await expect(page).toHaveTitle(/Bowie's Adventure/);
  });
});
```

---

## Test Scenarios

### Scenario 1: Unit Tests Pass

**Given**: All code written
**When**: Run `npm test`
**Then**:
- All unit tests pass
- Coverage > 90%
- No console warnings

### Scenario 2: E2E Tests Pass

**Given**: System deployed to staging
**When**: Run `npm run test:e2e`
**Then**:
- Customer journey test passes
- Designer workflow test passes
- Admin workflow test passes
- No flaky tests

### Scenario 3: Load Test Passes

**Given**: System deployed to production
**When**: Run `k6 run tests/load/api-load-test.js`
**Then**:
- 100 concurrent users handled
- p95 latency < 200ms
- 0% error rate

### Scenario 4: Security Scan Passes

**Given**: Application running
**When**: Run OWASP ZAP scan
**Then**:
- No critical vulnerabilities
- No high-severity issues
- Medium/low issues documented

---

## Definition of Done

- [ ] All documentation written
- [ ] README updated
- [ ] API docs published
- [ ] Developer guide complete
- [ ] Deployment guide tested
- [ ] Unit tests > 90% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Load tests passing
- [ ] Security scan passing
- [ ] CI/CD pipeline configured
- [ ] Code reviewed

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 10 (Monitoring & Analytics)
