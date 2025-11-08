// Home component - Landing page
import { useState, useEffect } from 'react';
import { Search, BarChart3, TrendingUp, Sparkles, ArrowRight, FileVideo, Download, Copy, Shield } from '../src/components/icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLocation } from '../src/lib/simple-router';
import { useApiKey } from '../hooks/useApiKey';
import { useUserTier } from '../hooks/useUserTier';

export function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { hasValidKey } = useApiKey();
  const { isPro } = useUserTier();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/channel?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // URL에 channelId가 있으면 채널 분석 페이지로 리다이렉트
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const channelId = params.get('channelId');
    
    if (channelId) {
      setLocation(`/channel?channelId=${channelId}`);
    }
  }, [location, setLocation]);

  const features = [
    {
      icon: BarChart3,
      title: '채널 분석',
      description: '구독자, 조회수, 영상 수 등 핵심 지표를 한눈에',
      tier: 'basic',
      link: '/channel'
    },
    {
      icon: Search,
      title: '키워드 분석',
      description: '인기 키워드와 태그를 분석하여 최적의 전략 수립',
      tier: 'basic',
      link: '/keyword'
    },
    {
      icon: TrendingUp,
      title: '공략 채널 찾기',
      description: '라이징 스타 채널과 블루오션 토픽 발굴',
      tier: 'pro',
      link: '/opportunity'
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-full px-4 py-2 text-sm text-[#ef4444]">
          <Sparkles className="w-4 h-4" />
          AI 기반 채널 성장 컨설팅
        </div>
        
        <h1 className="text-5xl tracking-tight">
          YouTube 채널을 
          <br />
          <span className="text-[#ef4444]">데이터로 성장</span>시키세요
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          YouTube Data API v3와 AI 인사이트를 결합하여
          <br />
          채널 분석부터 전략 수립까지 한 번에
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="분석할 채널 이름을 입력하세요... (예: Google, MrBeast)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 text-lg bg-card border-border px-6 pr-12"
                disabled={!hasValidKey}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            <Button 
              size="lg" 
              className="h-14 px-8 bg-[#ef4444] hover:bg-[#dc2626] text-white"
              onClick={handleSearch}
              disabled={!hasValidKey || !searchQuery.trim()}
            >
              <Search className="w-5 h-5 mr-2" />
              분석 시작
            </Button>
          </div>
          
          {!hasValidKey && (
            <p className="text-sm text-amber-400 mt-3 text-left">
              ⚠️ API 키를 먼저 설정해주세요. 
              <button 
                onClick={() => setLocation('/setup')}
                className="underline ml-1 hover:text-amber-300"
              >
                설정하기
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isLocked = feature.tier === 'pro' && !isPro;

          return (
            <Card 
              key={feature.title}
              className={`border-border hover:border-[#ef4444]/30 transition-all cursor-pointer group ${
                isLocked ? 'opacity-60' : ''
              }`}
              onClick={() => !isLocked && setLocation(feature.link)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-[#ef4444]/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  {feature.tier === 'pro' && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs">
                      PRO
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-[#ef4444] group-hover:gap-2 transition-all">
                  {isLocked ? '프로 플랜 필요' : '자세히 보기'}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 공통 편의 기능 */}
      <div className="space-y-6">
        <h2 className="text-3xl text-center">공통 편의 기능</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-[#2d1b69] border-[#4338ca]/30 hover:border-[#4338ca] transition-all cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4338ca]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileVideo className="w-6 h-6 text-[#818cf8]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-[#818cf8]">AI 영상 요약</CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    영상 내용을 빠르게 파악
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-[#2d1b69] border-[#4338ca]/30 hover:border-[#4338ca] transition-all cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4338ca]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6 text-[#818cf8]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-[#818cf8]">데이터 내보내기</CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    JSON, CSV 형식 지원
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-[#2d1b69] border-[#4338ca]/30 hover:border-[#4338ca] transition-all cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4338ca]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Copy className="w-6 h-6 text-[#818cf8]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-[#818cf8]">보고서 복사</CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    AI 전략보고서 원클릭 복사
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-[#2d1b69] border-[#4338ca]/30 hover:border-[#4338ca] transition-all cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4338ca]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-[#818cf8]" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-[#818cf8]">안전한 저장</CardTitle>
                  <CardDescription className="text-gray-300 mt-1">
                    API 키브라우저 암호화
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <p className="text-center text-sm text-gray-400 border-t border-gray-700 pt-6">
          데이터 분석, AI 전략 제안, 시장 기회 발굴을 통해 유튜브 채널 성장을 위한
          <br />
          모든 것을 지원하는 전문 컨설팅 도구입니다.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#ef4444]/10 to-purple-500/10 border border-[#ef4444]/20 rounded-2xl p-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl text-[#ef4444] mb-2">100+</div>
            <div className="text-sm text-muted-foreground">채널 분석 완료</div>
          </div>
          <div>
            <div className="text-4xl text-[#ef4444] mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">키워드 추출</div>
          </div>
          <div>
            <div className="text-4xl text-[#ef4444] mb-2">50+</div>
            <div className="text-sm text-muted-foreground">AI 인사이트 생성</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Card className="border-[#ef4444]/30 bg-gradient-to-br from-card to-[#ef4444]/5">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl">지금 바로 시작하세요</h3>
          <p className="text-muted-foreground">
            무료 플랜으로 채널 분석과 키워드 분석을 이용하실 수 있습니다
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              size="lg"
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
              onClick={() => setLocation('/channel')}
            >
              채널 분석 시작
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation('/setup')}
            >
              API 키 설정
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
