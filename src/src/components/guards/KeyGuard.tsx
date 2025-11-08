import { ReactNode } from 'react';
import { useLocation, Redirect } from '../../lib/simple-router';
import { useApiKey } from '../../../hooks/useApiKey';
import { Loader2, Key } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface KeyGuardProps {
  children: ReactNode;
}

export function KeyGuard({ children }: KeyGuardProps) {
  const [, setLocation] = useLocation();
  const { hasValidKey, loading } = useApiKey();

  // Show loading state while checking API key
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#ef4444] animate-spin mx-auto" />
          <p className="text-muted-foreground">API 키 확인 중...</p>
        </div>
      </div>
    );
  }

  // Redirect to setup if no valid key
  if (!hasValidKey) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-border">
          <CardHeader>
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <CardTitle>API 키가 필요합니다</CardTitle>
            <CardDescription>
              이 기능을 사용하려면 먼저 YouTube Data API v3 키를 설정해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/setup')}
              className="w-full bg-[#ef4444] hover:bg-[#dc2626]"
            >
              API 키 설정하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
