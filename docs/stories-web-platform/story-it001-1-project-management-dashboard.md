# Story IT001.1: Project Management Dashboard

## Status
Draft

## Story
**As an** artist  
**I want** to view all active projects and their status in a clean dashboard  
**so that** I can efficiently manage my workload and track progress

## Acceptance Criteria
1. Dashboard displays projects in kanban-style board (Backlog, In Progress, Review, Complete)
2. Project cards show customer name, pet name, deadline, and current status
3. Filter projects by artist, status, priority, and deadline
4. Search functionality for finding specific projects quickly
5. Real-time status updates when projects move between stages
6. Mobile-responsive design for checking status on-the-go

## Tasks / Subtasks
- [ ] Create main dashboard page layout (AC: 1)
  - [ ] Set up Next.js app router page at `/dashboard`
  - [ ] Create responsive grid layout using Tailwind CSS
  - [ ] Implement kanban column structure (Backlog, In Progress, Review, Complete)
- [ ] Implement project card component (AC: 2)
  - [ ] Design project card with customer name, pet name, deadline, status
  - [ ] Add priority indicator and progress visualization
  - [ ] Implement drag-and-drop functionality between columns
- [ ] Add filtering and search functionality (AC: 3, 4)
  - [ ] Create filter dropdown for artist assignment
  - [ ] Add status, priority, and deadline filters
  - [ ] Implement search input with debounced queries
  - [ ] Persist filter state in URL parameters
- [ ] Implement real-time updates (AC: 5)
  - [ ] Set up WebSocket connection using Socket.io
  - [ ] Listen for project status change events
  - [ ] Update UI optimistically with rollback capability
- [ ] Ensure mobile responsiveness (AC: 6)
  - [ ] Test layout on mobile devices (320px-768px)
  - [ ] Implement touch-friendly interactions
  - [ ] Add bottom navigation for mobile users
- [ ] Unit and integration testing
  - [ ] Write Jest tests for dashboard components
  - [ ] Test filtering and search functionality
  - [ ] Test real-time update mechanisms

## Dev Notes

### Architecture Context
**Source**: [Internal Tool Architecture](../architecture/internal-tool-architecture.md)

**Frontend Technology Stack**:
- Framework: Next.js 14 with App Router [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- Styling: Tailwind CSS + Shadcn/ui components [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- State Management: React Query + Zustand for global state [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- Real-time: WebSocket + Socket.io [Source: architecture/internal-tool-architecture.md#frontend-architecture]

**Database Schema**:
Projects table structure [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  pet_name VARCHAR(100) NOT NULL,
  package_type VARCHAR(50) NOT NULL, -- express, custom, premium
  status VARCHAR(50) DEFAULT 'backlog', -- backlog, in_progress, review, complete
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  assigned_artist_id UUID REFERENCES users(id),
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**API Integration**:
tRPC router endpoints [Source: architecture/internal-tool-architecture.md#api-architecture]:
- `projects.list` - Get projects with filtering and pagination
- `projects.updateStatus` - Update project status for kanban moves
- `projects.assignArtist` - Artist assignment functionality

**UI Component Library**:
- Use Shadcn/ui + Radix UI components [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- Lucide React for iconography [Source: epic-it001-admin-dashboard.md#ui-ux-requirements]
- 8px grid system for consistent layouts [Source: epic-it001-admin-dashboard.md#ui-ux-requirements]

**Performance Requirements**:
- Page Load: <2 seconds initial dashboard load [Source: epic-it001-admin-dashboard.md#performance-requirements]
- Real-time Updates: <500ms latency for status changes [Source: epic-it001-admin-dashboard.md#performance-requirements]
- Search/Filter: <300ms response time for filtering operations [Source: epic-it001-admin-dashboard.md#performance-requirements]

**File Structure**:
Based on Next.js 14 App Router pattern:
```
src/app/dashboard/
├── page.tsx                 # Main dashboard page
├── components/
│   ├── ProjectBoard.tsx     # Kanban board container
│   ├── ProjectCard.tsx      # Individual project card
│   ├── FilterPanel.tsx      # Filtering controls
│   └── SearchBar.tsx        # Search functionality
└── hooks/
    ├── useProjects.tsx      # React Query hook for projects
    ├── useRealTime.tsx      # Socket.io real-time updates
    └── useFilters.tsx       # Filter state management
```

### Testing
**Test Location**: `tests/unit/dashboard/` and `tests/integration/dashboard/`
**Test Standards**: Jest with jsdom environment [Source: architecture/tech-stack.md#testing-framework]
**Testing Framework**: Jest 29.x+ with React Testing Library
**Coverage Requirements**: 80% line coverage for dashboard components [Source: architecture/tech-stack.md#testing-framework]

**Specific Testing Requirements**:
- Unit tests for each React component (ProjectCard, ProjectBoard, FilterPanel, SearchBar)
- Integration tests for real-time WebSocket functionality
- Performance tests for large project lists (100+ projects)
- Mobile responsiveness testing using device simulation

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-21 | 1.0 | Initial story creation | Scrum Master |

## Dev Agent Record
*This section will be populated by the development agent during implementation*

### Agent Model Used
*To be filled by dev agent*

### Debug Log References
*To be filled by dev agent*

### Completion Notes List
*To be filled by dev agent*

### File List
*To be filled by dev agent*

## QA Results
*Results from QA Agent review will be populated here after story completion*