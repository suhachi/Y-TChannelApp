import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { YouTubeAPI } from '../services/youtube-api';
import type { ApiKeyStatus } from '../types';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const savedKey = await storage.getApiKey();
        if (savedKey) {
          setApiKey(savedKey);
          setStatus('valid');
        }
      } catch (err) {
        console.error('Failed to load API key:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKey();
  }, []);

  const testKey = async (key: string) => {
    setStatus('testing');
    setError(null);

    try {
      const api = new YouTubeAPI(key);
      const result = await api.testKey();

      if (result.valid) {
        setStatus('valid');
        setApiKey(key);
        setLoading(false); // Ensure loading is false
        await storage.saveApiKey(key);
      } else {
        const errorStatus = result.error === 'QUOTA_EXCEEDED' ? 'quota_exceeded' :
                           result.error === 'INVALID_API_KEY' ? 'invalid' :
                           'network_error';
        setStatus(errorStatus as ApiKeyStatus);
        setError(result.error || 'Invalid API key');
      }
    } catch (err: any) {
      setStatus('network_error');
      setError(err.message || 'Network error');
    }
  };

  const clearKey = () => {
    storage.clearApiKey();
    setApiKey(null);
    setStatus('idle');
    setError(null);
    setLoading(false);
  };

  return {
    apiKey,
    status,
    error,
    loading,
    testKey,
    clearKey,
    hasValidKey: status === 'valid' && !!apiKey,
  };
}
