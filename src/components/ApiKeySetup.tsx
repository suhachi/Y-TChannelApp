import { useState } from 'react';
import { Eye, EyeOff, Key, AlertCircle, CheckCircle2, Loader2, ExternalLink, BookOpen } from '../src/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApiKey } from '../hooks/useApiKey';
import { ApiKeyGuide } from '../src/components/ApiKeyGuide';

export function ApiKeySetup() {
  const [inputKey, setInputKey] = useState('');
  const [inputOpenAIKey, setInputOpenAIKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const { 
    apiKey, 
    status, 
    error, 
    testKey, 
    clearKey, 
    hasValidKey,
    openaiApiKey,
    saveOpenAIKey,
    clearOpenAIKey,
    hasOpenAIKey
  } = useApiKey();

  const handleTest = async () => {
    if (!inputKey.trim()) return;
    await testKey(inputKey.trim());
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />연결됨</Badge>;
      case 'invalid':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" />유효하지 않음</Badge>;
      case 'quota_exceeded':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30"><AlertCircle className="w-3 h-3 mr-1" />쿼터 초과</Badge>;
      case 'network_error':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" />네트워크 오류</Badge>;
      case 'testing':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30"><Loader2 className="w-3 h-3 mr-1 animate-spin" />테스트 중...</Badge>;
      default:
        return null;
    }
  };

  const getErrorMessage = () => {
    switch (status) {
      case 'invalid':
        return 'API 키가 유효하지 않습니다. 설정에서 키를 확인/교체하세요.';
      case 'quota_exceeded':
        return '일일 쿼터를 초과했습니다. 내일 재시도하거나 범위를 축소하세요.';
      case 'network_error':
        return '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.';
      default:
        return error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ef4444]/10 rounded-2xl mb-4">
          <Key className="w-8 h-8 text-[#ef4444]" />
        </div>
        <h1 className="text-4xl">API 키 설정</h1>
        <p className="text-lg text-muted-foreground">
          YouTube Data API v3 키를 등록하여 채널 분석을 시작하세요
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-accent">
          <TabsTrigger value="setup">
            <Key className="w-4 h-4 mr-2" />
            API 키 등록
          </TabsTrigger>
          <TabsTrigger value="guide">
            <BookOpen className="w-4 h-4 mr-2" />
            발급 가이드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* API Key Input Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>API 키 등록</CardTitle>
                <CardDescription>
                  YouTube Data API v3 키를 입력하고 테스트하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      placeholder="AIza..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      disabled={status === 'testing'}
                      className="pr-10 h-12 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTest}
                      disabled={!inputKey.trim() || status === 'testing'}
                      className="flex-1 h-11 bg-[#ef4444] hover:bg-[#dc2626]"
                    >
                      {status === 'testing' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          테스트 중...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          테스트 & 저장
                        </>
                      )}
                    </Button>
                    {hasValidKey && (
                      <Button variant="outline" onClick={clearKey} className="h-11 border-border">
                        초기화
                      </Button>
                    )}
                  </div>
                </div>

                {status !== 'idle' && status !== 'testing' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">상태:</span>
                      {getStatusBadge()}
                    </div>

                    {(status === 'invalid' || status === 'quota_exceeded' || status === 'network_error') && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{getErrorMessage()}</AlertDescription>
                      </Alert>
                    )}

                    {status === 'valid' && (
                      <Alert className="bg-emerald-500/10 border-emerald-500/30">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <AlertDescription className="text-emerald-400">
                          API 키가 저장되었습니다. 이제 채널 분석을 시작할 수 있습니다.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {hasValidKey && apiKey && (
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      저장된 키: <span className="text-foreground font-mono">{apiKey.substring(0, 15)}...</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Guide Card */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>빠른 가이드</CardTitle>
                <CardDescription>
                  간단한 4단계로 API 키 발급하기
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-[#ef4444]">1</span>
                      </div>
                      <div>
                        <p className="text-sm">Google Cloud Console 접속</p>
                        <a
                          href="https://console.cloud.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#ef4444] hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          console.cloud.google.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-[#ef4444]">2</span>
                      </div>
                      <div>
                        <p className="text-sm">YouTube Data API v3 활성화</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          APIs & Services → Enable APIs & Services
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-[#ef4444]">3</span>
                      </div>
                      <div>
                        <p className="text-sm">사용자 인증 정보 생성</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Credentials → Create Credentials → API Key
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm text-[#ef4444]">4</span>
                      </div>
                      <div>
                        <p className="text-sm">API 키 제한 설정 (권장)</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          도메인 제한 및 YouTube Data API v3만 허용
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/30">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-sm text-blue-400">
                    <strong className="block mb-2">보안 주의사항</strong>
                    <ul className="space-y-1 text-sm">
                      <li>• API 키를 공개적으로 공유하지 마세요</li>
                      <li>• 도메인 제한을 설정하세요</li>
                      <li>• 일일 쿼터: 10,000 units (기본)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button
                  variant="outline"
                  className="w-full border-[#ef4444]/30"
                  onClick={() => setActiveTab('guide')}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  자세한 가이드 보기
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* OpenAI API 키 (선택사항) */}
          <Card className="border-border border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 text-sm">AI</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>OpenAI API 키</CardTitle>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400">선택사항</Badge>
                  </div>
                  <CardDescription>
                    GPT-4o로 강화된 AI 인사이트 생성 (선택사항)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-purple-500/10 border-purple-500/30">
                <AlertCircle className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-sm text-purple-400">
                  <strong className="block mb-2">🎉 AI 인사이트 기능</strong>
                  <p className="mb-2">
                    OpenAI API 키를 추가하면 실제 GPT-4o가 채널을 분석합니다:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li>• 맞춤형 성장 전략 제안</li>
                    <li>• 경쟁사 심층 분석</li>
                    <li>• 콘텐츠 최적화 인사이트</li>
                    <li>• 블루오션 기회 발견</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    키가 없어도 기본 분석은 가능합니다 (시뮬레이션 모드)
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={inputOpenAIKey}
                    onChange={(e) => setInputOpenAIKey(e.target.value)}
                    className="pr-10 h-12 bg-background border-purple-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (inputOpenAIKey.trim()) {
                        saveOpenAIKey(inputOpenAIKey.trim());
                      }
                    }}
                    disabled={!inputOpenAIKey.trim()}
                    className="flex-1 h-11 bg-purple-600 hover:bg-purple-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                  {hasOpenAIKey && (
                    <Button variant="outline" onClick={clearOpenAIKey} className="h-11 border-purple-500/30">
                      초기화
                    </Button>
                  )}
                </div>
              </div>

              {hasOpenAIKey && openaiApiKey && (
                <Alert className="bg-emerald-500/10 border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="text-emerald-400">
                    OpenAI API 키가 저장되었습니다. 이제 AI 인사이트를 생성할 수 있습니다!
                    <p className="text-sm mt-1">
                      저장된 키: <span className="font-mono">{openaiApiKey.substring(0, 15)}...</span>
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 pt-2">
                <p className="text-sm text-muted-foreground">
                  📖 OpenAI API 키 발급 방법:
                </p>
                <ol className="space-y-1 text-sm text-muted-foreground pl-4">
                  <li>1. <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">platform.openai.com</a> 접속</li>
                  <li>2. API Keys → Create new secret key</li>
                  <li>3. 키 복사 후 위에 입력</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  💰 예상 비용: 채널 분석 1회당 약 $0.01-0.05
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="mt-6">
          <ApiKeyGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
}
