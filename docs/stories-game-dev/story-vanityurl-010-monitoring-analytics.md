# User Story: Monitoring & Analytics

**Story ID**: VanityURL-010
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P2 - Medium
**Estimated Effort**: 6-8 hours
**Sprint**: Sprint 3 (Week 3)
**Dependencies**: All previous stories (1-9)

---

## User Story

**As a** platform operator
**I want** real-time monitoring and analytics for the vanity URL system
**So that** I can detect issues proactively, track usage patterns, and make data-driven business decisions

---

## Business Context

Monitoring prevents revenue loss:
- **Incident Detection**: Catch API failures before customers report them
- **Capacity Planning**: Know when to scale infrastructure
- **Product Decisions**: Understand which features customers use most
- **Revenue Tracking**: Monitor game creation rate (directly tied to revenue)

---

## Acceptance Criteria

### Error Tracking (Sentry)

- [ ] **AC1.1**: Sentry integrated for error tracking
- [ ] **AC1.2**: All unhandled exceptions captured:
  - API errors
  - Database connection failures
  - Client-side JavaScript errors
  - Email delivery failures

- [ ] **AC1.3**: Error context includes:
  - User ID (if authenticated)
  - Request URL
  - Stack trace
  - Environment (dev/staging/prod)
  - Custom tags: feature, severity

- [ ] **AC1.4**: Alert rules configured:
  - > 10 errors in 5 minutes → Alert on-call
  - Critical errors (500 responses) → Immediate alert
  - Database connection lost → Page on-call

### Application Logging (Winston/Pino)

- [ ] **AC2.1**: Structured logging implemented:
  ```javascript
  logger.info('Config loaded successfully', {
    slug: 'fluffy-happy',
    petName: 'Fluffy',
    loadTime: 45, // ms
    source: 'API' // or 'cache', 'default'
  });
  ```

- [ ] **AC2.2**: Log levels properly used:
  - ERROR: System failures, unhandled exceptions
  - WARN: Degraded performance, fallback used
  - INFO: Successful operations, state changes
  - DEBUG: Detailed trace (dev only)

- [ ] **AC2.3**: Logs include:
  - Timestamp (ISO 8601)
  - Request ID (for tracing)
  - User ID (if authenticated)
  - Duration (for performance metrics)

- [ ] **AC2.4**: Log aggregation:
  - Vercel logs forwarded to log service (LogTail, Datadog, etc.)
  - Searchable by request ID, user, slug
  - Retained for 30 days

### Usage Analytics (Plausible or Google Analytics)

- [ ] **AC3.1**: Analytics tracking:
  - Page views (game loads)
  - Unique visitors per game
  - Referral sources
  - Geographic distribution
  - Device types (mobile vs desktop)

- [ ] **AC3.2**: Custom events tracked:
  - Game loaded: `game_loaded` with slug
  - Game started: `game_started` with slug
  - Game completed: `game_completed` with slug, level
  - Share button clicked: `share_clicked` with platform

- [ ] **AC3.3**: Privacy-friendly (GDPR compliant):
  - No PII collected
  - IP addresses anonymized
  - Cookie consent (if required)
  - Opt-out respected

### System Metrics (Prometheus or CloudWatch)

- [ ] **AC4.1**: API metrics tracked:
  - Request rate (requests per second)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Active connections

- [ ] **AC4.2**: Database metrics:
  - Query duration
  - Connection pool usage
  - Slow queries (> 1 second)
  - Deadlocks

- [ ] **AC4.3**: Cache metrics:
  - Hit rate (%)
  - Miss rate (%)
  - Eviction rate
  - Memory usage

- [ ] **AC4.4**: Email metrics:
  - Emails sent (count)
  - Delivery rate (%)
  - Open rate (%)
  - Bounce rate (%)

### Business Analytics Dashboard

- [ ] **AC5.1**: Admin analytics page (`/admin/analytics`):
  - Total games created
  - Games created this week/month
  - Revenue estimate (games × price)
  - Most popular pet names
  - Designer productivity (games per designer)

- [ ] **AC5.2**: Charts visualizing:
  - Games created per day (line chart, last 30 days)
  - Status distribution (pie chart: active, refunded, expired)
  - Email delivery funnel (sent → delivered → opened → clicked)
  - Game play frequency (histogram)

- [ ] **AC5.3**: Exportable reports:
  - CSV download of all metrics
  - Date range selector
  - Filter by designer, status, date

### Health Checks & Uptime Monitoring

- [ ] **AC6.1**: Health check endpoint (`/api/health`):
  ```javascript
  GET /api/health
  Response:
  {
    "status": "healthy",
    "timestamp": "2025-01-27T10:30:00Z",
    "checks": {
      "database": "healthy",
      "cache": "healthy",
      "email": "healthy"
    },
    "version": "1.0.0"
  }
  ```

- [ ] **AC6.2**: Uptime monitoring (UptimeRobot or Pingdom):
  - Check `/api/health` every 1 minute
  - Alert if down for 2 consecutive checks
  - Alert channels: Email, Slack, PagerDuty

- [ ] **AC6.3**: Synthetic monitoring:
  - Test vanity URL load every 5 minutes
  - Test API endpoints every 5 minutes
  - Alert if response time > 5 seconds

### Alerting & On-Call

- [ ] **AC7.1**: Alert channels configured:
  - Slack: #alerts channel for all warnings
  - PagerDuty: Page on-call for critical issues
  - Email: Backup notification method

- [ ] **AC7.2**: Alert thresholds:
  - API error rate > 1% for 5 minutes
  - Response time p95 > 1 second for 5 minutes
  - Database connection pool > 80% for 2 minutes
  - Email delivery failure rate > 5%

- [ ] **AC7.3**: Runbook linked in alerts:
  - "API Error Rate High" → Link to troubleshooting guide
  - "Database Connection Lost" → Link to database restart procedure
  - "Email Delivery Failing" → Link to SendGrid status page

---

## Technical Implementation

### Sentry Integration

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of requests traced
  beforeSend(event, hint) {
    // Don't send errors from development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  }
});

// Express error handler
app.use(Sentry.Handlers.errorHandler());
```

### Winston Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sparkleclassic-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Config loaded', { slug, petName, loadTime });
logger.error('Database connection failed', { error: err.message });
```

### Plausible Analytics

```html
<!-- In index.html -->
<script defer data-domain="sparkleclassic.com" src="https://plausible.io/js/script.js"></script>

<!-- In game code -->
<script>
  window.plausible('game_loaded', { props: { slug: 'fluffy-happy' } });
  window.plausible('game_started', { props: { slug: 'fluffy-happy' } });
</script>
```

### Health Check Endpoint

```javascript
router.get('/api/health', async (req, res) => {
  const checks = {
    database: 'unknown',
    cache: 'unknown',
    email: 'unknown'
  };

  // Check database
  try {
    await db.query('SELECT 1');
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
  }

  // Check cache (if applicable)
  try {
    await redis.ping();
    checks.cache = 'healthy';
  } catch (error) {
    checks.cache = 'unhealthy';
  }

  // Check email service
  try {
    await sgMail.client.request({
      method: 'GET',
      url: '/v3/stats'
    });
    checks.email = 'healthy';
  } catch (error) {
    checks.email = 'unhealthy';
  }

  const allHealthy = Object.values(checks).every(status => status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

### Analytics Dashboard Query

```javascript
// GET /api/admin/analytics
router.get('/api/admin/analytics', authenticateJWT, requireRole('admin'), async (req, res) => {
  const [
    totalGames,
    gamesThisWeek,
    gamesThisMonth,
    popularNames,
    dailyCreations
  ] = await Promise.all([
    // Total games
    db.query('SELECT COUNT(*) FROM game_configs WHERE status = \'active\''),

    // Games this week
    db.query(`SELECT COUNT(*) FROM game_configs
              WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'active'`),

    // Games this month
    db.query(`SELECT COUNT(*) FROM game_configs
              WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'active'`),

    // Popular pet names (top 10)
    db.query(`SELECT pet_name, COUNT(*) as count FROM game_configs
              WHERE status = 'active'
              GROUP BY pet_name ORDER BY count DESC LIMIT 10`),

    // Daily creations (last 30 days)
    db.query(`SELECT DATE(created_at) as date, COUNT(*) as count
              FROM game_configs
              WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'active'
              GROUP BY DATE(created_at) ORDER BY date`)
  ]);

  res.json({
    totalGames: parseInt(totalGames.rows[0].count),
    gamesThisWeek: parseInt(gamesThisWeek.rows[0].count),
    gamesThisMonth: parseInt(gamesThisMonth.rows[0].count),
    revenue: parseInt(totalGames.rows[0].count) * 24.99, // Estimate
    popularNames: popularNames.rows,
    dailyCreations: dailyCreations.rows
  });
});
```

---

## Test Scenarios

### Scenario 1: Error Captured in Sentry

**Given**: API endpoint throws unhandled exception
**When**: Exception occurs
**Then**:
- Error sent to Sentry
- Sentry dashboard shows error
- Alert sent to Slack #alerts
- Error includes stack trace and context

### Scenario 2: Health Check Passes

**Given**: All services running
**When**: GET `/api/health`
**Then**:
- Returns 200 OK
- Response shows all checks healthy
- UptimeRobot marks service as up

### Scenario 3: Health Check Fails

**Given**: Database connection lost
**When**: GET `/api/health`
**Then**:
- Returns 503 Service Unavailable
- Response shows database unhealthy
- UptimeRobot detects downtime
- Alert sent to on-call

### Scenario 4: Analytics Dashboard Shows Metrics

**Given**: Admin logged in
**When**: Navigate to `/admin/analytics`
**Then**:
- See total games count
- See games created this week
- See chart of daily creations
- See top 10 pet names

---

## Definition of Done

- [ ] Sentry integrated
- [ ] Winston logging configured
- [ ] Plausible analytics tracking
- [ ] Health check endpoint functional
- [ ] Uptime monitoring configured
- [ ] Analytics dashboard deployed
- [ ] Alert rules configured
- [ ] Runbook documented
- [ ] Tested in staging
- [ ] Deployed to production

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Status**: Complete - All 10 Stories Created
