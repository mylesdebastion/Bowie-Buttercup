# Customization Architecture Comparison
## SparkleClassic - Choosing the Right Approach

**Quick Decision Guide**: Which approach for your customization needs?

---

## 🎯 **Quick Comparison**

| Feature | Query Params | JSON Configs | Database |
|---------|-------------|--------------|----------|
| **Complexity** | ⭐ Simple | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Implementation** | 30 min | 2-3 days | 1 week |
| **Best For** | Sprite only | Full customization | 100+ games |
| **Storage** | None | ~5KB/game | PostgreSQL |
| **Admin UI** | Not needed | Config generator | Full dashboard |
| **Real-time Updates** | ❌ No | ❌ No | ✅ Yes |
| **Flexibility** | ❌ Limited | ✅ High | ✅ Very High |

---

## 📊 **Data Structure Comparison**

### **Query Parameters (Too Limited)**
```
URL: /game?pet=Bowie&sprite=bowie.png&difficulty=hard

Pros:
  ✅ Instant - no file/DB needed
  ✅ 5 minutes to implement

Cons:
  ❌ Can't handle complex data (levels, items)
  ❌ URL length limits (~2000 chars)
  ❌ Ugly URLs
  ❌ No nested structures
```

**Verdict**: ❌ **REJECTED** - Can't support items/levels

---

### **JSON Config Files (Recommended for MVP)**

```json
// /public/configs/bowieruns.json (5KB)
{
  "petName": "Bowie",
  "character": { "sprite": "bowie.png", "color": "#FF6B35" },

  "items": {
    "collectibles": [
      { "id": "bone", "sprite": "bone.png", "points": 10 },
      { "id": "treat", "sprite": "treat.png", "points": 25 }
    ],
    "powerups": [
      { "id": "speed", "sprite": "speed.png", "duration": 5 }
    ]
  },

  "settings": {
    "difficulty": "medium",
    "theme": "classic",
    "audio": { "music": "theme-classic.mp3", "volume": 0.7 }
  },

  "levels": [
    {
      "id": 1,
      "name": "Backyard",
      "platforms": [
        { "x": 100, "y": 300, "width": 200, "type": "grass" }
      ],
      "enemies": [
        { "type": "cat", "x": 200, "y": 280, "pattern": "patrol" }
      ],
      "collectibles": [
        { "item": "bone", "x": 150, "y": 280 }
      ]
    }
  ]
}
```

**Pros:**
- ✅ Unlimited nesting depth
- ✅ Human-readable
- ✅ Easy to edit manually
- ✅ Version controlled (git)
- ✅ Tiny files (5KB)
- ✅ No database needed
- ✅ Can preview before deployment

**Cons:**
- Needs redeployment to update
- Files in public directory
- Manual JSON editing

**Storage:**
```
100 games:
  - 1 game template: 2MB
  - 100 config files: 500KB (5KB × 100)
  - 100 sprites: 1MB
  - 50 item sprites: 250KB

Total: ~3.75MB
```

**Verdict**: ✅ **RECOMMENDED FOR MVP** (10-100 games)

---

### **Database-Driven (Best for Scale)**

```sql
-- Projects
bowieruns: { id: uuid, pet_name: "Bowie", sprite_url: "bowie.png" }

-- Customizations
{ project_id: uuid, difficulty: "medium", theme: "classic", ... }

-- Custom Items
[
  { project_id: uuid, item_type: "collectible", item_id: "bone", points: 10 },
  { project_id: uuid, item_type: "collectible", item_id: "treat", points: 25 }
]

-- Custom Levels
[
  {
    project_id: uuid,
    level_number: 1,
    platforms: [...],
    enemies: [...],
    collectibles: [...]
  }
]
```

**API Response** (same format as JSON):
```json
GET /api/game-config/bowieruns
→ Returns same structure as JSON config
```

**Pros:**
- ✅ Real-time updates (no redeploy)
- ✅ Admin UI for editing
- ✅ Analytics on customizations
- ✅ Query/filter capabilities
- ✅ Version history
- ✅ A/B testing support

**Cons:**
- API call adds ~100ms latency
- More complex to implement
- Database management overhead

**Verdict**: ✅ **MIGRATE LATER** (100+ games or need admin UI)

---

## 🚀 **Migration Path**

### **Phase 1: JSON Configs (Weeks 1-4)**
```typescript
// Load from static JSON file
const config = await fetch(`/configs/${slug}.json`).then(r => r.json());
```

**When to use:**
- MVP / Proof of concept
- 10-100 games
- Friends/colleagues testing
- Manual config creation is OK

---

### **Phase 2: Hybrid (Weeks 5-8)**
```typescript
// Try database first, fallback to JSON
const config = await fetch(`/api/game-config/${slug}`)
  .catch(() => fetch(`/configs/${slug}.json`));
```

**When to use:**
- Migrating to database
- Some games in DB, some in JSON
- Testing database approach

---

### **Phase 3: Full Database (Month 3+)**
```typescript
// Load from database only
const config = await fetch(`/api/game-config/${slug}`).then(r => r.json());
```

**When to use:**
- 100+ games
- Need admin UI
- Real-time updates required
- Analytics needed

---

## 💡 **Example Configs**

### **Simple Game (Sprite + 1 Level)**
```json
{
  "petName": "Bowie",
  "character": { "sprite": "bowie.png" },
  "levels": [
    {
      "id": 1,
      "name": "Quick Run",
      "platforms": [
        { "x": 0, "y": 350, "width": 800, "type": "grass" }
      ],
      "winCondition": { "type": "reachEnd" }
    }
  ]
}
```
**Size**: ~500 bytes

---

### **Complex Game (Full Customization)**
```json
{
  "petName": "Bowie",
  "character": { "sprite": "bowie.png", "color": "#FF6B35", "size": "medium" },

  "items": {
    "collectibles": [
      { "id": "bone", "sprite": "bone.png", "points": 10 },
      { "id": "treat", "sprite": "treat.png", "points": 25 },
      { "id": "ball", "sprite": "ball.png", "points": 50 }
    ],
    "powerups": [
      { "id": "speed", "sprite": "speed.png", "duration": 5 },
      { "id": "jump", "sprite": "jump.png", "duration": 3 }
    ],
    "obstacles": [
      { "id": "puddle", "sprite": "puddle.png", "damage": 1 },
      { "id": "fence", "sprite": "fence.png", "damage": 2 }
    ]
  },

  "settings": {
    "difficulty": "hard",
    "theme": "neon",
    "backgroundColor": "#1a1a2e",
    "audio": {
      "music": "theme-electronic.mp3",
      "volume": 0.8,
      "effects": true
    },
    "controls": {
      "jump": "space",
      "move": "arrows",
      "sprint": "shift"
    }
  },

  "levels": [
    {
      "id": 1,
      "name": "Backyard Blitz",
      "layout": "backyard",
      "platforms": [
        { "x": 100, "y": 300, "width": 200, "type": "grass" },
        { "x": 350, "y": 250, "width": 150, "type": "wood" },
        { "x": 550, "y": 200, "width": 100, "type": "stone" }
      ],
      "enemies": [
        { "type": "cat", "x": 200, "y": 280, "pattern": "patrol", "speed": 2 },
        { "type": "squirrel", "x": 400, "y": 230, "pattern": "jump", "speed": 3 }
      ],
      "collectibles": [
        { "item": "bone", "x": 150, "y": 280 },
        { "item": "treat", "x": 400, "y": 230 },
        { "item": "ball", "x": 600, "y": 180 }
      ],
      "obstacles": [
        { "item": "puddle", "x": 250, "y": 300 },
        { "item": "fence", "x": 500, "y": 250 }
      ],
      "winCondition": {
        "type": "collectAll",
        "required": ["bone", "treat", "ball"]
      }
    },
    {
      "id": 2,
      "name": "Living Room Chaos",
      "layout": "livingroom",
      "platforms": [
        { "x": 50, "y": 350, "width": 100, "type": "couch" },
        { "x": 200, "y": 300, "width": 150, "type": "table" },
        { "x": 400, "y": 250, "width": 120, "type": "shelf" }
      ],
      "enemies": [
        { "type": "vacuum", "x": 300, "y": 280, "pattern": "chase", "speed": 4 }
      ],
      "collectibles": [
        { "item": "speed", "x": 100, "y": 330 },
        { "item": "jump", "x": 450, "y": 230 }
      ],
      "winCondition": {
        "type": "reachGoal",
        "goal": { "x": 700, "y": 250 }
      }
    }
  ]
}
```
**Size**: ~2.5KB

---

## 📋 **Decision Framework**

### **Use JSON Configs if:**
- ✅ You have 10-100 games
- ✅ Manual config editing is acceptable
- ✅ You want fast MVP implementation
- ✅ No admin UI needed yet
- ✅ Git version control is valuable

### **Migrate to Database if:**
- ✅ You have 100+ games
- ✅ Need admin UI for non-technical users
- ✅ Real-time updates required
- ✅ Want analytics on customization usage
- ✅ Need to query/filter games by customizations

---

## 🎯 **Recommended Approach**

**Week 1-4: JSON Configs**
- Fast implementation
- Perfect for MVP
- Easy to debug

**Week 5+: Evaluate Migration**
- If >50 games → start planning database migration
- If admin UI needed → build database backend
- If staying small → keep JSON configs

---

**Last Updated**: 2025-10-25
**Status**: Recommendation for MVP Architecture
