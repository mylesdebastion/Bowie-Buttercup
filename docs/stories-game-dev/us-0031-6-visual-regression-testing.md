# User Story US-0031.6: Visual Regression Testing

**Story ID**: US-0031.6  
**Epic**: E0031 - Port Level 1 to Modular Architecture  
**Story Points**: 2  
**Priority**: Medium  
**Status**: Ready  
**Sprint**: 7  

## Story Description

**As a** developer  
**I want** automated visual comparison between monolithic and modular Level 1  
**So that** I can ensure pixel-perfect accuracy  

## Acceptance Criteria

### AC1: Screenshot Comparison Test
- [ ] Automated test captures Level 1 screenshots from both versions
- [ ] Screenshots taken from identical camera positions and timing
- [ ] Platform layout comparison shows <2% pixel difference
- [ ] Test runs automatically in CI/CD pipeline

### AC2: Theme Conversion Documentation
- [ ] Raindrop vs fireball visual comparison documented with screenshots
- [ ] Puddle vs lava visual comparison documented with screenshots  
- [ ] Theme conversion changes clearly documented and approved
- [ ] Visual differences intentional and align with design goals

### AC3: Performance Benchmark Comparison
- [ ] FPS measurement comparison between versions
- [ ] Memory usage comparison during Level 1 gameplay
- [ ] Load time comparison for Level 1 initialization
- [ ] Performance metrics within 5% of monolithic version

### AC4: Collision Detection Accuracy
- [ ] Platform collision areas match exactly between versions
- [ ] Raindrop collision matches fireball collision accuracy
- [ ] Puddle collision area matches lava collision area
- [ ] Player navigation paths identical in both versions

### AC5: Automated Test Integration
- [ ] Visual regression tests run automatically on PR creation
- [ ] Test results reported in PR comments with diff images
- [ ] Tests must pass before merge approval
- [ ] Test failures provide clear guidance for fixes

## Technical Requirements

### Visual Testing Framework
```javascript
// visual-regression-level1.test.js
describe('Level 1 Visual Regression', () => {
  test('Platform layout matches monolithic version', async () => {
    const monolithicScreenshot = await captureMonolithic({
      level: 1,
      position: { x: 0, y: 0 },
      waitMs: 2000
    });
    
    const modularScreenshot = await captureModular({
      level: 1,
      position: { x: 0, y: 0 },
      waitMs: 2000
    });
    
    const diff = await compareImages(
      monolithicScreenshot,
      modularScreenshot,
      { threshold: 0.02 } // 2% pixel difference allowed
    );
    
    expect(diff.percentage).toBeLessThan(0.02);
  });
});
```

### Performance Testing Framework
```javascript
// performance-comparison-level1.test.js
describe('Level 1 Performance Comparison', () => {
  test('FPS maintains within 5% of monolithic', async () => {
    const monolithicFPS = await measureFPS('monolithic', 1, 10000); // 10 second test
    const modularFPS = await measureFPS('modular', 1, 10000);
    
    const fpsVariance = Math.abs(modularFPS - monolithicFPS) / monolithicFPS;
    expect(fpsVariance).toBeLessThan(0.05); // Within 5%
  });
  
  test('Memory usage comparable', async () => {
    const monolithicMemory = await measureMemory('monolithic', 1);
    const modularMemory = await measureMemory('modular', 1);
    
    const memoryVariance = Math.abs(modularMemory - monolithicMemory) / monolithicMemory;
    expect(memoryVariance).toBeLessThan(0.1); // Within 10%
  });
});
```

### Documentation System
```javascript
// Generate visual comparison documentation
const generateThemeComparisonDocs = () => {
  const comparisons = [
    {
      name: 'Fireball vs Raindrop',
      monolithic: './screenshots/level1-fireball.png',
      modular: './screenshots/level1-raindrop.png',
      description: 'Enemy sprites converted from fire to water theme'
    },
    {
      name: 'Lava vs Puddle',
      monolithic: './screenshots/level1-lava.png', 
      modular: './screenshots/level1-puddle.png',
      description: 'Hazard converted from damaging lava to slowing puddle'
    }
  ];
  
  generateComparisonReport(comparisons);
};
```

## Development Tasks

### Task 1: Visual Testing Framework Setup (60 min)
- [ ] Set up Puppeteer-based screenshot capture system
- [ ] Implement image comparison using pixelmatch or similar
- [ ] Create test helpers for monolithic vs modular comparison
- [ ] Configure screenshot capture timing and positioning

### Task 2: Platform Layout Regression Tests (45 min)
- [ ] Create automated tests for platform positioning accuracy
- [ ] Implement pixel-perfect comparison with reasonable thresholds
- [ ] Test multiple camera positions and zoom levels
- [ ] Generate diff images highlighting any differences

### Task 3: Performance Benchmarking System (60 min)
- [ ] Implement FPS measurement during gameplay
- [ ] Add memory usage tracking and comparison
- [ ] Create load time measurement for level initialization
- [ ] Set up automated performance regression detection

### Task 4: Theme Conversion Documentation (45 min)
- [ ] Generate before/after screenshots for theme changes
- [ ] Document intentional visual differences (fireballs→raindrops, lava→puddles)
- [ ] Create comparison report with design rationale
- [ ] Update design documentation with theme conversion decisions

### Task 5: CI/CD Integration (30 min)
- [ ] Integrate visual regression tests into GitHub Actions
- [ ] Configure test results reporting in PR comments
- [ ] Set up test artifact storage for diff images
- [ ] Configure merge protection rules requiring test passage

## Testing Strategy

### Automated Visual Tests
- Platform layout pixel comparison
- Entity positioning accuracy
- Theme conversion verification
- UI element consistency

### Performance Tests
- FPS measurement during active gameplay
- Memory usage tracking over time
- Level loading performance comparison
- Particle effect performance impact

### Manual Verification
- Theme conversion aesthetic review
- Gameplay feel comparison
- Visual polish assessment
- Player experience validation

## Definition of Done

- [ ] Automated visual regression tests pass with <2% pixel difference
- [ ] Theme conversion changes documented and approved
- [ ] Performance benchmarks within 5% of monolithic version
- [ ] Collision detection accuracy verified
- [ ] CI/CD integration working and tests are enforced
- [ ] Test documentation complete and accessible
- [ ] All stakeholders approve visual changes
- [ ] Code reviewed and merged

## Dependencies

- **All Level 1 Stories**: US-0031.1 through US-0031.5 must be complete
- **Testing Infrastructure**: Puppeteer and visual testing framework
- **CI/CD Pipeline**: GitHub Actions or equivalent automation
- **Monolithic Version**: Reference implementation must be stable
- **Performance Tools**: Memory and FPS measurement capabilities

## Risk Assessment

- **Medium Risk**: Screenshot timing and consistency can be challenging
- **Low Risk**: Performance comparison is straightforward measurement
- **Low Risk**: CI/CD integration is well-established practice

## Notes

- Visual regression testing ensures quality and prevents regressions
- Theme conversion documentation helps stakeholders understand changes
- Performance benchmarking validates that modular architecture doesn't hurt performance
- Automated testing reduces manual QA burden for future changes

---

**Created**: 2025-08-27  
**Assigned**: QA Team + Development Team  
**Reviewer**: Technical Lead + Game Design Team