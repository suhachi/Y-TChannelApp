import { ExternalLink, CheckCircle2, AlertCircle, Copy, ChevronRight } from './icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useState } from 'react';
import { toast } from '../../components/ui/sonner';

export function ApiKeyGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    toast.success('복사되었습니다!');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: 'Google Cloud Console 접속',
      description: 'Google Cloud 프로젝트를 생성하기 위해 콘솔에 접속합니다',
      action: {
        label: 'Google Cloud Console 열기',
        url: 'https://console.cloud.google.com/',
        external: true,
      },
      details: [
        'Google 계정으로 로그인하세요',
        '처음 사용하는 경우 약관 동의가 필요합니다',
        '무료 크레딧 $300이 제공됩니다 (신규 가입 시)',
      ],
    },
    {
      title: '새 프로젝트 생성',
      description: 'YouTube 채널 컨설턴트 전용 프로젝트를 만듭니다',
      details: [
        '상단 프로젝트 선택 드롭다운 클릭',
        '"새 프로젝트" 버튼 클릭',
        '프로젝트 이름 입력 (예: "youtube-consultant")',
        '"만들기" 버튼 클릭',
        '⏱️ 프로젝트 생성까지 약 30초 소요',
      ],
      warning: '프로젝트 이름은 전역적으로 고유해야 합니다',
    },
    {
      title: 'YouTube Data API v3 활성화',
      description: 'API 라이브러리에서 YouTube API를 검색하고 활성화합니다',
      action: {
        label: 'API 라이브러리로 이동',
        url: 'https://console.cloud.google.com/apis/library',
        external: true,
      },
      details: [
        '검색창에 "YouTube Data API v3" 입력',
        'YouTube Data API v3 선택 (빨간 YouTube 로고)',
        '"사용" 또는 "Enable" 버튼 클릭',
        '✅ 활성화 완료되면 대시보드로 이동',
      ],
      copyableText: 'YouTube Data API v3',
    },
    {
      title: 'API 키 생성',
      description: '사용자 인증 정보를 만들어 API 키를 발급받습니다',
      action: {
        label: '사용자 인증 정보로 이동',
        url: 'https://console.cloud.google.com/apis/credentials',
        external: true,
      },
      details: [
        '상단 "+ 사용자 인증 정보 만들기" 클릭',
        '"API 키" 선택',
        '🎉 API 키가 즉시 생성됩니다',
        '"키 제한" 버튼 클릭하여 보안 설정으로 이동',
      ],
    },
    {
      title: 'API 키 제한 설정 (보안 강화)',
      description: 'API 키 보안을 위해 제한 사항을 설정합니다',
      details: [
        '**애플리케이션 제한사항**:',
        '  • "HTTP 리퍼러(웹사이트)" 선택',
        '  • 웹사이트 제한사항에 도메인 추가',
        '  • 예시: "localhost:*", "*.yourdomain.com/*"',
        '',
        '**API 제한사항**:',
        '  • "키 제한" 선택',
        '  • "YouTube Data API v3" 체크',
        '',
        '💡 로컬 개발: "HTTP 리퍼러"에 "localhost:*" 추가',
        '🌐 배포 시: 실제 도메인 추가',
        '',
        '"저장" 버튼 클릭',
      ],
      warning: '제한 없는 API 키는 악용될 수 있으니 반드시 설정하세요!',
    },
    {
      title: 'API 키 복사 및 테스트',
      description: '생성된 API 키를 복사하고 앱에서 테스트합니다',
      details: [
        'API 키 옆의 복사 아이콘 클릭',
        '이 페이지의 "API 키 등록" 섹션으로 돌아가기',
        'API 키 입력란에 붙여넣기',
        '"테스트 및 저장" 버튼 클릭',
        '✅ "연결됨" 상태 확인',
      ],
    },
  ];

  const quotaInfo = [
    {
      label: '일일 할당량',
      value: '10,000 units',
      description: '무료 플랜 기본 할당량',
    },
    {
      label: '채널 검색',
      value: '~100 units',
      description: '채널 1개 검색 비용',
    },
    {
      label: '영상 목록',
      value: '~1 unit',
      description: '영상 정보 조회 비용 (50개당)',
    },
    {
      label: '예상 분석 가능',
      value: '약 50-100회/일',
      description: '채널 + 영상 분석 기준',
    },
  ];

  const troubleshooting = [
    {
      problem: '"API 키가 유효하지 않습니다" 오류',
      solutions: [
        'API 키를 정확히 복사했는지 확인 (공백 없이)',
        'YouTube Data API v3가 활성화되었는지 확인',
        'API 키 제한사항에서 현재 도메인이 허용되었는지 확인',
        '키 생성 후 적용까지 최대 5분 소요될 수 있음',
      ],
    },
    {
      problem: '"할당량 초과" (QUOTA_EXCEEDED) 오류',
      solutions: [
        '일일 할당량 10,000 units 초과',
        '다음 날 00:00 (태평양 시간)에 리셋됨',
        '검색 범위를 줄여보세요 (100개 → 50개)',
        '할당량 증가 요청: Google Cloud Console에서 신청 가능',
      ],
    },
    {
      problem: 'CORS 오류',
      solutions: [
        'HTTP 리퍼러 제한사항 확인',
        'localhost 개발 시: "localhost:*" 추가 필수',
        '배포 환경: 실제 도메인 추가 필수',
        '와일드카드 사용 가능: "*.yourdomain.com/*"',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl">📘 YouTube Data API v3 키 발급 가이드</h2>
        <p className="text-lg text-muted-foreground">
          단계별로 따라하시면 5분 안에 API 키를 발급받을 수 있습니다
        </p>
      </div>

      <Alert className="bg-blue-500/10 border-blue-500/30">
        <AlertCircle className="w-4 h-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>중요:</strong> YouTube Data API v3는 완전 무료이며, 일일 10,000 units의 할당량이 제공됩니다. 
          신용카드 등록이 필요하지만 <strong>자동 결제되지 않습니다</strong>.
        </AlertDescription>
      </Alert>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={index} className="border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#ef4444] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground mt-2" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {step.action && (
                <Button
                  variant="outline"
                  className="w-full justify-between border-[#ef4444]/30 hover:bg-[#ef4444]/10"
                  onClick={() => window.open(step.action!.url, '_blank')}
                >
                  <span>{step.action.label}</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              <div className="space-y-2">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {detail.startsWith('**') ? (
                      <p className="text-muted-foreground pl-0 font-medium">{detail.replace(/\*\*/g, '')}</p>
                    ) : detail.startsWith('  •') ? (
                      <p className="text-muted-foreground pl-6">{detail}</p>
                    ) : detail === '' ? (
                      <div className="h-2" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">{detail}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {step.copyableText && (
                <div className="flex items-center gap-2 p-3 bg-accent rounded-lg border border-border">
                  <code className="flex-1 text-sm">{step.copyableText}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(step.copyableText!, index)}
                    className="h-8"
                  >
                    {copiedStep === index ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}

              {step.warning && (
                <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <AlertDescription className="text-amber-200">
                    {step.warning}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Quota Information */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💰 할당량 (Quota) 안내</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              무료
            </Badge>
          </CardTitle>
          <CardDescription>
            YouTube Data API v3의 무료 할당량 정보
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quotaInfo.map((info, index) => (
              <div key={index} className="p-4 bg-accent/50 rounded-lg border border-border">
                <div className="text-xs text-muted-foreground mb-1">{info.label}</div>
                <div className="text-xl text-[#ef4444] mb-1">{info.value}</div>
                <div className="text-xs text-muted-foreground">{info.description}</div>
              </div>
            ))}
          </div>

          <Alert className="mt-4 bg-emerald-500/10 border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <AlertDescription className="text-emerald-200">
              <strong>할당량 팁:</strong> 이 앱은 효율적인 API 호출을 위해 캐싱을 사용하며, 
              한 번 분석한 데이터는 6시간 동안 재사용됩니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Separator />

      {/* Troubleshooting */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔧 문제 해결 (Troubleshooting)</span>
          </CardTitle>
          <CardDescription>
            자주 발생하는 문제와 해결 방법
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {troubleshooting.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-2">{item.problem}</h4>
                  <div className="space-y-2">
                    {item.solutions.map((solution, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-[#ef4444] mt-0.5">•</span>
                        <span>{solution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {index < troubleshooting.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
        <CardHeader>
          <CardTitle>📚 추가 자료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-between border-border"
            onClick={() => window.open('https://developers.google.com/youtube/v3/getting-started', '_blank')}
          >
            <span>YouTube Data API v3 공식 문서</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between border-border"
            onClick={() => window.open('https://developers.google.com/youtube/v3/determine_quota_cost', '_blank')}
          >
            <span>API 호출 비용 계산기</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between border-border"
            onClick={() => window.open('https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas', '_blank')}
          >
            <span>현재 할당량 사용량 확인</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          size="lg"
          className="bg-[#ef4444] hover:bg-[#dc2626]"
          onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Google Cloud Console 바로가기
        </Button>
      </div>
    </div>
  );
}
