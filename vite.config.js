import { defineConfig } from 'vite'
import { resolve } from 'path'

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
        manualChunks: undefined,
        inlineDynamicImports: true,
        assetFileNames: 'assets/[name].[ext]',
        entryFileNames: 'assets/[name].js'
      }
    },
    // Target modern browsers (ES6 modules)
    target: 'es2020',
    // Source maps for debugging
    sourcemap: true,
    // Bundle size limits
    chunkSizeWarningLimit: 200, // 200KB warning
    assetsInlineLimit: 0 // Don't inline assets by default
  },

  // Development server
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
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
    }
  ],

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