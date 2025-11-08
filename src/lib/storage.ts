// Secure browser storage for API keys and cache
import { secureStorage } from '../src/lib/secure-storage';

const CACHE_PREFIX = 'yt_cache_';

export const storage = {
  // API Key management (using WebCrypto)
  saveApiKey: async (key: string): Promise<boolean> => {
    return await secureStorage.saveApiKey(key);
  },

  getApiKey: async (): Promise<string | null> => {
    return await secureStorage.getApiKey();
  },

  clearApiKey: (): void => {
    secureStorage.clearApiKey();
  },

  // Cache management
  setCache: (key: string, data: any, ttlMinutes: number = 360): void => {
    try {
      const item = {
        data,
        expiry: Date.now() + ttlMinutes * 60 * 1000,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  },

  getCache: (key: string): any => {
    try {
      const itemStr = localStorage.getItem(CACHE_PREFIX + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  },

  clearCache: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  // User tier
  setUserTier: (tier: 'basic' | 'pro'): void => {
    localStorage.setItem('user_tier', tier);
  },

  getUserTier: (): 'basic' | 'pro' => {
    return (localStorage.getItem('user_tier') as 'basic' | 'pro') || 'basic';
  },
};
