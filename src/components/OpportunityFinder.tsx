import { useState } from 'react';
import { Search, Loader2, TrendingUp, Target, Lock, Sparkles, Copy, ExternalLink } from '../src/components/icons';
import { toast } from './ui/sonner';
import { useLocation } from '../src/lib/simple-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useApiKey } from '../hooks/useApiKey';
import { useUserTier } from '../hooks/useUserTier';
import { YouTubeAPI } from '../services/youtube-api';
import { aiService } from '../services/ai';
import type { RisingStarChannel, BlueOceanMetrics, VideoCore } from '../types';

export function OpportunityFinder() {
  const { hasValidKey } = useApiKey();
  const { isPro, upgradeToPro } = useUserTier();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [risingChannels, setRisingChannels] = useState<RisingStarChannel[]>([]);
  const [blueOcean, setBlueOcean] = useState<BlueOceanMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rising' | 'blue'>('rising');

  const calculateRisingScore = (videos: VideoCore[], channelStats: any): RisingStarChannel['subScores'] => {
    if (!videos.length) return { conversionEfficiency: 0, viewVelocity: 0, consistency: 0, recency: 0, formatBalance: 0 };

    // Conversion Efficiency (추정치)
    const totalViews = videos.reduce((sum, v) => sum + (v.stats.views || 0), 0);
    const subscribers = channelStats.subscribers || 1;
    const ceRaw = subscribers / Math.sqrt(totalViews || 1);
    const conversionEfficiency = Math.min(ceRaw * 100, 100);

    // View Velocity
    const recentVideos = videos.slice(0, Math.min(10, videos.length));
    const avgVelocity = recentVideos.reduce((sum, v) => {
      const daysSince = Math.max(1, (Date.now() - new Date(v.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
      return sum + (v.stats.views || 0) / daysSince;
    }, 0) / recentVideos.length;
    const viewVelocity = Math.min((avgVelocity / 1000) * 100, 100);

    // Consistency
    const uploadDates = videos.map(v => new Date(v.publishedAt).getTime());
    const intervals = [];
    for (let i = 1; i < uploadDates.length; i++) {
      intervals.push((uploadDates[i - 1] - uploadDates[i]) / (1000 * 60 * 60 * 24));
    }
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / (intervals.length || 1);
    const stdDev = Math.sqrt(intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / (intervals.length || 1));
    const consistency = Math.max(0, 100 - stdDev * 2);

    // Recency
    const latestUpload = new Date(videos[0]?.publishedAt || Date.now()).getTime();
    const daysSinceLatest = (Date.now() - latestUpload) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 100 - daysSinceLatest * 2);

    // Format Balance
    const shortsCount = videos.filter(v => v.isShort).length;
    const shortsRatio = shortsCount / videos.length;
    const formatBalance = shortsRatio >= 0.2 && shortsRatio <= 0.8 ? 100 : 50;

    return {
      conversionEfficiency,
      viewVelocity,
      consistency,
      recency,
      formatBalance,
    };
  };

  const handleRisingSearch = async () => {
    if (!hasValidKey || !query.trim()) return;

    setLoading(true);
    setError(null);
    setRisingChannels([]);

    try {
      const api = new YouTubeAPI();
      
      // Search for channels
      const channels = await api.searchChannels(query);
      
      if (!channels.length) {
        setError('조건에 맞는 채널이 없습니다.');
        setLoading(false);
        return;
      }

      const risingData: RisingStarChannel[] = [];

      for (const channel of channels.slice(0, 5)) {
        const videoIds = await api.getChannelUploads(channel.channelId, 20);
        const videos = await api.getVideos(videoIds);
        
        const subScores = calculateRisingScore(videos, channel.stats);
        const score = 
          subScores.conversionEfficiency * 0.35 +
          subScores.viewVelocity * 0.30 +
          subScores.consistency * 0.20 +
          subScores.recency * 0.10 +
          subScores.formatBalance * 0.05;

        risingData.push({
          channel,
          score,
          subScores,
          recentVideos: videos.slice(0, 5),
        });
      }

      risingData.sort((a, b) => b.score - a.score);
      setRisingChannels(risingData);

    } catch (err: any) {
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlueOceanSearch = async () => {
    if (!hasValidKey || !query.trim()) return;

    setLoading(true);
    setError(null);
    setBlueOcean(null);

    try {
      const api = new YouTubeAPI();
      const videos = await api.searchVideos(query, 50);
      
      if (!videos.length) {
        setError('조건에 맞는 결과가 없습니다.');
        setLoading(false);
        return;
      }

      // Calculate metrics
      const views = videos.map(v => v.stats.views || 0);
      const viewMean = views.reduce((sum, v) => sum + v, 0) / views.length;
      const sortedViews = [...views].sort((a, b) => a - b);
      const mid = Math.floor(sortedViews.length / 2);
      const viewMedian = sortedViews.length % 2 === 0
        ? (sortedViews[mid - 1] + sortedViews[mid]) / 2
        : sortedViews[mid];

      // Channel concentration
      const uniqueChannels = new Set(videos.map(v => v.channelId)).size;
      const concentrationRatio = uniqueChannels / videos.length;

      // Activity
      const uploadDates = videos.map(v => new Date(v.publishedAt).getTime());
      const intervals = [];
      for (let i = 1; i < uploadDates.length; i++) {
        intervals.push((uploadDates[i - 1] - uploadDates[i]) / (1000 * 60 * 60 * 24));
      }
      const avgUploadIntervalDays = intervals.reduce((sum, val) => sum + val, 0) / (intervals.length || 1);
      const latestUploadDaysAgo = (Date.now() - Math.max(...uploadDates)) / (1000 * 60 * 60 * 24);

      // Verdict
      const distributionScore = viewMedian / viewMean;
      const concentrationScore = concentrationRatio;
      const activityScore = Math.min(avgUploadIntervalDays / 14, 1);
      
      const blueScore = distributionScore * 0.4 + concentrationScore * 0.4 + activityScore * 0.2;
      const verdict: 'BLUE' | 'RED' = blueScore > 0.5 ? 'BLUE' : 'RED';

      const metrics: BlueOceanMetrics = {
        query,
        topN: videos.length,
        viewMean,
        viewMedian,
        concentrationRatio,
        activity: {
          avgUploadIntervalDays,
          latestUploadDaysAgo,
        },
        verdict,
        aiPlan: '',
      };

      // Generate AI plan
      const aiPlan = await aiService.generateBlueOceanAnalysis(metrics);
      metrics.aiPlan = aiPlan;

      setBlueOcean(metrics);

    } catch (err: any) {
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <Card className="border-border bg-gradient-to-br from-card to-purple-500/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl mb-2">Pro 전용 기능</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            공략 채널 찾기는 Pro 멤버십 전용 기능입니다. 
            라이징 스타 채널과 블루오션 토픽을 발견하여 성장 기회를 잡으세요.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>라이징 스타 채널 탐색</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-purple-400" />
              <span>블루오션 토픽 발견</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>고급 AI 전략 템플릿</span>
            </div>
          </div>
          <Button onClick={upgradeToPro} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            Pro 체험하기
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            *데모 환경에서는 즉시 Pro 기능을 체험할 수 있습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasValidKey) {
    return (
      <Alert>
        <AlertDescription>
          API 키를 먼저 설정해주세요. 상단 "설정" 탭에서 API 키를 등록할 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-gradient-to-r from-card to-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  공략 채널 찾기
                </CardTitle>
                <CardDescription>
                  성장 기회를 발견하고 전략적으로 진입하세요
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rising' | 'blue')}>
        <TabsList className="grid w-full grid-cols-2 bg-accent">
          <TabsTrigger value="rising">
            <TrendingUp className="w-4 h-4 mr-2" />
            라이징 스타
          </TabsTrigger>
          <TabsTrigger value="blue">
            <Target className="w-4 h-4 mr-2" />
            블루오션 토픽
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rising" className="space-y-6">
          {/* Rising Star Search */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>라이징 스타 채널 찾기</CardTitle>
              <CardDescription>
                급성장 중인 채널을 발견하여 벤치마킹하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="키워드 입력... (예: tech review, gaming)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRisingSearch()}
                  disabled={loading}
                  className="h-12 bg-background"
                />
                <Button onClick={handleRisingSearch} disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      검색
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && activeTab === 'rising' && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading */}
          {loading && activeTab === 'rising' && (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {risingChannels.length > 0 && (
            <div className="space-y-4">
              {risingChannels.map((item) => (
                <Card 
                  key={item.channel.channelId} 
                  className="border-green-200 hover:border-green-300 transition-colors cursor-pointer group"
                  onClick={() => setLocation(`/channel?channelId=${item.channel.channelId}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg mb-1 flex items-center gap-2">
                          {item.channel.title}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.channel.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>👥 {item.channel.stats.subscribers?.toLocaleString() || 'N/A'} 구독자</span>
                          <span>📹 {item.channel.stats.videoCount || 0} 영상</span>
                          <span>📅 {new Date(item.channel.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl mb-1">{item.score.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">성장 점수</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">전환 효율</div>
                        <div className="text-sm">{item.subScores.conversionEfficiency.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">조회 속도</div>
                        <div className="text-sm">{item.subScores.viewVelocity.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">일관성</div>
                        <div className="text-sm">{item.subScores.consistency.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">최근성</div>
                        <div className="text-sm">{item.subScores.recency.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">포맷 밸런스</div>
                        <div className="text-sm">{item.subScores.formatBalance.toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">최근 영상 (최대 5개)</div>
                    <div className="space-y-1">
                      {item.recentVideos.slice(0, 3).map((video) => (
                        <div key={video.videoId} className="text-sm flex items-center justify-between">
                          <span className="truncate flex-1">{video.title}</span>
                          <span className="text-muted-foreground ml-2">{video.stats.views?.toLocaleString() || 0} views</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blue" className="space-y-6">
          {/* Blue Ocean Search */}
          <Card>
            <CardHeader>
              <CardTitle>블루오션 토픽 분석</CardTitle>
              <CardDescription>
                경쟁이 적은 기회의 토픽을 발견하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="키워드 입력... (예: sustainable living, crypto trading)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBlueOceanSearch()}
                  disabled={loading}
                />
                <Button onClick={handleBlueOceanSearch} disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      분석 중...
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

          {/* Error */}
          {error && activeTab === 'blue' && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading */}
          {loading && activeTab === 'blue' && (
            <Skeleton className="h-96 w-full" />
          )}

          {/* Results */}
          {blueOcean && (
            <div className="space-y-6">
              {/* Verdict Card */}
              <Card className={blueOcean.verdict === 'BLUE' ? 'border-blue-300 bg-blue-50' : 'border-red-300 bg-red-50'}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl mb-1">
                        {blueOcean.verdict === 'BLUE' ? '🔵 블루오션 (기회)' : '🔴 레드오션 (포화)'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        "{blueOcean.query}" 키워드 분석 결과
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">평균 조회수</div>
                      <div className="text-xl">{blueOcean.viewMean.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">중앙값 조회수</div>
                      <div className="text-xl">{blueOcean.viewMedian.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">채널 집중도</div>
                      <div className="text-xl">{(blueOcean.concentrationRatio * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>AI 전략 분석</CardTitle>
                  <CardDescription>
                    데이터 기반 진입 전략 및 실행 계획
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                      {blueOcean.aiPlan}
                    </pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(blueOcean.aiPlan);
                      toast.success('블루오션 전략이 클립보드에 복사되었습니다');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    전략 복사
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
