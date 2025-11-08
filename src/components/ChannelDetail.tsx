import { useState, useEffect } from 'react';
import { Download, Loader2, BarChart3, ArrowLeft } from '../src/components/icons';
import { toast } from './ui/sonner';
import { useLocation } from '../src/lib/simple-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
import type { ChannelDashboard } from '../types';

export function ChannelDetail() {
  const { hasValidKey } = useApiKey();
  const [location, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<ChannelDashboard | null>(null);
  const [aiReport, setAiReport] = useState<{ competition?: string; growth?: string; diagnosis?: string }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // URL에서 channelId 추출 (window.location.search 사용)
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('channelId');

    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    console.log('📌 Channel ID:', channelId);

    if (!hasValidKey) {
      console.log('⏸️ No valid API key');
      return;
    }

    if (!channelId) {
      console.log('⏸️ No channelId provided');
      setError('채널 ID가 제공되지 않았습니다.');
      return;
    }

    const analyzeChannel = async () => {
      console.log('🎯 Starting channel analysis:', channelId);
      
      setLoading(true);
      setError(null);
      setDashboard(null);
      setAiReport({});

      try {
        const api = new YouTubeAPI();
        
        // Step 1: Fetch channel info
        console.log('📡 Fetching channel info...');
        const channels = await api.getChannels([channelId]);
        if (!channels.length) {
          setError('채널을 찾을 수 없습니다.');
          return;
        }
        const channelInfo = channels[0];
        console.log('✅ Channel info received:', channelInfo.title);
        
        // Step 2: Fetch video IDs
        console.log('📡 Fetching video IDs...');
        const videoIds = await api.getChannelUploads(channelId, 100);
        console.log(`✅ Found ${videoIds.length} video IDs`);
        
        // Step 3: Fetch video details
        console.log('📡 Fetching video details...');
        const videos = await api.getVideos(videoIds);
        console.log(`✅ Fetched ${videos.length} videos`);
        
        if (!videos.length) {
          setError('이 채널은 조회 가능한 영상이 없습니다.');
          return;
        }

        // Step 4: Calculate metrics
        const shortsCount = videos.filter(v => v.isShort).length;
        const shortsRatio = videos.length > 0 ? shortsCount / videos.length : 0;
        
        const totalDuration = videos.reduce((sum, v) => sum + (v.durationSec || 0), 0);
        const avgDuration = videos.length > 0 ? totalDuration / videos.length : 0;
        
        const titleLengths = videos.map(v => v.title.length);
        const titleLenAvg = titleLengths.length > 0 
          ? titleLengths.reduce((sum, len) => sum + len, 0) / titleLengths.length 
          : 0;
        
        // Pareto analysis (top 20%)
        const sortedByViews = [...videos].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0));
        const top20Percent = sortedByViews.slice(0, Math.ceil(videos.length * 0.2));
        const top20Views = top20Percent.reduce((sum, v) => sum + (v.stats.views || 0), 0);
        const totalViews = videos.reduce((sum, v) => sum + (v.stats.views || 0), 0);
        const topParetoShare = totalViews > 0 ? top20Views / totalViews : 0;

        const newDashboard: ChannelDashboard = {
          core: channelInfo,
          videos,
          metrics: {
            shortsRatio,
            avgDuration,
            titleLenAvg,
            topParetoShare,
          },
        };
        
        console.log('✅ Dashboard created');
        setDashboard(newDashboard);
        
        // Step 5: Generate AI reports (async)
        generateAIReports(newDashboard);
        
      } catch (err: any) {
        console.error('❌ Analysis error:', err);
        setError(err.message || '채널 분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    analyzeChannel();
  }, [location, hasValidKey]); // location 변경 시 재실행

  const generateAIReports = async (data: ChannelDashboard) => {
    try {
      console.log('🤖 Generating AI reports...');
      const [competition, growth, diagnosis] = await Promise.all([
        aiService.generateCompetitionStrategy(data),
        aiService.generateGrowthPhases(data),
        aiService.generateDiagnosis(data),
      ]);
      setAiReport({ competition, growth, diagnosis });
      console.log('✅ AI reports generated');
    } catch (err) {
      console.error('Failed to generate AI reports:', err);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!dashboard) return;

    const filename = `${dashboard.core.title}_${format === 'csv' ? 'videos' : 'analysis'}`;
    
    if (format === 'csv') {
      exportToCSV(dashboard.videos, filename);
    } else {
      const data = {
        channel: dashboard.core,
        metrics: dashboard.metrics,
        videos: dashboard.videos,
      };
      exportToJSON(data, filename);
    }
    
    toast.success(`${format.toUpperCase()} 파일이 다운로드되었습니다`);
  };

  if (!hasValidKey) {
    return (
      <Alert className="bg-yellow-500/10 border-yellow-500/30">
        <AlertDescription>
          API 키를 먼저 설정해주세요. 상단 "API 설정" 탭에서 API 키를 등록할 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/keyword')}
          className="border-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          키워드 분석으로 돌아가기
        </Button>
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const kpis = dashboard ? computeKPIs(dashboard.videos) : null;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && !dashboard && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32 bg-accent" />
          </div>
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
        </div>
      )}

      {/* Dashboard */}
      {dashboard && (
        <div className="space-y-6">
          {/* Header with Export */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/keyword')}
                className="border-border"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
              <div>
                <h2 className="text-2xl">{dashboard.core.title}</h2>
                <p className="text-sm text-muted-foreground">
                  구독자 {dashboard.core.stats.subscribers?.toLocaleString() || 'N/A'} · 
                  영상 {dashboard.videos.length}개 분석
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('csv')} 
                className="border-border"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('json')} 
                className="border-border"
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <KpiCards kpis={kpis} />

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <ParetoChart videos={dashboard.videos} />
            <UploadHeatmap videos={dashboard.videos} />
          </div>

          {/* AI Insights */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>🤖 AI 인사이트</CardTitle>
              <CardDescription>
                AI가 분석한 채널 전략 및 성장 제안
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="competition" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="competition">경쟁 분석</TabsTrigger>
                  <TabsTrigger value="growth">성장 전략</TabsTrigger>
                  <TabsTrigger value="diagnosis">진단</TabsTrigger>
                </TabsList>

                <TabsContent value="competition" className="mt-4">
                  {aiReport.competition ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg">
                        {aiReport.competition}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="growth" className="mt-4">
                  {aiReport.growth ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg">
                        {aiReport.growth}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="diagnosis" className="mt-4">
                  {aiReport.diagnosis ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg">
                        {aiReport.diagnosis}
                      </pre>
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

          {/* Video Table */}
          <VideoTable videos={dashboard.videos} channelTitle={dashboard.core.title} />
        </div>
      )}
    </div>
  );
}
