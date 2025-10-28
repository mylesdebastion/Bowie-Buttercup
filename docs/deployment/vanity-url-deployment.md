# Vanity URL System - Deployment Guide

## Overview

This guide covers deploying the vanity URL system for SparkleClassic, including:
- Game client (frontend) deployment to Vercel
- API backend deployment
- Database setup
- DNS and domain configuration
- Monitoring and maintenance

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                             │
│  sparkleclassic.com/fluffy-happy                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│          Vercel Edge Network (CDN)                          │
│  - URL Rewrites: /fluffy-happy → /index.html              │
│  - Security Headers (CSP, X-Frame-Options, etc.)           │
│  - Static Asset Caching                                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐    ┌─────────────────┐
│  Game Client  │    │   Config API    │
│  (Frontend)   │◄───│  (Backend)      │
│  - index.html │    │  - Node.js/     │
│  - JS/CSS     │    │    Express      │
│  - ConfigLoader│    │  - JWT Auth     │
└───────────────┘    └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   PostgreSQL    │
                     │   Database      │
                     │  - game_configs │
                     └─────────────────┘
```

---

## Prerequisites

### Required Accounts
- [ ] Vercel account (for frontend deployment)
- [ ] Database hosting (Railway, Supabase, or AWS RDS)
- [ ] Domain registrar account (for custom domain)
- [ ] Sentry account (for error tracking, optional)

### Required Tools
- [ ] Node.js 18+ and npm/pnpm
- [ ] Git
- [ ] Vercel CLI (`npm install -g vercel`)
- [ ] PostgreSQL client (`psql`)

### Environment Variables
Create `.env.production` file with:

```bash
# API Configuration
API_BASE_URL=https://api.sparkleclassic.com
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=24h

# External Services
STORAGE_BUCKET=sparkleclassic-sprites
SENTRY_DSN=https://...@sentry.io/...
SENDGRID_API_KEY=SG.xxx

# Environment
NODE_ENV=production
```

---

## Deployment Steps

### Phase 1: Database Setup

#### 1.1 Create PostgreSQL Database

**Option A: Railway (Recommended for MVP)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Get connection string
railway variables
```

**Option B: Supabase**

1. Go to https://supabase.com
2. Create new project
3. Navigate to Settings → Database
4. Copy connection string

**Option C: AWS RDS**

```bash
# Create RDS instance via AWS Console
# Select PostgreSQL 15+
# Choose db.t3.micro for development
# Enable public accessibility for setup
```

#### 1.2 Run Database Migrations

```bash
# Connect to database
psql $DATABASE_URL

# Create tables
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
  email_status VARCHAR(20) DEFAULT 'pending',
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accessed_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('active', 'deleted', 'draft')),
  CONSTRAINT valid_email_status CHECK (email_status IN ('pending', 'sent', 'failed'))
);

-- Create indexes
CREATE INDEX idx_configs_slug ON game_configs(slug);
CREATE INDEX idx_configs_customer ON game_configs(customer_id);
CREATE INDEX idx_configs_status ON game_configs(status);
CREATE INDEX idx_configs_created ON game_configs(created_at DESC);
CREATE INDEX idx_configs_accessed ON game_configs(accessed_at DESC);
CREATE INDEX idx_configs_email_status ON game_configs(email_status);

-- Create audit log table
CREATE TABLE config_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES game_configs(id),
  action VARCHAR(20) NOT NULL,
  user_id VARCHAR(100),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_config ON config_audit_log(config_id);
CREATE INDEX idx_audit_created ON config_audit_log(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER game_configs_updated_at
BEFORE UPDATE ON game_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

#### 1.3 Seed Test Data (Optional)

```sql
-- Insert test configurations
INSERT INTO game_configs (slug, pet_name, safeword, config_json, status)
VALUES
  ('fluffy-happy', 'Fluffy', 'happy', '{"petType": "cat", "personality": "playful"}', 'active'),
  ('max-brave', 'Max', 'brave', '{"petType": "dog", "personality": "bold"}', 'active'),
  ('whiskers-calm', 'Whiskers', 'calm', '{"petType": "cat", "personality": "gentle"}', 'active');
```

### Phase 2: Backend API Deployment

**Note**: The backend API will be in a separate repository. This section provides deployment guidance for when that repository is created.

#### 2.1 API Repository Structure

```
sparkleclassic-api/
├── src/
│   ├── routes/
│   │   ├── configs.js       # Public endpoints
│   │   └── admin.js         # Admin endpoints
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── rateLimiter.js   # Rate limiting
│   │   └── validation.js    # Input validation
│   ├── services/
│   │   ├── slugGenerator.js # Slug generation logic
│   │   └── emailService.js  # Email notifications
│   └── app.js               # Express app
├── package.json
├── vercel.json              # API deployment config
└── .env.production
```

#### 2.2 Deploy API to Vercel

```bash
# Navigate to API repository
cd sparkleclassic-api

# Install dependencies
npm install

# Test locally
npm run dev

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SENDGRID_API_KEY

# Configure custom domain
vercel domains add api.sparkleclassic.com
```

#### 2.3 Verify API Deployment

```bash
# Test health endpoint
curl https://api.sparkleclassic.com/api/health

# Test config endpoint
curl https://api.sparkleclassic.com/api/configs/fluffy-happy
```

### Phase 3: Game Client Deployment

#### 3.1 Build Game Client

```bash
# Navigate to game repository
cd Bowie-Buttercup

# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm run preview
```

#### 3.2 Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (production)
vercel --prod

# Vercel will automatically:
# - Use vercel.json configuration
# - Apply URL rewrites for vanity URLs
# - Add security headers
# - Enable CDN caching
```

#### 3.3 Configure Custom Domain

```bash
# Add custom domain
vercel domains add sparkleclassic.com

# Vercel will provide DNS records to add:
```

**DNS Configuration** (at your domain registrar):

```
Type  | Name | Value                           | TTL
------+------+---------------------------------+-----
A     | @    | 76.76.21.21                     | 300
CNAME | www  | cname.vercel-dns.com            | 300
CNAME | api  | cname-api.vercel-dns.com        | 300
```

**SSL Certificate**:
- Vercel automatically provisions SSL certificates via Let's Encrypt
- HTTPS will be enabled within 24 hours

#### 3.4 Environment Variables

```bash
# Set production environment variables in Vercel dashboard
# Or via CLI:
vercel env add API_BASE_URL production
# Enter: https://api.sparkleclassic.com

vercel env add NODE_ENV production
# Enter: production
```

### Phase 4: Verification & Testing

#### 4.1 Smoke Tests

```bash
# Test root URL
curl -I https://sparkleclassic.com/
# Expected: 200 OK, game loads

# Test vanity URL
curl -I https://sparkleclassic.com/fluffy-happy
# Expected: 200 OK, game loads with custom config

# Test API
curl https://api.sparkleclassic.com/api/configs/fluffy-happy
# Expected: JSON config response

# Test security headers
curl -I https://sparkleclassic.com/ | grep -i "x-frame-options\|content-security-policy"
# Expected: Security headers present
```

#### 4.2 Run E2E Tests

```bash
# Run Playwright tests against production
BASE_URL=https://sparkleclassic.com npm run test:e2e

# Expected: All tests pass
```

#### 4.3 Performance Testing

```bash
# Test with Lighthouse
npx lighthouse https://sparkleclassic.com/fluffy-happy --view

# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
```

### Phase 5: Monitoring & Observability

#### 5.1 Setup Sentry

```bash
# Install Sentry
npm install @sentry/browser

# Add to main.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: "production",
  tracesSampleRate: 0.1
});

# Add environment variable
vercel env add SENTRY_DSN production
```

#### 5.2 Setup Uptime Monitoring

**Option A: Vercel Analytics** (Built-in)
- Automatically enabled for Vercel deployments
- View at vercel.com/dashboard/analytics

**Option B: UptimeRobot** (Free)
1. Go to https://uptimerobot.com
2. Add monitors:
   - `https://sparkleclassic.com/` (every 5 min)
   - `https://api.sparkleclassic.com/api/health` (every 5 min)
3. Configure alerts via email/Slack

**Option C: Datadog** (Paid)
```bash
# Install Datadog RUM
npm install @datadog/browser-rum

# Configure in main.js
```

#### 5.3 Setup Logging

```bash
# API logging with Winston
npm install winston

# Configure in API:
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

## Configuration Files

### vercel.json (Game Client)

Already configured in the repository at `D:\Github\Bowie-Buttercup\vercel.json`

Key features:
- URL rewrites for vanity URLs
- Security headers (CSP, X-Frame-Options, etc.)
- Cache control for assets
- HTTPS enforcement

### vercel.json (API Backend)

To be created in separate API repository:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Rollback Procedures

### Quick Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# Or via dashboard:
# 1. Go to vercel.com/dashboard
# 2. Select project
# 3. Navigate to Deployments
# 4. Click "..." on previous deployment
# 5. Select "Promote to Production"
```

### Database Rollback

```bash
# Backup before changes
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup-20250126-120000.sql
```

---

## Troubleshooting

### Issue: Vanity URLs Return 404

**Symptoms**: `/fluffy-happy` returns 404 instead of loading game

**Diagnosis**:
```bash
# Check Vercel rewrite rules
vercel inspect <deployment-url>

# Test locally with Vite
npm run dev
# Navigate to http://localhost:3000/fluffy-happy
```

**Fix**:
1. Verify `vercel.json` rewrites are correct
2. Ensure slug format is valid (lowercase, hyphen)
3. Check Vercel deployment logs

### Issue: API Requests Failing

**Symptoms**: Game loads but config doesn't load, CORS errors

**Diagnosis**:
```bash
# Test API directly
curl https://api.sparkleclassic.com/api/configs/fluffy-happy

# Check browser console for CORS errors
```

**Fix**:
1. Verify API_BASE_URL environment variable
2. Check CORS configuration in API
3. Ensure API is deployed and healthy

### Issue: Database Connection Errors

**Symptoms**: API returns 500 errors, "connection refused"

**Diagnosis**:
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check API logs
vercel logs <project-name> --follow
```

**Fix**:
1. Verify DATABASE_URL environment variable
2. Check database firewall rules
3. Verify connection pool settings

### Issue: Cache Not Working

**Symptoms**: Configs load slowly on repeat visits

**Diagnosis**:
```bash
# Check localStorage in browser console
localStorage.getItem('sparkleclassic_config_fluffy-happy')

# Check cache headers
curl -I https://api.sparkleclassic.com/api/configs/fluffy-happy
```

**Fix**:
1. Clear browser localStorage and test
2. Verify ConfigLoader caching logic
3. Check API cache-control headers

---

## Maintenance

### Daily
- [ ] Check Sentry for errors
- [ ] Review API error logs
- [ ] Monitor database size

### Weekly
- [ ] Review Vercel analytics
- [ ] Check API rate limiting logs
- [ ] Verify backup integrity

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate JWT secret
- [ ] Database performance tuning
- [ ] CDN cache analysis

---

## Security Checklist

Pre-deployment security review:

- [ ] Environment variables secured (not in code)
- [ ] JWT secret is strong (32+ characters)
- [ ] Database uses SSL connection
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] XSS prevention measures in place
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS policy configured correctly
- [ ] HTTPS enforced (HTTP redirects)
- [ ] Security headers configured (CSP, X-Frame-Options)
- [ ] Secrets stored in Vercel environment (not .env files)
- [ ] Database backups automated

---

## Performance Optimization

### CDN Configuration
- Static assets cached for 1 year
- HTML cached for 1 hour
- API responses cached for 5 minutes (CDN)
- localStorage caches configs for 24 hours (client)

### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM game_configs WHERE slug = 'fluffy-happy';

-- Vacuum and analyze regularly
VACUUM ANALYZE game_configs;

-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Bundle Size Optimization
```bash
# Analyze bundle
ANALYZE=true npm run build

# View bundle-analysis.html
# Target: Total bundle < 500KB gzipped
```

---

## Disaster Recovery

### Backup Strategy
1. **Database**: Automated daily backups via hosting provider
2. **Code**: Git repository (GitHub)
3. **Environment Variables**: Documented and backed up securely

### Recovery Time Objective (RTO)
- Target: < 1 hour for full service restoration

### Recovery Point Objective (RPO)
- Target: < 24 hours of data loss

### Recovery Procedures
```bash
# 1. Redeploy frontend
vercel --prod

# 2. Restore database
psql $DATABASE_URL < latest-backup.sql

# 3. Redeploy API
cd sparkleclassic-api && vercel --prod

# 4. Verify services
curl https://sparkleclassic.com/fluffy-happy
curl https://api.sparkleclassic.com/api/health
```

---

## Cost Estimates (Monthly)

**MVP / Low Traffic (<10k games)**:
- Vercel (Hobby): $0 (free tier)
- Railway PostgreSQL: $5
- Domain: $12/year ($1/month)
- **Total**: ~$6/month

**Growth (10k-100k games)**:
- Vercel (Pro): $20
- Railway PostgreSQL: $10-25
- Sentry (Team): $26
- Domain: $1/month
- **Total**: ~$60/month

**Scale (100k+ games)**:
- Vercel (Enterprise): $200+
- AWS RDS: $50-200
- CloudFront CDN: $50-100
- Sentry (Business): $80
- **Total**: ~$400-600/month

---

## Next Steps

After successful deployment:

1. [ ] Monitor system for 48 hours
2. [ ] Create first customer game manually
3. [ ] Test end-to-end customer workflow
4. [ ] Document any issues or improvements
5. [ ] Implement automated testing in CI/CD
6. [ ] Setup staging environment
7. [ ] Create runbooks for common operations

---

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Railway Support**: team@railway.app
- **Database Issues**: DBA team
- **On-call Engineer**: [Emergency contact]

---

## Changelog

### 2025-01-26 - v1.0
- Initial deployment guide created
- Covers frontend, API, and database deployment
- Includes monitoring and troubleshooting sections
