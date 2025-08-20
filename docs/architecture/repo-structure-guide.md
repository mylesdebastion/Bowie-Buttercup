# PetPixel Games - Repository Structure Guide

## Architecture Decision: Strategic Monorepo → Multi-Repo Evolution

**Decision**: Start with monorepo for MVP speed, evolve to multi-repo as components mature.

## Phase 1: MVP Monorepo Structure

```
petpixel-platform/
├── apps/
│   ├── web/                    # Next.js platform application
│   │   ├── src/
│   │   │   ├── pages/          # Next.js pages
│   │   │   ├── components/     # Platform-specific components
│   │   │   └── lib/           # Platform utilities
│   │   └── package.json
│   └── game-engine/           # Shared game framework
│       ├── src/
│       │   ├── core/          # Game engine core
│       │   ├── components/    # Game components
│       │   └── utils/         # Game utilities
│       └── package.json
├── packages/
│   ├── shared-ui/             # Component library (React)
│   │   ├── src/
│   │   │   ├── components/    # Shared UI components
│   │   │   └── styles/        # Design system
│   │   └── package.json
│   ├── auth/                  # Authentication logic
│   │   ├── src/
│   │   │   ├── hooks/         # React auth hooks
│   │   │   └── utils/         # Auth utilities
│   │   └── package.json
│   ├── api-client/            # API client library
│   │   ├── src/
│   │   │   ├── endpoints/     # API endpoint definitions
│   │   │   └── types/         # TypeScript types
│   │   └── package.json
│   └── game-types/            # Shared game type definitions
│       ├── src/
│       │   ├── player/        # Player-related types
│       │   ├── game/          # Game state types
│       │   └── platform/      # Platform integration types
│       └── package.json
├── services/
│   ├── api/                   # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── models/        # Database models
│   │   │   └── services/      # Business logic
│   │   └── package.json
│   └── image-processor/       # Python ML service
│       ├── src/
│       │   ├── processors/    # Image processing modules
│       │   ├── models/        # ML models
│       │   └── api/           # FastAPI endpoints
│       └── requirements.txt
├── game-templates/
│   └── pet-platformer/        # Game template (lean, exportable)
│       ├── src/
│       │   ├── game.js        # Single compiled game file
│       │   └── config.json    # Game configuration template
│       ├── build/
│       │   ├── game.html      # Single HTML file export
│       │   └── game.min.js    # Minified game bundle
│       └── package.json
├── game-content/
│   ├── levels/                # Level definitions (JSON)
│   │   ├── pet-platformer/
│   │   │   ├── level-1.json
│   │   │   ├── level-2.json
│   │   │   └── custom/        # User-generated levels
│   │   └── templates/         # Level templates
│   ├── assets/                # Shared game assets
│   │   ├── sprites/
│   │   ├── sounds/
│   │   └── backgrounds/
│   └── themes/                # Visual themes
│       ├── default/
│       ├── forest/
│       └── space/
├── game-editor/               # Internal development tool
│   ├── src/
│   │   ├── components/        # Editor UI components
│   │   ├── tools/             # Level editing tools
│   │   └── preview/           # Game preview
│   └── package.json
├── shared/
│   ├── database/              # Database schemas & migrations
│   │   ├── migrations/
│   │   └── schemas/
│   └── config/                # Environment configurations
│       ├── development.json
│       ├── staging.json
│       └── production.json
├── tools/
│   ├── build/                 # Build scripts
│   ├── deployment/            # Deployment configurations
│   └── development/           # Dev tooling
├── package.json               # Root package.json (workspace)
├── turbo.json                 # Turborepo configuration
└── tsconfig.json              # Root TypeScript config
```

## Technology Stack

### Platform Core
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 or Cloudinary

### Game Development
- **Game Engine**: Phaser 3 + TypeScript
- **Game Framework**: Custom framework in `apps/game-engine`
- **Asset Management**: Shared asset pipeline
- **Game State**: Redux Toolkit for complex state

### Image Processing
- **ML Service**: Python + FastAPI
- **Image Processing**: OpenCV + PIL
- **AI Models**: Stable Diffusion (Hugging Face)
- **Background Removal**: Remove.bg API or local models

### DevOps & Tooling
- **Monorepo**: Turborepo for build orchestration
- **Package Manager**: pnpm for efficient dependency management
- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Testing Library + Playwright
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

## Development Workflow

### Setup Commands
```bash
# Initial setup
pnpm install
pnpm build

# Development
pnpm dev                    # Start all services
pnpm dev --filter=web       # Start only platform
pnpm dev --filter=api       # Start only backend
pnpm dev --filter=pet-platformer  # Start only game

# Testing
pnpm test                   # Run all tests
pnpm test --filter=web      # Test specific package

# Building
pnpm build                  # Build all packages
pnpm build --filter=web     # Build specific package
```

### Development Order
1. **Platform Core** (`apps/web` + `services/api`)
   - User authentication
   - Image upload pipeline
   - Basic UI framework

2. **Game Engine Foundation** (`apps/game-engine` + `packages/game-types`)
   - Core game framework
   - Platform integration layer
   - Shared game utilities

3. **First Game** (`games/pet-platformer`)
   - Pet platformer implementation
   - Platform integration
   - Game-specific features

## Integration Strategy

### Game-Platform Communication
```typescript
// Platform embeds games via iframe
// Games communicate via postMessage API
interface GamePlatformAPI {
  // From platform to game
  initGame(config: GameConfig): void;
  updatePlayerData(data: PlayerData): void;
  pauseGame(): void;
  
  // From game to platform
  gameReady(): void;
  saveProgress(progress: GameProgress): void;
  requestFeature(feature: PlatformFeature): void;
}
```

### Shared Authentication
```typescript
// Auth token passed from platform to game
// Game validates token with platform API
interface AuthContext {
  token: string;
  userId: string;
  gamePermissions: string[];
}
```

## Migration Path to Multi-Repo

### When to Split
- **Game Modules**: When games become complex (>2-3 games)
- **Platform Services**: When scaling requires independent deployments
- **Team Growth**: When teams need independent release cycles

### Extraction Strategy
1. **Games First**: Extract stable games to `petpixel-game-*` repos
2. **Services**: Extract API service to `petpixel-api` repo
3. **Shared Packages**: Publish to private npm registry

### Benefits of Starting Monorepo
- **Speed**: Faster initial development
- **Simplicity**: Single CI/CD, deployment, dependency management
- **Iteration**: Easy cross-cutting changes during MVP phase
- **Learning**: Better understanding of boundaries before splitting

### Benefits of Future Multi-Repo
- **Independence**: Teams can work independently
- **Scaling**: Services can scale and deploy independently
- **Technology**: Games can use different tech stacks if needed
- **Security**: Separate access controls for different components

## Immediate Next Steps

1. **Setup Monorepo**: Initialize Turborepo structure
2. **Platform Foundation**: Create Next.js app with basic auth
3. **API Service**: Setup Express server with PostgreSQL
4. **Game Engine**: Create Phaser 3 foundation
5. **Integration Layer**: Implement game-platform communication

This approach gives you the speed of monorepo development for MVP while providing a clear path to multi-repo when scaling requirements emerge.