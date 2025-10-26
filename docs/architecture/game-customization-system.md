# Game Customization System Architecture
## SparkleClassic - Multi-Layered Customization Design

**Version**: 1.0
**Created**: 2025-10-25
**Scope**: Custom sprites, items, settings, levels per user

---

## 🎯 **Customization Requirements**

### **What Users Can Customize**
1. **Character**: Custom pet sprite (bowie.png, fluffy.png)
2. **Items**: Unique collectibles, power-ups, obstacles
3. **Settings**: Difficulty, controls, theme, music
4. **Levels**: Custom level layouts, enemy placements, win conditions

### **Architecture Constraint**
- ✅ ONE shared game template (not duplicated)
- ✅ Dynamic loading of customizations
- ✅ Scalable to unlimited customization combinations

---

## 🏗️ **Architecture Comparison**

### **❌ Option A: Query Parameters (TOO LIMITED)**

```
sparkleclassic.com/bowieruns
  → /game?pet=Bowie&sprite=bowie.png&difficulty=hard&items=bone,treat,ball&level1=classic&level2=advanced

Problems:
  ❌ URL length limits (2048 chars)
  ❌ Complex data structures don't fit in query params
  ❌ Can't represent nested level data
  ❌ Ugly URLs
```

**Verdict**: ❌ Won't work for multi-level customizations

---

### **✅ Option B: JSON Config Files (RECOMMENDED)**

```
sparkleclassic.com/bowieruns
  → Loads /configs/bowieruns.json
```

**File Structure:**
```
/public/
  game/
    index.html              (2MB - shared template)
    assets/                 (shared)
  configs/
    bowieruns.json          (5KB - Bowie's customizations)
    fluffyadventures.json   (5KB - Fluffy's customizations)
    maxsleeps.json          (5KB - Max's customizations)
  sprites/
    bowie.png               (10KB)
    fluffy.png              (10KB)
  items/
    bone.png                (5KB)
    treat.png               (5KB)
```

**Config Example:**
```json
{
  "version": "1.0",
  "petName": "Bowie",
  "metadata": {
    "owner": "John",
    "created": "2025-10-25",
    "theme": "classic"
  },

  "character": {
    "sprite": "bowie.png",
    "name": "Bowie",
    "color": "#FF6B35",
    "size": "medium"
  },

  "items": {
    "collectibles": [
      { "id": "bone", "sprite": "bone.png", "points": 10 },
      { "id": "treat", "sprite": "treat.png", "points": 25 },
      { "id": "ball", "sprite": "ball.png", "points": 50 }
    ],
    "powerups": [
      { "id": "speed_boost", "sprite": "speed.png", "duration": 5 },
      { "id": "jump_boost", "sprite": "jump.png", "duration": 3 }
    ],
    "obstacles": [
      { "id": "puddle", "sprite": "puddle.png", "damage": 1 }
    ]
  },

  "settings": {
    "difficulty": "medium",
    "controls": {
      "jump": "space",
      "move": "arrows"
    },
    "audio": {
      "music": "theme-classic.mp3",
      "volume": 0.7,
      "effects": true
    },
    "visual": {
      "theme": "retro",
      "backgroundColor": "#87CEEB",
      "particleEffects": true
    }
  },

  "levels": [
    {
      "id": 1,
      "name": "Bowie's Backyard",
      "layout": "backyard",
      "platforms": [
        { "x": 100, "y": 300, "width": 200, "type": "grass" },
        { "x": 350, "y": 250, "width": 150, "type": "wood" }
      ],
      "enemies": [
        { "type": "cat", "x": 200, "y": 280, "pattern": "patrol" }
      ],
      "collectibles": [
        { "item": "bone", "x": 150, "y": 280 },
        { "item": "treat", "x": 400, "y": 230 }
      ],
      "winCondition": {
        "type": "collectAll",
        "required": ["bone", "treat"]
      }
    },
    {
      "id": 2,
      "name": "Living Room Adventure",
      "layout": "livingroom",
      "platforms": [
        { "x": 50, "y": 350, "width": 100, "type": "couch" },
        { "x": 200, "y": 300, "width": 150, "type": "table" }
      ],
      "enemies": [
        { "type": "vacuum", "x": 300, "y": 280, "pattern": "chase" }
      ],
      "collectibles": [
        { "item": "ball", "x": 250, "y": 280 }
      ],
      "winCondition": {
        "type": "reachGoal",
        "goal": { "x": 700, "y": 300 }
      }
    }
  ]
}
```

**Game Template Usage:**
```javascript
// /public/game/index.html
async function loadGameConfig() {
  const configName = new URLSearchParams(window.location.search).get('config');
  const config = await fetch(`/configs/${configName}.json`).then(r => r.json());

  // Load character sprite
  playerSprite.src = `/sprites/${config.character.sprite}`;

  // Load custom items
  config.items.collectibles.forEach(item => {
    const sprite = new Image();
    sprite.src = `/items/${item.sprite}`;
    gameItems.push({ ...item, sprite });
  });

  // Apply settings
  game.difficulty = config.settings.difficulty;
  audio.volume = config.settings.audio.volume;

  // Build levels
  config.levels.forEach(levelData => {
    const level = new Level(levelData);
    level.platforms = levelData.platforms.map(p => new Platform(p));
    level.enemies = levelData.enemies.map(e => new Enemy(e));
    level.collectibles = levelData.collectibles.map(c => new Collectible(c));
    levels.push(level);
  });

  startGame();
}
```

**Pros:**
- ✅ Unlimited customization depth
- ✅ Human-readable and editable
- ✅ Easy to version control
- ✅ Config files are tiny (5KB vs 2MB game)
- ✅ Can add new customization types easily
- ✅ Admin can edit JSON directly for quick changes

**Cons:**
- Config files stored in git (minor, they're tiny)
- Need to regenerate config on customization changes

**Storage:**
```
100 games with full customizations:
  - 1 game template: 2MB
  - 100 config files: 500KB (5KB each)
  - 100 sprites: 1MB (10KB each)
  - 50 unique items: 250KB (5KB each)

Total: ~3.75MB (vs 200MB full duplication)
```

---

### **✅ Option C: Database-Driven (MOST FLEXIBLE)**

```
sparkleclassic.com/bowieruns
  → Fetches config from API: /api/game-config/bowieruns
```

**Database Schema:**
```sql
-- Projects table (already exists)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  url_slug VARCHAR(50) UNIQUE,
  pet_name VARCHAR(100),
  sprite_url VARCHAR(255),
  deployment_status VARCHAR(20)
);

-- Customizations table
CREATE TABLE customizations (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),

  -- Settings
  difficulty VARCHAR(20),
  theme VARCHAR(50),
  background_color VARCHAR(7),
  audio_enabled BOOLEAN,
  music_track VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom items
CREATE TABLE custom_items (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),

  item_type VARCHAR(50),  -- collectible, powerup, obstacle
  item_id VARCHAR(50),    -- bone, treat, ball
  sprite_url VARCHAR(255),
  points INTEGER,
  duration INTEGER,       -- for powerups

  metadata JSONB          -- flexible additional properties
);

-- Custom levels
CREATE TABLE custom_levels (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),

  level_number INTEGER,
  level_name VARCHAR(100),
  layout_type VARCHAR(50),

  -- Store complex data as JSONB
  platforms JSONB,        -- array of platform configs
  enemies JSONB,          -- array of enemy configs
  collectibles JSONB,     -- array of collectible placements
  win_condition JSONB,    -- win condition config

  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Route:**
```typescript
// app/api/game-config/[slug]/route.ts
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const project = await db.projects.findUnique({
    where: { url_slug: params.slug },
    include: {
      customizations: true,
      items: true,
      levels: {
        orderBy: { level_number: 'asc' }
      }
    }
  });

  if (!project) {
    return Response.json({ error: 'Game not found' }, { status: 404 });
  }

  return Response.json({
    version: '1.0',
    petName: project.pet_name,
    character: {
      sprite: project.sprite_url,
      name: project.pet_name,
      color: project.customizations.background_color
    },
    items: {
      collectibles: project.items.filter(i => i.item_type === 'collectible'),
      powerups: project.items.filter(i => i.item_type === 'powerup'),
      obstacles: project.items.filter(i => i.item_type === 'obstacle')
    },
    settings: {
      difficulty: project.customizations.difficulty,
      theme: project.customizations.theme,
      audio: {
        enabled: project.customizations.audio_enabled,
        music: project.customizations.music_track
      }
    },
    levels: project.levels.map(level => ({
      id: level.level_number,
      name: level.level_name,
      layout: level.layout_type,
      platforms: level.platforms,
      enemies: level.enemies,
      collectibles: level.collectibles,
      winCondition: level.win_condition
    }))
  });
}
```

**Game Template Usage:**
```javascript
// /public/game/index.html
async function loadGameConfig() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const config = await fetch(`/api/game-config/${slug}`).then(r => r.json());

  // Same usage as Option B - loads from API instead of JSON file
  initializeGameFromConfig(config);
  startGame();
}
```

**Pros:**
- ✅ Most flexible - no file system changes
- ✅ Real-time updates without redeployment
- ✅ Advanced analytics and tracking
- ✅ Can query/filter customizations
- ✅ A/B testing and experiments
- ✅ Version history and rollback

**Cons:**
- API call adds ~100ms latency
- More complex to implement
- Database queries vs static files

---

## 🎯 **Recommendation: Hybrid Approach**

**🏗️ Architect:** "Start with Option B (JSON configs), migrate to Option C (database) when you scale."

**Why Hybrid?**

### **Phase 1 (MVP - Weeks 1-4): JSON Config Files**
- Fast to implement
- Easy to edit and debug
- Version controlled
- Perfect for 10-100 games

### **Phase 2 (Scale - Month 2+): Database-Driven**
- When you need admin UI for customizations
- When you have >100 games
- When you need analytics on customization usage
- When you want real-time updates

### **Migration Path:**
```typescript
// Step 1: JSON files
const config = await fetch(`/configs/${slug}.json`);

// Step 2: Database with JSON fallback
const config = await fetch(`/api/game-config/${slug}`)
  .catch(() => fetch(`/configs/${slug}.json`));

// Step 3: Full database (remove JSON files)
const config = await fetch(`/api/game-config/${slug}`);
```

---

## 📋 **Implementation Plan**

### **Week 1: Core Customization System (JSON-based)**

**Day 1: Schema Design**
- Define JSON config schema
- Create example configs for 3 pets
- Document customization options

**Day 2: Game Template Updates**
- Modify game to load config file
- Parse character customizations
- Test sprite loading

**Day 3: Item System**
- Load custom collectibles from config
- Load custom obstacles from config
- Test item rendering

**Day 4: Settings System**
- Apply difficulty settings
- Apply theme/visual settings
- Apply audio settings

**Day 5: Level System**
- Parse level data from config
- Build platforms from config
- Spawn enemies from config

**Day 6-7: Admin UI**
- Config generator form
- Preview customizations
- Export to JSON

---

## 🗄️ **Database Schema (Future Migration)**

```sql
-- Complete schema for database-driven approach

-- Projects (main game entry)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_slug VARCHAR(50) UNIQUE NOT NULL,
  pet_name VARCHAR(100) NOT NULL,
  sprite_url VARCHAR(255) NOT NULL,
  deployment_status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customizations (settings per project)
CREATE TABLE customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,

  difficulty VARCHAR(20) DEFAULT 'medium',
  theme VARCHAR(50) DEFAULT 'classic',
  background_color VARCHAR(7) DEFAULT '#87CEEB',

  audio_enabled BOOLEAN DEFAULT true,
  music_track VARCHAR(100) DEFAULT 'theme-classic.mp3',
  music_volume DECIMAL(3,2) DEFAULT 0.7,

  particle_effects BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom items (collectibles, powerups, obstacles)
CREATE TABLE custom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  item_type VARCHAR(50) NOT NULL,  -- collectible, powerup, obstacle
  item_id VARCHAR(50) NOT NULL,
  sprite_url VARCHAR(255) NOT NULL,

  points INTEGER,                   -- for collectibles
  duration INTEGER,                 -- for powerups (seconds)
  damage INTEGER,                   -- for obstacles

  metadata JSONB,                   -- flexible additional data

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(project_id, item_type, item_id)
);

-- Custom levels
CREATE TABLE custom_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  level_number INTEGER NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  layout_type VARCHAR(50) NOT NULL,

  platforms JSONB NOT NULL,         -- [{x, y, width, type}, ...]
  enemies JSONB,                    -- [{type, x, y, pattern}, ...]
  collectibles JSONB,               -- [{item, x, y}, ...]
  win_condition JSONB NOT NULL,     -- {type, ...}

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(project_id, level_number)
);

-- Indexes for performance
CREATE INDEX idx_custom_items_project ON custom_items(project_id);
CREATE INDEX idx_custom_levels_project ON custom_levels(project_id);
CREATE INDEX idx_projects_slug ON projects(url_slug);
```

---

## 🎮 **Customization Examples**

### **Example 1: Bowie's Classic Game**
```json
{
  "petName": "Bowie",
  "character": { "sprite": "bowie.png" },
  "items": {
    "collectibles": [
      { "id": "bone", "sprite": "bone.png", "points": 10 }
    ]
  },
  "settings": {
    "difficulty": "medium",
    "theme": "classic"
  },
  "levels": [
    {
      "id": 1,
      "name": "Backyard",
      "layout": "grass",
      "platforms": [...]
    }
  ]
}
```

### **Example 2: Fluffy's Hard Mode**
```json
{
  "petName": "Fluffy",
  "character": { "sprite": "fluffy.png" },
  "items": {
    "collectibles": [
      { "id": "yarn", "sprite": "yarn.png", "points": 15 }
    ],
    "obstacles": [
      { "id": "water", "sprite": "water.png", "damage": 2 }
    ]
  },
  "settings": {
    "difficulty": "hard",
    "theme": "neon"
  },
  "levels": [
    {
      "id": 1,
      "name": "Rooftop Chase",
      "layout": "rooftop",
      "platforms": [...],
      "enemies": [
        { "type": "bird", "x": 200, "y": 100, "pattern": "dive" }
      ]
    }
  ]
}
```

---

## ✅ **Success Criteria**

- [ ] Support unlimited character customizations
- [ ] Support 10+ custom item types per game
- [ ] Support custom settings (difficulty, theme, audio)
- [ ] Support 5+ custom levels per game
- [ ] Config files <10KB each
- [ ] Game loads in <3 seconds with full customizations
- [ ] Easy to add new customization types

---

**Last Updated**: 2025-10-25
**Status**: Active - JSON Config Approach Recommended for MVP
**Next Review**: After 50 games deployed
