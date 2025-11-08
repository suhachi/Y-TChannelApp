import { ReactNode } from 'react';
import { useLocation } from '../../lib/simple-router';
import { useUserTier } from '../../../hooks/useUserTier';
import { Sparkles, Lock } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

interface ProGuardProps {
  children: ReactNode;
}

export function ProGuard({ children }: ProGuardProps) {
  const { isPro, upgradeToPro } = useUserTier();

  // Show upgrade prompt if not Pro
  if (!isPro) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border-border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-border">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">Pro 전용 기능</CardTitle>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                  PRO
                </Badge>
              </div>
              <CardDescription className="text-base">
                이 기능은 Pro 멤버십 전용입니다. 업그레이드하여 고급 분석 도구에 액세스하세요.
              </CardDescription>
            </CardHeader>
          </div>
          
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium">Pro 멤버십 혜택:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                  <span>라이징 스타 채널 발굴 - 급성장 채널 자동 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                  <span>블루오션 토픽 분석 - 경쟁이 적은 키워드 발견</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                  <span>고급 AI 인사이트 및 전략 리포트</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                  <span>무제한 분석 및 내보내기</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={upgradeToPro}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Pro 체험하기 (데모)
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              * 현재는 데모 모드입니다. 실제 서비스에서는 결제가 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
