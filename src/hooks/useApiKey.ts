import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { YouTubeAPI } from '../services/youtube-api';
import type { ApiKeyStatus } from '../types';

const OPENAI_KEY_STORAGE = 'openai_api_key';

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const savedYoutubeKey = await storage.getApiKey();
        const savedOpenAIKey = localStorage.getItem(OPENAI_KEY_STORAGE);
        
        if (savedYoutubeKey) {
          setApiKey(savedYoutubeKey);
          setStatus('valid');
        }
        
        if (savedOpenAIKey) {
          setOpenaiApiKey(savedOpenAIKey);
        }
      } catch (err) {
        console.error('Failed to load API keys:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKeys();
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

  const saveOpenAIKey = (key: string) => {
    localStorage.setItem(OPENAI_KEY_STORAGE, key);
    setOpenaiApiKey(key);
  };

  const clearOpenAIKey = () => {
    localStorage.removeItem(OPENAI_KEY_STORAGE);
    setOpenaiApiKey(null);
  };

  const clearKey = () => {
    storage.clearApiKey();
    setApiKey(null);
    setStatus('idle');
    setError(null);
    setLoading(false);
  };

  const clearAllKeys = () => {
    clearKey();
    clearOpenAIKey();
  };

  return {
    // YouTube API
    apiKey,
    status,
    error,
    loading,
    testKey,
    clearKey,
    hasValidKey: status === 'valid' && !!apiKey,
    
    // OpenAI API
    openaiApiKey,
    saveOpenAIKey,
    clearOpenAIKey,
    hasOpenAIKey: !!openaiApiKey,
    
    // 전체
    clearAllKeys,
  };
}
