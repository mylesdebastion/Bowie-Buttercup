# Story IT001.2: Customer Order Intake

## Status
Draft

## Story
**As an** operator  
**I want** to create new projects from customer orders efficiently  
**so that** I can convert sales into actionable work items quickly

## Acceptance Criteria
1. Form to input customer details (name, email, contact preferences)
2. Pet information section (name, breed, age, personality traits)
3. Multiple pet photo upload with drag-and-drop interface
4. Game customization preferences (theme, difficulty, special features)
5. Package selection (Express $79, Custom $149, Premium $299)
6. Automatic project folder creation in file system
7. Artist assignment based on workload and specialization
8. Customer notification email sent automatically

## Tasks / Subtasks
- [ ] Create multi-step order intake form (AC: 1, 2, 4, 5)
  - [ ] Set up React Hook Form with Zod validation
  - [ ] Create customer details step (name, email, contact preferences)
  - [ ] Build pet information step (name, breed, age, personality)
  - [ ] Add game customization step (theme, difficulty, features)
  - [ ] Implement package selection with pricing display
  - [ ] Add form progress indicator
- [ ] Implement file upload functionality (AC: 3)
  - [ ] Set up React Dropzone for pet photo uploads
  - [ ] Add image preview and metadata extraction
  - [ ] Implement progress indicators for uploads >1MB
  - [ ] Integrate with AWS S3 presigned URL upload
  - [ ] Add file validation (type, size, virus scanning)
- [ ] Create project creation logic (AC: 6, 7)
  - [ ] Build tRPC mutation for project creation
  - [ ] Implement automatic folder structure generation
  - [ ] Add artist assignment algorithm based on workload
  - [ ] Create project in database with all form data
- [ ] Implement email notification system (AC: 8)
  - [ ] Set up SendGrid email template system
  - [ ] Create welcome email template with project timeline
  - [ ] Send automatic notification on project creation
  - [ ] Log email delivery status
- [ ] Form state management and persistence
  - [ ] Save form progress to localStorage
  - [ ] Handle form errors and validation
  - [ ] Implement form submission with loading states
- [ ] Unit and integration testing
  - [ ] Test form validation and submission
  - [ ] Test file upload functionality
  - [ ] Test email notification delivery
  - [ ] Test project creation workflow

## Dev Notes

### Architecture Context
**Source**: [Internal Tool Architecture](../architecture/internal-tool-architecture.md)

**Form Technology Stack**:
- Forms: React Hook Form + Zod validation [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- File Upload: React Dropzone + Progress [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- Email: SendGrid for automated notifications [Source: architecture/internal-tool-architecture.md#backend-architecture]

**Database Schema Integration**:
Projects table fields [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
CREATE TABLE projects (
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  pet_name VARCHAR(100) NOT NULL,
  pet_breed VARCHAR(100),
  pet_age INTEGER,
  pet_personality TEXT,
  package_type VARCHAR(50) NOT NULL, -- express, custom, premium
  game_config JSONB, -- theme, difficulty, special features
  assigned_artist_id UUID REFERENCES users(id),
  deadline DATE,
  estimated_hours INTEGER
);
```

Asset storage schema [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
CREATE TABLE project_assets (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL, -- photo, sprite, background, sound, config
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- S3 key
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  metadata JSONB, -- dimensions, duration, format details
  uploaded_by UUID REFERENCES users(id)
);
```

**API Endpoints**:
tRPC router usage [Source: architecture/internal-tool-architecture.md#api-architecture]:
- `projects.create` - Create new project from order
- `assets.getPresignedUrl` - Get S3 upload URL
- `assets.upload` - Upload asset files to S3
- `users.list` - Get available artists for assignment

**File Upload Security**:
File validation requirements [Source: architecture/internal-tool-architecture.md#file-upload-security]:
- Allowed types: image/jpeg, image/png, image/heic
- Max file size: 10MB
- Virus scanning: ClamAV integration
- Filename validation: Sanitize and validate filenames

**Email Integration**:
SendGrid configuration [Source: architecture/internal-tool-architecture.md#backend-architecture]:
- Template system for notifications
- Customer welcome email with project timeline
- Automated delivery with status tracking

**File Structure**:
```
src/app/orders/
├── new/
│   └── page.tsx            # Order intake page
├── components/
│   ├── OrderForm.tsx       # Multi-step form container
│   ├── CustomerStep.tsx    # Customer details step
│   ├── PetStep.tsx         # Pet information step
│   ├── PhotoUpload.tsx     # File upload component
│   ├── GameConfigStep.tsx  # Game customization step
│   ├── PackageStep.tsx     # Package selection step
│   └── ReviewStep.tsx      # Final review before submission
├── hooks/
│   ├── useOrderForm.tsx    # Form state management
│   ├── useFileUpload.tsx   # File upload logic
│   └── useArtistAssignment.tsx # Artist assignment logic
└── schemas/
    └── orderSchema.ts      # Zod validation schemas
```

**Package Pricing Structure**:
```typescript
const packages = {
  express: { price: 79, features: ['Basic game', '24h delivery'] },
  custom: { price: 149, features: ['Custom features', '3-day delivery'] },
  premium: { price: 299, features: ['Full customization', '1-week delivery'] }
};
```

### Testing
**Test Location**: `tests/unit/orders/` and `tests/integration/orders/`
**Test Standards**: Jest with jsdom environment, React Testing Library
**Coverage Requirements**: 80% line coverage for order form components

**Specific Testing Requirements**:
- Unit tests for each form step component
- Integration tests for complete order submission workflow
- File upload testing with mock S3 integration
- Email notification testing with SendGrid mocks
- Form validation testing for all input fields
- Artist assignment algorithm testing

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