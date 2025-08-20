import puppeteer from 'puppeteer';

(async () => {
    console.log('🔍 Starting visual debugging...');
    
    const browser = await puppeteer.launch({
        headless: false, // Show browser window
        devtools: true,  // Open devtools
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        if (type === 'error') {
            console.error('❌ Page error:', msg.text());
        } else {
            console.log(`📝 Console ${type}:`, msg.text());
        }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
        console.error('❌ Page error:', error.message);
    });
    
    // Navigate to the game
    console.log('🌐 Loading game...');
    await page.goto('http://localhost:8080/index.html', {
        waitUntil: 'networkidle2'
    });
    
    // Wait a bit for game to initialize
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ 
        path: 'debug-game-state.png',
        fullPage: true 
    });
    console.log('📸 Screenshot saved as debug-game-state.png');
    
    // Try to get game state
    const gameState = await page.evaluate(() => {
        if (typeof game !== 'undefined' && game) {
            return {
                exists: true,
                currentLevel: game.currentLevel,
                playerExists: !!game.player,
                playerX: game.player ? game.player.x : null,
                playerY: game.player ? game.player.y : null,
                levelExists: !!game.level,
                levelLength: game.level ? game.level.length : 0
            };
        }
        return { exists: false };
    });
    
    console.log('🎮 Game state:', JSON.stringify(gameState, null, 2));
    
    // Check for JavaScript errors
    const errors = await page.evaluate(() => {
        return window.__errors || [];
    });
    
    if (errors.length > 0) {
        console.error('❌ JavaScript errors found:', errors);
    }
    
    // Get canvas state
    const canvasState = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, 10, 10);
            const hasContent = imageData.data.some(pixel => pixel !== 0);
            return {
                exists: true,
                width: canvas.width,
                height: canvas.height,
                hasContent: hasContent
            };
        }
        return { exists: false };
    });
    
    console.log('🖼️ Canvas state:', JSON.stringify(canvasState, null, 2));
    
    // Check what's visible on screen
    const visibleElements = await page.evaluate(() => {
        const elements = {
            canvas: !!document.getElementById('gameCanvas'),
            leftPanel: !!document.getElementById('leftPanel'),
            debugPanel: !!document.getElementById('debugPanel'),
            gameTitle: document.querySelector('h2') ? document.querySelector('h2').textContent : null
        };
        return elements;
    });
    
    console.log('👁️ Visible elements:', JSON.stringify(visibleElements, null, 2));
    
    console.log('\n🔍 Keeping browser open for inspection...');
    console.log('Press Ctrl+C to close');
    
    // Keep browser open
    await new Promise(() => {});
})().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});