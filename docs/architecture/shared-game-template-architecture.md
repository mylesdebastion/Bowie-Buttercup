# Shared Game Template Architecture
## SparkleClassic Efficient Multi-Tenant Design

**Version**: 1.0
**Created**: 2025-10-25
**Decision**: Use shared game template with custom sprites (NOT full game duplication)

---

## 🎯 **Architecture Decision**

### **Problem**
Creating custom games for friends/colleagues at sparkleclassic.com/[petname] could be implemented two ways:
1. ❌ **Full Duplication**: Copy entire game (2MB) for each pet
2. ✅ **Shared Template**: One game template (2MB) + custom sprites (10KB each)

### **Decision: Shared Template Approach**

**Efficiency Comparison:**
```
Full Duplication:
  100 games × 2MB = 200MB
  Bug fix = update 100 files
  New pet = deploy 2MB

Shared Template:
  1 template (2MB) + 100 sprites (1MB) = 3MB
  Bug fix = update 1 file (all games benefit)
  New pet = upload 10KB sprite

Savings: 98.5% reduction in storage!
```

---

## 🏗️ **Technical Architecture**

### **File Structure**
```
sparkleclassic/
├── app/
│   ├── [slug]/
│   │   └── page.tsx              # Dynamic landing pages
│   └── game/
│       └── page.tsx               # Shared game template route
│
├── public/
│   └── game/
│       ├── index.html             # 2MB - ONE shared game
│       ├── assets/                # Shared game assets
│       │   ├── sounds/
│       │   ├── backgrounds/
│       │   └── effects/
│       └── sprites/               # Custom pet sprites
│           ├── bowie.png          # 10KB
│           ├── fluffy.png         # 10KB
│           └── max.png            # 10KB
│
└── prisma/
    └── schema.prisma
        projects {
          url_slug: "bowieruns"
          sprite_url: "bowie.png"
          pet_name: "Bowie"
        }
```

---

## 🔄 **User Flow**

### **1. User Visits Custom URL**
```
Browser: https://sparkleclassic.com/bowieruns
```

### **2. Next.js Dynamic Route Handler**
```typescript
// app/[slug]/page.tsx
export default async function GamePage({ params }: { params: { slug: string } }) {
  // Fetch project from database
  const project = await db.projects.findUnique({
    where: { url_slug: params.slug }
  });

  if (!project) return <NotFound />;

  return (
    <div className="game-container">
      <h1>{project.pet_name}'s Adventure!</h1>
      <p>Use arrow keys to move, space to jump</p>

      {/* Load shared game template with custom sprite */}
      <iframe
        src={`/game?pet=${project.pet_name}&sprite=${project.sprite_url}`}
        width="800"
        height="600"
        className="game-iframe"
      />
    </div>
  );
}
```

### **3. Shared Game Template**
```html
<!-- public/game/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>SparkleClassic Game</title>
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script>
    // Parse query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const petName = urlParams.get('pet') || 'Pet';
    const spriteFile = urlParams.get('sprite') || 'default.png';

    // Load custom sprite
    const playerSprite = new Image();
    playerSprite.src = `/game/sprites/${spriteFile}`;

    playerSprite.onload = () => {
      console.log(`Loaded ${petName}'s sprite: ${spriteFile}`);
      startGame(playerSprite, petName);
    };

    function startGame(sprite, name) {
      // Your existing game code here
      // Use 'sprite' for the player character
      // Display 'name' in UI elements
    }
  </script>
</body>
</html>
```

---

## 📊 **Database Schema**

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- URL Management
  url_slug VARCHAR(50) UNIQUE NOT NULL,     -- "bowieruns"

  -- Pet Customization
  pet_name VARCHAR(100) NOT NULL,           -- "Bowie"
  sprite_url VARCHAR(255) NOT NULL,         -- "bowie.png"

  -- Deployment
  deployment_status VARCHAR(20) DEFAULT 'draft',  -- draft, deploying, deployed
  deployed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example data
INSERT INTO projects (url_slug, pet_name, sprite_url, deployment_status)
VALUES
  ('bowieruns', 'Bowie', 'bowie.png', 'deployed'),
  ('fluffyadventures', 'Fluffy', 'fluffy.png', 'deployed'),
  ('maxsleeps', 'Max', 'max.png', 'deployed');
```

---

## 🚀 **Deployment Flow**

### **Adding a New Pet Game**

**Step 1: Create Project in Admin Dashboard**
```
Admin enters:
  - Pet name: "Bowie"
  - URL slug: "bowieruns" (auto-validated)
  - Upload sprite: bowie.png (10KB)
```

**Step 2: System Processing**
```bash
1. Validate URL availability
2. Save sprite to: /public/game/sprites/bowie.png
3. Create database record:
   {
     url_slug: "bowieruns",
     pet_name: "Bowie",
     sprite_url: "bowie.png",
     deployment_status: "draft"
   }
```

**Step 3: Deploy (One-Click)**
```bash
1. Mark project as "deploying"
2. Git commit: "Add Bowie sprite (bowieruns)"
3. Git push to main
4. Vercel auto-deploys (~2 minutes)
5. Update status to "deployed"
```

**Step 4: Game is Live**
```
URL: https://sparkleclassic.com/bowieruns
Loads: Shared game template with Bowie's sprite
Storage: Only added 10KB (not 2MB!)
```

---

## ✅ **Benefits**

### **Storage Efficiency**
- 100 games = 3MB vs 200MB (98.5% savings)
- Vercel deployment quota: minimal usage
- Git repository: stays lean

### **Development Velocity**
- Bug fixes: Update ONE file → all games fixed
- New features: Add to template → all games benefit
- Testing: Test once, works for all pets

### **Operational Simplicity**
- New pet deployment: 10KB sprite upload
- No need to manage 100 separate game files
- Easy rollback: revert one template file

### **Scalability**
- 1,000 games = still only ~12MB total
- 10,000 games = ~102MB (vs 20GB duplicated!)

---

## 🔧 **Implementation Checklist**

**Phase 1: Shared Game Template**
- [ ] Create /public/game/index.html with query param support
- [ ] Modify game code to load sprite from URL parameter
- [ ] Test with multiple sprites (bowie.png, fluffy.png)
- [ ] Verify sprite loading and rendering

**Phase 2: Dynamic Landing Pages**
- [ ] Create app/[slug]/page.tsx dynamic route
- [ ] Database query for project by url_slug
- [ ] Render iframe with query params
- [ ] Style landing page (responsive)

**Phase 3: Admin Dashboard**
- [ ] Sprite upload component
- [ ] URL validation and availability check
- [ ] Deploy button (git commit + push)
- [ ] Deployment status tracking

**Phase 4: Analytics**
- [ ] Track page views per URL slug
- [ ] Simple analytics dashboard
- [ ] CSV export

---

## 🎯 **Success Metrics**

- **Storage**: <5MB for 100 games ✅
- **Deployment**: <30 seconds to add new pet ✅
- **Maintenance**: 1 bug fix updates all games ✅
- **Developer Experience**: Minimal cognitive load ✅

---

## 📚 **Related Documents**

- [Epic IT003: URL Management](../epics-web-platform/epic-it003-url-management.md)
- [Internal Tool Architecture](./internal-tool-architecture.md)
- [Platform-Game Integration](./platform-game-integration.md)

---

**Last Updated**: 2025-10-25
**Status**: Active Architecture
**Decision Owner**: Development Team
