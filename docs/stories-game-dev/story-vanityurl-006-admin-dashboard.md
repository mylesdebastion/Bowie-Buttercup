# User Story: Admin Dashboard - Config Management

**Story ID**: VanityURL-006
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P1 - High
**Estimated Effort**: 8-10 hours
**Sprint**: Sprint 2 (Week 2)
**Dependencies**: Story 1 (Config API), Story 5 (Security)

---

## User Story

**As a** SparkleClassic administrator
**I want** a web dashboard to view, search, and manage all game configurations
**So that** I can handle customer support, process refunds, and monitor system health without database access

---

## Business Context

Admin dashboard enables:
- **Customer Support**: Quickly find customer's game, resend URLs
- **Refund Processing**: Soft-delete configs when refunds issued
- **System Monitoring**: View game creation trends, identify issues
- **Data Auditing**: View audit log for compliance

---

## Acceptance Criteria

### Dashboard Access

- [ ] **AC1.1**: Admin dashboard accessible at `/admin`
- [ ] **AC1.2**: Requires authentication (JWT token)
- [ ] **AC1.3**: Role check: Only users with "admin" or "superadmin" role can access
- [ ] **AC1.4**: Redirect to login if unauthenticated

### Config List View

- [ ] **AC2.1**: Display all configs in table:
  - Columns: Slug, Pet Name, Customer Email, Created Date, Status, Actions
  - Sortable by any column
  - Paginated (50 per page)
  - Default sort: newest first

- [ ] **AC2.2**: Status badges with color coding:
  - `active` → Green badge
  - `refunded` → Red badge
  - `expired` → Gray badge

- [ ] **AC2.3**: Action buttons per row:
  - View Details
  - Edit Config
  - Soft Delete
  - View Audit Log

### Search & Filters

- [ ] **AC3.1**: Search bar filters by:
  - Slug (exact or partial match)
  - Pet name (partial match)
  - Customer email (partial match)
  - Order ID (exact match)

- [ ] **AC3.2**: Filter dropdowns:
  - Status: All / Active / Refunded / Expired
  - Date range: Last 7 days / Last 30 days / Custom range
  - Designer: All / Specific designer

- [ ] **AC3.3**: Search is instant (no submit button)
- [ ] **AC3.4**: URL updates with search params for sharing

### Config Detail View

- [ ] **AC4.1**: Click row opens detail modal showing:
  - Full config JSON (syntax highlighted)
  - Customer info (email, order ID)
  - Sprite URL (with preview thumbnail)
  - Timestamps (created, updated, last accessed)
  - Access count
  - Link to live game

- [ ] **AC4.2**: Copy slug button (clipboard copy)
- [ ] **AC4.3**: "View Game" button opens game in new tab
- [ ] **AC4.4**: Download config JSON button

### Soft Delete (Refund Processing)

- [ ] **AC5.1**: Delete button shows confirmation dialog:
  - "Are you sure you want to deactivate this game?"
  - Reason dropdown: Refund / Expired / Customer Request / Other
  - Notes field (optional)

- [ ] **AC5.2**: Soft delete updates:
  - Sets `status = 'deleted'`
  - Logs deletion in audit log
  - Game no longer accessible via URL (403)

- [ ] **AC5.3**: Deleted configs still visible in admin (grayed out)
- [ ] **AC5.4**: Can restore deleted configs (sets status back to 'active')

### Audit Log View

- [ ] **AC6.1**: "Audit Log" button shows full history:
  - Action (created, updated, deleted, restored)
  - Changed by (admin user)
  - Timestamp
  - Changes (before/after diff)

- [ ] **AC6.2**: Audit log filterable by:
  - Action type
  - Admin user
  - Date range

- [ ] **AC6.3**: Audit log exportable as CSV

### Analytics Dashboard

- [ ] **AC7.1**: Dashboard homepage shows:
  - Total games created
  - Active games count
  - Games created this week
  - Most popular pet names (top 10)
  - Recent activity feed

- [ ] **AC7.2**: Charts visualize:
  - Games created per day (last 30 days)
  - Status distribution (pie chart)
  - Designer productivity (bar chart)

---

## Technical Implementation

### Tech Stack

- **Frontend**: React 18 or vanilla JS (user's choice)
- **Styling**: Tailwind CSS or vanilla CSS
- **API**: Existing endpoints from Story 1
- **Auth**: JWT tokens from Story 5

### Admin API Endpoints

```javascript
// GET /api/admin/configs?page=1&limit=50&status=active&search=fluffy
router.get('/api/admin/configs', authenticateJWT, requireRole('admin'), async (req, res) => {
  const { page = 1, limit = 50, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

  let query = 'SELECT * FROM game_configs WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (slug LIKE $${params.length} OR pet_name LIKE $${params.length} OR customer_email LIKE $${params.length})`;
  }

  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

  const result = await db.query(query, params);
  const total = await db.query('SELECT COUNT(*) FROM game_configs WHERE 1=1');

  res.json({
    configs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total.rows[0].count),
      pages: Math.ceil(total.rows[0].count / limit)
    }
  });
});
```

### React Component Structure (if using React)

```
/admin
  /components
    ConfigList.jsx
    ConfigDetail.jsx
    SearchBar.jsx
    FilterPanel.jsx
    DeleteConfirmModal.jsx
    AuditLogModal.jsx
    AnalyticsDashboard.jsx
  /hooks
    useConfigs.js
    useAuth.js
  /pages
    AdminDashboard.jsx
  /utils
    api.js
    auth.js
```

---

## Test Scenarios

### Scenario 1: Admin Views All Configs

**Given**: Admin logged in
**When**: Navigate to `/admin`
**Then**:
- See list of all configs (paginated)
- Table shows slug, pet name, email, date, status
- Can sort by any column

### Scenario 2: Admin Searches for Config

**Given**: Admin on dashboard
**When**: Type "fluffy" in search bar
**Then**:
- List filters to configs matching "fluffy"
- Shows results for slug, pet name, or email containing "fluffy"
- URL updates: `/admin?search=fluffy`

### Scenario 3: Admin Views Config Details

**Given**: Admin viewing config list
**When**: Click on "fluffy-happy" row
**Then**:
- Modal opens with full config details
- Shows customer email, sprite URL
- Shows created/updated timestamps
- "View Game" button works

### Scenario 4: Admin Processes Refund

**Given**: Customer requests refund for "fluffy-happy"
**When**: Admin clicks Delete → Selects "Refund" → Confirms
**Then**:
- Config status changes to 'refunded'
- Game returns 403 when accessed
- Audit log records deletion
- Config still visible in admin (grayed out)

### Scenario 5: Admin Views Audit Log

**Given**: Config has been updated multiple times
**When**: Admin clicks "Audit Log" button
**Then**:
- Modal shows all changes
- Each entry shows action, user, timestamp
- Can see before/after values for updates

---

## Definition of Done

- [ ] Dashboard accessible at `/admin`
- [ ] All acceptance criteria met
- [ ] List view functional (sort, paginate)
- [ ] Search and filters working
- [ ] Detail view shows full config
- [ ] Soft delete functional
- [ ] Audit log viewable
- [ ] Analytics dashboard displays metrics
- [ ] Mobile responsive design
- [ ] Unit tests for components
- [ ] E2E tests for critical flows
- [ ] Code reviewed and deployed

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 7 (Designer Dashboard)
