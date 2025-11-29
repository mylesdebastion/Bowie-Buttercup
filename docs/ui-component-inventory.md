# UI Component Inventory - SparkleClassic

**Generated:** 2025-11-29
**Type:** Game UI Components
**Location:** `src/ui/`

## Component Overview

SparkleClassic implements a custom UI system for game-specific interfaces.

## Components

### 1. HUD (Heads-Up Display)
**File:** `src/ui/HUD.js`
**Purpose:** Display game stats during gameplay
**Features:**
- Lives display (heart icons)
- Score counter
- Coin counter
- Level indicator
- Real-time updates via State Manager

### 2. Mobile Controls
**File:** `src/ui/MobileControls.js`
**Purpose:** Touch-based controls for mobile devices
**Features:**
- Virtual D-pad for movement
- Jump button
- Touch gesture support
- Responsive layout
- Auto-hide on desktop

### 3. Settings Panel
**File:** `src/ui/SettingsPanel.js`
**Purpose:** Game configuration interface
**Features:**
- Audio controls (music/SFX volume, mute)
- Accessibility settings (high contrast, reduced motion)
- Physics tuning (for testing)
- Key mapping customization
- Persistent settings via State Manager

### 4. Sprite Editor
**File:** `src/ui/SpriteEditor.js`
**Purpose:** In-game sprite customization tool
**Features:**
- Load custom pet images
- Sprite mapping configuration
- Real-time preview
- Save custom sprites
- Export/import functionality

### 5. Pet Selector
**File:** `src/ui/PetSelector.js`
**Purpose:** Pet character selection interface
**Features:**
- Pet A (Bowie Cat - gray tabby)
- Pet B (Buttercup Cat - cream cat)
- Visual preview of selected pet
- Persistent selection
- URL parameter support (?pet=bowie or ?pet=buttercup)
- Auto-dismiss after 10 seconds

### 6. UI Manager
**File:** `src/ui/UIManager.js`
**Purpose:** Coordinate all UI components
**Features:**
- Centralized UI state
- Component lifecycle management
- Modal/overlay system
- Responsive layout management

## UI Architecture Pattern

### Integration with State Manager

All UI components subscribe to State Manager for reactive updates:

```javascript
stateManager.subscribe('change:game.score', ({ value }) => {
  updateScoreDisplay(value);
});
```

### Component Lifecycle

1. **Initialize:** Component setup, event listeners
2. **Render:** DOM creation/update
3. **Show/Hide:** Visibility management
4. **Destroy:** Cleanup, remove listeners

### Styling

- CSS in `src/styles/main.css`
- Pixel art aesthetic
- Accessibility considerations (high contrast mode)
- Responsive design for mobile/desktop

## Asset Requirements

- Icons: Hearts, coins, buttons
- Backgrounds: Transparent overlays
- Fonts: Pixel-style game font
- Colors: Consistent palette from main game

## Accessibility Features

- **High Contrast Mode:** Toggle via Settings Panel
- **Reduced Motion:** Disable animations
- **Keyboard Navigation:** Full keyboard support
- **Screen Reader:** ARIA labels (planned)
- **Scalable UI:** `uiScale` setting (1x-4x)

## Mobile Optimization

- Touch-optimized hit targets (44x44 minimum)
- Virtual controls for movement
- Swipe gestures for menus
- Orientation lock support

## Future Enhancements

- Leaderboard UI
- Achievement popups
- Level select screen
- Shop/unlockables UI
- Social sharing UI
