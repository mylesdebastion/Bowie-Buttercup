# 🔴 CRITICAL: Baseline Recording Instructions

**MUST BE DONE BEFORE ANY CODE CHANGES**

## Step 1: Load the Game

1. Open `index.html` in your browser
2. Ensure the game loads completely and all 5 levels work
3. Open browser Developer Tools (F12)

## Step 2: Load Baseline Recording Scripts

Paste these scripts into the browser console:

### Load Physics Recorder
```javascript
// Load physics baseline recorder
const script1 = document.createElement('script');
script1.src = 'test-utils/baseline-recorder.js';
document.head.appendChild(script1);
```

### Load Visual Capture
```javascript
// Load visual baseline capture
const script2 = document.createElement('script');
script2.src = 'test-utils/visual-baseline-capture.js';
document.head.appendChild(script2);
```

## Step 3: Record Physics Baseline

```javascript
// Record all physics scenarios (CRITICAL!)
const physicsRecorder = new PhysicsBaselineRecorder();
await physicsRecorder.recordAllScenarios();
```

**Expected Output:**
- Console shows recording progress for each scenario
- Downloads `physics_baseline_YYYY-MM-DD.json` file
- Console shows "✅ Physics baselines recorded successfully"

## Step 4: Capture Visual Snapshots

```javascript
// Capture all visual states
const visualCapture = new VisualBaselineCapture();
await visualCapture.captureAllStates();
```

**Expected Output:**
- Console shows capture progress for each state
- Downloads `visual_baseline_YYYY-MM-DD.json` file  
- Console shows "✅ Visual baselines captured successfully"

## Step 5: Verify Baselines

Check that these files were downloaded:
- `physics_baseline_YYYY-MM-DD.json` - Physics recordings
- `visual_baseline_YYYY-MM-DD.json` - Visual state metadata

Check localStorage:
```javascript
// Verify baselines saved
console.log('Physics baseline:', !!localStorage.getItem('physics_baseline'));
console.log('Visual baseline:', !!localStorage.getItem('visual_baseline'));
```

## Step 6: Save Baseline Files

1. Move downloaded JSON files to `test-utils/baselines/` directory
2. Commit baseline files to git
3. **ONLY THEN** proceed with modularization

## Critical Physics Scenarios Recorded

1. **jump_arc** - Basic jump physics (120 frames)
2. **coyote_time** - Coyote time window validation (90 frames)  
3. **acceleration** - Movement acceleration curves (150 frames)
4. **platform_collision** - Platform collision response (60 frames)
5. **dodge_roll** - Dodge roll mechanics (60 frames)

## Critical Visual States Captured

- All player animation states (idle, run, jump, crouch, dodge)
- All 5 level screenshots
- UI states (editor, mobile controls, settings)
- Entity states (fireballs, dog, mice, particles)

## ⚠️ WARNING

**DO NOT PROCEED** with any code changes until:
- ✅ Physics baseline recorded successfully
- ✅ Visual snapshots captured successfully  
- ✅ Baseline files saved and committed
- ✅ Console shows no errors

**These baselines are CRITICAL** for validating that modularization preserves exact game behavior.

## Next Steps After Baseline Capture

Only after baselines are captured and saved:

1. Set up build system (US-001)
2. Begin modular extraction
3. Validate against baselines after each change
4. Use baselines for automated regression testing

## Troubleshooting

**If recording fails:**
- Ensure game is fully loaded
- Check console for JavaScript errors
- Verify all 5 levels can be played manually
- Try recording individual scenarios

**If downloads don't work:**
- Check browser download permissions
- Data is still saved in localStorage
- Can manually export via console