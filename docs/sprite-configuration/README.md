# Sprite Configuration System

## Overview

The Sprite Configuration System provides a flexible, JSON-based approach to defining pet sprite mappings, animations, and behaviors. This system allows developers to easily add new pets or modify existing ones without changing code.

## Quick Start

### Creating a New Pet

1. **Copy the template**: Start with `src/configs/sprites/template-pet-config.json`
2. **Update metadata**: Change `id`, `name`, `description`, and `spriteSheet` fields
3. **Configure sprite cells**: Set the correct `crop` coordinates for each animation state
4. **Validate**: Use the built-in validation to ensure your config is complete
5. **Import**: Load your configuration using the SpriteConfig API

### Example: Adding a New Pet

```javascript
import { getSpriteConfig } from './core/sprites/index.js';

// Load your custom configuration
const spriteConfig = getSpriteConfig();
const customPetJSON = await fetch('/configs/sprites/my-pet-config.json').then(r => r.text());

// Import and validate
const success = spriteConfig.importConfig(customPetJSON, 'my-pet');

if (success) {
    console.log('✅ Custom pet loaded successfully!');
    // Switch to your custom pet
    game.changePet('my-pet');
}
```

## Configuration Schema

### Required Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Unique identifier for the pet | ✅ |
| `name` | string | Display name for the pet | ✅ |
| `spriteSheet` | string | Filename of the PNG sprite sheet | ✅ |
| `sheet` | string | Sheet identifier ('A', 'B', or custom) | ✅ |
| `cells` | array | Array of sprite cell configurations | ✅ |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Pet personality and appearance description |
| `version` | string | Configuration version (semantic versioning) |
| `author` | string | Creator of the configuration |
| `animations` | object | Animation timing and sequencing definitions |

### Cell Configuration

Each sprite cell must include:

```json
{
  "r": 1,           // Row number in sprite sheet (1-indexed)
  "c": 1,           // Column number in sprite sheet (1-indexed)
  "crop": [0, 0, 32, 32],  // [x, y, width, height] in pixels
  "assign": "idle_sit",    // Animation state name
  "pivot": [0.5, 1],       // [x, y] pivot point (0-1 range)
  "flipX": false,          // Horizontal flip flag
  "description": "..."     // Optional description
}
```

## Required Animation States

Every pet configuration **MUST** include these 9 animation states:

1. **idle_sit** - Idle sitting pose (side view)
2. **idle_sit_front** - Idle sitting pose (front view)
3. **run_1** - Run cycle frame 1
4. **run_2** - Run cycle frame 2
5. **run_3** - Run cycle frame 3
6. **jump_up** - Jumping up animation
7. **fall_down** - Falling down animation
8. **crouch** - Crouching pose
9. **dodge_roll** - Rolling dodge animation

### Animation State Mappings

The configuration system validates that all required states are present. Missing states will cause validation errors.

## Sprite Sheet Layout

### 3x3 Grid Layout (Standard)

Sprite sheets should be 96x96 pixels (3 rows × 3 columns of 32x32 pixel sprites):

```
[Row 1] dodge_roll | run_1        | idle_sit
[Row 2] run_2      | run_3        | idle_sit_front
[Row 3] crouch     | jump_up      | fall_down
```

### Crop Coordinates

Crop coordinates are specified as `[x, y, width, height]`:
- **x**: Horizontal offset from top-left (0 = left edge)
- **y**: Vertical offset from top-left (0 = top edge)
- **width**: Width of the sprite (typically 32px)
- **height**: Height of the sprite (typically 32px)

Example for top-left cell (r:1, c:1):
```json
"crop": [0, 0, 32, 32]
```

Example for center cell (r:2, c:2):
```json
"crop": [32, 32, 32, 32]
```

## Pivot Points

Pivot points determine the anchor point for sprite rendering and transformations.

### Format

Pivot points use normalized coordinates [x, y] in the range 0-1:
- **[0, 0]** - Top-left corner
- **[0.5, 0]** - Top-center
- **[1, 0]** - Top-right corner
- **[0.5, 0.5]** - Center
- **[0.5, 1]** - Bottom-center (default for platformers)

### Common Pivot Points

For platformer games, **[0.5, 1]** (bottom-center) is recommended for all sprites:
- Ensures sprites align properly with ground
- Consistent positioning across animations
- Simplifies collision detection

## Import/Export API

### Exporting Configurations

```javascript
import { getSpriteConfig } from './core/sprites/index.js';

const spriteConfig = getSpriteConfig();

// Export current configuration
const jsonData = spriteConfig.exportConfig('pet-a');

// Save to file (browser download)
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'pet-a-config.json';
a.click();
```

### Importing Configurations

```javascript
import { getSpriteConfig } from './core/sprites/index.js';

const spriteConfig = getSpriteConfig();

// Load from file input
document.getElementById('configFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const jsonData = await file.text();

    const success = spriteConfig.importConfig(jsonData, 'custom-pet');

    if (success) {
        console.log('✅ Configuration imported successfully');
    } else {
        console.error('❌ Configuration import failed');
    }
});
```

## Validation

### Automatic Validation

The system automatically validates configurations on import:

1. **Required Fields Check**: Ensures all required fields are present
2. **Animation Completeness**: Verifies all 9 required animation states exist
3. **Coordinate Validation**: Checks crop coordinates are within bounds
4. **Pivot Range Check**: Ensures pivot points are in 0-1 range

### Manual Validation

```javascript
import { getSpriteConfig } from './core/sprites/index.js';

const spriteConfig = getSpriteConfig();

try {
    const config = JSON.parse(jsonData);
    const isValid = spriteConfig.validateConfig(config);
    console.log('Configuration is valid:', isValid);
} catch (error) {
    console.error('Validation error:', error.message);
}
```

## Troubleshooting

### Common Errors

#### "Missing required animations"
**Cause**: Configuration doesn't include all 9 required animation states
**Solution**: Add missing states to the `cells` array

#### "Invalid crop coordinates"
**Cause**: Crop rectangle extends beyond sprite sheet dimensions
**Solution**: Verify your crop [x, y, width, height] values

#### "Invalid pivot point"
**Cause**: Pivot coordinates outside 0-1 range
**Solution**: Use normalized coordinates (e.g., [0.5, 1] not [16, 32])

#### "Cannot add config: Configuration already exists"
**Cause**: Trying to add a configuration with an ID that's already loaded
**Solution**: Use a unique ID or remove the existing configuration first

### Debugging Tips

1. **Check Console**: Validation errors are logged to console with details
2. **Compare with Template**: Use `template-pet-config.json` as reference
3. **Test with Existing Pets**: Verify your sprite sheet format matches Pet A/B
4. **Use JSON Validator**: Ensure your JSON syntax is correct

## Examples

### Complete Pet Configuration

See `src/configs/sprites/pet-a-config.json` for a complete, working example.

### Minimal Configuration

```json
{
  "id": "simple-pet",
  "name": "Simple Pet",
  "spriteSheet": "simple_pet_3x3.png",
  "sheet": "SIMPLE",
  "cells": [
    { "r": 1, "c": 1, "crop": [0, 0, 32, 32], "assign": "dodge_roll", "pivot": [0.5, 1], "flipX": false },
    { "r": 1, "c": 2, "crop": [32, 0, 32, 32], "assign": "run_1", "pivot": [0.5, 1], "flipX": false },
    { "r": 1, "c": 3, "crop": [64, 0, 32, 32], "assign": "idle_sit", "pivot": [0.5, 1], "flipX": false },
    { "r": 2, "c": 1, "crop": [0, 32, 32, 32], "assign": "run_2", "pivot": [0.5, 1], "flipX": false },
    { "r": 2, "c": 2, "crop": [32, 32, 32, 32], "assign": "run_3", "pivot": [0.5, 1], "flipX": false },
    { "r": 2, "c": 3, "crop": [64, 32, 32, 32], "assign": "idle_sit_front", "pivot": [0.5, 1], "flipX": false },
    { "r": 3, "c": 1, "crop": [0, 64, 32, 32], "assign": "crouch", "pivot": [0.5, 1], "flipX": false },
    { "r": 3, "c": 2, "crop": [32, 64, 32, 32], "assign": "jump_up", "pivot": [0.5, 1], "flipX": false },
    { "r": 3, "c": 3, "crop": [64, 64, 32, 32], "assign": "fall_down", "pivot": [0.5, 1], "flipX": false }
  ]
}
```

## Best Practices

1. **Use Descriptive IDs**: Choose clear, unique identifiers (e.g., `pet-orange-tabby`)
2. **Document Your Work**: Add descriptions to cells and animations
3. **Version Your Configs**: Use semantic versioning for tracking changes
4. **Test Thoroughly**: Verify all animations look correct in-game
5. **Keep Backups**: Export configurations before making changes
6. **Follow Standards**: Use the 3x3 grid layout for consistency

## Advanced Topics

### Custom Animation Speeds

```json
{
  "animations": {
    "run": {
      "frames": ["run_1", "run_2", "run_3"],
      "speed": 80,  // Faster run animation
      "loop": true
    }
  }
}
```

### Flipped Sprites

For pets that face different directions:

```json
{
  "r": 1,
  "c": 2,
  "crop": [32, 0, 32, 32],
  "assign": "run_1",
  "pivot": [0.5, 1],
  "flipX": true  // Horizontally flip the sprite
}
```

## Related Documentation

- [Creating New Pets Guide](./creating-new-pets.md)
- [Animation States Reference](./animation-states.md)
- [Troubleshooting Guide](./troubleshooting.md)

## Support

For additional help:
1. Check the troubleshooting guide
2. Review existing pet configurations
3. Examine the SpriteConfig source code
4. Open an issue on GitHub

---

**Last Updated**: 2025-10-26
**Version**: 1.0.0
**Story**: E002.1-004 - Configuration System
