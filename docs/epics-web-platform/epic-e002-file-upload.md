# Epic E002: File Upload & Processing

**Epic ID**: E002  
**Epic Name**: File Upload & Processing  
**Priority**: P0 (Must Have)  
**Estimated Effort**: 2-3 weeks  
**Sprint Allocation**: Sprint 2-3  

## Epic Description

Implement robust file upload system for pet photos with validation, processing, and storage. Support multiple file formats, provide real-time upload progress, and ensure secure file handling with cloud storage integration.

## Business Value

- **User Experience**: Smooth, reliable photo upload process
- **Data Quality**: Ensure high-quality pet photos for game generation
- **Scalability**: Cloud storage for unlimited photo capacity
- **Security**: Secure file validation and virus scanning

## User Stories

### Story E002.1: Photo Upload Interface
**As a** user  
**I want** to upload my pet's photo easily  
**So that** I can create a personalized game  

**Acceptance Criteria:**
- Drag and drop upload interface
- Click to browse file selector
- Multiple file format support (JPEG, PNG, HEIC)
- File size validation (max 10MB)
- Real-time upload progress indicator

### Story E002.2: File Validation & Security
**As a** platform owner  
**I want** to validate and secure uploaded files  
**So that** only safe, appropriate images are processed  

**Acceptance Criteria:**
- File type validation (whitelist approach)
- File size limits enforcement
- Basic image content validation
- Virus scanning integration
- Malicious file rejection

### Story E002.3: Upload Progress & Feedback
**As a** user  
**I want** to see upload progress and status  
**So that** I know my photo is being processed correctly  

**Acceptance Criteria:**
- Upload progress bar with percentage
- File processing status indicators
- Error handling with clear messages
- Retry functionality for failed uploads
- Success confirmation with preview

### Story E002.4: Multiple Photo Support
**As a** user  
**I want** to upload multiple photos of my pet  
**So that** I can provide different angles/poses for better results  

**Acceptance Criteria:**
- Support up to 5 photos per game
- Photo gallery interface
- Individual photo management (delete, reorder)
- Primary photo selection
- Batch upload functionality

### Story E002.5: Image Preview & Editing
**As a** user  
**I want** to preview and make basic edits to my uploaded photos  
**So that** I can ensure the best possible game generation  

**Acceptance Criteria:**
- Photo preview with zoom functionality
- Basic cropping tool
- Rotation controls (90° increments)
- Image quality preview
- Save/discard changes

## Technical Requirements

### File Upload System
- **Storage**: AWS S3 or CloudFlare R2
- **Processing**: Sharp.js for image optimization
- **Validation**: File type, size, and content validation
- **Security**: Virus scanning with ClamAV or similar
- **CDN**: CloudFlare for fast global delivery

### Supported Formats
```typescript
const SUPPORTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic', '.heif'], // iOS photos
  'image/webp': ['.webp'] // Modern format
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_USER = 5;
```

### Database Schema
```sql
-- Uploaded files table
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_key VARCHAR(500) NOT NULL, -- S3 key
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  upload_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  virus_scan_status VARCHAR(50) DEFAULT 'pending',
  image_metadata JSONB, -- dimensions, exif data, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Game file associations
CREATE TABLE game_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL, -- Will reference games table
  file_id UUID REFERENCES uploaded_files(id) ON DELETE CASCADE,
  file_role VARCHAR(50) NOT NULL, -- primary, secondary, reference
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```typescript
// File upload endpoints
POST /api/upload/presigned-url     // Get S3 presigned URL
POST /api/upload/confirm           // Confirm upload completion
GET  /api/upload/status/:fileId    // Check upload/processing status
DELETE /api/upload/:fileId         // Delete uploaded file

// File management
GET  /api/files/user              // Get user's uploaded files
PUT  /api/files/:fileId/metadata  // Update file metadata
POST /api/files/:fileId/process   // Trigger file processing
```

### Upload Flow
```typescript
// Frontend upload process
1. Request presigned URL from backend
2. Upload directly to S3 using presigned URL
3. Confirm upload completion with backend
4. Backend validates and processes file
5. Update UI with processing status
6. Show success/error state to user
```

## UI/UX Requirements

### Upload Interface
- **Drag & Drop Zone**: Visual feedback for hover states
- **Progress Indicators**: Real-time upload progress
- **Preview Gallery**: Thumbnail grid with management controls
- **Error Handling**: Clear error messages with retry options
- **Mobile Support**: Touch-friendly interface

### Design Specifications
```css
/* Upload zone styling */
.upload-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-zone.dragover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

/* Progress bar */
.upload-progress {
  height: 4px;
  background: linear-gradient(90deg, #4299e1 0%, #3182ce 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}
```

### Responsive Behavior
- **Desktop**: Full drag-and-drop interface
- **Mobile**: Tap to select with gallery preview
- **Tablet**: Hybrid approach with touch optimization

## Image Processing Pipeline

### File Validation
```typescript
async function validateUploadedFile(fileKey: string) {
  // 1. Verify file exists in storage
  // 2. Check file size and type
  // 3. Validate image content (not corrupted)
  // 4. Run virus scan
  // 5. Extract metadata (dimensions, format, etc.)
  // 6. Generate thumbnails
  // 7. Update database status
}
```

### Metadata Extraction
```typescript
interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  quality: number;
  hasTransparency: boolean;
  dominantColors: string[];
  exif?: {
    camera?: string;
    timestamp?: Date;
    location?: { lat: number; lng: number };
  };
}
```

## Security Implementation

### File Validation
- **Magic Number Check**: Verify actual file type vs extension
- **Content Scanning**: Basic image structure validation
- **Size Limits**: Prevent DoS via large file uploads
- **Rate Limiting**: Limit uploads per user per time period

### Virus Scanning
```typescript
// Integration with ClamAV or cloud service
async function scanFileForViruses(fileKey: string): Promise<ScanResult> {
  // Stream file from S3 to virus scanner
  // Return clean/infected/error status
  // Quarantine infected files
  // Log scan results
}
```

### Access Control
- **Presigned URLs**: Time-limited upload permissions
- **User Association**: Files tied to authenticated users
- **Privacy**: Files only accessible by owner
- **Cleanup**: Remove abandoned uploads after 24 hours

## Performance Requirements
- **Upload Speed**: Utilize full available bandwidth
- **Processing Time**: <30 seconds for file validation
- **Concurrent Uploads**: Support 100+ simultaneous uploads
- **Storage**: Unlimited capacity via cloud storage
- **Thumbnail Generation**: <5 seconds for preview images

## Testing Strategy

### Unit Tests
- File validation functions
- Metadata extraction
- Upload confirmation logic
- Error handling scenarios
- Security validation

### Integration Tests
- S3 upload/download operations
- Virus scanning integration
- Database file record creation
- File processing pipeline
- Cleanup job functionality

### E2E Tests
- Complete upload flow
- Multiple file upload
- Upload failure scenarios
- Progress indicator accuracy
- Mobile upload experience

## Error Handling

### Upload Errors
```typescript
enum UploadError {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

### User-Friendly Messages
- "File too large. Please use images under 10MB."
- "Invalid file format. Please use JPEG, PNG, or HEIC files."
- "Upload failed. Please check your connection and try again."
- "Processing your image... This may take a moment."

## Dependencies
- **Internal**: E001 (User Auth) for user association
- **External**: AWS S3/CloudFlare R2, ClamAV/virus scanning service
- **Libraries**: Sharp.js, AWS SDK, file validation utilities

## Risks and Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Large file uploads overwhelming system | High | File size limits, rate limiting, CDN |
| Virus/malware uploads | High | Comprehensive scanning, quarantine |
| Storage costs escalating | Medium | Lifecycle policies, compression |
| Upload failures on mobile | Medium | Progressive enhancement, retry logic |

## Definition of Done
- [ ] All user stories completed and tested
- [ ] Security review passed (file validation, virus scanning)
- [ ] Performance benchmarks met (upload speed, processing time)
- [ ] Mobile responsive upload interface verified
- [ ] Error handling comprehensive and user-friendly
- [ ] Storage and CDN integration configured
- [ ] Monitoring and alerting implemented
- [ ] Documentation updated
- [ ] Production deployment verified

## Success Metrics
- **Upload Success Rate**: 98%+ successful uploads
- **Upload Speed**: Utilize 80%+ of available bandwidth
- **Processing Time**: 95% of files processed within 30 seconds
- **User Satisfaction**: <2% upload-related support tickets
- **Security**: Zero malicious files reaching processing stage

---

**Epic Owner**: Development Team  
**Stakeholders**: Product, Design, QA, Security  
**Dependencies**: E001 (User Auth)  
**Next Epic**: E003 - Game Generation & Customization