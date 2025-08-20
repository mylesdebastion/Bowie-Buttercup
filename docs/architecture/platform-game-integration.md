# Platform-Game Integration Strategy

## Overview

This document defines how games integrate with the PetPixel Games platform, enabling seamless user experience while maintaining modularity for future multi-repo architecture.

## Integration Architecture

### High-Level Flow
```
Platform Web App → Game Loader → Game Instance → Platform APIs
     ↓                ↓              ↓              ↑
User Management → Game Config → Game Events → Progress Sync
```

## Integration Methods

### Method 1: Iframe Integration (Recommended for MVP)

**Platform Side (`apps/web`):**
```typescript
// components/GameContainer.tsx
interface GameContainerProps {
  gameId: string;
  playerData: PlayerData;
  gameConfig: GameConfig;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameId,
  playerData,
  gameConfig
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [gameReady, setGameReady] = useState(false);

  // Listen for messages from game
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const { type, data } = event.data;
      switch (type) {
        case 'GAME_READY':
          setGameReady(true);
          sendToGame('INIT_GAME', { playerData, gameConfig });
          break;
        case 'SAVE_PROGRESS':
          saveGameProgress(gameId, data);
          break;
        case 'GAME_COMPLETE':
          handleGameCompletion(data);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendToGame = (type: string, data: any) => {
    iframeRef.current?.contentWindow?.postMessage({ type, data }, '*');
  };

  return (
    <iframe
      ref={iframeRef}
      src={`/games/${gameId}`}
      className="w-full h-full border-0"
      allow="autoplay; gamepad; microphone"
    />
  );
};
```

**Game Side (`games/pet-platformer`):**
```typescript
// src/platform/PlatformBridge.ts
export class PlatformBridge {
  private static instance: PlatformBridge;
  private gameConfig?: GameConfig;
  private playerData?: PlayerData;

  static getInstance(): PlatformBridge {
    if (!PlatformBridge.instance) {
      PlatformBridge.instance = new PlatformBridge();
    }
    return PlatformBridge.instance;
  }

  init() {
    // Listen for platform messages
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Signal game is ready
    this.sendToPlatform('GAME_READY', {});
  }

  private handleMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    
    const { type, data } = event.data;
    switch (type) {
      case 'INIT_GAME':
        this.gameConfig = data.gameConfig;
        this.playerData = data.playerData;
        this.startGame();
        break;
      case 'PAUSE_GAME':
        this.pauseGame();
        break;
      case 'RESUME_GAME':
        this.resumeGame();
        break;
    }
  }

  sendToPlatform(type: string, data: any) {
    window.parent.postMessage({ type, data }, '*');
  }

  saveProgress(progress: GameProgress) {
    this.sendToPlatform('SAVE_PROGRESS', progress);
  }

  completeGame(result: GameResult) {
    this.sendToPlatform('GAME_COMPLETE', result);
  }
}
```

### Method 2: Web Components (Future Enhancement)

**Platform Registration:**
```typescript
// Register game as web component
customElements.define('pet-platformer-game', PetPlatformerElement);

// Usage in platform
<pet-platformer-game
  player-data={JSON.stringify(playerData)}
  game-config={JSON.stringify(gameConfig)}
  onGameComplete={handleComplete}
/>
```

## Data Integration

### Shared Type Definitions (`packages/game-types`)

```typescript
// src/player/PlayerData.ts
export interface PlayerData {
  id: string;
  username: string;
  petName: string;
  petImageUrl: string;
  petPixelArtUrl: string;
  gameProgress: Record<string, GameProgress>;
  preferences: PlayerPreferences;
}

// src/game/GameConfig.ts
export interface GameConfig {
  gameId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  customization: {
    backgroundColor: string;
    musicEnabled: boolean;
    soundEffectsEnabled: boolean;
  };
  petCustomization: {
    jumpHeight: number;
    speed: number;
    abilities: string[];
  };
}

// src/game/GameProgress.ts
export interface GameProgress {
  currentLevel: number;
  score: number;
  collectibles: number;
  timeElapsed: number;
  lastPlayedAt: Date;
  achievements: string[];
}

// src/platform/GameResult.ts
export interface GameResult {
  completed: boolean;
  finalScore: number;
  levelsCompleted: number;
  totalTime: number;
  newAchievements: string[];
  statistics: GameStatistics;
}
```

### Authentication Integration

```typescript
// packages/auth/src/GameAuth.ts
export class GameAuth {
  static validateGameToken(token: string): Promise<AuthPayload> {
    return fetch('/api/auth/validate-game-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).then(res => res.json());
  }

  static refreshGameSession(gameId: string): Promise<string> {
    return fetch(`/api/auth/refresh-game-session/${gameId}`, {
      method: 'POST',
      credentials: 'include'
    }).then(res => res.text());
  }
}
```

## API Integration

### Game-Specific API Endpoints (`services/api`)

```typescript
// src/routes/games.ts
import express from 'express';

const router = express.Router();

// Get game configuration for player
router.get('/:gameId/config', async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  
  const config = await generateGameConfig(gameId, userId);
  res.json(config);
});

// Save game progress
router.post('/:gameId/progress', async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const progress = req.body;
  
  await saveGameProgress(userId, gameId, progress);
  res.json({ success: true });
});

// Complete game and calculate rewards
router.post('/:gameId/complete', async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.id;
  const result = req.body;
  
  const rewards = await processGameCompletion(userId, gameId, result);
  res.json(rewards);
});

export { router as gamesRouter };
```

### Platform API Client (`packages/api-client`)

```typescript
// src/endpoints/GameAPI.ts
export class GameAPI {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async getGameConfig(gameId: string): Promise<GameConfig> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}/config`, {
      headers: { Authorization: `Bearer ${this.authToken}` }
    });
    return response.json();
  }

  async saveProgress(gameId: string, progress: GameProgress): Promise<void> {
    await fetch(`${this.baseUrl}/games/${gameId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`
      },
      body: JSON.stringify(progress)
    });
  }

  async completeGame(gameId: string, result: GameResult): Promise<GameRewards> {
    const response = await fetch(`${this.baseUrl}/games/${gameId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`
      },
      body: JSON.stringify(result)
    });
    return response.json();
  }
}
```

## Asset Integration

### Shared Asset Pipeline

```typescript
// apps/game-engine/src/assets/AssetManager.ts
export class AssetManager {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  loadPlayerAssets(playerData: PlayerData): Promise<PlayerAssets> {
    return Promise.all([
      this.loadPetSprite(playerData.petPixelArtUrl),
      this.loadCustomBackgrounds(playerData.preferences.backgrounds),
      this.loadPlayerAchievementBadges(playerData.achievements)
    ]).then(([petSprite, backgrounds, badges]) => ({
      petSprite,
      backgrounds,
      badges
    }));
  }

  private loadPetSprite(url: string): Promise<Phaser.Textures.Texture> {
    // Load and process pet pixel art for game use
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        // Process image for Phaser sprite sheets
        resolve(this.createSpriteSheet(image));
      };
      image.src = url;
    });
  }
}
```

## Development Workflow

### Local Development Setup

1. **Start Platform Development Server:**
   ```bash
   pnpm dev --filter=web
   ```

2. **Start Game Development Server:**
   ```bash
   pnpm dev --filter=pet-platformer
   ```

3. **Platform serves games at:**
   - Platform: `http://localhost:3000`
   - Game iframe: `http://localhost:3000/games/pet-platformer`

### Testing Integration

```typescript
// tests/integration/GameIntegration.test.ts
describe('Game Platform Integration', () => {
  test('should load game with player data', async () => {
    const player = await createTestPlayer();
    const gameContainer = render(<GameContainer gameId="pet-platformer" playerData={player} />);
    
    // Wait for game to load
    await waitFor(() => expect(gameContainer.getByTestId('game-iframe')).toBeInTheDocument());
    
    // Verify game receives player data
    expect(mockGameBridge.receivedPlayerData).toEqual(player);
  });

  test('should save game progress', async () => {
    const progress = { currentLevel: 2, score: 1500 };
    
    // Simulate game sending progress
    mockGameBridge.sendProgress(progress);
    
    // Verify platform saves progress
    await waitFor(() => expect(mockAPI.saveProgress).toHaveBeenCalledWith('pet-platformer', progress));
  });
});
```

## Security Considerations

### Cross-Origin Communication
- Validate message origin
- Sanitize all data passed between platform and game
- Use structured message types

### Authentication
- Games receive temporary auth tokens
- Tokens expire after game session
- All API calls validated on server

### Data Validation
```typescript
// Validate all game data on platform side
const gameResultSchema = z.object({
  completed: z.boolean(),
  finalScore: z.number().min(0).max(999999),
  levelsCompleted: z.number().min(0).max(50),
  // ... other validations
});

export function validateGameResult(data: unknown): GameResult {
  return gameResultSchema.parse(data);
}
```

## Deployment Strategy

### Development
- Platform and games served from same domain
- Hot reload for both platform and game code

### Production
- Games bundled and served as static assets
- Platform serves games from `/games/` route
- CDN for game assets and optimized delivery

This integration strategy provides the foundation for seamless platform-game communication while maintaining the flexibility to evolve to multi-repo architecture as the platform scales.