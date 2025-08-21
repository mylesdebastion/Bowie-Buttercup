# Epic IT003: URL Management & Hosting

**Epic ID**: IT003  
**Epic Name**: Smart URL Generation and Game Hosting  
**Priority**: P1 (High Priority)  
**Estimated Effort**: 2 weeks  
**Sprint Allocation**: Weeks 6-7 of Phase 2  
**Dependencies**: IT001 (Admin Dashboard), IT002 (Game Template Engine)

## Epic Description

Implement intelligent URL generation system that creates memorable, collision-free URLs for each pet game (e.g., petpixel.com/buttercup-sunny). The system handles name conflicts, manages deployment pipeline, and provides hosting infrastructure for games as single HTML files with analytics tracking.

## Business Value

- **Brand Recognition**: Memorable URLs increase sharing and return visits
- **Professional Appearance**: Custom URLs enhance perceived value vs generic links
- **Marketing Advantage**: Easy-to-remember URLs for word-of-mouth marketing
- **Analytics Insights**: Track game engagement and customer behavior
- **Scalability**: Automated deployment supports unlimited game hosting
- **Customer Satisfaction**: Personalized URLs create emotional connection

## User Stories

### Story IT003.1: Smart URL Generation Algorithm
**As an** artist  
**I want** the system to generate 3 unique URL options for each pet  
**So that** customers always have memorable, available URLs to choose from

**Acceptance Criteria:**
- Generate 3 URL variations using different strategies:
  - Pet name + random positive adjective (buttercup-sunny)
  - Pet name + current year (buttercup-2024)  
  - Pet name + short random code (buttercup-x7k2)
- Real-time availability checking for all generated options
- Clear indication of available vs. taken URLs
- URL sanitization (spaces, special characters, length limits)
- Support for duplicate pet names across different customers
- Collision resolution with infinite fallback options
- URL validation according to web standards

**Technical Requirements:**
- Algorithm for generating meaningful adjective combinations
- Database lookup for URL availability checking
- URL slug generation with proper sanitization
- Fallback strategies for high-collision names
- Performance optimization for real-time checking

### Story IT003.2: URL Reservation System
**As an** operator  
**I want** to reserve URLs for projects in development  
**So that** chosen URLs remain available until game deployment

**Acceptance Criteria:**
- 24-hour reservation period for selected URLs
- Visual indication of reservation status and expiration
- Automatic renewal option for delayed projects
- Release of expired reservations back to available pool
- Reservation conflict prevention and handling
- Manual reservation extension for special cases
- Reservation analytics and usage reporting
- Integration with project timeline and deadlines

**Technical Requirements:**
- Database schema for URL reservations with expiration
- Background job for automatic reservation cleanup
- Real-time reservation status updates
- Conflict resolution for simultaneous reservations
- Audit trail for reservation history

### Story IT003.3: Automated Game Deployment
**As an** artist  
**I want** games automatically deployed when marked complete  
**So that** URLs become active without manual technical work

**Acceptance Criteria:**
- One-click deployment from admin dashboard
- Automatic HTML file upload to hosting infrastructure
- DNS/routing configuration for custom subdirectories
- SSL certificate provisioning for secure connections
- Content delivery network (CDN) integration
- Deployment status tracking and notifications
- Rollback capability for problematic deployments
- Staging environment for pre-deployment testing

**Technical Requirements:**
- Integration with cloud storage (S3/CloudFlare)
- Automated DNS record management
- SSL certificate automation (Let's Encrypt)
- CDN configuration and cache management
- Deployment pipeline with error handling
- Health checks for deployed games

### Story IT003.4: Game Landing Pages
**As a** customer  
**I want** attractive landing pages for each game URL  
**So that** the experience feels polished and professional

**Acceptance Criteria:**
- Branded landing page with pet name and game preview
- Game loading screen with progress indication
- Social sharing buttons for the game URL
- Basic game instructions and controls explanation
- Mobile-responsive design matching brand guidelines
- Analytics tracking for page views and engagement
- Optional customer message or dedication display
- Error handling for game loading failures

**Technical Requirements:**
- Dynamic landing page generation from game metadata
- Responsive web design with mobile optimization
- Social media meta tags for sharing previews
- Analytics integration (Google Analytics or similar)
- Error boundary components for graceful failures
- Performance optimization for fast loading

### Story IT003.5: Analytics and Management Dashboard
**As an** operator  
**I want** to monitor URL performance and game engagement  
**So that** I can optimize the service and provide customer insights

**Acceptance Criteria:**
- URL-specific analytics dashboard showing:
  - Page views, unique visitors, session duration
  - Geographic distribution of players
  - Device/browser usage statistics
  - Game completion rates and engagement metrics
- Bulk URL management tools for expired/inactive games
- Performance monitoring for hosting infrastructure
- Customer analytics reports for business insights
- URL management tools (redirect, archive, delete)
- Automated reporting for monthly customer updates

**Technical Requirements:**
- Analytics integration with privacy compliance
- Database design for efficient analytics queries
- Real-time dashboard with charts and visualizations
- Export functionality for analytics data
- Performance monitoring and alerting system
- GDPR-compliant data handling

## Technical Architecture

### URL Generation Algorithm
```typescript
interface URLGenerationStrategy {
  petName: string;
  strategies: {
    adjective: () => string;     // buttercup-sunny
    year: () => string;          // buttercup-2024
    shortCode: () => string;     // buttercup-x7k2
  };
}

const generateURLOptions = async (petName: string): Promise<URLOption[]> => {
  const sanitized = sanitizePetName(petName);
  const options = [
    generateAdjectiveURL(sanitized),
    generateYearURL(sanitized),
    generateShortCodeURL(sanitized)
  ];
  
  return await Promise.all(
    options.map(async url => ({
      url,
      available: await checkAvailability(url),
      type: getURLType(url)
    }))
  );
};
```

### Database Schema
```sql
-- URL management
CREATE TABLE game_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  
  -- URL details
  url_slug VARCHAR(150) UNIQUE NOT NULL,
  full_url VARCHAR(500) NOT NULL,
  generation_strategy VARCHAR(50) NOT NULL, -- adjective, year, shortcode
  
  -- Status management
  status VARCHAR(50) DEFAULT 'reserved', -- reserved, active, inactive, expired
  reserved_at TIMESTAMP DEFAULT NOW(),
  reserved_by UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  deployed_at TIMESTAMP,
  last_accessed TIMESTAMP,
  
  -- Analytics
  view_count BIGINT DEFAULT 0,
  unique_visitors BIGINT DEFAULT 0,
  total_playtime_minutes BIGINT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics tracking
CREATE TABLE url_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES game_urls(id),
  
  -- Session data
  session_id VARCHAR(255) NOT NULL,
  visitor_id VARCHAR(255), -- Anonymous visitor tracking
  ip_address INET,
  user_agent TEXT,
  
  -- Geographic data
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Engagement metrics
  page_views INTEGER DEFAULT 1,
  session_duration_seconds INTEGER,
  game_completed BOOLEAN DEFAULT FALSE,
  
  -- Technical data
  device_type VARCHAR(50), -- mobile, tablet, desktop
  browser VARCHAR(100),
  os VARCHAR(100),
  screen_resolution VARCHAR(20),
  
  -- Timing
  first_visit TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Deployment tracking
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES game_urls(id),
  
  -- Deployment details
  version INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash VARCHAR(64) NOT NULL, -- SHA-256 of deployed file
  cdn_url VARCHAR(500),
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, failed, rolled_back
  deployed_by UUID REFERENCES users(id),
  deployed_at TIMESTAMP DEFAULT NOW(),
  health_check_passed BOOLEAN DEFAULT FALSE,
  
  -- Performance data
  deployment_duration_seconds INTEGER,
  first_response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0
);
```

### Hosting Infrastructure
```typescript
const hostingArchitecture = {
  storage: {
    primary: 'AWS S3 with CloudFront CDN',
    backup: 'Redundant multi-region storage',
    organization: 'games/{url-slug}/index.html'
  },
  
  routing: {
    dns: 'Route 53 with subdirectory routing',
    ssl: 'CloudFlare SSL with automatic provisioning',
    caching: 'CloudFront with 1-year cache for static assets'
  },
  
  deployment: {
    pipeline: 'GitHub Actions → S3 → CloudFront invalidation',
    testing: 'Automated health checks post-deployment',
    rollback: 'Instant rollback to previous version'
  },
  
  monitoring: {
    uptime: 'CloudWatch + Pingdom monitoring',
    performance: 'Real User Monitoring (RUM)',
    alerts: 'Immediate notification for failures'
  }
};
```

## Performance Requirements

- **URL Generation**: <500ms for 3 options with availability check
- **Deployment**: <2 minutes from trigger to live URL
- **Page Load**: <3 seconds for game landing page + loading
- **Analytics**: Real-time data with <5 minute delay
- **Availability**: 99.9% uptime for hosted games
- **Global CDN**: <200ms response time worldwide

## Security Requirements

- **URL Validation**: Prevent XSS and injection attacks
- **Access Control**: Rate limiting for URL generation
- **Analytics Privacy**: GDPR/CCPA compliant data collection
- **Secure Hosting**: HTTPS-only with strong SSL configuration
- **DDoS Protection**: CloudFlare protection for hosted games
- **Data Encryption**: Encrypted storage for analytics data

## Testing Strategy

### Unit Tests
- URL generation algorithm with edge cases
- Availability checking and collision resolution
- Deployment pipeline components
- Analytics data processing and aggregation
- URL sanitization and validation

### Integration Tests
- End-to-end URL generation to deployment
- CDN integration and cache invalidation
- Analytics tracking and data collection
- Health check and monitoring systems
- Error handling and recovery procedures

### Load Testing
- URL generation under high concurrent load
- Deployment pipeline capacity testing
- Analytics system performance with high traffic
- CDN performance with global traffic simulation
- Database performance with large URL datasets

## Dependencies

- **Internal**: IT001 (Admin Dashboard), IT002 (Game Template)
- **External**: AWS S3, CloudFront, Route 53, SSL certificates
- **Services**: Analytics platform, monitoring tools
- **Domain**: Custom domain configuration and DNS management

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| DNS propagation delays | Medium | Use CloudFlare for faster DNS updates |
| CDN cache invalidation issues | Medium | Automated cache management with fallbacks |
| URL collision at scale | High | Multiple fallback strategies and monitoring |
| SSL certificate failures | High | Automated renewal with alerting |
| Analytics privacy compliance | High | Privacy-first design with user consent |

## Definition of Done

- [ ] Smart URL generation with 3 strategies implemented
- [ ] URL reservation system with automatic expiration
- [ ] Automated deployment pipeline working end-to-end
- [ ] Game landing pages with responsive design
- [ ] Analytics dashboard with privacy compliance
- [ ] Performance benchmarks met (load time, availability)
- [ ] Security audit passed (URL validation, data protection)
- [ ] Monitoring and alerting systems operational
- [ ] Documentation complete with deployment procedures

## Success Metrics

- **Generation Speed**: <500ms for URL options with availability
- **Collision Rate**: <5% of generated URLs require fallback
- **Deployment Success**: 99% successful deployments
- **Page Performance**: <3s average game loading time
- **Uptime**: 99.9% availability for hosted games
- **User Satisfaction**: >4.5/5 rating for URL memorability

---

**Epic Owner**: Development Team  
**Stakeholders**: Artists, Operations, Customers  
**Next Epic**: IT004 - Workflow Integration