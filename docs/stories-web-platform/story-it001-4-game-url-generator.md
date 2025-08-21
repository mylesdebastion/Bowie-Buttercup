# Story IT001.4: Game URL Generator

## Status
Draft

## Story
**As an** artist  
**I want** to generate and reserve unique game URLs for customers  
**so that** I can provide memorable, personalized game addresses

## Acceptance Criteria
1. Generate 3 URL options from pet name using different strategies:
   - Pet name + random adjective (buttercup-sunny)
   - Pet name + year (buttercup-2024)
   - Pet name + short code (buttercup-x7k2)
2. Real-time availability checking across all options
3. Clear display of available vs taken URLs
4. One-click reservation of chosen URL for 24 hours
5. Manual override option for custom URLs
6. URL validation and sanitization
7. Integration with customer communication for approval

## Tasks / Subtasks
- [ ] Create URL generation algorithms (AC: 1)
  - [ ] Build adjective-based URL generator with positive word list
  - [ ] Implement year-based URL generator (current year)
  - [ ] Create short code generator (3-4 character alphanumeric)
  - [ ] Add pet name sanitization (spaces, special characters)
- [ ] Implement availability checking system (AC: 2, 3)
  - [ ] Create database lookup for existing URLs
  - [ ] Build real-time validation with debounced queries
  - [ ] Add visual indicators for available/taken/reserved URLs
  - [ ] Implement collision detection and retry logic
- [ ] Build URL reservation system (AC: 4)
  - [ ] Create 24-hour reservation mechanism
  - [ ] Add reservation expiration tracking
  - [ ] Implement automatic cleanup of expired reservations
  - [ ] Build reservation conflict prevention
- [ ] Add manual URL override functionality (AC: 5)
  - [ ] Create custom URL input field
  - [ ] Add manual URL validation
  - [ ] Implement admin-only override capabilities
  - [ ] Add custom URL approval workflow
- [ ] Implement URL validation and sanitization (AC: 6)
  - [ ] Create URL format validation (length, characters)
  - [ ] Add profanity filtering
  - [ ] Implement reserved word checking
  - [ ] Build URL preview functionality
- [ ] Create customer communication integration (AC: 7)
  - [ ] Build URL approval email template
  - [ ] Add customer URL confirmation workflow
  - [ ] Implement URL change request handling
  - [ ] Create URL sharing functionality
- [ ] Unit and integration testing
  - [ ] Test URL generation algorithms with edge cases
  - [ ] Test availability checking and collision resolution
  - [ ] Test reservation system and expiration
  - [ ] Test customer approval workflow

## Dev Notes

### Architecture Context
**Source**: [Internal Tool Architecture](../architecture/internal-tool-architecture.md)

**Database Schema for URLs**:
Game URLs table [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
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
```

**API Integration**:
tRPC endpoints [Source: architecture/internal-tool-architecture.md#api-architecture]:
- `urls.generate` - Generate URL options for project
- `urls.check` - Check URL availability
- `urls.reserve` - Reserve URL for project
- `urls.deploy` - Deploy game to URL
- `urls.analytics` - Get URL access analytics

**URL Generation Strategies**:
Based on Epic requirements:
```typescript
interface URLGenerationStrategy {
  adjective: (petName: string) => string; // buttercup-sunny
  year: (petName: string) => string;      // buttercup-2024
  shortCode: (petName: string) => string; // buttercup-x7k2
}

const adjectiveList = [
  'sunny', 'happy', 'bright', 'clever', 'gentle', 'swift', 'bold',
  'kind', 'brave', 'smart', 'sweet', 'calm', 'proud', 'wise'
];

const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
```

**URL Validation Rules**:
- Length: 3-50 characters
- Characters: alphanumeric, hyphens only
- No consecutive hyphens
- No starting/ending hyphens
- Reserved words: admin, api, www, mail, ftp
- Profanity filtering required

**Reservation System Logic**:
```typescript
const reservationRules = {
  duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxReservations: 3, // per project
  cleanupInterval: 60 * 60 * 1000, // 1 hour cleanup
  renewalPeriod: 2 * 60 * 60 * 1000 // 2 hours before expiry
};
```

**File Structure**:
```
src/app/urls/
├── generate/
│   └── page.tsx           # URL generation interface
├── components/
│   ├── URLGenerator.tsx   # Main URL generation component
│   ├── URLOptions.tsx     # Display generated options
│   ├── URLPreview.tsx     # Preview selected URL
│   ├── ReservationPanel.tsx # Reservation management
│   ├── CustomURLInput.tsx # Manual URL override
│   └── AvailabilityCheck.tsx # Real-time validation
├── hooks/
│   ├── useURLGeneration.tsx # URL generation logic
│   ├── useURLAvailability.tsx # Availability checking
│   └── useURLReservation.tsx # Reservation management
└── utils/
    ├── urlValidation.ts   # Validation and sanitization
    ├── urlGeneration.ts   # Generation algorithms
    └── profanityFilter.ts # Content filtering
```

**Email Integration for Customer Approval**:
SendGrid templates [Source: architecture/internal-tool-architecture.md#backend-architecture]:
- URL approval request email
- URL confirmation email
- URL expiration warning email

**Performance Requirements**:
- URL generation: <500ms for 3 options with availability check [Source: epic-it001-admin-dashboard.md#performance-requirements]
- Real-time validation: <300ms response time
- Reservation processing: <200ms

**Security Considerations**:
- Rate limiting for URL generation (10 requests per minute per user)
- Input sanitization for all URL inputs
- SQL injection prevention in availability queries
- XSS prevention in URL display

### Testing
**Test Location**: `tests/unit/urls/` and `tests/integration/urls/`
**Test Standards**: Jest with jsdom environment, React Testing Library
**Coverage Requirements**: 80% line coverage for URL generation components

**Specific Testing Requirements**:
- Unit tests for URL generation algorithms with various pet names
- Availability checking with concurrent requests
- Reservation system with expiration and cleanup
- URL validation with edge cases and invalid inputs
- Customer approval workflow testing
- Performance testing for large-scale URL generation
- Security testing for input validation and rate limiting

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