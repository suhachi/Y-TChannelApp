// Layout component - Main application layout
import { ReactNode } from 'react';
import { Link, useLocation } from '../src/lib/simple-router';
import { Youtube, Key, Search, TrendingUp, Sparkles } from '../src/components/icons';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUserTier } from '../hooks/useUserTier';
import { useApiKey } from '../hooks/useApiKey';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { isPro, upgradeToPro, downgradeToBasic } = useUserTier();
  const { hasValidKey } = useApiKey();

  const navigation = [
    { name: '채널 분석', href: '/channel', icon: Search, restricted: false },
    { name: '키워드 분석', href: '/keyword', icon: Youtube, restricted: false },
    { name: '공략 채널 찾기', href: '/opportunity', icon: TrendingUp, restricted: true },
    { name: 'API 설정', href: '/setup', icon: Key, restricted: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 bg-[#ef4444] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl">YouTube 채널 컨설턴트</h1>
                  {isPro && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs px-2 py-0">
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">데이터 기반 채널 성장 분석 도구</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {hasValidKey ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  ● API 연결됨
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                  ● API 미설정
                </Badge>
              )}

              {/* Demo tier toggle */}
              <Button
                size="sm"
                variant={isPro ? "outline" : "default"}
                className={isPro ? "" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"}
                onClick={() => isPro ? downgradeToBasic() : upgradeToPro()}
              >
                {isPro ? (
                  'Basic으로 전환'
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Pro 체험하기
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {navigation.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + '/');
              const Icon = item.icon;
              const isRestricted = item.restricted && !isPro;

              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-2 text-sm font-medium transition-all h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground ${
                      isActive 
                        ? 'border-[#ef4444] bg-[#ef4444]/10 text-white' 
                        : 'border-transparent'
                    } ${isRestricted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isRestricted}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {isRestricted && (
                      <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs px-1.5 py-0">
                        Pro
                      </Badge>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* API Key Warning Banner */}
      {!hasValidKey && location !== '/setup' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-400">
                ⚠️ API 키가 설정되지 않았습니다. 기능을 사용하려면 먼저 API 키를 설정하세요.
              </p>
              <Link href="/setup">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-8 px-3 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                  API 키 설정하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              YouTube Data API v3 기반 채널 분석 도구
            </p>
            <p>
              공개 데이터만 사용하며 YouTube Analytics API는 사용하지 않습니다
            </p>
            <p className="text-xs pt-2">
              Made with ❤️ for content creators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
