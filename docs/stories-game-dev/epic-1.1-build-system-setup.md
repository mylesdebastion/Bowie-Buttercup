# US-001: Modern Build System Setup

**Story ID**: US-001  
**Epic**: [Epic 1: Core Architecture Setup](../epics/epic-1-foundation.md)  
**Story Points**: 5  
**Priority**: High  
**Sprint**: Week 1, Days 1-2  

## User Story

**As a** developer  
**I want** a modern build system with ES6 modules and hot reload  
**So that** I can develop efficiently with modern tooling and faster iteration cycles  

## Business Value

Establishes the foundation for all modularization work and significantly improves developer productivity through modern tooling.

## Acceptance Criteria

### AC-001: Development Server
- **Given** I have the project set up locally
- **When** I run `npm run dev`
- **Then** a development server starts on localhost with the game functional
- **And** hot module replacement works for all JavaScript files
- **And** changes are reflected in browser without manual refresh

### AC-002: Production Build
- **Given** the development build is working
- **When** I run `npm run build`
- **Then** a production-optimized bundle is created
- **And** the bundle size is equal or smaller than original (target: <200KB gzipped)
- **And** the game functions identically to the original

### AC-003: Source Maps
- **Given** the build system is configured
- **When** I debug in browser DevTools
- **Then** I can set breakpoints in original source files
- **And** stack traces show original file names and line numbers
- **And** debugging experience is superior to original monolithic file

### AC-004: Code Quality Tools
- **Given** the build system is set up
- **When** I run `npm run lint`
- **Then** ESLint checks all JavaScript files
- **And** zero warnings are allowed in the codebase
- **And** consistent code formatting is enforced

## Technical Tasks

### Task 1: Project Initialization
- [ ] Initialize npm project with `package.json`
- [ ] Install Vite 4.x as build tool
- [ ] Configure Vite for vanilla JavaScript project
- [ ] Set up npm scripts for development and production

### Task 2: Development Server Configuration
- [ ] Configure Vite dev server with hot module replacement
- [ ] Set up proper MIME types for all assets
- [ ] Configure port and host settings for development
- [ ] Test HMR with sample module changes

### Task 3: Production Build Setup
- [ ] Configure Vite production build with optimization
- [ ] Set up CSS extraction and minification
- [ ] Configure asset hashing for cache busting
- [ ] Implement bundle size monitoring

### Task 4: Code Quality Integration
- [ ] Install and configure ESLint with appropriate rules
- [ ] Set up Prettier for code formatting
- [ ] Configure pre-commit hooks for quality checks
- [ ] Create npm scripts for linting and formatting

### Task 5: Documentation and Verification
- [ ] Create development setup documentation
- [ ] Test build system on clean environment
- [ ] Verify cross-platform compatibility (Windows/Mac/Linux)
- [ ] Document troubleshooting common issues

## Definition of Done

- [ ] `npm run dev` starts development server with HMR
- [ ] `npm run build` creates production bundle under target size
- [ ] `npm run lint` passes with zero warnings
- [ ] Source maps work correctly for debugging
- [ ] Documentation is complete and tested
- [ ] Build system tested on multiple environments
- [ ] Performance benchmarks collected for baseline

## Dependencies

- Node.js 18+ installed on development machines
- npm or yarn package manager available

## Story Points Breakdown

- Project setup and configuration: 2 points
- Development server and HMR: 1.5 points  
- Production build optimization: 1 point
- Code quality tools: 0.5 points

## Testing Strategy

- Automated testing of build processes in CI/CD
- Cross-platform build verification
- Performance comparison with original bundle size
- Developer experience validation with team members