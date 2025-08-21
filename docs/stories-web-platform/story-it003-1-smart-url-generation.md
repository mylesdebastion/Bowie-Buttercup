# Story IT003.1: Smart URL Generation Algorithm
## PetPixel Games Platform

**Story ID:** IT003.1  
**Story Title:** Smart URL Generation Algorithm  
**Epic:** IT003 - URL Management & Hosting  
**Priority:** P1 (High Priority)  
**Story Points:** 8  
**Sprint:** Week 6 of Phase 2  

---

## User Story

**As an** artist  
**I want** the system to generate 3 unique URL options for each pet  
**So that** customers always have memorable, available URLs to choose from  

## Business Context

This is the core algorithm that powers the URL generation experience. The system must provide artists with intelligent, memorable URL suggestions that customers will easily remember and share. The algorithm needs to balance creativity with availability, ensuring high success rates while maintaining brand consistency.

## Acceptance Criteria

### AC-1: Multi-Strategy URL Generation
- [ ] **Given** I enter a pet name, **when** I request URL options, **then** I receive exactly 3 unique variations using different strategies
- [ ] **Given** the pet name is "Buttercup", **when** generation runs, **then** I see options like: buttercup-sunny, buttercup-2024, buttercup-x7k2
- [ ] **Given** any pet name, **when** URLs are generated, **then** each strategy produces distinctly different results

### AC-2: Real-Time Availability Checking
- [ ] **Given** 3 URLs are generated, **when** availability is checked, **then** I see immediate status for each (available/taken)
- [ ] **Given** a URL is taken, **when** results display, **then** it shows clear visual indication of unavailability
- [ ] **Given** all URLs are available, **when** results display, **then** all show as selectable options

### AC-3: URL Sanitization and Validation
- [ ] **Given** I enter "Mr. Whiskers!", **when** URLs generate, **then** special characters are properly sanitized to "mr-whiskers"
- [ ] **Given** I enter a very long name, **when** URLs generate, **then** they respect length limits (max 50 characters)
- [ ] **Given** any input, **when** URLs generate, **then** they conform to web-safe URL standards

### AC-4: Collision Resolution System
- [ ] **Given** a popular pet name like "Buddy", **when** all variations are taken, **then** system generates infinite fallback options
- [ ] **Given** high collision scenarios, **when** fallbacks are needed, **then** they maintain readability and brand consistency
- [ ] **Given** duplicate names across customers, **when** URLs generate, **then** each customer gets unique options

### AC-5: Strategy-Specific Logic
- [ ] **Given** the adjective strategy, **when** generation runs, **then** only positive, brand-appropriate adjectives are used
- [ ] **Given** the year strategy, **when** generation runs, **then** current year is used automatically
- [ ] **Given** the random code strategy, **when** generation runs, **then** codes are pronounceable and avoid offensive combinations

### AC-6: Performance Requirements
- [ ] **Given** URL generation request, **when** processing begins, **then** results return within 2 seconds
- [ ] **Given** high concurrent usage, **when** multiple requests occur, **then** system maintains response times
- [ ] **Given** database queries for availability, **when** checking occurs, **then** queries are optimized for speed

## Technical Requirements

### Algorithm Implementation
```typescript
interface URLGenerationRequest {
  petName: string;
  customerID: string;
  excludePatterns?: string[];
}

interface URLGenerationResult {
  suggestions: URLSuggestion[];
  fallbackAvailable: boolean;
  generationTime: number;
}

interface URLSuggestion {
  url: string;
  strategy: 'adjective' | 'year' | 'random';
  available: boolean;
  reservationExpiry?: Date;
}
```

### Generation Strategies
1. **Adjective Strategy**: petname-{positive-adjective}
   - Curated list of 200+ positive adjectives
   - No offensive or negative words
   - Brand-appropriate tone (sunny, bright, happy, etc.)

2. **Year Strategy**: petname-{current-year}
   - Always uses current calendar year
   - Fallback to year+1, year+2 if needed

3. **Random Code Strategy**: petname-{short-code}
   - 3-4 character pronounceable codes
   - Avoid offensive letter combinations
   - Use vowel-consonant patterns for readability

### Database Schema
```sql
CREATE TABLE url_reservations (
  id UUID PRIMARY KEY,
  url_slug VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID NOT NULL,
  project_id UUID,
  status ENUM('available', 'reserved', 'deployed') NOT NULL,
  reserved_at TIMESTAMP,
  expires_at TIMESTAMP,
  deployed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_url_slug (url_slug),
  INDEX idx_status_expiry (status, expires_at)
);
```

### API Specification
```typescript
// URL Generation API
POST /api/urls/generate
Content-Type: application/json

Request:
{
  petName: string,
  customerID: string,
  projectID?: string
}

Response:
{
  suggestions: [
    {
      url: "buttercup-sunny",
      strategy: "adjective", 
      available: true,
      estimatedAvailability: "immediate"
    },
    {
      url: "buttercup-2024",
      strategy: "year",
      available: true,
      estimatedAvailability: "immediate"  
    },
    {
      url: "buttercup-x7k2",
      strategy: "random",
      available: false,
      suggestedAlternative: "buttercup-m3w8"
    }
  ],
  fallbackOptions: 15,
  generationTime: 1.2
}
```

## UI/UX Specifications

### Desktop Layout
```
┌─────────────────────────────────────────┐
│        Choose Your Game URL            │
├─────────────────────────────────────────┤
│                                         │
│  Pet Name: Buttercup                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✅ buttercup-sunny               │   │
│  │    Available - Creative & Fun   │   │
│  │    [Select This URL]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✅ buttercup-2024               │   │
│  │    Available - Year Based       │   │
│  │    [Select This URL]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ❌ buttercup-x7k2               │   │
│  │    Taken - Try: buttercup-m3w8  │   │
│  │    [View Alternative]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 Don't like these? Generate more... │
└─────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────┐
│      Choose Game URL            │
├─────────────────────────────────┤
│                                 │
│ Pet: Buttercup                  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ buttercup-sunny           │ │
│ │ Available                   │ │
│ │ [Select]                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✅ buttercup-2024           │ │
│ │ Available                   │ │
│ │ [Select]                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ❌ buttercup-x7k2           │ │
│ │ Taken                       │ │
│ │ Try: buttercup-m3w8         │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Generate More Options]         │
└─────────────────────────────────┘
```

### Visual States
```css
/* Available URL Option */
.url-option.available {
  border: 2px solid #27ae60;
  background: #f8fff9;
  cursor: pointer;
}

/* Taken URL Option */
.url-option.taken {
  border: 2px solid #e74c3c;
  background: #fdf2f2;
  opacity: 0.7;
}

/* Selected URL Option */
.url-option.selected {
  border: 2px solid #ff6b35;
  background: #fff5f2;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

/* Loading State */
.url-option.checking {
  border: 2px solid #4ecdc4;
  background: #f0fffe;
  position: relative;
}
```

## Implementation Notes

### Frontend Components
```typescript
interface URLGeneratorProps {
  petName: string;
  onURLSelected: (url: string) => void;
  onGenerateMore: () => void;
}

interface URLOptionProps {
  suggestion: URLSuggestion;
  onSelect: (url: string) => void;
  isSelected: boolean;
}

// Custom hooks
const useURLGeneration = (petName: string) => {
  const [suggestions, setSuggestions] = useState<URLSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation...
};
```

### Backend Services
```typescript
class URLGenerationService {
  async generateURLs(request: URLGenerationRequest): Promise<URLGenerationResult> {
    const strategies = [
      new AdjectiveStrategy(),
      new YearStrategy(), 
      new RandomCodeStrategy()
    ];
    
    const suggestions = await Promise.all(
      strategies.map(strategy => strategy.generate(request.petName))
    );
    
    return this.checkAvailability(suggestions);
  }
  
  private async checkAvailability(urls: string[]): Promise<URLSuggestion[]> {
    // Batch database query for availability
    // Return results with availability status
  }
}
```

### Adjective Library
- Curated list of 200+ positive adjectives
- Categorized by tone: playful, elegant, strong, gentle
- Regularly updated based on usage analytics
- Localization support for international markets

### Performance Optimizations
- Database indexes on url_slug and expiration fields
- Redis caching for recent availability checks
- Batch processing for multiple URL checks
- Connection pooling for database queries

## Testing Strategy

### Unit Tests
- URL sanitization logic
- Each generation strategy independently
- Collision resolution algorithms
- Performance benchmarks

### Integration Tests
- Database availability checking
- Full generation workflow
- Error handling scenarios
- Concurrent request handling

### E2E Tests
```gherkin
Scenario: Successful URL generation for common pet name
  Given I am creating a game for pet "Buddy"
  When I request URL suggestions
  Then I see 3 different URL options
  And at least 2 are marked as available
  And each uses a different generation strategy

Scenario: Handling high-collision pet names
  Given I am creating a game for pet "Max" 
  And most "Max" variations are already taken
  When I request URL suggestions
  Then I still receive 3 valid options
  And fallback suggestions are available
  And response time is under 3 seconds
```

### Load Testing
- 100 concurrent URL generation requests
- Database query performance under load
- Memory usage during high traffic
- Response time consistency

## Definition of Done

- [ ] All acceptance criteria verified and tested
- [ ] URL generation algorithm implemented and optimized
- [ ] Database schema created with proper indexes
- [ ] API endpoints developed with comprehensive error handling
- [ ] Frontend components built with responsive design
- [ ] Adjective library curated and integrated
- [ ] Performance benchmarks met (<2s response time)
- [ ] Unit tests written with >85% coverage
- [ ] Integration tests pass all scenarios
- [ ] Load testing completed successfully
- [ ] Code review completed by senior developer
- [ ] Documentation updated with API specifications
- [ ] Ready for Story IT003.2 (URL Reservation System)

## Dependencies

### Upstream Dependencies
- Database infrastructure provisioned
- Authentication service for customer identification
- Basic admin dashboard framework (IT001)

### Downstream Dependencies
- URL Reservation System (Story IT003.2)
- Game deployment pipeline (Story IT003.3)
- Analytics tracking system (Story IT003.5)

---

**Story Status:** Ready for Development  
**Assigned Developer:** Backend Team + Frontend Team  
**Estimated Completion:** Week 6, Phase 2  
**Last Updated:** 2025-08-21