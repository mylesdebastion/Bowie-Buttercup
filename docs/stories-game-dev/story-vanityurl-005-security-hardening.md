# User Story: Security Hardening

**Story ID**: VanityURL-005
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P0 - Business Critical
**Estimated Effort**: 6-8 hours
**Sprint**: Sprint 1 (Week 1)
**Dependencies**: Story 1 (Config API), Story 3 (URL Routing), Story 4 (Client Loading)

---

## User Story

**As a** platform security engineer
**I want** comprehensive security measures protecting the vanity URL system
**So that** customer data, game configs, and the platform itself are protected from common web vulnerabilities and attacks

---

## Business Context

Security breaches can destroy trust and revenue:
- **Customer Data Protection**: Email addresses, order IDs, personal pet photos
- **Platform Integrity**: Prevent unauthorized config creation/modification
- **Reputation Risk**: Security incidents damage brand and customer confidence
- **Compliance**: GDPR, CCPA data protection requirements

---

## Acceptance Criteria

### XSS Prevention

- [ ] **AC1.1**: Install and configure DOMPurify:
  ```javascript
  import DOMPurify from 'dompurify';

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

- [ ] **AC1.2**: Sanitize all user inputs before rendering:
  - Pet names
  - Custom text fields
  - Config JSON metadata
  - Email addresses (display only)

- [ ] **AC1.3**: Test XSS attack vectors:
  - Payload: `<script>alert('XSS')</script>` → Sanitized to plain text
  - Payload: `<img src=x onerror=alert('XSS')>` → Stripped
  - Payload: `javascript:alert('XSS')` → Removed

### SQL Injection Prevention

- [ ] **AC2.1**: All database queries use parameterized statements:
  ```javascript
  // ✅ SAFE
  db.query('SELECT * FROM game_configs WHERE slug = $1', [slug]);

  // ❌ UNSAFE - Never do this
  // db.query(`SELECT * FROM game_configs WHERE slug = '${slug}'`);
  ```

- [ ] **AC2.2**: Code review checklist enforces parameterized queries
- [ ] **AC2.3**: SQL injection testing with common payloads:
  - `' OR '1'='1`
  - `'; DROP TABLE game_configs;--`
  - `\x00`
  - All blocked by parameterization

### Authentication & Authorization

- [ ] **AC3.1**: Implement JWT authentication for admin endpoints:
  ```javascript
  const jwt = require('jsonwebtoken');

  function authenticateJWT(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  }
  ```

- [ ] **AC3.2**: Role-based access control (RBAC):
  - **Public**: Can read configs via slug
  - **Designer**: Can create/update configs
  - **Admin**: Can delete configs, view audit log
  - **Super Admin**: Can manage users

- [ ] **AC3.3**: Token expiration enforced:
  - Access tokens expire after 1 hour
  - Refresh tokens expire after 7 days
  - Expired tokens rejected with 401

### Rate Limiting

- [ ] **AC4.1**: Implement express-rate-limit:
  ```javascript
  const rateLimit = require('express-rate-limit');

  const publicLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests, please try again later.'
  });

  const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300 // 300 requests per minute for admins
  });
  ```

- [ ] **AC4.2**: Rate limits applied per endpoint:
  - Public GET `/api/configs/:slug`: 60 req/min per IP
  - Admin POST `/api/configs`: 100 req/min per user
  - Admin DELETE: 20 req/min per user

- [ ] **AC4.3**: Rate limit bypass for internal services via API key

### CSRF Protection

- [ ] **AC5.1**: Implement CSRF tokens for state-changing operations:
  ```javascript
  const csrf = require('csurf');
  const csrfProtection = csrf({ cookie: true });

  app.post('/api/configs', csrfProtection, authenticateJWT, createConfig);
  ```

- [ ] **AC5.2**: CSRF tokens required for POST/PUT/DELETE (not GET)
- [ ] **AC5.3**: Double-submit cookie pattern for SPA

### Input Validation

- [ ] **AC6.1**: Validate all inputs with express-validator:
  ```javascript
  const { body, param, validationResult } = require('express-validator');

  app.post('/api/configs',
    body('slug').matches(/^[a-z0-9-]{5,50}$/),
    body('petName').trim().isLength({ min: 1, max: 50 }),
    body('customerEmail').optional().isEmail(),
    body('configJson').isJSON(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      // Process request
    }
  );
  ```

- [ ] **AC6.2**: Validation rules:
  - Slug: alphanumeric + hyphen, 5-50 chars
  - Pet name: 1-50 chars, no HTML
  - Email: valid email format
  - Config JSON: valid JSON, max 100KB

### Secure Headers

- [ ] **AC7.1**: Already configured in vercel.json (Story 3)
- [ ] **AC7.2**: Add helmet.js for additional security:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

- [ ] **AC7.3**: Verify headers in production:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Content-Security-Policy`

### Secrets Management

- [ ] **AC8.1**: All secrets in environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `SENDGRID_API_KEY`
  - `STRIPE_SECRET_KEY`

- [ ] **AC8.2**: Never commit secrets to git:
  - `.env` in `.gitignore`
  - Use Vercel environment variables
  - Rotate secrets quarterly

- [ ] **AC8.3**: Different secrets for dev/staging/production

---

## Test Scenarios

### Scenario 1: XSS Attack Blocked

**Given**: Admin creates config with malicious pet name
**When**: POST `/api/configs` with `petName: "<script>alert('XSS')</script>"`
**Then**:
- Config saved with sanitized name (no script tags)
- Game loads without executing script
- Console shows no XSS errors

### Scenario 2: SQL Injection Blocked

**Given**: Attacker tries SQL injection in slug
**When**: GET `/api/configs/test'; DROP TABLE game_configs;--`
**Then**:
- Query uses parameterized statement
- Returns 400 (invalid slug format)
- Database unaffected
- Attack logged for monitoring

### Scenario 3: Unauthorized Access Denied

**Given**: Unauthenticated user
**When**: POST `/api/configs` without JWT token
**Then**:
- Returns 401 Unauthorized
- Error: "Authentication required"
- No config created

### Scenario 4: Rate Limit Exceeded

**Given**: User makes 61 requests in 1 minute
**When**: 61st request sent
**Then**:
- Returns 429 Too Many Requests
- Headers show rate limit info
- Request blocked until window resets

### Scenario 5: CSRF Attack Blocked

**Given**: Attacker creates malicious form on external site
**When**: Form submits POST to `/api/configs`
**Then**:
- CSRF token missing/invalid
- Returns 403 Forbidden
- No config created

---

## Implementation Notes

### Security Packages

```json
{
  "dependencies": {
    "dompurify": "^3.0.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0",
    "csurf": "^1.11.0",
    "express-validator": "^7.0.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### Security Middleware Stack

```javascript
// src/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

// Apply to all routes
app.use(helmet());
app.use(express.json({ limit: '100kb' })); // Prevent large payloads

// Public rate limiter
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

// Admin rate limiter
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300
});

// CSRF protection
const csrfProtection = csrf({ cookie: true });

module.exports = {
  helmet,
  publicLimiter,
  adminLimiter,
  csrfProtection
};
```

---

## Definition of Done

- [ ] All security packages installed
- [ ] XSS prevention implemented and tested
- [ ] SQL injection prevention verified
- [ ] JWT authentication functional
- [ ] Rate limiting enforced
- [ ] CSRF protection active
- [ ] Input validation comprehensive
- [ ] Security audit passed
- [ ] Penetration testing completed
- [ ] Code reviewed by security expert

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 6 (Admin Dashboard)
