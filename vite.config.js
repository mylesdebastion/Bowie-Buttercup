import { defineConfig } from 'vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // Entry point for development
  root: '.',
  
  // Build configuration for single HTML output
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        // Single file output (inline all assets)
        manualChunks: process.env.NODE_ENV === 'production' ? undefined : {
          // Development: split chunks for better debugging
          'vendor': ['./src/utils/EventBus.js'],
          'game-core': ['./src/core/GameEngine.js', './src/core/GameLoop.js'],
          'entities': ['./src/entities/Player.js', './src/entities/Pet.js'],
          'performance': ['./src/performance/PerformanceMonitor.js', './src/performance/MemoryManager.js']
        },
        inlineDynamicImports: process.env.NODE_ENV === 'production',
        assetFileNames: 'assets/[name].[hash:8].[ext]',
        entryFileNames: 'assets/[name].[hash:8].js',
        chunkFileNames: 'assets/[name].[hash:8].js'
      },
      // Tree shaking and dead code elimination
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Target modern browsers (ES2020 for better optimization)
    target: 'es2020',
    // Source maps only in development
    sourcemap: process.env.NODE_ENV !== 'production',
    // Bundle size limits
    chunkSizeWarningLimit: 200, // 200KB warning
    assetsInlineLimit: 4096, // Inline assets under 4KB
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : []
      },
      mangle: {
        properties: {
          regex: /^_private/
        }
      }
    }
  },

  // Development server
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true,
    // Middleware for vanity URL routing
    middlewareMode: false,
    proxy: {}
  },

  // Custom server configuration for vanity URLs
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';

      // Skip API routes
      if (url.startsWith('/api/')) {
        return next();
      }

      // Skip static assets (files with extensions)
      if (url.includes('.') && !url.endsWith('.html')) {
        return next();
      }

      // Skip root path
      if (url === '/' || url === '') {
        return next();
      }

      // Skip explicit paths to src/
      if (url.startsWith('/src/')) {
        return next();
      }

      // Match vanity URL pattern: /petname-safeword or /petname-safeword-number
      const vanityUrlPattern = /^\/([a-z0-9-]+)$/;
      const match = url.match(vanityUrlPattern);

      if (match && match[1]) {
        const slug = match[1];

        // Validate slug format (must have at least one hyphen for petname-safeword)
        if (slug.includes('-')) {
          console.log(`🔀 Vanity URL detected: ${url} → /src/index.html (slug: ${slug})`);
          req.url = '/src/index.html';
        }
      }

      next();
    });
  },

  // Preview server (for testing builds)
  preview: {
    port: 3001,
    open: true
  },

  // CSS configuration
  css: {
    devSourcemap: true
  },

  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.svg'],

  // Plugin configuration
  plugins: [
    // Custom plugin to handle game-specific assets
    {
      name: 'game-assets',
      buildStart() {
        console.log('🎮 Building cat platformer...')
      },
      buildEnd() {
        console.log('✅ Build complete!')
      }
    },
    // Bundle analyzer for production builds
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),

  // Optimization
  optimizeDeps: {
    include: [],
    exclude: []
  },
  

  // Test configuration (for Vitest)
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-utils/setup.js'],
    include: [
      'src/**/*.{test,spec}.js',
      'tests/**/*.{test,spec}.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'test-utils/baseline-*.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.test.js',
        'src/**/*.spec.js'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    }
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0')
  },

  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'assets')
    }
  }
})