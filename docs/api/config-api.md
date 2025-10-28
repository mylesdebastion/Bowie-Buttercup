# Game Configuration API

## Overview

The Game Configuration API provides endpoints for managing personalized game configurations. Each game is identified by a unique slug (e.g., `fluffy-happy`) derived from the pet's name and a safeword.

**Base URL**:
- Production: `https://api.sparkleclassic.com`
- Development: `http://localhost:3001`

**Authentication**:
- Public endpoints (GET): No authentication required
- Admin endpoints (POST, PUT, DELETE): JWT authentication required

## Endpoints

### Public Endpoints

#### GET /api/configs/:slug

Retrieves a game configuration by its slug. This is the primary endpoint used by the game client to load personalized configurations.

**URL Parameters**:
- `slug` (string, required): The game's unique slug (e.g., `fluffy-happy`, `max-brave-2`)

**Response** (200 OK):
```json
{
  "slug": "fluffy-happy",
  "petName": "Fluffy",
  "configJson": {
    "petName": "Fluffy",
    "petType": "cat",
    "spriteSheet": "/sprites/fluffy-12345.png",
    "personality": "playful",
    "colors": {
      "primary": "#ff9900",
      "secondary": "#ffffff"
    },
    "abilities": {
      "jump": 250,
      "speed": 200
    }
  },
  "spriteUrl": "https://storage.googleapis.com/sparkleclassic-sprites/fluffy-12345.png"
}
```

**Response Fields**:
- `slug` (string): The configuration's unique identifier
- `petName` (string): The pet's display name
- `configJson` (object): Complete game configuration (see Configuration Schema below)
- `spriteUrl` (string, optional): URL to custom sprite sheet

**Error Responses**:

404 Not Found:
```json
{
  "error": "Config not found",
  "code": "CONFIG_NOT_FOUND",
  "slug": "invalid-slug"
}
```

400 Bad Request (Invalid slug format):
```json
{
  "error": "Invalid slug format",
  "code": "INVALID_SLUG",
  "details": "Slug must be 5-50 characters, lowercase alphanumeric with hyphens"
}
```

500 Internal Server Error:
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

**Rate Limiting**:
- 60 requests per minute per IP address
- Response header: `X-RateLimit-Remaining: 57`

**Caching**:
- Client-side: localStorage cache for 24 hours
- Server-side: CDN cache for 1 hour
- Updates `accessed_at` timestamp in database

**Example Request**:
```bash
curl https://api.sparkleclassic.com/api/configs/fluffy-happy
```

**Example Response**:
```json
{
  "slug": "fluffy-happy",
  "petName": "Fluffy",
  "configJson": {
    "petName": "Fluffy",
    "petType": "cat",
    "personality": "playful"
  },
  "spriteUrl": "https://storage.googleapis.com/sparkleclassic-sprites/fluffy-12345.png"
}
```

---

### Admin Endpoints

All admin endpoints require JWT authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

#### POST /api/admin/configs

Creates a new game configuration with automatic slug generation.

**Authentication**: Required (Role: `admin` or `designer`)

**Request Body**:
```json
{
  "petName": "Fluffy",
  "customerId": "cus_abc123",
  "customerEmail": "customer@example.com",
  "orderId": "ord_xyz789",
  "config": {
    "petType": "cat",
    "personality": "playful",
    "spriteSheet": "/sprites/fluffy-12345.png"
  },
  "spriteUrl": "https://storage.googleapis.com/sparkleclassic-sprites/fluffy-12345.png"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "slug": "fluffy-happy",
  "safeword": "happy",
  "config": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "fluffy-happy",
    "petName": "Fluffy",
    "safeword": "happy",
    "customerId": "cus_abc123",
    "customerEmail": "customer@example.com",
    "orderId": "ord_xyz789",
    "configJson": { ... },
    "spriteUrl": "https://...",
    "status": "active",
    "createdAt": "2025-01-26T12:00:00Z",
    "updatedAt": "2025-01-26T12:00:00Z"
  }
}
```

**Error Responses**:

400 Bad Request (Validation error):
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "petName",
      "message": "Pet name is required"
    }
  ]
}
```

409 Conflict (Slug generation failed - too many collisions):
```json
{
  "error": "Unable to generate unique slug",
  "code": "SLUG_GENERATION_FAILED",
  "details": "All safeword combinations exhausted"
}
```

**Rate Limiting**: 300 requests per minute per user

#### PUT /api/admin/configs/:slug

Updates an existing game configuration.

**Authentication**: Required (Role: `admin` or `designer`)

**URL Parameters**:
- `slug` (string, required): The configuration's slug

**Request Body** (partial update supported):
```json
{
  "config": {
    "personality": "calm",
    "abilities": {
      "jump": 300
    }
  },
  "spriteUrl": "https://storage.googleapis.com/sparkleclassic-sprites/fluffy-67890.png"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "config": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "fluffy-happy",
    "petName": "Fluffy",
    "configJson": { ... },
    "spriteUrl": "https://...",
    "updatedAt": "2025-01-26T13:00:00Z"
  }
}
```

**Error Responses**: Same as GET endpoint, plus 403 Forbidden if lacking permissions

#### DELETE /api/admin/configs/:slug

Soft-deletes a game configuration (sets `status` to `deleted`).

**Authentication**: Required (Role: `admin`)

**URL Parameters**:
- `slug` (string, required): The configuration's slug

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Configuration deleted",
  "slug": "fluffy-happy"
}
```

**Note**: This is a soft delete. The configuration remains in the database with `status='deleted'` and will not be returned by public endpoints.

#### GET /api/admin/configs

Lists all game configurations with filtering and pagination.

**Authentication**: Required (Role: `admin` or `designer`)

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 50, max: 200)
- `status` (string, optional): Filter by status (`active`, `deleted`, `draft`)
- `search` (string, optional): Search by slug or pet name
- `sortBy` (string, optional): Sort field (`created_at`, `updated_at`, `accessed_at`)
- `order` (string, optional): Sort order (`asc`, `desc`) (default: `desc`)

**Response** (200 OK):
```json
{
  "configs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "fluffy-happy",
      "petName": "Fluffy",
      "customerId": "cus_abc123",
      "customerEmail": "customer@example.com",
      "status": "active",
      "createdAt": "2025-01-26T12:00:00Z",
      "accessedAt": "2025-01-27T08:30:00Z"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "totalResults": 147
  }
}
```

**Example Request**:
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.sparkleclassic.com/api/admin/configs?status=active&search=fluffy&page=1&limit=20"
```

---

## Configuration Schema

The `configJson` field contains the complete game configuration with the following structure:

```json
{
  "petName": "string (required)",
  "petType": "string (required): 'cat' | 'dog' | 'hamster' | 'rabbit'",
  "personality": "string (optional): 'playful' | 'calm' | 'brave' | 'curious' | 'sleepy'",
  "spriteSheet": "string (required): Path to sprite sheet",
  "colors": {
    "primary": "string (hex color)",
    "secondary": "string (hex color)",
    "accent": "string (hex color)"
  },
  "abilities": {
    "jump": "number: Jump force (default: 250)",
    "speed": "number: Movement speed (default: 200)",
    "specialMove": "string (optional): 'double-jump' | 'dash' | 'wall-climb'"
  },
  "gameSettings": {
    "difficulty": "string: 'easy' | 'medium' | 'hard'",
    "startLevel": "number (1-5)",
    "powerUps": "boolean: Enable power-ups"
  },
  "customization": {
    "theme": "string: 'forest' | 'city' | 'space' | 'underwater'",
    "music": "string: Music track identifier",
    "soundEffects": "boolean: Enable sound effects"
  }
}
```

**Required Fields**:
- `petName`: Display name (1-50 characters)
- `petType`: One of the supported pet types
- `spriteSheet`: Path to sprite sheet (relative or absolute URL)

**Optional Fields**: All other fields are optional and will use sensible defaults

---

## Slug Generation

Slugs are automatically generated using the format: `[petname]-[safeword]` or `[petname]-[safeword]-[number]`

**Safeword Pool** (90 words total):
- **Personality traits** (50): happy, brave, calm, playful, curious, sleepy, gentle, wild, sweet, bold, ...
- **Nature words** (25): forest, ocean, mountain, river, cloud, star, moon, ...
- **Color words** (15): golden, silver, copper, ruby, emerald, ...

**Collision Handling**:
1. Generate normalized pet name (lowercase, alphanumeric only)
2. Try 10 random safewords from the pool
3. If all collide, append incrementing numbers (2, 3, 4, ...)
4. After 100 attempts, return error

**Validation Rules**:
- Total length: 5-50 characters
- Characters: lowercase alphanumeric + hyphens only
- Must contain at least one hyphen
- Reserved paths blocked: `api`, `admin`, `designer`, `public`, `assets`, `src`

---

## Authentication

Admin endpoints require JWT authentication.

**Token Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload**:
```json
{
  "sub": "user_id",
  "email": "admin@sparkleclassic.com",
  "role": "admin",
  "iat": 1643213200,
  "exp": 1643299600
}
```

**Roles**:
- `admin`: Full access to all endpoints
- `designer`: Can create and update configs, list configs
- `viewer`: Can only list configs

**Token Expiry**: 24 hours

**Refresh**: Use refresh token endpoint (to be documented separately)

---

## Rate Limiting

**Public Endpoints**:
- 60 requests per minute per IP address
- Response headers:
  - `X-RateLimit-Limit: 60`
  - `X-RateLimit-Remaining: 57`
  - `X-RateLimit-Reset: 1643213260` (Unix timestamp)

**Admin Endpoints**:
- 300 requests per minute per authenticated user

**Rate Limit Exceeded** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 42
}
```

---

## Security

**XSS Prevention**:
- All string fields sanitized server-side
- HTML tags stripped from pet names and text fields
- Sprite URLs validated to allow only trusted domains

**SQL Injection Prevention**:
- Parameterized queries used exclusively
- Input validation on all endpoints

**CORS Policy**:
- Production: Only `sparkleclassic.com` domain
- Development: `localhost:3000` allowed

**HTTPS Required**:
- All API requests must use HTTPS in production
- HTTP requests redirected to HTTPS

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CONFIG_NOT_FOUND` | 404 | Configuration does not exist |
| `INVALID_SLUG` | 400 | Slug format validation failed |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `SLUG_GENERATION_FAILED` | 409 | Unable to generate unique slug |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server-side error |

---

## Client Usage Examples

### JavaScript (Fetch API)

```javascript
// Public endpoint - Load config
async function loadGameConfig(slug) {
  try {
    const response = await fetch(`https://api.sparkleclassic.com/api/configs/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Config not found, using default');
        return getDefaultConfig();
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load config:', error);
    return getDefaultConfig();
  }
}

// Admin endpoint - Create config
async function createGameConfig(configData, authToken) {
  const response = await fetch('https://api.sparkleclassic.com/api/admin/configs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(configData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### cURL

```bash
# Public endpoint - Get config
curl https://api.sparkleclassic.com/api/configs/fluffy-happy

# Admin endpoint - Create config
curl -X POST https://api.sparkleclassic.com/api/admin/configs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "petName": "Fluffy",
    "customerId": "cus_123",
    "customerEmail": "customer@example.com",
    "config": {
      "petType": "cat",
      "personality": "playful"
    }
  }'

# Admin endpoint - List configs
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.sparkleclassic.com/api/admin/configs?status=active&limit=10"
```

---

## Changelog

### v2.0.0 (2025-01-26)
- Initial API specification for vanity URL system
- Public GET endpoint for config retrieval
- Admin CRUD endpoints for config management
- Slug generation with safeword collision handling
- Rate limiting and security hardening

---

## Support

For API issues or questions:
- Email: api@sparkleclassic.com
- Documentation: https://docs.sparkleclassic.com/api
- Status Page: https://status.sparkleclassic.com
