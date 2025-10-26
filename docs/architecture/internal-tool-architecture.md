# Internal Tool Architecture - SparkleClassic

**Version**: 2.0
**Updated**: 2025-10-25
**Scope**: Phase 2 - Internal Tool Development + Custom URL Hosting

## 🏗️ **Architecture Overview**

The internal tool architecture is designed to streamline boutique operations while providing multi-tenant game hosting at custom URLs (sparkleclassic.com/[petname]). The system prioritizes developer productivity, user experience, and scalability for creating personalized pet games for friends and colleagues.

### **Core Principles**
- **User-Centric Design**: Optimized for artist and operator workflows
- **Type Safety**: End-to-end TypeScript for reliability
- **Real-time Collaboration**: Live updates and activity tracking
- **Scalable Foundation**: Built to support 10x growth
- **Security First**: Role-based access and audit logging

---

## 🎯 **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Internal Tool Frontend                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Dashboard     │ │ Asset Manager   │ │ URL Generator   │   │
│  │   (Projects)    │ │  (Sprite Tool)  │ │  (SparkleURLs)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Order Intake    │ │ Team Auth       │ │ Activity Feed   │   │
│  │ (Customer)      │ │ (Roles)         │ │ (Real-time)     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                               tRPC API
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services Layer                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Project Service │ │  Asset Service  │ │   URL Service   │   │
│  │ (CRUD + Status) │ │ (Upload + CDN)  │ │ (Generation)    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  Auth Service   │ │ Notification    │ │  Game Builder   │   │
│  │ (NextAuth.js)   │ │ Service (Email) │ │  (Templates)    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                              Database Layer
                                    │
┌─────────────────────────────────────────────────────────────────┐
│                        Data & Storage                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   PostgreSQL    │ │     Redis       │ │     AWS S3      │   │
│  │ (Primary Data)  │ │ (Sessions +     │ │ (File Storage)  │   │
│  │                 │ │  Cache)         │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Technology Stack**

### **Frontend Architecture**
```typescript
const frontendStack = {
  framework: 'Next.js 14',
  router: 'App Router',
  language: 'TypeScript',
  styling: 'Tailwind CSS',
  components: 'Shadcn/ui + Radix UI',
  stateManagement: 'React Query + Zustand',
  forms: 'React Hook Form + Zod',
  realTime: 'WebSocket + Socket.io',
  fileUpload: 'React Dropzone + Progress',
  charts: 'Recharts',
  notifications: 'Sonner (toast)',
  deployment: 'Vercel'
};
```

### **Backend Architecture**
```typescript
const backendStack = {
  runtime: 'Node.js 18+',
  framework: 'Next.js API Routes',
  apiLayer: 'tRPC for type safety',
  authentication: 'NextAuth.js',
  database: 'PostgreSQL 15+',
  orm: 'Prisma ORM',
  cache: 'Redis',
  fileStorage: 'AWS S3 + CloudFront',
  email: 'SendGrid',
  queue: 'Bull.js + Redis',
  monitoring: 'Sentry',
  logging: 'Winston'
};
```

### **Infrastructure**
```typescript
const infrastructure = {
  hosting: 'Vercel (Frontend + API)',
  database: 'Supabase PostgreSQL',
  cache: 'Upstash Redis',
  storage: 'AWS S3 + CloudFront CDN',
  domain: 'Custom domain with SSL',
  monitoring: 'Vercel Analytics + Sentry',
  backup: 'Automated DB backups',
  env: 'Development, Staging, Production'
};
```

---

## 📊 **Database Schema Design**

### **Core Tables**
```sql
-- Projects (main entity)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  
  -- Pet information
  pet_name VARCHAR(100) NOT NULL,
  pet_breed VARCHAR(100),
  pet_age INTEGER,
  pet_personality TEXT,
  
  -- Project details
  package_type VARCHAR(50) NOT NULL, -- express, custom, premium
  status VARCHAR(50) DEFAULT 'backlog',
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Assignment and timeline
  assigned_artist_id UUID REFERENCES users(id),
  deadline DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Game configuration
  game_config JSONB, -- theme, difficulty, special features
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Assets management
CREATE TABLE project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- File information
  asset_type VARCHAR(50) NOT NULL, -- photo, sprite, background, sound, config
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- S3 key
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  
  -- Asset metadata
  metadata JSONB, -- dimensions, duration, format details
  processing_status VARCHAR(50) DEFAULT 'pending',
  version INTEGER DEFAULT 1,
  
  -- Tracking
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- URL management
CREATE TABLE game_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  
  -- URL details
  url_slug VARCHAR(150) UNIQUE NOT NULL,
  full_url VARCHAR(500) NOT NULL, -- petpixel.com/buttercup-sunny
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'reserved', -- reserved, active, expired, deleted
  reserved_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  deployed_at TIMESTAMP,
  
  -- Analytics
  view_count BIGINT DEFAULT 0,
  last_accessed TIMESTAMP
);

-- User management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  
  -- Role and permissions
  role VARCHAR(50) DEFAULT 'artist', -- artist, manager, admin
  permissions JSONB, -- granular permissions
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity logging
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  
  -- Action
  action VARCHAR(100) NOT NULL,
  action_type VARCHAR(50), -- create, update, delete, view
  
  -- Target
  resource_type VARCHAR(50), -- project, asset, url, user
  resource_id UUID,
  
  -- Context
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID REFERENCES users(id),
  
  -- Content
  type VARCHAR(50) NOT NULL, -- project_assigned, deadline_approaching, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Metadata
  data JSONB, -- additional context
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Indexes for Performance**
```sql
-- Project queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_artist ON projects(assigned_artist_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_created ON projects(created_at);

-- Asset queries
CREATE INDEX idx_assets_project ON project_assets(project_id);
CREATE INDEX idx_assets_type ON project_assets(asset_type);
CREATE INDEX idx_assets_status ON project_assets(processing_status);

-- URL queries
CREATE INDEX idx_urls_slug ON game_urls(url_slug);
CREATE INDEX idx_urls_status ON game_urls(status);
CREATE INDEX idx_urls_project ON game_urls(project_id);

-- Activity queries
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at);
```

---

## 🔒 **Security Architecture**

### **Authentication & Authorization**
```typescript
const securityModel = {
  authentication: {
    provider: 'NextAuth.js',
    strategy: 'JWT + Database sessions',
    passwordHashing: 'bcrypt with salt rounds 12',
    sessionExpiry: '7 days',
    refreshTokens: true
  },
  
  authorization: {
    roleBasedAccess: {
      admin: ['*'], // All permissions
      manager: ['projects:*', 'users:read', 'analytics:read'],
      artist: ['projects:read,update', 'assets:*', 'urls:read']
    },
    
    resourceBasedAccess: {
      projects: 'Can only modify assigned projects',
      assets: 'Can only access project assets',
      users: 'Can only view own profile unless manager+'
    }
  },
  
  dataProtection: {
    encryption: 'AES-256 for sensitive data',
    transmission: 'HTTPS/TLS 1.3 only',
    storage: 'Encrypted database connections',
    fileStorage: 'S3 server-side encryption'
  }
};
```

### **File Upload Security**
```typescript
const fileUploadSecurity = {
  validation: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/heic', 'audio/mp3'],
    maxFileSize: '10MB',
    filenameValidation: 'Sanitize and validate filenames',
    virusScanning: 'ClamAV integration for uploaded files'
  },
  
  storage: {
    s3Security: 'IAM roles with minimal permissions',
    presignedUrls: 'Time-limited upload URLs',
    publicAccess: 'Disabled by default',
    encryption: 'Server-side encryption enabled'
  },
  
  processing: {
    imageValidation: 'Verify image headers and content',
    metadataExtraction: 'Safe metadata parsing',
    thumbnailGeneration: 'Secure image processing',
    contentScanning: 'Inappropriate content detection'
  }
};
```

---

## 🔄 **API Architecture**

### **tRPC Router Structure**
```typescript
// API structure with tRPC
const apiRouters = {
  projects: {
    list: 'Get projects with filtering and pagination',
    create: 'Create new project from order',
    update: 'Update project details and status',
    delete: 'Soft delete project',
    getById: 'Get project details with assets',
    updateStatus: 'Update project status',
    assignArtist: 'Assign project to artist'
  },
  
  assets: {
    upload: 'Upload asset files to S3',
    list: 'Get project assets',
    update: 'Update asset metadata',
    delete: 'Delete asset file',
    process: 'Process uploaded assets',
    getPresignedUrl: 'Get S3 upload URL'
  },
  
  urls: {
    generate: 'Generate URL options for project',
    check: 'Check URL availability',
    reserve: 'Reserve URL for project',
    deploy: 'Deploy game to URL',
    analytics: 'Get URL access analytics'
  },
  
  users: {
    list: 'Get team members',
    create: 'Add new team member',
    update: 'Update user profile',
    updateRole: 'Change user role/permissions',
    getProfile: 'Get current user profile'
  },
  
  notifications: {
    list: 'Get user notifications',
    markRead: 'Mark notification as read',
    create: 'Send notification to user',
    getUnreadCount: 'Get unread notification count'
  }
};
```

### **Type-Safe API Definitions**
```typescript
// Example tRPC router with Zod validation
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const projectRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['backlog', 'in_progress', 'review', 'complete']).optional(),
      assignedTo: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      // Implementation with type safety
    }),

  create: protectedProcedure
    .input(z.object({
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      petName: z.string().min(1),
      packageType: z.enum(['express', 'custom', 'premium']),
      gameConfig: z.object({
        theme: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        features: z.array(z.string())
      })
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation with validation
    })
});
```

---

## 🚀 **Performance Architecture**

### **Frontend Performance**
```typescript
const frontendPerformance = {
  codeSpilitting: 'Route-based and component-based splitting',
  bundleOptimization: 'Tree shaking and dead code elimination',
  imageOptimization: 'Next.js Image component with WebP',
  caching: {
    staticAssets: '1 year cache for unchanging assets',
    apiResponses: 'React Query with stale-while-revalidate',
    images: 'Optimized with Next.js Image cache'
  },
  
  realTimeUpdates: {
    websockets: 'Socket.io for real-time project updates',
    optimisticUpdates: 'Immediate UI updates with rollback',
    debouncing: 'Debounced search and filter operations',
    pagination: 'Virtual scrolling for large lists'
  }
};
```

### **Backend Performance**
```typescript
const backendPerformance = {
  database: {
    connectionPooling: 'Prisma connection pooling',
    queryOptimization: 'N+1 prevention with includes',
    indexing: 'Strategic indexes on frequently queried columns',
    readReplicas: 'Read replicas for analytics queries'
  },
  
  caching: {
    redis: 'Session storage and API response caching',
    cdnCaching: 'CloudFront for static assets',
    applicationCache: 'In-memory caching for frequent queries',
    invalidationStrategy: 'Smart cache invalidation on updates'
  },
  
  fileProcessing: {
    backgroundJobs: 'Bull.js queue for asset processing',
    imageOptimization: 'Sharp.js for image processing',
    parallelUploads: 'Concurrent file upload processing',
    progressTracking: 'Real-time upload progress updates'
  }
};
```

---

## 📈 **Monitoring & Observability**

### **Application Monitoring**
```typescript
const monitoring = {
  errorTracking: {
    service: 'Sentry',
    coverage: 'Frontend and backend error capture',
    alerting: 'Real-time error notifications',
    sourceMapping: 'Source map upload for stack traces'
  },
  
  performance: {
    webVitals: 'Core Web Vitals tracking',
    apiMetrics: 'Response time and throughput',
    databaseMetrics: 'Query performance and connection health',
    userExperience: 'Real user monitoring'
  },
  
  business: {
    projectMetrics: 'Project completion rates and times',
    userActivity: 'Artist productivity and engagement',
    systemUsage: 'Feature adoption and usage patterns',
    customDashboards: 'Business KPI visualization'
  }
};
```

### **Health Checks & Alerts**
```typescript
const healthChecking = {
  endpoints: [
    'GET /api/health - Basic service health',
    'GET /api/health/deep - Database and external service health',
    'GET /api/health/cache - Redis connectivity',
    'GET /api/health/storage - S3 connectivity'
  ],
  
  alerts: {
    errorRate: 'Alert if error rate > 1%',
    responseTime: 'Alert if API response > 2s',
    uptime: 'Alert if uptime < 99.9%',
    diskSpace: 'Alert if storage > 80%'
  }
};
```

---

## 🔄 **Development Workflow**

### **Local Development Setup**
```bash
# Environment setup
git clone <repo>
cd petpixel-platform
pnpm install

# Database setup
docker-compose up -d postgres redis
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🎯 **Success Metrics**

### **Technical KPIs**
- **Performance**: <2s page load, <500ms API response
- **Reliability**: 99.9% uptime, <0.1% error rate
- **Security**: Zero security incidents, regular audits
- **Scalability**: Support 50+ concurrent users

### **Business KPIs**
- **Adoption**: 100% team adoption within 1 week
- **Productivity**: 3x improvement in project throughput
- **Quality**: 95% first-time approval rate
- **User Satisfaction**: >4.5/5 internal user rating

**This architecture provides a solid foundation for the internal tool while preparing for AI integration and eventual customer platform development.** 🏗️