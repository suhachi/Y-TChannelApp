// Channel Analysis component - Core analytics feature
import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Loader2, BarChart3, Copy, Users, ExternalLink } from '../src/components/icons';
import { toast } from './ui/sonner';
import { useLocation } from '../src/lib/simple-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useApiKey } from '../hooks/useApiKey';
import { YouTubeAPI } from '../services/youtube-api';
import { aiService } from '../services/ai';
import { computeKPIs } from '../src/lib/aggregate';
import { exportToCSV, exportToJSON } from '../src/lib/export';
import { KpiCards } from '../src/components/channel/KpiCards';
import { ParetoChart } from '../src/components/channel/ParetoChart';
import { UploadHeatmap } from '../src/components/channel/UploadHeatmap';
import { VideoTable } from '../src/components/channel/VideoTable';
import type { ChannelDashboard, ChannelCore } from '../types';

export function ChannelAnalysis() {
  const { hasValidKey } = useApiKey();
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ChannelCore[]>([]);
  const [dashboard, setDashboard] = useState<ChannelDashboard | null>(null);
  const [aiReport, setAiReport] = useState<{ competition?: string; growth?: string; diagnosis?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const searchChannels = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setDashboard(null);
    setShowResults(true);

    try {
      const api = new YouTubeAPI();
      const results = await api.searchChannels(searchQuery);
      
      if (!results.length) {
        setError('조건에 맞는 채널이 없습니다. 검색어를 변경해 다시 시도하세요.');
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeChannel = useCallback(async (channelId: string) => {
    console.log('🔍 Analyzing channel:', channelId);
    
    setLoading(true);
    setError(null);
    setDashboard(null);
    setAiReport({});
    setShowResults(false);

    try {
      const api = new YouTubeAPI();
      
      // Get channel details
      console.log('📡 Fetching channel details...');
      const channels = await api.getChannels([channelId]);
      if (!channels.length) {
        setError('채널을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      const channel = channels[0];
      console.log('✅ Channel found:', channel.title);
      
      // Get uploads
      console.log('📡 Fetching channel uploads...');
      const videoIds = await api.getChannelUploads(channel.channelId, 100);
      console.log('✅ Found', videoIds.length, 'videos');
      
      // Get video details
      console.log('📡 Fetching video details...');
      const videos = await api.getVideos(videoIds);
      console.log('✅ Video details loaded');
      
      // Calculate metrics
      const shortsCount = videos.filter(v => v.isShort).length;
      const shortsRatio = videos.length > 0 ? shortsCount / videos.length : 0;
      
      const totalDuration = videos.reduce((sum, v) => sum + (v.durationSec || 0), 0);
      const avgDuration = videos.length > 0 ? totalDuration / videos.length : 0;
      
      const titleLengths = videos.map(v => v.title.length);
      const titleLenAvg = titleLengths.reduce((sum, len) => sum + len, 0) / titleLengths.length;
      
      // Pareto analysis (top 20%)
      const sortedByViews = [...videos].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0));
      const top20Percent = sortedByViews.slice(0, Math.ceil(videos.length * 0.2));
      const top20Views = top20Percent.reduce((sum, v) => sum + (v.stats.views || 0), 0);
      const totalViews = videos.reduce((sum, v) => sum + (v.stats.views || 0), 0);
      const topParetoShare = totalViews > 0 ? top20Views / totalViews : 0;

      const newDashboard: ChannelDashboard = {
        core: channel,
        videos,
        metrics: {
          shortsRatio,
          avgDuration,
          titleLenAvg,
          topParetoShare,
        },
      };

      setDashboard(newDashboard);
      console.log('✅ Dashboard ready!');

      // Generate AI reports in background
      generateAIReports(newDashboard);
      
    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAIReports = async (data: ChannelDashboard) => {
    try {
      const [competition, growth, diagnosis] = await Promise.all([
        aiService.generateCompetitionStrategy(data),
        aiService.generateGrowthPhases(data),
        aiService.generateDiagnosis(data),
      ]);
      setAiReport({ competition, growth, diagnosis });
    } catch (err) {
      console.error('Failed to generate AI reports:', err);
    }
  };

  const handleSearch = () => {
    if (!hasValidKey || !query.trim()) return;
    searchChannels(query);
  };

  const handleChannelClick = (channelId: string) => {
    analyzeChannel(channelId);
  };

  // URL 파라미터에서 channelId를 읽어서 자동 분석
  useEffect(() => {
    if (!hasValidKey) {
      console.log('⏸️ No valid API key, skipping URL params check');
      return;
    }

    const params = new URLSearchParams(location.split('?')[1] || '');
    const channelId = params.get('channelId');
    const q = params.get('q');

    console.log('🔄 URL changed:', { location, channelId, q });

    if (channelId) {
      // URL이 변경되면 무조건 새로 분석 (키워드 분석에서 온 경우)
      console.log('🎯 Auto-analyzing channel from URL:', channelId);
      setQuery(channelId);
      setShowResults(false); // 검색 결과 숨김
      analyzeChannel(channelId);
    } else if (q) {
      console.log('🔍 Auto-searching channels from URL:', q);
      setQuery(q);
      searchChannels(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, hasValidKey]);

  const handleExport = (format: 'csv' | 'json') => {
    if (!dashboard) return;

    const filename = `${dashboard.core.title}_${format === 'csv' ? 'videos' : 'analysis'}`;
    
    if (format === 'json') {
      exportToJSON(dashboard, filename);
      toast.success('JSON 파일이 다운로드되었습니다');
    } else {
      exportToCSV(dashboard.videos, filename);
      toast.success('CSV 파일이 다운로드되었습니다');
    }
  };

  if (!hasValidKey) {
    return (
      <Alert>
        <AlertDescription>
          API 키를 먼저 설정해주세요. 상단 "API 설정" 탭에서 API 키를 등록할 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  const kpis = dashboard ? computeKPIs(dashboard.videos) : null;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef4444]/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <CardTitle>채널 분석</CardTitle>
              <CardDescription>
                채널 이름을 입력하여 상세 분석을 시작하세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="채널 이름 입력... (예: Google, MrBeast, ai)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              className="h-12 bg-background"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="h-12 px-6 bg-[#ef4444] hover:bg-[#dc2626]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  분석
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !dashboard && (
        <div className="space-y-4">
          {showResults ? (
            // Loading channel list
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full bg-accent" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2 bg-accent" />
                      <Skeleton className="h-4 w-32 bg-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Loading dashboard
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-16 mb-2 bg-accent" />
                      <Skeleton className="h-8 w-24 mb-1 bg-accent" />
                      <Skeleton className="h-3 w-20 bg-accent" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Skeleton className="h-64 w-full bg-accent" />
            </>
          )}
        </div>
      )}

      {/* Search Results */}
      {!loading && showResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">검색 결과</h2>
            <p className="text-sm text-muted-foreground">
              {searchResults.length}개의 채널을 찾았습니다
            </p>
          </div>

          <div className="grid gap-4">
            {searchResults.map((channel) => (
              <Card 
                key={channel.channelId}
                className="border-border hover:border-[#ef4444]/30 transition-all cursor-pointer group"
                onClick={() => handleChannelClick(channel.channelId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {channel.thumbnails?.default?.url ? (
                        <img 
                          src={channel.thumbnails.default.url}
                          alt={channel.title}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                          <Users className="w-8 h-8 text-[#ef4444]" />
                        </div>
                      )}
                    </div>

                    {/* Channel Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg truncate">{channel.title}</h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      
                      {channel.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {channel.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#ef4444]" />
                          <span className="text-muted-foreground">구독자</span>
                          <span className="text-foreground">
                            {channel.stats.subscribers?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">영상</span>
                          <span className="text-foreground">
                            {channel.stats.videoCount?.toLocaleString() || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">조회수</span>
                          <span className="text-foreground">
                            {channel.stats.views?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border self-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChannelClick(channel.channelId);
                      }}
                    >
                      분석하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard */}
      {dashboard && !showResults && (
        <div className="space-y-6">
          {/* Header with Export */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl">{dashboard.core.title}</h2>
              <p className="text-sm text-muted-foreground">
                구독자 {dashboard.core.stats.subscribers?.toLocaleString() || 'N/A'} · 
                영상 {dashboard.videos.length}개 분석
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setDashboard(null);
                  setShowResults(true);
                }} 
                className="border-border"
              >
                목록으로
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="border-border">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="border-border">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <KpiCards kpis={kpis} loading={false} />

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ParetoChart videos={dashboard.videos} topN={20} />
            <UploadHeatmap videos={dashboard.videos} />
          </div>

          {/* Video Table */}
          <VideoTable videos={dashboard.videos} />

          {/* AI Reports */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI 전략 리포트</CardTitle>
              <CardDescription>
                데이터 기반 성장 전략 및 인사이트
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="competition">
                <TabsList className="grid w-full grid-cols-3 bg-accent">
                  <TabsTrigger value="competition">경쟁 전략</TabsTrigger>
                  <TabsTrigger value="growth">성장 과정</TabsTrigger>
                  <TabsTrigger value="diagnosis">채널 진단</TabsTrigger>
                </TabsList>

                <TabsContent value="competition" className="space-y-4">
                  {aiReport.competition ? (
                    <div className="space-y-3">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border">
                        {aiReport.competition}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        onClick={() => {
                          navigator.clipboard.writeText(aiReport.competition || '');
                          toast.success('보고서가 클립보드에 복사되었습니다');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="growth" className="space-y-4">
                  {aiReport.growth ? (
                    <div className="space-y-3">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border">
                        {aiReport.growth}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        onClick={() => {
                          navigator.clipboard.writeText(aiReport.growth || '');
                          toast.success('보고서가 클립보드에 복사되었습니다');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="diagnosis" className="space-y-4">
                  {aiReport.diagnosis ? (
                    <div className="space-y-3">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border">
                        {aiReport.diagnosis}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        onClick={() => {
                          navigator.clipboard.writeText(aiReport.diagnosis || '');
                          toast.success('보고서가 클립보드에 복사되었습니다');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State - 초기 상태 또는 분석 대기 중 */}
      {!loading && !dashboard && !showResults && !error && (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h3 className="text-xl mb-2">채널을 검색하여 분석을 시작하세요</h3>
            <p className="text-sm text-muted-foreground mb-6">
              채널 이름을 입력하고 분석 버튼을 클릭하거나,<br />
              키워드 분석에서 채널을 선택하여 상세 분석을 진행할 수 있습니다.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/keyword')}
                className="border-border"
              >
                키워드 분석으로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
