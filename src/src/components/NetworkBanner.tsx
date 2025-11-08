import { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from './icons';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface NetworkBannerProps {
  quotaExceeded?: boolean;
  onRetry?: () => void;
}

export function NetworkBanner({ quotaExceeded, onRetry }: NetworkBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (quotaExceeded) {
    return (
      <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-400">
          <strong>쿼터 초과:</strong> YouTube API 일일 할당량을 초과했습니다. 
          내일 재시도하거나 검색 범위를 축소하세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isOnline) {
    return (
      <Alert className="mb-4 border-red-500/30 bg-red-500/10">
        <WifiOff className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-400">
          <strong>오프라인:</strong> 인터넷 연결을 확인하세요. 
          {onRetry && (
            <button 
              onClick={onRetry}
              className="ml-2 underline hover:text-red-300"
            >
              다시 시도
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
