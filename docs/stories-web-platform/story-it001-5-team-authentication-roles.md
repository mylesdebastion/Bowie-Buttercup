# Story IT001.5: Team Authentication & Roles

## Status
Draft

## Story
**As a** team member  
**I want** to securely access the dashboard with appropriate permissions  
**so that** I can perform my role safely without security concerns

## Acceptance Criteria
1. Secure login system with email/password authentication
2. Role-based access control (Artist, Manager, Admin)
3. Session management with automatic timeout
4. Activity logging for security and accountability
5. Password reset functionality
6. Two-factor authentication option for admins
7. Permission-based UI (hide/show features by role)
8. Audit trail for sensitive actions

## Tasks / Subtasks
- [ ] Set up NextAuth.js authentication system (AC: 1)
  - [ ] Configure NextAuth.js with database adapter
  - [ ] Create login page with email/password form
  - [ ] Implement secure password hashing with bcrypt
  - [ ] Add login rate limiting and brute force protection
- [ ] Implement role-based access control (AC: 2, 7)
  - [ ] Create user roles database schema (Artist, Manager, Admin)
  - [ ] Build role-based middleware for API routes
  - [ ] Implement permission checking utilities
  - [ ] Add UI component role-based rendering
- [ ] Build session management system (AC: 3)
  - [ ] Configure session storage with secure cookies
  - [ ] Implement automatic session timeout (7 days)
  - [ ] Add session refresh mechanism
  - [ ] Create logout functionality with session cleanup
- [ ] Create activity logging system (AC: 4, 8)
  - [ ] Build comprehensive activity logging middleware
  - [ ] Log authentication events and sensitive actions
  - [ ] Create audit trail viewing interface
  - [ ] Add IP address and user agent tracking
- [ ] Implement password reset functionality (AC: 5)
  - [ ] Create password reset request flow
  - [ ] Build secure token generation and validation
  - [ ] Add password reset email templates
  - [ ] Implement new password setting interface
- [ ] Add two-factor authentication (AC: 6)
  - [ ] Integrate TOTP-based 2FA (Google Authenticator)
  - [ ] Create 2FA setup and management interface
  - [ ] Add backup codes generation
  - [ ] Implement 2FA verification flow
- [ ] Build permission management interface
  - [ ] Create user management dashboard for admins
  - [ ] Add role assignment and permission editing
  - [ ] Implement user activation/deactivation
  - [ ] Create permission audit interface
- [ ] Unit and integration testing
  - [ ] Test authentication flows and security
  - [ ] Test role-based access control
  - [ ] Test session management and timeout
  - [ ] Test activity logging and audit trails

## Dev Notes

### Architecture Context
**Source**: [Internal Tool Architecture](../architecture/internal-tool-architecture.md)

**Authentication Technology Stack**:
- Authentication: NextAuth.js [Source: architecture/internal-tool-architecture.md#backend-architecture]
- Password Hashing: bcrypt with salt rounds 12 [Source: architecture/internal-tool-architecture.md#security-architecture]
- Session Management: JWT + Database sessions [Source: architecture/internal-tool-architecture.md#security-architecture]
- Session Storage: Secure cookies with 7-day expiry [Source: architecture/internal-tool-architecture.md#security-architecture]

**Database Schema for Users**:
Users table [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
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
```

Activity logging schema [Source: architecture/internal-tool-architecture.md#database-schema]:
```sql
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
```

**Role-Based Access Control**:
Permission structure [Source: architecture/internal-tool-architecture.md#security-architecture]:
```typescript
const rolePermissions = {
  admin: ['*'], // All permissions
  manager: ['projects:*', 'users:read', 'analytics:read'],
  artist: ['projects:read,update', 'assets:*', 'urls:read']
};

const resourceAccess = {
  projects: 'Artists can only modify assigned projects',
  assets: 'Artists can only access project assets',
  users: 'Artists can only view own profile unless manager+'
};
```

**API Integration**:
tRPC endpoints [Source: architecture/internal-tool-architecture.md#api-architecture]:
- `users.list` - Get team members
- `users.create` - Add new team member
- `users.update` - Update user profile
- `users.updateRole` - Change user role/permissions
- `users.getProfile` - Get current user profile

**Security Implementation**:
Authentication security [Source: architecture/internal-tool-architecture.md#security-architecture]:
- bcrypt password hashing with salt rounds 12
- Rate limiting for authentication attempts
- Session timeout after 7 days
- HTTPS/TLS 1.3 only transmission
- JWT + database sessions for authentication

**File Structure**:
```
src/app/auth/
├── signin/
│   └── page.tsx           # Login page
├── signup/
│   └── page.tsx           # Registration page (admin only)
├── reset-password/
│   └── page.tsx           # Password reset page
├── components/
│   ├── LoginForm.tsx      # Login form component
│   ├── PasswordReset.tsx  # Password reset form
│   ├── TwoFactorSetup.tsx # 2FA configuration
│   └── UserProfile.tsx    # User profile management
src/app/admin/
├── users/
│   └── page.tsx           # User management dashboard
├── components/
│   ├── UserList.tsx       # User listing and management
│   ├── RoleEditor.tsx     # Role assignment interface
│   └── ActivityLog.tsx    # Audit trail viewer
src/middleware.ts          # Authentication middleware
src/lib/auth/
├── config.ts              # NextAuth configuration
├── permissions.ts         # Permission checking utilities
└── activity.ts            # Activity logging utilities
```

**NextAuth.js Configuration**:
```typescript
const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      authorize: async (credentials) => {
        // Custom authentication logic with bcrypt
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database', maxAge: 7 * 24 * 60 * 60 }, // 7 days
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, role: user.role, permissions: user.permissions }
    })
  }
};
```

**Two-Factor Authentication**:
- TOTP-based using authenticator apps
- QR code generation for setup
- Backup codes for account recovery
- Admin enforcement capabilities

### Testing
**Test Location**: `tests/unit/auth/` and `tests/integration/auth/`
**Test Standards**: Jest with jsdom environment, React Testing Library
**Coverage Requirements**: 90% line coverage for authentication components (higher due to security)

**Specific Testing Requirements**:
- Authentication flow testing (login, logout, session management)
- Role-based access control testing with different user roles
- Permission checking and UI rendering based on roles
- Activity logging verification for all sensitive actions
- Password reset flow testing with email delivery
- Two-factor authentication setup and verification
- Session timeout and automatic logout testing
- Brute force protection and rate limiting testing

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