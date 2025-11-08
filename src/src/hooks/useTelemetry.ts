import { useEffect } from 'react';
import { useLocation } from '../lib/simple-router';
import { telemetry } from '../lib/telemetry';

/**
 * Track page views automatically
 */
export function useTelemetry() {
  const [location] = useLocation();

  useEffect(() => {
    telemetry.pageView(location);
  }, [location]);

  return { telemetry };
}

/**
 * Track API calls with timing
 */
export function useApiTelemetry() {
  const trackApiCall = async <T,>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      telemetry.apiSuccess(endpoint, duration);
      return result;
    } catch (error: any) {
      telemetry.apiError(endpoint, error.message || 'Unknown error');
      throw error;
    }
  };

  return { trackApiCall };
}
