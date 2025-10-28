# User Story: Database Schema & Config API

**Story ID**: VanityURL-001
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P0 - Business Critical
**Estimated Effort**: 8-10 hours
**Sprint**: Sprint 1 (Week 1)
**Dependencies**: None (foundational story)

---

## User Story

**As a** SparkleClassic internal developer
**I want** a PostgreSQL database with REST API endpoints for game configuration management
**So that** custom pet game configurations can be stored, retrieved, and managed at scale for thousands of customers

---

## Business Context

This is the foundational story for the entire vanity URL system. Without a database-backed config management system, the business cannot scale beyond ~100 games (file system limitation). This enables:

- **Revenue Growth**: Support 1000+ custom games ($14.99-24.99 each)
- **Customer Experience**: Fast, reliable game access via clean URLs
- **Internal Efficiency**: Designers can manage configs without file system access
- **Data Integrity**: ACID transactions, audit trails, and backup capabilities

---

## Acceptance Criteria

### Database Schema

- [ ] **AC1.1**: `game_configs` table created with following schema:
  ```sql
  CREATE TABLE game_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    pet_name VARCHAR(50) NOT NULL,
    safeword VARCHAR(50) NOT NULL,
    customer_id VARCHAR(100),
    customer_email VARCHAR(255),
    order_id VARCHAR(100),
    config_json JSONB NOT NULL,
    sprite_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    accessed_at TIMESTAMP
  );
  ```

- [ ] **AC1.2**: Indexes created for performance:
  - Primary index on `slug` (for URL lookups)
  - Index on `customer_id` (for customer queries)
  - Index on `created_at` (for admin list sorting)
  - Index on `status` (for filtering active/refunded games)

- [ ] **AC1.3**: `config_audit_log` table created for compliance:
  ```sql
  CREATE TABLE config_audit_log (
    id BIGSERIAL PRIMARY KEY,
    config_id UUID REFERENCES game_configs(id),
    action VARCHAR(20) NOT NULL,
    changed_by VARCHAR(100),
    changes JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **AC1.4**: Foreign key constraints enforce referential integrity
- [ ] **AC1.5**: Unique constraint on `slug` prevents duplicates

### API Endpoints - Public

- [ ] **AC2.1**: `GET /api/configs/:slug` endpoint:
  - Returns config JSON for valid slug
  - Returns 404 for non-existent slug
  - Returns 403 for soft-deleted configs (status != 'active')
  - Response time p95 < 100ms
  - Example response:
    ```json
    {
      "slug": "fluffy-happy",
      "petName": "Fluffy",
      "configJson": {
        "spritesheet": "/sprites/fluffy-custom.png",
        "metadata": {"owner": "customer@email.com"}
      },
      "spriteUrl": "https://storage.googleapis.com/sprites/fluffy.png"
    }
    ```

- [ ] **AC2.2**: Endpoint validates slug format (alphanumeric + hyphen, 5-50 chars)
- [ ] **AC2.3**: Updates `accessed_at` timestamp on successful retrieval

### API Endpoints - Admin Only

- [ ] **AC3.1**: `POST /api/configs` endpoint (requires JWT auth):
  - Creates new config with auto-generated UUID
  - Validates required fields: slug, petName, safeword, configJson
  - Returns 201 with created config on success
  - Returns 400 for validation errors
  - Returns 409 if slug already exists
  - Logs creation to audit log

- [ ] **AC3.2**: `PUT /api/configs/:slug` endpoint (requires JWT auth):
  - Updates existing config
  - Updates `updated_at` timestamp
  - Logs changes to audit log (before/after values)
  - Returns 404 if slug doesn't exist
  - Returns 400 for validation errors

- [ ] **AC3.3**: `DELETE /api/configs/:slug` endpoint (requires JWT auth):
  - Soft-deletes config (sets status = 'deleted')
  - Does NOT physically delete from database
  - Logs deletion to audit log
  - Returns 204 on success

- [ ] **AC3.4**: `GET /api/configs/validate/:slug` endpoint (public):
  - Checks if slug is available
  - Returns `{"available": true}` or `{"available": false, "reason": "taken"}`
  - Used by slug generation system

### Input Validation & Sanitization

- [ ] **AC4.1**: Slug validation prevents:
  - Special characters (only alphanumeric + hyphen allowed)
  - SQL injection attempts
  - XSS payloads in slug
  - Reserved words: 'api', 'admin', 'auth', 'public', 'static'

- [ ] **AC4.2**: Config JSON validation:
  - Must be valid JSON
  - Must contain required fields: spritesheet, metadata
  - Total size < 100KB
  - No executable code in JSON strings

- [ ] **AC4.3**: Pet name sanitization:
  - Strips HTML tags
  - Escapes special characters
  - Max length 50 characters
  - Profanity filter applied

### Rate Limiting

- [ ] **AC5.1**: Public endpoints limited to 60 requests/minute per IP
- [ ] **AC5.2**: Admin endpoints limited to 300 requests/minute per user
- [ ] **AC5.3**: Returns 429 status code when limit exceeded
- [ ] **AC5.4**: Rate limit headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Error Handling

- [ ] **AC6.1**: All errors return consistent JSON format:
  ```json
  {
    "error": "Config not found",
    "code": "CONFIG_NOT_FOUND",
    "timestamp": "2025-01-27T10:30:00Z"
  }
  ```

- [ ] **AC6.2**: Database connection errors return 503 (Service Unavailable)
- [ ] **AC6.3**: Validation errors return 400 with detailed field errors
- [ ] **AC6.4**: Authentication errors return 401 (Unauthorized)
- [ ] **AC6.5**: Rate limit errors return 429 (Too Many Requests)

### Testing

- [ ] **AC7.1**: Unit tests cover:
  - Slug validation logic
  - Config JSON validation
  - Error handling
  - Audit log creation

- [ ] **AC7.2**: Integration tests cover:
  - Database CRUD operations
  - API endpoint responses
  - Rate limiting behavior
  - Transaction rollbacks

- [ ] **AC7.3**: Load tests demonstrate:
  - 1000 concurrent requests handled successfully
  - p95 latency < 100ms for GET requests
  - p95 latency < 200ms for POST/PUT requests
  - No memory leaks over 10,000 requests

- [ ] **AC7.4**: Test coverage > 90% for all API code

---

## Technical Implementation Notes

### Database Technology Choice

**Recommended**: PostgreSQL 15+
- ✅ JSONB type for flexible config storage
- ✅ Strong ACID guarantees
- ✅ Excellent indexing performance
- ✅ Free tier on Vercel Postgres or Railway

**Alternative**: Firebase Firestore
- ✅ Easier initial setup
- ✅ Real-time updates (not needed)
- ❌ More expensive at scale
- ❌ Less flexible querying

**Decision**: PostgreSQL (better long-term scalability)

### Backend Framework

**Recommended**: Express.js
```javascript
// Example implementation structure
const express = require('express');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

const app = express();
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Rate limiting
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300
});

// GET /api/configs/:slug
app.get('/api/configs/:slug',
  publicLimiter,
  param('slug').matches(/^[a-z0-9-]{5,50}$/),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await db.query(
        `UPDATE game_configs
         SET accessed_at = NOW()
         WHERE slug = $1 AND status = 'active'
         RETURNING *`,
        [req.params.slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Config not found',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      res.json({
        slug: result.rows[0].slug,
        petName: result.rows[0].pet_name,
        configJson: result.rows[0].config_json,
        spriteUrl: result.rows[0].sprite_url
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(503).json({
        error: 'Service unavailable',
        code: 'DATABASE_ERROR'
      });
    }
  }
);
```

### Migration Files

Create Sequelize or Knex migrations:

```javascript
// migrations/20250127_create_game_configs.js
exports.up = async function(knex) {
  await knex.schema.createTable('game_configs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('slug', 50).unique().notNullable();
    table.string('pet_name', 50).notNullable();
    table.string('safeword', 50).notNullable();
    table.string('customer_id', 100);
    table.string('customer_email', 255);
    table.string('order_id', 100);
    table.jsonb('config_json').notNullable();
    table.string('sprite_url', 500);
    table.string('status', 20).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('accessed_at');

    table.index('slug', 'idx_slug');
    table.index('customer_id', 'idx_customer_id');
    table.index('created_at', 'idx_created_at');
    table.index('status', 'idx_status');
  });

  await knex.schema.createTable('config_audit_log', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('config_id').references('id').inTable('game_configs');
    table.string('action', 20).notNullable();
    table.string('changed_by', 100);
    table.jsonb('changes');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('config_audit_log');
  await knex.schema.dropTable('game_configs');
};
```

### Audit Logging

Implement audit log middleware:

```javascript
async function logAudit(configId, action, changedBy, changes) {
  await db.query(
    `INSERT INTO config_audit_log
     (config_id, action, changed_by, changes, timestamp)
     VALUES ($1, $2, $3, $4, NOW())`,
    [configId, action, changedBy, JSON.stringify(changes)]
  );
}

// Usage in POST endpoint
await logAudit(newConfig.id, 'created', req.user.id, {
  slug: newConfig.slug,
  petName: newConfig.pet_name
});
```

---

## Test Scenarios

### Scenario 1: Successful Config Retrieval

**Given**: Config with slug "fluffy-happy" exists in database
**When**: GET request to `/api/configs/fluffy-happy`
**Then**:
- Returns 200 status code
- Returns config JSON with pet name and sprite URL
- Updates `accessed_at` timestamp in database
- Response time < 100ms

### Scenario 2: Config Not Found

**Given**: No config with slug "nonexistent-slug" exists
**When**: GET request to `/api/configs/nonexistent-slug`
**Then**:
- Returns 404 status code
- Returns error JSON: `{"error": "Config not found", "code": "CONFIG_NOT_FOUND"}`
- No database writes occur

### Scenario 3: Soft-Deleted Config

**Given**: Config with slug "refunded-game" has status = 'deleted'
**When**: GET request to `/api/configs/refunded-game`
**Then**:
- Returns 403 status code
- Returns error: "Config no longer active"
- Customer sees user-friendly message

### Scenario 4: Create New Config (Admin)

**Given**: Admin authenticated with valid JWT
**When**: POST request to `/api/configs` with body:
```json
{
  "slug": "max-brave",
  "petName": "Max",
  "safeword": "brave",
  "customerEmail": "customer@example.com",
  "configJson": {"spritesheet": "/sprites/max.png"},
  "spriteUrl": "https://storage.googleapis.com/sprites/max.png"
}
```
**Then**:
- Returns 201 status code
- Config created in database with UUID
- Audit log entry created with action = 'created'
- Returns created config in response

### Scenario 5: Duplicate Slug Rejection

**Given**: Config with slug "fluffy-happy" already exists
**When**: POST request to `/api/configs` with slug = "fluffy-happy"
**Then**:
- Returns 409 status code (Conflict)
- Error message: "Slug already exists"
- No database write occurs

### Scenario 6: Invalid Slug Format

**Given**: Admin attempts to create config
**When**: POST request with slug = "test@invalid!"
**Then**:
- Returns 400 status code
- Error message: "Slug must contain only alphanumeric characters and hyphens"
- No database write occurs

### Scenario 7: SQL Injection Attempt

**Given**: Malicious user attempts injection
**When**: GET request to `/api/configs/test'; DROP TABLE game_configs;--`
**Then**:
- Returns 400 status code (validation fails)
- Slug validation rejects special characters
- Database unaffected
- Attack logged for monitoring

### Scenario 8: Rate Limit Exceeded

**Given**: IP address has made 60 requests in last minute
**When**: 61st request to `/api/configs/fluffy-happy`
**Then**:
- Returns 429 status code
- Headers include:
  - `X-RateLimit-Limit: 60`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset: <timestamp>`
- Error message: "Too many requests, please try again in 30 seconds"

### Scenario 9: Database Connection Failure

**Given**: PostgreSQL database is unreachable
**When**: GET request to `/api/configs/fluffy-happy`
**Then**:
- Returns 503 status code
- Error message: "Service temporarily unavailable"
- Error logged to Sentry
- Alert sent to on-call engineer

### Scenario 10: Update Existing Config (Admin)

**Given**: Config "fluffy-happy" exists with old sprite URL
**When**: PUT request to `/api/configs/fluffy-happy` with new spriteUrl
**Then**:
- Returns 200 status code
- Config updated in database
- `updated_at` timestamp updated
- Audit log shows before/after values
- Old sprite URL preserved in audit log

---

## Integration Points

### Depends On (Blocking Dependencies)

- None (this is the foundational story)

### Enables (Stories That Depend On This)

- **Story 2 (Slug Generation)**: Needs database to check uniqueness
- **Story 3 (URL Routing)**: Needs API endpoint for config retrieval
- **Story 4 (Client Loading)**: Consumes GET `/api/configs/:slug` endpoint
- **Story 6 (Admin Dashboard)**: Uses all admin API endpoints
- **Story 7 (Designer Dashboard)**: Uses POST endpoint to create configs
- **Story 10 (Monitoring)**: Monitors API endpoint health

### External Systems

- **PostgreSQL Database**: Primary data store (Vercel Postgres or Railway)
- **Vercel Hosting**: Hosts API endpoints as serverless functions
- **Authentication Service** (Story 5): Validates JWT tokens for admin endpoints

---

## Security Considerations

### SQL Injection Prevention

- ✅ All queries use parameterized statements (`$1`, `$2` placeholders)
- ✅ No string concatenation for SQL queries
- ✅ ORM/query builder (Knex or Sequelize) escapes inputs automatically

### XSS Prevention

- ✅ Slug validation prevents `<script>` tags in URLs
- ✅ Pet name sanitization strips HTML
- ✅ Config JSON validated to prevent executable code
- ✅ Response Content-Type set to `application/json`

### Authentication & Authorization

- ✅ Public endpoints (GET) require no auth
- ✅ Admin endpoints (POST/PUT/DELETE) require valid JWT
- ✅ JWT validated on every request (not just once)
- ✅ Expired JWTs rejected with 401

### Rate Limiting

- ✅ Prevents DDoS attacks on public endpoints
- ✅ IP-based limiting (60 req/min)
- ✅ User-based limiting for admin (300 req/min)
- ✅ Distributed rate limiting (Redis) for multi-instance deployments

### Data Privacy

- ✅ Customer emails not exposed in public API responses
- ✅ Audit logs only accessible to admins
- ✅ Soft-delete preserves data for compliance
- ✅ GDPR-compliant deletion available (hard delete after 90 days)

### Database Security

- ✅ Connection uses SSL/TLS
- ✅ Database credentials stored in environment variables
- ✅ Principle of least privilege (API uses read-only user for GET endpoints)
- ✅ Database backups automated daily

---

## Definition of Done

- [ ] All acceptance criteria met and verified
- [ ] Database schema deployed to staging and production
- [ ] API endpoints functional and tested
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Load tests demonstrate p95 < 100ms
- [ ] Security review completed (no critical vulnerabilities)
- [ ] Code reviewed and approved by senior developer
- [ ] API documentation generated (Swagger/OpenAPI)
- [ ] Migration scripts tested on staging database
- [ ] Rollback plan documented and tested
- [ ] Monitoring alerts configured
- [ ] Pull request merged to main branch

---

## Risks & Mitigation

### Risk 1: Database Performance Degradation

**Probability**: Medium
**Impact**: High
**Mitigation**:
- Index optimization on `slug` column
- Connection pooling (max 20 connections)
- Query timeout (5 seconds)
- Fallback to cache if database slow

### Risk 2: Migration Failure

**Probability**: Low
**Impact**: Critical
**Mitigation**:
- Test migrations on staging first
- Backup database before migration
- Rollback script prepared
- Run during low-traffic window

### Risk 3: API Downtime

**Probability**: Low
**Impact**: High
**Mitigation**:
- Health check endpoint (`/api/health`)
- Auto-restart on failure (Vercel)
- Fallback to cached configs (Story 4)
- Status page for customer visibility

---

## Development Checklist

### Setup (1-2 hours)

- [ ] Create PostgreSQL database on Vercel Postgres or Railway
- [ ] Set up local development database
- [ ] Install dependencies (express, pg, express-validator, express-rate-limit)
- [ ] Configure environment variables (DATABASE_URL, JWT_SECRET)
- [ ] Set up migration tooling (Knex or Sequelize)

### Implementation (4-6 hours)

- [ ] Create migration files for schema
- [ ] Run migrations on local database
- [ ] Implement GET `/api/configs/:slug` endpoint
- [ ] Implement POST `/api/configs` endpoint
- [ ] Implement PUT `/api/configs/:slug` endpoint
- [ ] Implement DELETE `/api/configs/:slug` endpoint
- [ ] Implement GET `/api/configs/validate/:slug` endpoint
- [ ] Add input validation middleware
- [ ] Add rate limiting middleware
- [ ] Add audit logging to all endpoints
- [ ] Add error handling middleware

### Testing (2-3 hours)

- [ ] Write unit tests for validation logic
- [ ] Write integration tests for API endpoints
- [ ] Write load tests (k6 or Apache Bench)
- [ ] Test SQL injection scenarios
- [ ] Test XSS prevention
- [ ] Test rate limiting
- [ ] Test database connection failure scenarios

### Deployment (1 hour)

- [ ] Deploy to staging environment
- [ ] Run migrations on staging database
- [ ] Smoke test all endpoints
- [ ] Run load tests against staging
- [ ] Deploy to production
- [ ] Verify production health

---

## Story Points

**Estimated**: 8 Story Points (based on 8-10 hours effort)

**Breakdown**:
- Setup & Configuration: 2 points
- Implementation: 4 points
- Testing: 2 points

**Confidence**: High (well-defined scope, standard CRUD API)

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 2 (Slug Generation & Collision Handling)
