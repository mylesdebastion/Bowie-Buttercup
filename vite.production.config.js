/**
 * Vite Production Configuration - Epic E006
 * 
 * Optimized production build configuration with:
 * - Maximum compression and minification
 * - Bundle analysis capabilities
 * - Performance monitoring integration
 * - Single-file output for deployment
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: '.',
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // Rollup configuration for optimal production builds
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      },
      output: {
        // Single file output for game distribution
        inlineDynamicImports: true,
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpg|jpeg|gif|svg|ico|webp)$/.test(assetInfo.name)) {
            return `assets/images/[name].[hash:8].[ext]`;
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name].[hash:8].[ext]`;
          }
          if (/\.(mp3|wav|ogg|flac)$/.test(assetInfo.name)) {
            return `assets/audio/[name].[hash:8].[ext]`;
          }
          
          return `assets/[name].[hash:8].[ext]`;
        },
        entryFileNames: 'assets/game.[hash:8].js',
        chunkFileNames: 'assets/[name].[hash:8].js'
      },
      
      // Aggressive tree shaking for production
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        tryCatchDeoptimization: false
      },
      
      // External dependencies (if any)
      external: []
    },
    
    // Target modern browsers for optimal code generation
    target: ['es2020', 'chrome80', 'firefox75', 'safari13'],
    
    // No source maps in production
    sourcemap: false,
    
    // Bundle size optimization
    chunkSizeWarningLimit: 200, // 200KB warning threshold
    assetsInlineLimit: 8192, // Inline assets under 8KB
    
    // Aggressive minification with Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log, console.info, debugger statements
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        
        // Aggressive compression options
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        
        // Remove unused code
        dead_code: true,
        drop_unreachable: true,
        unused: true,
        
        // Optimize expressions
        collapse_vars: true,
        reduce_vars: true,
        pure_getters: true,
        keep_infinity: true,
        
        // String/number optimizations
        evaluate: true,
        inline: 2,
        join_vars: true,
        loops: true,
        negate_iife: true,
        sequences: true,
        
        // Conditionals optimization
        conditionals: true,
        if_return: true,
        merge_vars: true,
        reduce_funcs: true
      },
      
      mangle: {
        // Mangle all names aggressively
        toplevel: true,
        eval: true,
        keep_classnames: false,
        keep_fnames: false,
        
        // Mangle private properties (prefixed with _)
        properties: {
          regex: /^_/,
          keep_quoted: false
        }
      },
      
      format: {
        // Minimize output
        comments: false,
        beautify: false,
        semicolons: false,
        shebang: false
      }
    },
    
    // CSS optimization
    cssCodeSplit: false, // Inline CSS for single file output
    cssMinify: true,
    
    // Optimize chunk loading
    modulePreload: {
      polyfill: false // No polyfill needed for modern browsers
    },
    
    // Rollup plugin optimizations
    reportCompressedSize: true,
    
    // Force optimization of all modules
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  
  // Plugin configuration for production
  plugins: [
    // Custom game asset optimization
    {
      name: 'game-production-optimizer',
      buildStart() {
        console.log('🎮 Building optimized production game bundle...');
      },
      buildEnd(error) {
        if (error) {
          console.error('❌ Production build failed:', error);
        } else {
          console.log('✅ Production build complete - optimized for deployment!');
        }
      },
      generateBundle(options, bundle) {
        // Log bundle information
        const chunks = Object.keys(bundle).filter(key => bundle[key].type === 'chunk');
        const assets = Object.keys(bundle).filter(key => bundle[key].type === 'asset');
        
        console.log(`📦 Bundle contains ${chunks.length} chunks and ${assets.length} assets`);
        
        // Calculate total bundle size
        let totalSize = 0;
        Object.values(bundle).forEach(item => {
          if (item.type === 'chunk') {
            totalSize += item.code.length;
          } else if (item.type === 'asset') {
            totalSize += item.source.length;
          }
        });
        
        console.log(`📏 Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
        
        if (totalSize > 200 * 1024) {
          console.warn(`⚠️  Bundle size exceeds 200KB target: ${(totalSize / 1024).toFixed(2)} KB`);
        }
      }
    },
    
    // Bundle analyzer (only if ANALYZE env var is set)
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
  
  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle dependencies for faster development
    include: [],
    exclude: []
  },
  
  // Asset handling
  assetsInclude: [
    '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg',
    '**/*.mp3', '**/*.wav', '**/*.ogg',
    '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf'
  ],
  
  // Define global constants for production
  define: {
    __DEV__: JSON.stringify(false),
    __PROD__: JSON.stringify(true),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '2.0.0'),
    
    // Performance monitoring in production
    __PERFORMANCE_MONITORING__: JSON.stringify(true),
    __BUNDLE_ANALYSIS__: JSON.stringify(!!process.env.ANALYZE)
  },
  
  // ESBuild configuration for final optimization
  esbuild: {
    target: 'es2020',
    
    // Remove all console output and debugger statements
    drop: ['console', 'debugger'],
    
    // Optimize for size over speed
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    
    // Legal comments handling
    legalComments: 'none',
    
    // Pure annotation for better tree shaking
    pure: ['console.log', 'console.warn', 'console.error'],
    
    // Keep names in production for better debugging if needed
    keepNames: false
  },
  
  // Server configuration for testing production build
  preview: {
    port: 3001,
    host: true,
    open: true,
    cors: true,
    headers: {
      'Cache-Control': 'max-age=31536000',
      'Content-Encoding': 'gzip',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'assets'),
      '@performance': resolve(__dirname, 'src/performance')
    }
  }
});