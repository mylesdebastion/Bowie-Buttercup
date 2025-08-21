# Story IT003.3: Automated Game Deployment
## PetPixel Games Platform

**Story ID:** IT003.3  
**Story Title:** Automated Game Deployment  
**Epic:** IT003 - URL Management & Hosting  
**Priority:** P1 (High Priority)  
**Story Points:** 13  
**Sprint:** Week 7 of Phase 2  

---

## User Story

**As an** artist  
**I want** games automatically deployed when marked complete  
**So that** URLs become active without manual technical work  

## Business Context

This deployment automation eliminates technical barriers for artists and ensures consistent, reliable game launches. The system must handle the complete deployment pipeline from game files to live URLs, including SSL, CDN, and performance optimization, while maintaining high availability and quick rollback capabilities.

## Acceptance Criteria

### AC-1: One-Click Deployment Process
- [ ] **Given** I have a completed game project, **when** I click "Deploy", **then** the deployment starts immediately with progress tracking
- [ ] **Given** deployment is initiated, **when** I check the status, **then** I see real-time progress updates for each deployment stage
- [ ] **Given** deployment completes successfully, **when** I visit the URL, **then** the game loads within 3 seconds

### AC-2: Automated File Upload and Management
- [ ] **Given** I deploy a game, **when** upload begins, **then** all game assets are automatically uploaded to cloud storage
- [ ] **Given** files are uploading, **when** I monitor progress, **then** I see upload status for each file type (HTML, CSS, JS, images)
- [ ] **Given** upload completes, **when** I verify deployment, **then** all files are accessible via CDN with proper caching headers

### AC-3: DNS and SSL Configuration
- [ ] **Given** my URL is reserved, **when** deployment runs, **then** DNS routing is automatically configured for the subdirectory
- [ ] **Given** DNS is configured, **when** SSL setup begins, **then** HTTPS certificate is provisioned automatically
- [ ] **Given** SSL is active, **when** users visit the URL, **then** they see a secure connection with valid certificate

### AC-4: CDN Integration and Performance
- [ ] **Given** files are deployed, **when** CDN integration activates, **then** game assets load from global edge locations
- [ ] **Given** CDN is configured, **when** users access the game, **then** initial page load is under 2 seconds from any location
- [ ] **Given** cache is set up, **when** repeated visits occur, **then** assets load from cache for instant performance

### AC-5: Health Checks and Monitoring
- [ ] **Given** deployment completes, **when** health checks run, **then** game functionality is verified automatically
- [ ] **Given** health checks pass, **when** monitoring begins, **then** uptime and performance metrics are tracked continuously
- [ ] **Given** issues are detected, **when** alerts trigger, **then** I receive immediate notifications with diagnostic information

### AC-6: Rollback and Recovery Capabilities
- [ ] **Given** a problematic deployment occurs, **when** I initiate rollback, **then** previous version is restored within 5 minutes
- [ ] **Given** deployment fails, **when** automatic recovery triggers, **then** system attempts to fix common issues automatically
- [ ] **Given** manual intervention is needed, **when** I access deployment logs, **then** detailed error information guides troubleshooting

### AC-7: Staging Environment Testing
- [ ] **Given** I want to test before production, **when** I use staging deployment, **then** game is deployed to a test URL first
- [ ] **Given** staging is active, **when** I review the game, **then** all functionality works identically to production environment
- [ ] **Given** staging tests pass, **when** I promote to production, **then** deployment pipeline completes automatically

## Technical Requirements

### Cloud Infrastructure Architecture
```typescript
interface DeploymentPipeline {
  stages: [
    'validation',
    'file-upload', 
    'dns-configuration',
    'ssl-provisioning',
    'cdn-setup',
    'health-checks',
    'monitoring-setup'
  ];
  rollbackCapable: true;
  maxDeploymentTime: 600; // 10 minutes
}

interface DeploymentRequest {
  projectID: string;
  urlSlug: string;
  gameFiles: GameFileManifest;
  targetEnvironment: 'staging' | 'production';
  deploymentOptions: DeploymentOptions;
}

interface GameFileManifest {
  htmlFile: string;           // Main game HTML
  cssFiles: string[];         // Stylesheets
  jsFiles: string[];          // JavaScript bundles
  imageAssets: string[];      // Images, sprites
  audioAssets?: string[];     // Sound files
  configFiles: string[];      // Game configuration
  totalSize: number;          // Total deployment size
}
```

### AWS/CloudFlare Integration
```typescript
class CloudDeploymentService {
  async deployGame(request: DeploymentRequest): Promise<DeploymentResult> {
    const deployment = await this.initializeDeployment(request);
    
    try {
      // Stage 1: File Upload to S3
      await this.uploadGameFiles(deployment);
      
      // Stage 2: CloudFront CDN Configuration
      await this.configureCDN(deployment);
      
      // Stage 3: Route 53 DNS Setup
      await this.configureDNS(deployment);
      
      // Stage 4: Certificate Manager SSL
      await this.provisionSSL(deployment);
      
      // Stage 5: Health Checks
      await this.runHealthChecks(deployment);
      
      // Stage 6: Monitoring Setup
      await this.setupMonitoring(deployment);
      
      return this.completeDeployment(deployment);
    } catch (error) {
      await this.handleDeploymentFailure(deployment, error);
      throw error;
    }
  }
  
  private async uploadGameFiles(deployment: Deployment): Promise<void> {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: this.getAWSCredentials()
    });
    
    for (const file of deployment.gameFiles) {
      await s3Client.putObject({
        Bucket: process.env.GAMES_BUCKET,
        Key: `${deployment.urlSlug}/${file.path}`,
        Body: file.content,
        ContentType: this.getMimeType(file.path),
        CacheControl: this.getCacheControl(file.type),
        Metadata: {
          deploymentId: deployment.id,
          projectId: deployment.projectID
        }
      });
    }
  }
}
```

### Deployment Database Schema
```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  url_slug VARCHAR(100) NOT NULL,
  environment ENUM('staging', 'production') NOT NULL,
  status ENUM('pending', 'running', 'completed', 'failed', 'rolled_back') NOT NULL,
  current_stage VARCHAR(50),
  stages_completed TEXT[], -- JSON array of completed stages
  deployment_config JSONB NOT NULL,
  file_manifest JSONB NOT NULL,
  cdn_distribution_id VARCHAR(100),
  ssl_certificate_arn VARCHAR(200),
  health_check_url VARCHAR(500),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  deployed_by UUID NOT NULL,
  rollback_target UUID, -- Reference to previous deployment
  error_details JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (deployed_by) REFERENCES users(id),
  FOREIGN KEY (rollback_target) REFERENCES deployments(id),
  
  INDEX idx_project_environment (project_id, environment),
  INDEX idx_status_started (status, started_at),
  INDEX idx_url_slug (url_slug)
);

CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY,
  deployment_id UUID NOT NULL,
  stage VARCHAR(50) NOT NULL,
  level ENUM('info', 'warning', 'error') NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE,
  INDEX idx_deployment_stage (deployment_id, stage, timestamp)
);
```

### Deployment API Specification
```typescript
// Initiate Deployment
POST /api/deployments
Content-Type: application/json

Request:
{
  projectID: string,
  urlSlug: string,
  environment: "staging" | "production",
  options: {
    enableCDN: true,
    enableSSL: true,
    enableMonitoring: true,
    customDomain?: string,
    performanceOptimization: boolean
  }
}

Response:
{
  deploymentID: string,
  status: "pending",
  estimatedCompletion: string, // ISO timestamp
  stagingURL?: string,
  productionURL?: string,
  progressEndpoint: string
}

// Deployment Status and Progress
GET /api/deployments/{deploymentID}/status

Response:
{
  deploymentID: string,
  status: "running" | "completed" | "failed",
  currentStage: string,
  progress: {
    completed: string[], // Completed stages
    current: string,     // Current stage
    remaining: string[], // Remaining stages
    percentage: number   // 0-100
  },
  timing: {
    started: string,
    estimated: string,
    elapsed: number
  },
  urls: {
    staging?: string,
    production?: string,
    healthCheck: string
  },
  errors?: DeploymentError[]
}

// Rollback Deployment
POST /api/deployments/{deploymentID}/rollback
Content-Type: application/json

Request:
{
  targetDeploymentID?: string, // Specific version to rollback to
  reason: string
}

Response:
{
  rollbackID: string,
  status: "initiated",
  targetVersion: string,
  estimatedCompletion: string
}
```

## UI/UX Specifications

### Deployment Dashboard
```
┌─────────────────────────────────────────┐
│        Deploy Buttercup's Game         │
├─────────────────────────────────────────┤
│                                         │
│  🎯 URL: buttercup-sunny.petpixel.io    │
│  📦 Game Files: 12 files (2.3 MB)       │
│                                         │
│  🚀 Deployment Progress                 │
│                                         │
│  ✅ File Validation    (completed)      │
│  ✅ File Upload        (completed)      │
│  ✅ DNS Configuration  (completed)      │
│  🔄 SSL Provisioning   (in progress...) │
│  ⏳ CDN Setup          (waiting)        │
│  ⏳ Health Checks      (waiting)        │
│  ⏳ Monitoring Setup   (waiting)        │
│                                         │
│  ⏱️  Estimated completion: 3 minutes    │
│                                         │
│  📊 Real-time Stats:                    │
│  • Files uploaded: 12/12               │
│  • SSL cert: 45% provisioned           │
│  • Cache warmup: pending               │
│                                         │
│  [View Detailed Logs] [Cancel Deploy]  │
└─────────────────────────────────────────┘
```

### Mobile Deployment Status
```
┌─────────────────────────────────┐
│       Deploying Game            │
├─────────────────────────────────┤
│                                 │
│ 🎯 buttercup-sunny              │
│                                 │
│ Progress: 60% complete          │
│ ████████████▒▒▒▒▒▒▒▒           │
│                                 │
│ Current: SSL Setup              │
│ Next: CDN Configuration         │
│ ETA: 2 minutes                  │
│                                 │
│ ✅ Files uploaded               │
│ ✅ DNS configured               │
│ 🔄 SSL provisioning...          │
│                                 │
│ [View Details] [Cancel]         │
└─────────────────────────────────┘
```

### Deployment Success Screen
```
┌─────────────────────────────────────────┐
│           🎉 Deployment Successful!     │
├─────────────────────────────────────────┤
│                                         │
│  Your game is now live at:             │
│                                         │
│  🌐 https://buttercup-sunny.petpixel.io │
│     [Copy Link] [Visit Game] [Share]    │
│                                         │
│  📊 Deployment Summary:                 │
│  • Total time: 4 minutes 23 seconds    │
│  • Files deployed: 12 (2.3 MB)         │
│  • CDN locations: 150+ worldwide       │
│  • SSL certificate: ✅ Active          │
│  • Performance score: A+ (98/100)      │
│                                         │
│  🔍 Post-deployment checks:             │
│  ✅ Game loads successfully             │
│  ✅ All assets accessible               │
│  ✅ Mobile compatibility verified       │
│  ✅ Performance targets met             │
│                                         │
│  [View Analytics] [Deploy Another]     │
└─────────────────────────────────────────┘
```

### Rollback Interface
```
┌─────────────────────────────────────────┐
│           Rollback Deployment           │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️ Rolling back buttercup-sunny        │
│                                         │
│  Current Version: v1.2.1 (2h ago)      │
│  ❌ Issues detected:                    │
│  • Game loading timeout errors         │
│  • Missing audio assets                │
│                                         │
│  📋 Available Rollback Targets:         │
│                                         │
│  ◉ v1.2.0 (1 day ago) - Last stable    │
│    Deploy time: 3m 45s                 │
│    Status: ✅ All health checks passed │
│                                         │
│  ◯ v1.1.9 (3 days ago) - Previous      │
│    Deploy time: 4m 12s                 │
│    Status: ✅ Stable                   │
│                                         │
│  ⏱️ Estimated rollback time: 2 minutes │
│                                         │
│  📝 Reason for rollback:                │
│  [Audio assets missing after deploy]   │
│                                         │
│  [Cancel] [Confirm Rollback]           │
└─────────────────────────────────────────┘
```

### Visual States
```css
/* Deployment Progress Bar */
.deployment-progress {
  background: linear-gradient(90deg, #27ae60 0%, #4ecdc4 100%);
  height: 8px;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* Stage Status Indicators */
.stage-completed {
  color: #27ae60;
  font-weight: bold;
}

.stage-current {
  color: #4ecdc4;
  animation: pulse 2s infinite;
}

.stage-pending {
  color: #95a5a6;
}

.stage-error {
  color: #e74c3c;
  font-weight: bold;
}

/* Deployment Success Animation */
.deployment-success {
  background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
  border: 2px solid #27ae60;
  animation: success-glow 3s ease-in-out;
}

@keyframes success-glow {
  0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
  50% { box-shadow: 0 0 20px 10px rgba(39, 174, 96, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
}

/* Error State */
.deployment-error {
  background: #fdf2f2;
  border-left: 4px solid #e74c3c;
  padding: 16px;
}
```

## Implementation Notes

### Frontend Components
```typescript
interface DeploymentManagerProps {
  projectID: string;
  urlSlug: string;
  onDeploymentComplete: (deployment: Deployment) => void;
  onDeploymentError: (error: DeploymentError) => void;
}

interface DeploymentProgressProps {
  deploymentID: string;
  stages: DeploymentStage[];
  currentStage: string;
  progress: number;
}

// Real-time progress tracking
const useDeploymentProgress = (deploymentID: string) => {
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!deploymentID) return;
    
    const eventSource = new EventSource(`/api/deployments/${deploymentID}/stream`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStatus(update);
    };
    
    eventSource.onerror = () => {
      setError('Connection lost - deployment may still be running');
    };
    
    return () => eventSource.close();
  }, [deploymentID]);
  
  return { status, error };
};
```

### Infrastructure as Code
```yaml
# CloudFormation template for deployment infrastructure
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Pet Pixel Games - Automated Deployment Infrastructure'

Resources:
  GamesBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${Environment}-petpixel-games'
      VersioningConfiguration:
        Status: Enabled
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  GamesCDN:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt GamesBucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOAI}'
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad # Managed-CachingOptimized
        PriceClass: PriceClass_All
        ViewerCertificate:
          AcmCertificateArn: !Ref SSLCertificate
          SslSupportMethod: sni-only

  SSLCertificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: '*.petpixel.io'
      ValidationMethod: DNS
      DomainValidationOptions:
        - DomainName: '*.petpixel.io'
          HostedZoneId: !Ref HostedZone
```

### Monitoring and Alerting
```typescript
class DeploymentMonitor {
  async setupHealthChecks(deployment: Deployment): Promise<void> {
    // Create CloudWatch health check
    const healthCheck = await this.createHealthCheck({
      url: deployment.gameURL,
      interval: 300, // 5 minutes
      failureThreshold: 3,
      timeout: 10
    });
    
    // Setup alerting
    await this.createAlerts(deployment, healthCheck);
    
    // Configure application monitoring
    await this.setupApplicationMonitoring(deployment);
  }
  
  private async createAlerts(deployment: Deployment, healthCheck: HealthCheck): Promise<void> {
    const alerts = [
      {
        name: `GameDown-${deployment.urlSlug}`,
        metric: 'HealthCheck',
        threshold: 1,
        comparison: 'LessThanThreshold',
        treatMissingData: 'breaching'
      },
      {
        name: `SlowResponse-${deployment.urlSlug}`,
        metric: 'ResponseTime',
        threshold: 5000, // 5 seconds
        comparison: 'GreaterThanThreshold'
      }
    ];
    
    for (const alert of alerts) {
      await this.cloudWatch.createAlarm(alert);
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Deployment pipeline logic
- File upload mechanisms
- DNS configuration functions
- SSL certificate validation
- Rollback procedures

### Integration Tests
- AWS service integration
- CDN configuration and cache behavior
- Health check functionality
- Monitoring setup verification
- End-to-end deployment flow

### E2E Tests
```gherkin
Scenario: Complete game deployment pipeline
  Given I have a completed game project
  When I initiate deployment to production
  Then all deployment stages complete successfully
  And the game is accessible at the reserved URL
  And SSL certificate is active and valid
  And CDN serves assets from global locations
  And health checks confirm game functionality

Scenario: Deployment failure and rollback
  Given I have a problematic deployment
  When deployment fails at SSL provisioning stage
  Then I receive immediate error notification
  And rollback options are presented clearly
  When I choose to rollback to previous version
  Then previous version is restored within 5 minutes
  And game functionality is confirmed via health checks

Scenario: Staging environment testing
  Given I want to test before production deployment
  When I deploy to staging environment
  Then game is available at staging URL
  And all functionality works identically to production
  When staging tests pass and I promote to production
  Then production deployment completes automatically
```

### Performance Tests
- Large file deployment (10MB+ games)
- Concurrent deployment handling
- CDN cache performance globally
- SSL certificate provisioning speed
- Health check response times

### Security Tests
- SSL certificate validation
- Access control for deployed games
- File upload security scanning
- DNS hijacking prevention
- CDN security headers

## Definition of Done

- [ ] All acceptance criteria verified and tested
- [ ] Automated deployment pipeline implemented
- [ ] AWS/CloudFlare integration complete and tested
- [ ] Database schema created with proper indexes
- [ ] Real-time progress tracking functional
- [ ] Rollback system tested and operational
- [ ] Health checks and monitoring configured
- [ ] Staging environment functionality verified
- [ ] SSL and CDN integration working properly
- [ ] Performance benchmarks met (<10min deployments)
- [ ] Security measures implemented and tested
- [ ] Unit tests written with >85% coverage
- [ ] Integration tests pass all scenarios
- [ ] E2E deployment testing completed
- [ ] Load testing with concurrent deployments passed
- [ ] Code review completed by DevOps team
- [ ] Infrastructure as Code templates validated
- [ ] Documentation updated with deployment procedures
- [ ] Monitoring and alerting confirmed functional
- [ ] Ready for Story IT003.4 (Game Landing Pages)

## Dependencies

### Upstream Dependencies
- URL Reservation System (Story IT003.2)
- Cloud infrastructure provisioning
- SSL certificate management service
- CDN service configuration

### Downstream Dependencies
- Game Landing Pages (Story IT003.4)
- Analytics and monitoring (Story IT003.5)
- Customer notification system

---

**Story Status:** Ready for Development  
**Assigned Developer:** DevOps Team + Backend Team + Frontend Team  
**Estimated Completion:** Week 7, Phase 2  
**Last Updated:** 2025-08-21