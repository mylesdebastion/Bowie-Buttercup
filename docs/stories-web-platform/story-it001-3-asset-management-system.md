# Story IT001.3: Asset Management System

## Status
Draft

## Story
**As an** artist  
**I want** to upload and organize game assets efficiently  
**so that** I can focus on creative work rather than file management

## Acceptance Criteria
1. Drag-and-drop asset upload interface
2. Automatic file organization by type (sprites, backgrounds, sounds, configs)
3. Asset preview functionality with metadata display
4. Version control for asset updates with history
5. Batch upload and processing capabilities
6. Asset compression and optimization
7. Integration with project folder structure
8. Asset library search and filtering

## Tasks / Subtasks
- [ ] Create asset upload interface (AC: 1, 5)
  - [ ] Build drag-and-drop upload zone with React Dropzone
  - [ ] Support multiple file selection and batch uploads
  - [ ] Add upload progress indicators for each file
  - [ ] Implement file type validation and error handling
- [ ] Implement automatic file organization (AC: 2, 7)
  - [ ] Create file type detection logic (sprites, backgrounds, sounds, configs)
  - [ ] Build automatic folder structure creation
  - [ ] Implement S3 key generation with organized paths
  - [ ] Add project-based asset organization
- [ ] Build asset preview and metadata system (AC: 3)
  - [ ] Create image preview component with zoom functionality
  - [ ] Add audio preview with playback controls
  - [ ] Implement metadata extraction (dimensions, duration, format)
  - [ ] Display file information panel (size, type, upload date)
- [ ] Implement version control system (AC: 4)
  - [ ] Create asset versioning database schema
  - [ ] Build version history tracking
  - [ ] Add version comparison interface
  - [ ] Implement rollback functionality
- [ ] Add asset processing pipeline (AC: 6)
  - [ ] Set up image compression with Sharp.js
  - [ ] Implement thumbnail generation
  - [ ] Add audio format optimization
  - [ ] Create background job processing with Bull.js
- [ ] Create asset library interface (AC: 8)
  - [ ] Build searchable asset grid with pagination
  - [ ] Add filtering by type, project, date, and tags
  - [ ] Implement asset tagging system
  - [ ] Create asset library navigation
- [ ] Unit and integration testing
  - [ ] Test file upload and processing pipeline
  - [ ] Test asset organization and search functionality
  - [ ] Test version control and rollback features
  - [ ] Test batch upload and processing

## Dev Notes

### Architecture Context
**Source**: [Internal Tool Architecture](../architecture/internal-tool-architecture.md)

**File Storage Architecture**:
- File Storage: AWS S3 + CloudFront CDN [Source: architecture/internal-tool-architecture.md#backend-architecture]
- File Upload: React Dropzone + Progress [Source: architecture/internal-tool-architecture.md#frontend-architecture]
- Queue System: Redis + Bull for background jobs [Source: architecture/internal-tool-architecture.md#backend-architecture]

**Database Schema for Assets**:
Project assets table [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
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
```

**File Upload Security Requirements**:
Security validation [Source: architecture/internal-tool-architecture.md#file-upload-security]:
- Allowed file types: image/jpeg, image/png, image/heic, audio/mp3
- Max file size: 10MB per file
- Virus scanning: ClamAV integration for uploaded files
- Filename sanitization: Remove special characters and validate names

**API Integration**:
tRPC endpoints [Source: architecture/internal-tool-architecture.md#api-architecture]:
- `assets.upload` - Upload asset files to S3
- `assets.list` - Get project assets with filtering
- `assets.update` - Update asset metadata
- `assets.delete` - Delete asset file
- `assets.process` - Process uploaded assets
- `assets.getPresignedUrl` - Get S3 upload URL

**File Processing Pipeline**:
Background processing [Source: architecture/internal-tool-architecture.md#backend-performance]:
- Bull.js queue for asset processing
- Sharp.js for image processing and optimization
- Parallel upload processing for multiple files
- Real-time progress tracking for uploads

**S3 Bucket Organization**:
```
projects/{project-id}/
├── photos/           # Original pet photos
├── sprites/          # Generated sprite assets
├── backgrounds/      # Background images
├── sounds/          # Audio files
├── configs/         # Game configuration files
└── thumbnails/      # Generated thumbnails
```

**File Structure**:
```
src/app/assets/
├── page.tsx                # Asset library main page
├── [projectId]/
│   └── page.tsx           # Project-specific assets
├── components/
│   ├── AssetUpload.tsx    # Drag-drop upload interface
│   ├── AssetGrid.tsx      # Asset library grid
│   ├── AssetCard.tsx      # Individual asset card
│   ├── AssetPreview.tsx   # Preview modal
│   ├── AssetMetadata.tsx  # Metadata display
│   ├── VersionHistory.tsx # Version control interface
│   └── AssetFilters.tsx   # Search and filter controls
├── hooks/
│   ├── useAssetUpload.tsx # Upload logic and progress
│   ├── useAssetProcessing.tsx # Background processing status
│   └── useAssetLibrary.tsx # Asset fetching and management
└── utils/
    ├── fileValidation.ts  # File type and size validation
    ├── metadataExtractor.ts # Extract file metadata
    └── s3Upload.ts        # S3 upload utilities
```

**Asset Processing Workflow**:
```typescript
const assetProcessingFlow = {
  upload: 'User uploads → S3 presigned URL → File stored',
  detection: 'File type detection → Auto-categorization',
  processing: 'Background job → Compression/optimization → Thumbnail generation',
  metadata: 'Extract metadata → Store in database → Update UI',
  notification: 'Processing complete → Real-time UI update'
};
```

### Testing
**Test Location**: `tests/unit/assets/` and `tests/integration/assets/`
**Test Standards**: Jest with jsdom environment, React Testing Library
**Coverage Requirements**: 80% line coverage for asset management components

**Specific Testing Requirements**:
- Unit tests for file upload, preview, and metadata components
- Integration tests for complete asset upload and processing workflow
- File processing pipeline testing with background jobs
- S3 integration testing with presigned URLs
- Asset library search and filtering functionality
- Version control and rollback testing
- Batch upload and concurrent processing testing

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