/**
 * Player Entity Module
 *
 * Manages the player character's state, physics, and behavior
 */

export class Player {
  constructor(config = {}) {
    // Position and size
    this.x = config.x || 50;
    this.y = config.y || 200;
    this.width = config.width || 30;
    this.height = config.height || 30;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // Movement config
    this.moveSpeed = config.moveSpeed || 200;
    this.jumpPower = config.jumpPower || 350;
    this.acceleration = config.acceleration || 1200;
    this.friction = config.friction || 800;
    this.gravity = config.gravity || 700;
    this.maxFallSpeed = config.maxFallSpeed || 500;

    // State flags
    this.isGrounded = false;
    this.isJumping = false;
    this.isDucking = false;
    this.facingRight = true;
    this.isDodging = false;

    // Animation
    this.animationFrame = 0;
    this.animationTime = 0;
    this.currentAnimation = 'idle';

    // Combat
    this.health = config.health || 3;
    this.maxHealth = config.maxHealth || 3;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.attackCooldown = 0;

    // Coyote time (grace period for jumping after leaving platform)
    this.coyoteTime = config.coyoteTime || 150;
    this.lastGroundedTime = 0;

    // Double jump
    this.canDoubleJump = config.canDoubleJump || false;
    this.hasDoubleJumped = false;

    // Dodge roll
    this.dodgeSpeed = config.dodgeSpeed || 400;
    this.dodgeDuration = config.dodgeDuration || 300;
    this.dodgeTime = 0;
    this.dodgeCooldown = 0;

    // Input buffer (for smoother controls)
    this.jumpBufferTime = 100;
    this.jumpBuffered = false;
    this.jumpBufferTimer = 0;

    // Bounds for respawn
    this.spawnX = this.x;
    this.spawnY = this.y;
  }

  update(dt, input = {}) {
    // Convert dt to seconds
    const deltaTime = dt / 1000;

    // Update timers
    this.updateTimers(dt);

    // Handle input
    this.handleInput(input, deltaTime);

    // Apply physics
    this.applyPhysics(deltaTime);

    // Update animation
    this.updateAnimation(dt);

    // Check boundaries
    this.checkBounds();
  }

  updateTimers(dt) {
    // Invulnerability
    if (this.invulnerable && this.invulnerableTime > 0) {
      this.invulnerableTime -= dt;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Dodge cooldown
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= dt;
    }

    // Dodge duration
    if (this.isDodging && this.dodgeTime > 0) {
      this.dodgeTime -= dt;
      if (this.dodgeTime <= 0) {
        this.isDodging = false;
        this.dodgeCooldown = 500; // Half second cooldown
      }
    }

    // Jump buffer
    if (this.jumpBuffered && this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.jumpBufferTimer <= 0) {
        this.jumpBuffered = false;
      }
    }

    // Track time since last grounded
    if (!this.isGrounded) {
      this.lastGroundedTime += dt;
    }
  }

  handleInput(input, dt) {
    // Skip input during dodge
    if (this.isDodging) {
      return;
    }

    // Horizontal movement
    if (input.left) {
      this.vx = Math.max(this.vx - this.acceleration * dt, -this.moveSpeed);
      this.facingRight = false;
    } else if (input.right) {
      this.vx = Math.min(this.vx + this.acceleration * dt, this.moveSpeed);
      this.facingRight = true;
    } else {
      // Apply friction
      if (Math.abs(this.vx) > 0) {
        const friction = this.friction * dt;
        if (this.vx > 0) {
          this.vx = Math.max(0, this.vx - friction);
        } else {
          this.vx = Math.min(0, this.vx + friction);
        }
      }
    }

    // Jump input
    if (input.jump) {
      // Buffer jump input
      this.jumpBuffered = true;
      this.jumpBufferTimer = this.jumpBufferTime;

      // Try to jump
      this.tryJump();
    } else {
      // Variable jump height
      if (this.isJumping && this.vy < 0) {
        this.vy *= 0.5;
        this.isJumping = false;
      }
    }

    // Duck
    this.isDucking = input.down && this.isGrounded;

    // Dodge roll
    if (input.dodge && this.dodgeCooldown <= 0 && this.isGrounded) {
      this.startDodge();
    }

    // Attack
    if (input.attack && this.attackCooldown <= 0) {
      this.attack();
    }
  }

  tryJump() {
    const canCoyoteJump = this.lastGroundedTime < this.coyoteTime;

    if (this.isGrounded || canCoyoteJump) {
      // Regular jump
      this.vy = -this.jumpPower;
      this.isGrounded = false;
      this.isJumping = true;
      this.hasDoubleJumped = false;
      this.jumpBuffered = false;
      this.lastGroundedTime = this.coyoteTime; // Prevent coyote jump after jumping
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      // Double jump
      this.vy = -this.jumpPower * 0.85; // Slightly weaker
      this.hasDoubleJumped = true;
      this.jumpBuffered = false;
    }
  }

  startDodge() {
    this.isDodging = true;
    this.dodgeTime = this.dodgeDuration;
    this.invulnerable = true;
    this.invulnerableTime = this.dodgeDuration;

    // Set dodge velocity
    this.vx = this.facingRight ? this.dodgeSpeed : -this.dodgeSpeed;
    this.vy = 0;
  }

  attack() {
    this.attackCooldown = 300;
    this.currentAnimation = 'attack';
    // Attack logic will be handled by combat system
  }

  applyPhysics(dt) {
    // Apply gravity
    if (!this.isGrounded) {
      this.vy += this.gravity * dt;
      this.vy = Math.min(this.vy, this.maxFallSpeed);
    }

    // Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  updateAnimation(dt) {
    this.animationTime += dt;

    // Determine current animation based on state
    if (this.isDodging) {
      this.currentAnimation = 'dodge';
    } else if (!this.isGrounded) {
      this.currentAnimation = this.vy < 0 ? 'jump' : 'fall';
    } else if (this.isDucking) {
      this.currentAnimation = 'duck';
    } else if (Math.abs(this.vx) > 10) {
      this.currentAnimation = 'run';
    } else {
      this.currentAnimation = 'idle';
    }

    // Update animation frame
    const frameTime = 100; // ms per frame
    if (this.animationTime >= frameTime) {
      this.animationFrame++;
      this.animationTime = 0;
    }
  }

  checkBounds() {
    // Check if fallen off the world
    if (this.y > 600) {
      this.respawn();
    }
  }

  // Collision response
  land(y) {
    this.y = y;
    this.vy = 0;
    this.isGrounded = true;
    this.hasDoubleJumped = false;
    this.lastGroundedTime = 0;

    // Check jump buffer
    if (this.jumpBuffered) {
      this.tryJump();
    }
  }

  hitCeiling(y) {
    this.y = y;
    this.vy = 0;
  }

  hitWall(x) {
    this.x = x;
    this.vx = 0;
  }

  // Health and damage
  takeDamage(amount = 1) {
    if (this.invulnerable) return false;

    this.health -= amount;
    this.invulnerable = true;
    this.invulnerableTime = 2000; // 2 seconds

    if (this.health <= 0) {
      this.die();
      return true;
    }

    // Knockback
    this.vy = -200;
    this.vx = this.facingRight ? -150 : 150;

    return false;
  }

  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  die() {
    this.health = 0;
    // Death will be handled by game state
  }

  respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = false;
    this.isDodging = false;
    this.invulnerable = true;
    this.invulnerableTime = 2000;
    this.health = this.maxHealth;
  }

  setSpawnPoint(x, y) {
    this.spawnX = x;
    this.spawnY = y;
  }

  // Getters for rendering
  getPosition() {
    return { x: this.x, y: this.y };
  }

  getBounds() {
    return {
      left: this.x - this.width / 2,
      right: this.x + this.width / 2,
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2
    };
  }

  getState() {
    return {
      position: { x: this.x, y: this.y },
      velocity: { x: this.vx, y: this.vy },
      animation: this.currentAnimation,
      frame: this.animationFrame,
      facingRight: this.facingRight,
      health: this.health,
      invulnerable: this.invulnerable,
      isGrounded: this.isGrounded,
      isDodging: this.isDodging,
      isDucking: this.isDucking
    };
  }

  // Serialization for save/load
  serialize() {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      spawnX: this.spawnX,
      spawnY: this.spawnY
    };
  }

  deserialize(data) {
    this.x = data.x || this.x;
    this.y = data.y || this.y;
    this.health = data.health || this.health;
    this.spawnX = data.spawnX || this.spawnX;
    this.spawnY = data.spawnY || this.spawnY;
  }
}

export default Player;
