# Epic IT001: Admin Dashboard Foundation

**Epic ID**: IT001  
**Epic Name**: Internal Game Generation Dashboard  
**Priority**: P0 (Critical Path)  
**Estimated Effort**: 2 weeks  
**Sprint Allocation**: Weeks 1-2 of Phase 2  
**Dependencies**: None (foundation epic)

## Epic Description

Create a polished admin interface for artists and operators to streamline the boutique game creation workflow. This dashboard will serve as the central hub for project management, asset organization, and game deployment, providing immediate operational efficiency while building the foundation for future automation.

## Business Value

- **Immediate ROI**: 3x productivity improvement for existing boutique operations
- **Quality Consistency**: Standardized workflow reduces errors and improves quality
- **Scalability Foundation**: Infrastructure for AI integration and customer platform
- **Team Efficiency**: Streamlined communication and project tracking
- **Revenue Impact**: Increase monthly capacity from 20 to 60+ games

## User Stories

### Story IT001.1: Project Management Dashboard
**As an** artist  
**I want** to view all active projects and their status in a clean dashboard  
**So that** I can efficiently manage my workload and track progress

**Acceptance Criteria:**
- Dashboard displays projects in kanban-style board (Backlog, In Progress, Review, Complete)
- Project cards show customer name, pet name, deadline, and current status
- Filter projects by artist, status, priority, and deadline
- Search functionality for finding specific projects quickly
- Real-time status updates when projects move between stages
- Mobile-responsive design for checking status on-the-go

**Technical Requirements:**
- React component with drag-and-drop functionality
- Real-time updates via WebSocket or polling
- Responsive grid layout with card components
- Search and filter functionality with URL state persistence

### Story IT001.2: Customer Order Intake
**As an** operator  
**I want** to create new projects from customer orders efficiently  
**So that** I can convert sales into actionable work items quickly

**Acceptance Criteria:**
- Form to input customer details (name, email, contact preferences)
- Pet information section (name, breed, age, personality traits)
- Multiple pet photo upload with drag-and-drop interface
- Game customization preferences (theme, difficulty, special features)
- Package selection (Express $79, Custom $149, Premium $299)
- Automatic project folder creation in file system
- Artist assignment based on workload and specialization
- Customer notification email sent automatically

**Technical Requirements:**
- Multi-step form with validation and progress indicator
- File upload with preview and metadata extraction
- Integration with customer database
- Automatic folder structure generation
- Email template system for notifications

### Story IT001.3: Asset Management System
**As an** artist  
**I want** to upload and organize game assets efficiently  
**So that** I can focus on creative work rather than file management

**Acceptance Criteria:**
- Drag-and-drop asset upload interface
- Automatic file organization by type (sprites, backgrounds, sounds, configs)
- Asset preview functionality with metadata display
- Version control for asset updates with history
- Batch upload and processing capabilities
- Asset compression and optimization
- Integration with project folder structure
- Asset library search and filtering

**Technical Requirements:**
- File upload with progress indicators
- Image/audio preview components
- File type detection and validation
- S3/CloudFront integration for storage
- Metadata extraction and storage
- Thumbnail generation for images

### Story IT001.4: Game URL Generator
**As an** artist  
**I want** to generate and reserve unique game URLs for customers  
**So that** I can provide memorable, personalized game addresses

**Acceptance Criteria:**
- Generate 3 URL options from pet name using different strategies:
  - Pet name + random adjective (buttercup-sunny)
  - Pet name + year (buttercup-2024)
  - Pet name + short code (buttercup-x7k2)
- Real-time availability checking across all options
- Clear display of available vs taken URLs
- One-click reservation of chosen URL for 24 hours
- Manual override option for custom URLs
- URL validation and sanitization
- Integration with customer communication for approval

**Technical Requirements:**
- URL generation algorithms with collision detection
- Database integration for availability checking
- Real-time validation with debounced input
- URL reservation system with expiration
- Integration with domain management

### Story IT001.5: Team Authentication & Roles
**As a** team member  
**I want** to securely access the dashboard with appropriate permissions  
**So that** I can perform my role safely without security concerns

**Acceptance Criteria:**
- Secure login system with email/password authentication
- Role-based access control (Artist, Manager, Admin)
- Session management with automatic timeout
- Activity logging for security and accountability
- Password reset functionality
- Two-factor authentication option for admins
- Permission-based UI (hide/show features by role)
- Audit trail for sensitive actions

**Technical Requirements:**
- NextAuth.js integration with custom providers
- Role-based middleware for API routes
- Session storage with secure cookies
- Activity logging to database
- Password hashing with bcrypt
- Rate limiting for authentication attempts

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: React Query + Zustand for global state
- **Forms**: React Hook Form + Zod validation
- **File Upload**: Custom dropzone with react-dropzone
- **Real-time**: WebSocket connection for live updates

### Backend API
- **API Layer**: Next.js API routes with tRPC for type safety
- **Authentication**: NextAuth.js with custom database adapter
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 with CloudFront CDN
- **Email**: SendGrid for automated notifications
- **Queue System**: Redis + Bull for background jobs

### Database Schema
```sql
-- Core project management
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  pet_name VARCHAR(100) NOT NULL,
  pet_breed VARCHAR(100),
  package_type VARCHAR(50) NOT NULL, -- express, custom, premium
  status VARCHAR(50) DEFAULT 'backlog', -- backlog, in_progress, review, complete
  assigned_artist_id UUID REFERENCES users(id),
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Asset management
CREATE TABLE project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL, -- photo, sprite, background, sound, config
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- S3 path
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  metadata JSONB, -- dimensions, format, etc.
  version INTEGER DEFAULT 1,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- URL management
CREATE TABLE game_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  url_slug VARCHAR(150) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'reserved', -- reserved, active, expired
  reserved_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  deployed_at TIMESTAMP
);

-- User management and roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'artist', -- artist, manager, admin
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity logging
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- project, asset, url
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## UI/UX Requirements

### Design System
- **Color Palette**: Pet-friendly warm colors with professional accents
- **Typography**: Clean, readable fonts optimized for dashboard use
- **Components**: Consistent component library using Shadcn/ui
- **Icons**: Lucide React for consistent iconography
- **Spacing**: 8px grid system for consistent layouts

### Key Interface Elements
- **Sidebar Navigation**: Collapsible sidebar with role-based menu items
- **Project Cards**: Rich cards showing project status, deadlines, and progress
- **Asset Gallery**: Grid-based asset browser with preview modals
- **URL Generator**: Step-by-step URL creation with live validation
- **Activity Feed**: Real-time activity stream for team awareness

### Responsive Behavior
- **Desktop**: Full dashboard layout with sidebar and main content
- **Tablet**: Collapsible sidebar with touch-optimized interactions
- **Mobile**: Bottom navigation with condensed card layouts

## Performance Requirements
- **Page Load**: <2 seconds initial dashboard load
- **File Upload**: Progress indicators for uploads >1MB
- **Real-time Updates**: <500ms latency for status changes
- **Search/Filter**: <300ms response time for filtering operations
- **Concurrent Users**: Support 10+ simultaneous users

## Security Requirements
- **Authentication**: Secure session management with automatic timeout
- **Authorization**: Role-based access to sensitive operations
- **File Upload**: Virus scanning and file type validation
- **Data Protection**: Encrypted data transmission and storage
- **Audit Trail**: Complete logging of user actions

## Testing Strategy

### Unit Tests
- API route handlers and business logic
- Form validation and data processing
- URL generation and collision detection
- File upload and processing functions
- Authentication and authorization logic

### Integration Tests
- End-to-end project creation workflow
- File upload and asset management
- URL generation and reservation system
- Email notification delivery
- Database operations and data integrity

### E2E Tests
- Complete artist workflow from login to project completion
- Customer order intake and project creation
- Asset upload and organization
- URL generation and approval process
- Cross-browser compatibility testing

## Dependencies
- **Internal**: None (foundation epic)
- **External**: AWS S3, SendGrid, PostgreSQL database
- **Third-party**: NextAuth.js, Prisma, Shadcn/ui components

## Risks and Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| User adoption resistance | High | Extensive user testing and feedback incorporation |
| File upload performance | Medium | Progressive upload with chunking and compression |
| Real-time update complexity | Medium | Graceful fallback to polling if WebSocket fails |
| URL collision edge cases | Low | Comprehensive testing of generation algorithms |

## Definition of Done
- [ ] All user stories completed and tested
- [ ] Performance benchmarks met (load times, upload speeds)
- [ ] Security review passed (authentication, file handling)
- [ ] Mobile responsive design verified
- [ ] Team training completed and adoption achieved
- [ ] Error handling and logging comprehensive
- [ ] Documentation updated for new workflows
- [ ] Production deployment verified with monitoring

## Success Metrics
- **Adoption Rate**: 100% team adoption within 1 week
- **Productivity**: 3x improvement in projects per artist per week
- **Quality**: 95% first-time approval rate for created projects
- **Speed**: 50% reduction in project creation time
- **User Satisfaction**: >4.5/5 rating from internal users
- **System Reliability**: 99.9% uptime during business hours

---

**Epic Owner**: Development Team  
**Stakeholders**: Artists, Project Managers, Operations  
**Next Epic**: IT002 - Game Template Engine