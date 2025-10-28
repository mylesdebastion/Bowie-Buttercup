/**
 * ConfigLoader - Loads game configuration from vanity URLs
 *
 * Loading hierarchy:
 * 1. Vanity URL slug (/fluffy-happy)
 * 2. localStorage cache
 * 3. Query parameter (?pet=bowie)
 * 4. Default configuration
 */

export class ConfigLoader {
  constructor() {
    this.apiBaseUrl = this.getApiBaseUrl();
    this.cacheKey = 'sparkleclassic_config';
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get API base URL based on environment
   */
  getApiBaseUrl() {
    if (typeof window === 'undefined') return '';

    // Production
    if (window.location.hostname === 'sparkleclassic.com' ||
        window.location.hostname.endsWith('.vercel.app')) {
      return 'https://api.sparkleclassic.com';
    }

    // Development
    return 'http://localhost:3001';
  }

  /**
   * Main entry point - load configuration from best available source
   */
  async loadConfig() {
    console.log('🔧 ConfigLoader: Starting config load...');

    try {
      // 1. Try to extract slug from URL
      const slug = this.extractSlug();

      if (slug) {
        console.log(`🔗 ConfigLoader: Found vanity URL slug: ${slug}`);

        // Check cache first
        const cachedConfig = this.getCachedConfig(slug);
        if (cachedConfig) {
          console.log('💾 ConfigLoader: Using cached config');
          return cachedConfig;
        }

        // Fetch from API
        const apiConfig = await this.fetchFromAPI(slug);
        if (apiConfig) {
          console.log('🌐 ConfigLoader: Loaded config from API');
          this.setCachedConfig(slug, apiConfig);
          return apiConfig;
        }

        console.warn(`⚠️ ConfigLoader: No config found for slug "${slug}"`);
      }

      // 2. Try query parameter
      const queryConfig = this.getQueryParamConfig();
      if (queryConfig) {
        console.log('🔍 ConfigLoader: Using query parameter config');
        return queryConfig;
      }

      // 3. Default configuration
      console.log('📋 ConfigLoader: Using default config');
      return this.getDefaultConfig();

    } catch (error) {
      console.error('❌ ConfigLoader: Error loading config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Extract slug from URL path
   * Pattern: /[petname]-[safeword] or /[petname]-[safeword]-[number]
   */
  extractSlug() {
    if (typeof window === 'undefined') return null;

    const path = window.location.pathname;

    // Remove leading slash
    const slug = path.substring(1);

    // Validate slug format
    if (this.isValidSlug(slug)) {
      return slug;
    }

    return null;
  }

  /**
   * Validate slug format
   * Must be: lowercase alphanumeric + hyphens, 5-50 chars, at least one hyphen
   */
  isValidSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;

    // Must be 5-50 characters
    if (slug.length < 5 || slug.length > 50) return false;

    // Must match pattern: alphanumeric + hyphens
    if (!/^[a-z0-9-]+$/.test(slug)) return false;

    // Must contain at least one hyphen (to separate petname-safeword)
    if (!slug.includes('-')) return false;

    // Must not be a common route
    const reservedPaths = ['api', 'admin', 'designer', 'public', 'assets', 'src'];
    if (reservedPaths.includes(slug.split('-')[0])) return false;

    return true;
  }

  /**
   * Fetch configuration from API
   */
  async fetchFromAPI(slug) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/configs/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`ConfigLoader: Config not found for slug "${slug}"`);
          return null;
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data.slug || !data.petName || !data.configJson) {
        throw new Error('Invalid config response structure');
      }

      return {
        slug: data.slug,
        petName: data.petName,
        config: data.configJson,
        spriteUrl: data.spriteUrl || null,
        source: 'api'
      };

    } catch (error) {
      console.error('ConfigLoader: API fetch error:', error);
      return null;
    }
  }

  /**
   * Get configuration from localStorage cache
   */
  getCachedConfig(slug) {
    try {
      const cached = localStorage.getItem(`${this.cacheKey}_${slug}`);
      if (!cached) return null;

      const data = JSON.parse(cached);

      // Check expiry
      if (Date.now() - data.timestamp > this.cacheExpiry) {
        localStorage.removeItem(`${this.cacheKey}_${slug}`);
        return null;
      }

      return {
        ...data.config,
        source: 'cache'
      };

    } catch (error) {
      console.error('ConfigLoader: Cache read error:', error);
      return null;
    }
  }

  /**
   * Save configuration to localStorage cache
   */
  setCachedConfig(slug, config) {
    try {
      const cacheData = {
        config: config,
        timestamp: Date.now()
      };

      localStorage.setItem(`${this.cacheKey}_${slug}`, JSON.stringify(cacheData));
      console.log(`✅ ConfigLoader: Cached config for "${slug}"`);

    } catch (error) {
      console.error('ConfigLoader: Cache write error:', error);
    }
  }

  /**
   * Clear cached configuration
   */
  clearCache(slug = null) {
    try {
      if (slug) {
        localStorage.removeItem(`${this.cacheKey}_${slug}`);
      } else {
        // Clear all cached configs
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.cacheKey)) {
            localStorage.removeItem(key);
          }
        });
      }
      console.log('🗑️ ConfigLoader: Cache cleared');
    } catch (error) {
      console.error('ConfigLoader: Cache clear error:', error);
    }
  }

  /**
   * Get configuration from query parameter (?pet=bowie)
   */
  getQueryParamConfig() {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const petParam = params.get('pet');

    if (!petParam) return null;

    // Normalize pet name
    const petName = petParam.toLowerCase().trim();

    // Map to known configurations
    const knownPets = {
      'bowie': {
        petName: 'Bowie',
        petType: 'cat',
        spriteSheet: '/bowie_cat_3x3.png',
        personality: 'calm',
        source: 'queryparam'
      },
      'buttercup': {
        petName: 'Buttercup',
        petType: 'cat',
        spriteSheet: '/buttercup_cat_3x3.png',
        personality: 'curious',
        source: 'queryparam'
      }
    };

    return knownPets[petName] || null;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      petName: 'Bowie',
      petType: 'cat',
      spriteSheet: '/bowie_cat_3x3.png',
      personality: 'calm',
      source: 'default'
    };
  }

  /**
   * Sanitize configuration values to prevent XSS
   */
  sanitizeConfig(config) {
    const sanitized = { ...config };

    // Sanitize string fields
    if (sanitized.petName) {
      sanitized.petName = this.sanitizeString(sanitized.petName);
    }

    if (sanitized.spriteUrl) {
      // Only allow HTTPS URLs from trusted domains
      try {
        const url = new URL(sanitized.spriteUrl);
        if (url.protocol !== 'https:' ||
            !url.hostname.includes('sparkleclassic.com') &&
            !url.hostname.includes('googleapis.com')) {
          console.warn('ConfigLoader: Untrusted sprite URL blocked');
          delete sanitized.spriteUrl;
        }
      } catch {
        delete sanitized.spriteUrl;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize string to prevent XSS
   */
  sanitizeString(str) {
    if (typeof str !== 'string') return '';

    // Remove HTML tags and special characters
    return str
      .replace(/[<>\"']/g, '')
      .trim()
      .substring(0, 100); // Max 100 chars
  }
}

// Singleton instance
let configLoaderInstance = null;

/**
 * Get singleton ConfigLoader instance
 */
export function getConfigLoader() {
  if (!configLoaderInstance) {
    configLoaderInstance = new ConfigLoader();
  }
  return configLoaderInstance;
}

export default ConfigLoader;
