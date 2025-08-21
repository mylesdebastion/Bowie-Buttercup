# Story IT003.2: URL Reservation System
## PetPixel Games Platform

**Story ID:** IT003.2  
**Story Title:** URL Reservation System  
**Epic:** IT003 - URL Management & Hosting  
**Priority:** P1 (High Priority)  
**Story Points:** 5  
**Sprint:** Week 6 of Phase 2  

---

## User Story

**As an** operator  
**I want** to reserve URLs for projects in development  
**So that** chosen URLs remain available until game deployment  

## Business Context

The URL reservation system prevents conflicts and ensures artists don't lose their chosen URLs during the game development process. This system provides peace of mind for customers and prevents frustrating scenarios where URLs become unavailable between selection and deployment.

## Acceptance Criteria

### AC-1: URL Reservation Process
- [ ] **Given** I select an available URL, **when** I confirm my choice, **then** the URL is reserved for 24 hours
- [ ] **Given** I have a reserved URL, **when** I check the admin dashboard, **then** I see clear reservation status and expiration time
- [ ] **Given** I reserve a URL, **when** another user tries to select it, **then** they see it as "temporarily unavailable"

### AC-2: Reservation Status Visibility
- [ ] **Given** I have reserved URLs, **when** I view my projects, **then** I see each URL's reservation status and time remaining
- [ ] **Given** a reservation is expiring soon (< 2 hours), **when** I view the dashboard, **then** I see prominent expiration warnings
- [ ] **Given** a reservation has expired, **when** I check the status, **then** it shows as "expired" with renewal options

### AC-3: Automatic Renewal System
- [ ] **Given** my game development is ongoing, **when** I choose to extend, **then** reservation extends for another 24 hours
- [ ] **Given** I have active project timeline, **when** reservation expires, **then** I receive automatic renewal prompts
- [ ] **Given** I enable auto-renewal, **when** expiration approaches, **then** system extends reservation automatically up to 7 days total

### AC-4: Expiration and Cleanup
- [ ] **Given** a reservation expires, **when** no extension is requested, **then** URL returns to available pool within 1 hour
- [ ] **Given** expired reservations exist, **when** cleanup runs, **then** system processes all expired entries automatically
- [ ] **Given** multiple reservations expire, **when** cleanup occurs, **then** all are processed without impacting system performance

### AC-5: Conflict Prevention
- [ ] **Given** two users select the same URL simultaneously, **when** reservation attempts occur, **then** only first request succeeds
- [ ] **Given** a reservation is active, **when** URL generation runs, **then** reserved URLs are excluded from new suggestions
- [ ] **Given** system conflicts occur, **when** resolution is needed, **then** clear error messages guide users to alternatives

### AC-6: Manual Override Capabilities
- [ ] **Given** I am an admin, **when** special circumstances arise, **then** I can manually extend or release any reservation
- [ ] **Given** urgent deployment needs, **when** admin intervention is required, **then** reservations can be transferred between projects
- [ ] **Given** system issues occur, **when** manual cleanup is needed, **then** admin tools provide safe reservation management

## Technical Requirements

### Database Schema Enhancement
```sql
-- Extend existing url_reservations table
ALTER TABLE url_reservations ADD COLUMN IF NOT EXISTS
  auto_renewal_enabled BOOLEAN DEFAULT FALSE,
  renewal_count INTEGER DEFAULT 0,
  max_renewals INTEGER DEFAULT 7,
  reservation_reason VARCHAR(255),
  admin_notes TEXT,
  last_renewed_at TIMESTAMP,
  last_renewed_by UUID;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_expires_at_status 
  ON url_reservations (expires_at, status);
  
CREATE INDEX IF NOT EXISTS idx_customer_status 
  ON url_reservations (customer_id, status);
  
CREATE INDEX IF NOT EXISTS idx_auto_renewal 
  ON url_reservations (auto_renewal_enabled, expires_at)
  WHERE status = 'reserved';
```

### API Specification
```typescript
// Reservation Management API
POST /api/urls/reserve
Content-Type: application/json

Request:
{
  urlSlug: string,
  projectID: string,
  autoRenewal?: boolean,
  reason?: string
}

Response:
{
  reservationID: string,
  urlSlug: string,
  status: "reserved",
  expiresAt: string, // ISO timestamp
  renewalsRemaining: number,
  autoRenewalEnabled: boolean
}

// Reservation Extension API
PUT /api/urls/reservations/{reservationID}/extend
Content-Type: application/json

Request:
{
  duration?: number, // hours, default 24
  reason?: string
}

Response:
{
  reservationID: string,
  newExpirationTime: string,
  renewalsRemaining: number,
  totalExtensionTime: number
}

// Reservation Status API
GET /api/urls/reservations/customer/{customerID}

Response:
{
  reservations: [
    {
      reservationID: string,
      urlSlug: string,
      projectName: string,
      status: "reserved" | "expired" | "deployed",
      expiresAt: string,
      timeRemaining: number, // seconds
      autoRenewalEnabled: boolean,
      renewalsUsed: number,
      maxRenewals: number
    }
  ],
  totalActive: number,
  expiringToday: number
}
```

### Background Job System
```typescript
interface ReservationCleanupJob {
  name: "reservation-cleanup";
  schedule: "*/15 * * * *"; // Every 15 minutes
  handler: () => Promise<void>;
}

interface ExpirationNotificationJob {
  name: "expiration-notifications";
  schedule: "0 * * * *"; // Every hour
  handler: () => Promise<void>;
}

class ReservationService {
  async cleanupExpiredReservations(): Promise<CleanupResult> {
    const expired = await this.findExpiredReservations();
    const released = await this.releaseExpiredReservations(expired);
    await this.notifyAffectedCustomers(released);
    
    return {
      processedCount: expired.length,
      releasedCount: released.length,
      errors: []
    };
  }
  
  async sendExpirationNotifications(): Promise<NotificationResult> {
    const expiringSoon = await this.findExpiringReservations(2); // 2 hours
    const notifications = await this.sendNotifications(expiringSoon);
    
    return {
      notificationsSent: notifications.length,
      errors: []
    };
  }
}
```

## UI/UX Specifications

### Reservation Status Dashboard
```
┌─────────────────────────────────────────┐
│        URL Reservations                 │
├─────────────────────────────────────────┤
│                                         │
│  🟢 Active Reservations (2)             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ buttercup-sunny                 │   │
│  │ Project: Buttercup's Adventure  │   │
│  │ ⏰ Expires: 18h 34m remaining   │   │
│  │ 🔄 Auto-renewal: ON             │   │
│  │ [Extend] [Deploy Now] [Release] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ max-happy (EXPIRING SOON!)   │   │
│  │ Project: Max's Great Adventure  │   │
│  │ ⏰ Expires: 1h 23m remaining    │   │
│  │ 🔄 Auto-renewal: OFF            │   │
│  │ [Extend Now] [Enable Auto] [Deploy] │
│  └─────────────────────────────────┘   │
│                                         │
│  📊 Reservation Analytics               │
│  • Total Reserved: 2 URLs              │
│  • Renewals Used: 3/14 allowed         │
│  • Average Hold Time: 2.1 days         │
└─────────────────────────────────────────┘
```

### Mobile Reservation Interface
```
┌─────────────────────────────────┐
│       My URL Reservations       │
├─────────────────────────────────┤
│                                 │
│ 🟢 buttercup-sunny              │
│ Buttercup's Adventure           │
│ ⏰ 18h 34m left                 │
│ [Extend] [Deploy]               │
│                                 │
│ ⚠️ max-happy                    │
│ Max's Adventure                 │
│ ⏰ 1h 23m left - URGENT!        │
│ [Extend Now] [Deploy Now]       │
│                                 │
│ 📊 2 active, 0 expired          │
│ [View All Reservations]         │
└─────────────────────────────────┘
```

### Reservation Confirmation Modal
```
┌─────────────────────────────────────────┐
│        Confirm URL Reservation          │
├─────────────────────────────────────────┤
│                                         │
│  🎯 Reserving: buttercup-sunny          │
│                                         │
│  ⏰ Reservation Length: 24 hours        │
│     (until tomorrow at 3:45 PM)        │
│                                         │
│  🔄 Auto-Renewal Settings:              │
│     ◯ OFF - Manual renewal only         │
│     ◉ ON - Auto-extend if needed        │
│        (max 7 days total)               │
│                                         │
│  📝 Reason (optional):                  │
│     [Game development in progress...]   │
│                                         │
│  ✅ I understand this prevents others   │
│     from using this URL                 │
│                                         │
│     [Cancel]     [Reserve URL]          │
└─────────────────────────────────────────┘
```

### Visual States
```css
/* Active Reservation */
.reservation-card.active {
  border-left: 4px solid #27ae60;
  background: #f8fff9;
}

/* Expiring Soon Warning */
.reservation-card.expiring {
  border-left: 4px solid #f39c12;
  background: #fffcf0;
  animation: pulse-warning 2s infinite;
}

/* Expired Reservation */
.reservation-card.expired {
  border-left: 4px solid #e74c3c;
  background: #fdf2f2;
  opacity: 0.7;
}

/* Auto-renewal Indicator */
.auto-renewal-badge {
  background: #4ecdc4;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

@keyframes pulse-warning {
  0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(243, 156, 18, 0); }
  100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
}
```

## Implementation Notes

### Frontend Components
```typescript
interface ReservationManagerProps {
  customerID: string;
  onReservationChange: (reservations: Reservation[]) => void;
}

interface ReservationCardProps {
  reservation: Reservation;
  onExtend: (reservationID: string, duration: number) => void;
  onRelease: (reservationID: string) => void;
  onDeploy: (reservationID: string) => void;
}

// Custom hooks
const useReservationStatus = (customerID: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-refresh every minute for time-sensitive data
  useEffect(() => {
    const interval = setInterval(fetchReservations, 60000);
    return () => clearInterval(interval);
  }, [customerID]);
};

const useExpirationWarnings = (reservations: Reservation[]) => {
  return useMemo(() => {
    return reservations.filter(r => {
      const timeLeft = new Date(r.expiresAt).getTime() - Date.now();
      return timeLeft > 0 && timeLeft < 2 * 60 * 60 * 1000; // < 2 hours
    });
  }, [reservations]);
};
```

### Backend Services
```typescript
class ReservationManager {
  async createReservation(request: ReservationRequest): Promise<Reservation> {
    // Check availability with pessimistic locking
    const url = await this.lockAndCheckAvailability(request.urlSlug);
    
    if (!url.available) {
      throw new ConflictError('URL no longer available');
    }
    
    return this.createReservationRecord({
      ...request,
      expiresAt: this.calculateExpiration(24), // 24 hours
      status: 'reserved'
    });
  }
  
  async extendReservation(reservationID: string, hours: number = 24): Promise<Reservation> {
    const reservation = await this.findReservation(reservationID);
    
    if (reservation.renewalsUsed >= reservation.maxRenewals) {
      throw new LimitExceededError('Maximum renewals reached');
    }
    
    const newExpiration = this.calculateExpiration(hours, reservation.expiresAt);
    
    return this.updateReservation(reservationID, {
      expiresAt: newExpiration,
      renewalsUsed: reservation.renewalsUsed + 1,
      lastRenewedAt: new Date(),
      lastRenewedBy: reservation.customerID
    });
  }
  
  private calculateExpiration(hours: number, from?: Date): Date {
    const base = from || new Date();
    return new Date(base.getTime() + (hours * 60 * 60 * 1000));
  }
}
```

### Notification System Integration
```typescript
interface ExpirationNotification {
  type: 'reservation_expiring';
  customerID: string;
  urlSlug: string;
  projectName: string;
  expiresAt: Date;
  timeRemaining: number;
  actionUrls: {
    extend: string;
    deploy: string;
    manage: string;
  };
}

class NotificationService {
  async sendExpirationWarning(reservation: Reservation): Promise<void> {
    const notification: ExpirationNotification = {
      type: 'reservation_expiring',
      customerID: reservation.customerID,
      urlSlug: reservation.urlSlug,
      projectName: reservation.projectName,
      expiresAt: reservation.expiresAt,
      timeRemaining: this.calculateTimeRemaining(reservation.expiresAt),
      actionUrls: this.generateActionUrls(reservation)
    };
    
    await Promise.all([
      this.sendEmail(notification),
      this.sendDashboardAlert(notification),
      this.logNotification(notification)
    ]);
  }
}
```

## Testing Strategy

### Unit Tests
- Reservation creation logic
- Expiration calculation algorithms
- Conflict resolution mechanisms
- Auto-renewal logic validation

### Integration Tests
- Database transaction handling
- Background job processing
- Notification system integration
- Concurrent reservation attempts

### E2E Tests
```gherkin
Scenario: Successful URL reservation with auto-renewal
  Given I have selected an available URL
  When I reserve it with auto-renewal enabled
  Then the URL is marked as reserved for 24 hours
  And auto-renewal is configured for up to 7 days
  And I receive confirmation with expiration details

Scenario: Reservation expiration and cleanup
  Given I have a reservation that expires in 5 minutes
  When the reservation expires
  Then the URL becomes available again within 1 hour
  And I receive an expiration notification
  And the cleanup job processes the expired reservation

Scenario: Manual reservation extension
  Given I have an active reservation expiring soon
  When I choose to extend for another 24 hours
  Then the expiration time is updated correctly
  And my renewal count increments
  And I see updated status in the dashboard
```

### Performance Tests
- Concurrent reservation requests (50+ simultaneous)
- Background job performance with large datasets
- Database query optimization under load
- Notification system throughput

## Definition of Done

- [ ] All acceptance criteria verified and tested
- [ ] Reservation system implemented with proper locking
- [ ] Database schema updated with indexes
- [ ] Background jobs created for cleanup and notifications
- [ ] API endpoints developed with comprehensive error handling
- [ ] Frontend components built with real-time updates
- [ ] Auto-renewal system functioning correctly
- [ ] Admin override capabilities implemented
- [ ] Performance requirements met (<1s reservation response)
- [ ] Unit tests written with >85% coverage
- [ ] Integration tests pass all scenarios
- [ ] Notification system integrated and tested
- [ ] Code review completed by senior developer
- [ ] Documentation updated with API specifications
- [ ] Ready for Story IT003.3 (Automated Game Deployment)

## Dependencies

### Upstream Dependencies
- Smart URL Generation Algorithm (Story IT003.1)
- Database infrastructure with locking capabilities
- Notification service infrastructure

### Downstream Dependencies
- Automated Game Deployment (Story IT003.3)
- Analytics tracking (Story IT003.5)
- Customer dashboard updates

---

**Story Status:** Ready for Development  
**Assigned Developer:** Backend Team + DevOps Team  
**Estimated Completion:** Week 6, Phase 2  
**Last Updated:** 2025-08-21