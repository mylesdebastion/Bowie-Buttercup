/**
 * Collision Detection System
 *
 * Handles tile-based collision detection and response
 */

export class CollisionSystem {
  constructor(tileSize = 16) {
    this.tileSize = tileSize;
    this.level = null;
    this.levelWidth = 0;
    this.levelHeight = 0;
  }

  setLevel(level) {
    this.level = level;
    if (level && level.length > 0) {
      this.levelHeight = level.length;
      this.levelWidth = level[0].length;
    }
  }

  /**
   * Get tile value at world coordinates
   */
  getTileAt(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    if (tileY < 0 || tileY >= this.levelHeight ||
        tileX < 0 || tileX >= this.levelWidth) {
      return -1; // Out of bounds
    }

    return this.level[tileY][tileX];
  }

  /**
   * Check if a tile is solid (blocks movement)
   */
  isSolid(tileValue) {
    // Tile types:
    // 0 = pit/empty (fall through)
    // 1 = solid platform
    // 2 = collectible
    // 3 = moving platform
    // 4 = climbable (tree/vine)
    // 5 = checkpoint
    // 6 = goal
    return tileValue === 1 || tileValue === 3;
  }

  /**
   * Check if a tile is a pit (causes fall/death)
   */
  isPit(tileValue) {
    return tileValue === 0;
  }

  /**
   * Check if a tile is climbable
   */
  isClimbable(tileValue) {
    return tileValue === 4;
  }

  /**
   * Check if player is on ground
   * FIXED: Now properly handles pits
   */
  isOnGround(x, y, width, height) {
    // Check the tile directly below the player's feet
    const footY = y + height + 1; // One pixel below feet
    const leftFootX = x;
    const rightFootX = x + width - 1;
    const centerX = x + width / 2;

    // Check left foot, center, and right foot
    const leftTile = this.getTileAt(leftFootX, footY);
    const centerTile = this.getTileAt(centerX, footY);
    const rightTile = this.getTileAt(rightFootX, footY);

    // Player is on ground if ANY foot position is on a solid tile
    // This prevents falling through corners
    return this.isSolid(leftTile) ||
           this.isSolid(centerTile) ||
           this.isSolid(rightTile);
  }

  /**
   * Check if player is over a pit
   * NEW: Explicit pit detection
   */
  isOverPit(x, y, width, height) {
    // Check the tile directly below the player
    const footY = y + height + 1;
    const centerX = x + width / 2;

    const tile = this.getTileAt(centerX, footY);
    return this.isPit(tile);
  }

  /**
   * Check and resolve collisions for an entity
   */
  checkCollisions(entity, dt) {
    const bounds = {
      left: entity.x,
      right: entity.x + entity.width,
      top: entity.y,
      bottom: entity.y + entity.height,
      centerX: entity.x + entity.width / 2,
      centerY: entity.y + entity.height / 2
    };

    const collisions = {
      ground: false,
      ceiling: false,
      leftWall: false,
      rightWall: false,
      pit: false,
      climbable: false
    };

    // Ground collision (fixed for pits)
    if (entity.vy >= 0) {
      const footY = bounds.bottom + entity.vy * dt;
      const tileY = Math.floor(footY / this.tileSize);

      // Check all foot positions
      const leftTile = this.getTileAt(bounds.left, footY);
      const centerTile = this.getTileAt(bounds.centerX, footY);
      const rightTile = this.getTileAt(bounds.right - 1, footY);

      // Check if over a pit (center position matters most)
      if (this.isPit(centerTile)) {
        collisions.pit = true;
      }

      // Check for solid ground
      if (this.isSolid(leftTile) || this.isSolid(centerTile) || this.isSolid(rightTile)) {
        collisions.ground = true;
        entity.y = tileY * this.tileSize - entity.height;
        entity.vy = 0;
        entity.isGrounded = true;
      }
    }

    // Ceiling collision
    if (entity.vy < 0) {
      const headY = bounds.top + entity.vy * dt;
      const tileY = Math.floor(headY / this.tileSize);
      const tile = this.getTileAt(bounds.centerX, headY);

      if (this.isSolid(tile)) {
        collisions.ceiling = true;
        entity.y = (tileY + 1) * this.tileSize;
        entity.vy = 0;
      }
    }

    // Left wall collision
    if (entity.vx < 0) {
      const leftX = bounds.left + entity.vx * dt;
      const tileX = Math.floor(leftX / this.tileSize);
      const tile = this.getTileAt(leftX, bounds.centerY);

      if (this.isSolid(tile)) {
        collisions.leftWall = true;
        entity.x = (tileX + 1) * this.tileSize;
        entity.vx = 0;
      }
    }

    // Right wall collision
    if (entity.vx > 0) {
      const rightX = bounds.right + entity.vx * dt;
      const tileX = Math.floor(rightX / this.tileSize);
      const tile = this.getTileAt(rightX, bounds.centerY);

      if (this.isSolid(tile)) {
        collisions.rightWall = true;
        entity.x = tileX * this.tileSize - entity.width;
        entity.vx = 0;
      }
    }

    // Check for climbable tiles
    const centerTile = this.getTileAt(bounds.centerX, bounds.centerY);
    if (this.isClimbable(centerTile)) {
      collisions.climbable = true;
    }

    return collisions;
  }

  /**
   * Ray cast to check line of sight or projectile path
   */
  rayCast(startX, startY, endX, endY, checkSolid = true) {
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    while (true) {
      const tile = this.getTileAt(x, y);

      if (checkSolid && this.isSolid(tile)) {
        return { hit: true, x, y, tile };
      }

      if (Math.abs(x - endX) < 1 && Math.abs(y - endY) < 1) {
        break;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return { hit: false };
  }

  /**
   * Get all solid tiles in a rectangular area
   */
  getSolidTilesInArea(x, y, width, height) {
    const tiles = [];
    const startTileX = Math.floor(x / this.tileSize);
    const endTileX = Math.floor((x + width) / this.tileSize);
    const startTileY = Math.floor(y / this.tileSize);
    const endTileY = Math.floor((y + height) / this.tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tile = this.getTileAt(tx * this.tileSize, ty * this.tileSize);
        if (this.isSolid(tile)) {
          tiles.push({
            x: tx * this.tileSize,
            y: ty * this.tileSize,
            width: this.tileSize,
            height: this.tileSize,
            type: tile
          });
        }
      }
    }

    return tiles;
  }
}

// Singleton instance
let instance = null;

export function getCollisionSystem() {
  if (!instance) {
    instance = new CollisionSystem();
  }
  return instance;
}

export default CollisionSystem;
