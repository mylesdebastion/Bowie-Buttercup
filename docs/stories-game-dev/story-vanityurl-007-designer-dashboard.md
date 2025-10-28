# User Story: Designer Dashboard - Game Creation

**Story ID**: VanityURL-007
**Epic**: [Vanity URL Foundation](../epics-game-dev/epic-vanity-url-foundation.md)
**Status**: Draft
**Priority**: P1 - High
**Estimated Effort**: 10-12 hours
**Sprint**: Sprint 2 (Week 2)
**Dependencies**: Story 1 (Config API), Story 2 (Slug Generation), Story 5 (Security)

---

## User Story

**As a** SparkleClassic game designer
**I want** a dashboard to upload custom sprites and create personalized game configurations
**So that** I can efficiently create games for customers without manual file/database manipulation

---

## Business Context

The designer dashboard is the **core production workflow tool**. Without it:
- ❌ Designers manually edit files and database
- ❌ High error rate, slow turnaround (4-8 hours per game)
- ❌ No quality control or preview

With dashboard:
- ✅ Streamlined workflow (30-60 minutes per game)
- ✅ Built-in preview and validation
- ✅ Automatic slug generation and URL delivery

**Revenue Impact**: Designer efficiency directly affects capacity to fulfill orders.

---

## Acceptance Criteria

### Dashboard Access

- [ ] **AC1.1**: Designer dashboard at `/designer`
- [ ] **AC1.2**: Requires authentication + "designer" role
- [ ] **AC1.3**: Shows designer's active orders from Stripe

### Order List View

- [ ] **AC2.1**: Display pending orders needing game creation:
  - Order ID
  - Customer name + email
  - Pet photo thumbnail
  - Pet name
  - Order date
  - Status: Pending / In Progress / Completed

- [ ] **AC2.2**: Click order opens game creation workflow
- [ ] **AC2.3**: Filter by status
- [ ] **AC2.4**: Sort by date (oldest first by default)

### Sprite Upload

- [ ] **AC3.1**: Upload form accepts:
  - PNG files only
  - 32x32 or 96x96 pixels
  - Max 500KB file size
  - Transparent background recommended

- [ ] **AC3.2**: Upload validation:
  - Check file type (PNG)
  - Check dimensions
  - Check file size
  - Reject invalid files with clear error

- [ ] **AC3.3**: Preview uploaded sprite:
  - Show sprite at actual size
  - Show sprite at 2x size
  - Option to crop/adjust if needed

- [ ] **AC3.4**: Upload to cloud storage (Google Cloud Storage or S3):
  - Unique filename: `sprites/{order-id}-{timestamp}.png`
  - Returns public URL
  - URL stored in config

### Config Generation

- [ ] **AC4.1**: Form fields for config:
  - Pet name (pre-filled from order)
  - Sprite URL (auto-filled from upload)
  - Difficulty: Easy / Normal / Hard
  - Theme: Forest / City / Space / Beach
  - Custom message (optional, max 200 chars)

- [ ] **AC4.2**: Auto-generate slug button:
  - Calls `POST /api/admin/configs/generate-slug`
  - Shows 3 slug options
  - Designer selects preferred slug
  - Manual override option

- [ ] **AC4.3**: Config JSON auto-generated from template:
  ```json
  {
    "spritesheet": "<uploaded-sprite-url>",
    "metadata": {
      "title": "{PetName}'s Adventure",
      "description": "Custom platformer for {PetName}",
      "difficulty": "normal",
      "theme": "forest"
    },
    "animations": {
      "idle": { "frames": [0, 1], "speed": 0.1 },
      "walk": { "frames": [2, 3, 4, 5], "speed": 0.15 },
      "jump": { "frames": [6], "speed": 0.1 }
    }
  }
  ```

### Live Preview

- [ ] **AC5.1**: Preview panel shows game in iframe:
  - Loads actual game with uploaded sprite
  - Designer can play to test
  - Preview uses temp slug: `/preview-{temp-id}`

- [ ] **AC5.2**: Preview updates in real-time:
  - When sprite uploaded
  - When config fields changed
  - Debounced updates (500ms delay)

- [ ] **AC5.3**: Preview controls:
  - Restart game
  - Refresh preview
  - Fullscreen mode

### Create & Deliver

- [ ] **AC6.1**: "Create Game" button:
  - Validates all fields complete
  - Calls `POST /api/configs` with config
  - Creates config in database
  - Associates with order ID

- [ ] **AC6.2**: Success confirmation:
  - Shows generated URL: `sparkleclassic.com/{slug}`
  - Shows "Send Email" button
  - Shows "Copy URL" button
  - Shows "View Game" button

- [ ] **AC6.3**: Automatically trigger email (Story 8):
  - Email sent to customer
  - Designer sees delivery status
  - Option to resend if failed

### My Games List

- [ ] **AC7.1**: Tab showing designer's completed games:
  - List of all games created by this designer
  - Sortable by date
  - Search by pet name or slug
  - Link to edit or view game

- [ ] **AC7.2**: Game stats per entry:
  - Times played
  - Last accessed
  - Customer feedback (if available)

---

## Technical Implementation

### Tech Stack

- **Frontend**: React with TypeScript
- **File Upload**: Drag-and-drop with react-dropzone
- **Cloud Storage**: Google Cloud Storage or AWS S3
- **Preview**: Iframe with postMessage API
- **API**: Existing endpoints + new upload endpoint

### File Upload API

```javascript
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucket = storage.bucket('sparkleclassic-sprites');

const upload = multer({
  limits: { fileSize: 500 * 1024 }, // 500KB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/png') {
      return cb(new Error('Only PNG files allowed'));
    }
    cb(null, true);
  }
});

router.post('/api/designer/upload-sprite',
  authenticateJWT,
  requireRole('designer'),
  upload.single('sprite'),
  async (req, res) => {
    try {
      const { orderId } = req.body;
      const file = req.file;

      // Validate dimensions
      const dimensions = sizeOf(file.buffer);
      if (![32, 96].includes(dimensions.width) || dimensions.width !== dimensions.height) {
        return res.status(400).json({ error: 'Sprite must be 32x32 or 96x96' });
      }

      // Upload to cloud storage
      const filename = `sprites/${orderId}-${Date.now()}.png`;
      const blob = bucket.file(filename);

      await blob.save(file.buffer, {
        contentType: 'image/png',
        public: true
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      res.json({
        url: publicUrl,
        filename,
        dimensions
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
);
```

### Designer Dashboard Component

```javascript
// /designer/components/GameCreator.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function GameCreator({ order }) {
  const [spriteUrl, setSpriteUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [config, setConfig] = useState({});
  const [previewKey, setPreviewKey] = useState(0);

  const onDrop = async (files) => {
    const file = files[0];
    const formData = new FormData();
    formData.append('sprite', file);
    formData.append('orderId', order.id);

    const response = await fetch('/api/designer/upload-sprite', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    const data = await response.json();
    setSpriteUrl(data.url);
    setPreviewKey(prev => prev + 1); // Force preview reload
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'] },
    maxFiles: 1,
    maxSize: 500 * 1024
  });

  const generateSlug = async () => {
    const response = await fetch('/api/admin/configs/generate-slug', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ petName: order.petName })
    });

    const data = await response.json();
    setSlug(data.slug);
  };

  const createGame = async () => {
    const response = await fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug,
        petName: order.petName,
        safeword: slug.split('-')[1],
        customerEmail: order.customerEmail,
        orderId: order.id,
        configJson: config,
        spriteUrl
      })
    });

    if (response.ok) {
      alert(`Game created! URL: https://sparkleclassic.com/${slug}`);
      // Trigger email delivery
      await sendDeliveryEmail(slug, order.customerEmail);
    }
  };

  return (
    <div className="game-creator">
      <h2>Create Game for {order.petName}</h2>

      {/* Sprite Upload */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop sprite here, or click to select</p>
        {spriteUrl && <img src={spriteUrl} alt="Uploaded sprite" />}
      </div>

      {/* Slug Generation */}
      <button onClick={generateSlug}>Generate URL</button>
      {slug && <p>URL: sparkleclassic.com/{slug}</p>}

      {/* Config Form */}
      <form>
        <label>
          Difficulty:
          <select onChange={(e) => setConfig({...config, difficulty: e.target.value})}>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        {/* More form fields... */}
      </form>

      {/* Live Preview */}
      <iframe
        key={previewKey}
        src={`/preview?sprite=${encodeURIComponent(spriteUrl)}`}
        width="800"
        height="600"
        title="Game Preview"
      />

      {/* Create Button */}
      <button onClick={createGame} disabled={!spriteUrl || !slug}>
        Create & Send to Customer
      </button>
    </div>
  );
}
```

---

## Test Scenarios

### Scenario 1: Designer Uploads Sprite

**Given**: Designer on game creation page
**When**: Drag & drop 32x32 PNG sprite
**Then**:
- File uploads to cloud storage
- Public URL returned
- Preview shows sprite in game
- No errors

### Scenario 2: Invalid Sprite Rejected

**Given**: Designer attempts upload
**When**: Upload 100x100 PNG (wrong dimensions)
**Then**:
- Upload rejected
- Error: "Sprite must be 32x32 or 96x96"
- No file uploaded

### Scenario 3: Slug Auto-Generated

**Given**: Designer enters pet name "Fluffy"
**When**: Click "Generate URL" button
**Then**:
- API returns slug: "fluffy-happy"
- Shows 3 alternatives
- Designer can select or enter custom

### Scenario 4: Live Preview Updates

**Given**: Sprite uploaded and slug generated
**When**: Change difficulty to "Hard"
**Then**:
- Preview reloads within 500ms
- Game difficulty updated
- Can play to test

### Scenario 5: Game Created Successfully

**Given**: All fields valid
**When**: Click "Create & Send to Customer"
**Then**:
- Config saved to database
- Email sent to customer
- Success message shown
- URL copyable to clipboard

---

## Definition of Done

- [ ] Designer dashboard accessible at `/designer`
- [ ] All acceptance criteria met
- [ ] Sprite upload functional
- [ ] Config generation working
- [ ] Live preview updates
- [ ] Game creation successful
- [ ] Email delivery triggered
- [ ] Mobile responsive
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] Code reviewed and deployed

---

**Created By**: Scrum Master (BMad SM Agent)
**Date**: 2025-01-27
**Epic**: VanityURL-001
**Next Story**: Story 8 (Email Delivery)
