// Keyword Analysis component - Search optimization feature
import { useState } from 'react';
import { Search, Download, Loader2, TrendingUp, Video, Copy, ExternalLink } from '../src/components/icons';
import { toast } from './ui/sonner';
import { useLocation } from '../src/lib/simple-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { useApiKey } from '../hooks/useApiKey';
import { YouTubeAPI } from '../services/youtube-api';
import { aiService } from '../services/ai';
import type { KeywordSummary } from '../types';

export function KeywordAnalysis() {
  const { hasValidKey } = useApiKey();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<KeywordSummary | null>(null);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!hasValidKey || !query.trim()) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    setAiStrategy(null);

    try {
      const api = new YouTubeAPI();
      
      // Search for videos
      const videos = await api.searchVideos(query, 50);
      
      if (!videos.length) {
        setError('조건에 맞는 결과가 없습니다. 필터를 완화해 다시 검색하세요.');
        setLoading(false);
        return;
      }

      // Analyze top channels
      const channelCounts = new Map<string, number>();
      videos.forEach(v => {
        channelCounts.set(v.channelId, (channelCounts.get(v.channelId) || 0) + 1);
      });

      const totalVideos = videos.length;
      const topChannels = Array.from(channelCounts.entries())
        .map(([channelId, videoCount]) => ({
          channelId,
          videoCount,
          estShare: videoCount / totalVideos,
        }))
        .sort((a, b) => b.videoCount - a.videoCount)
        .slice(0, 10);

      // Calculate format mix
      const shortsCount = videos.filter(v => v.isShort).length;
      const formatMix = {
        shortsPct: shortsCount / videos.length,
        longPct: (videos.length - shortsCount) / videos.length,
      };

      const newSummary: KeywordSummary = {
        query,
        collectedAt: new Date().toISOString(),
        videos,
        topChannels,
        formatMix,
      };

      setSummary(newSummary);

      // Generate AI strategy
      const strategy = await aiService.generateKeywordStrategy(newSummary);
      setAiStrategy(strategy);

    } catch (err: any) {
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (!summary) return;

    if (format === 'json') {
      const dataStr = JSON.stringify(summary, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keyword_${summary.query}_analysis.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON 파일이 다운로드되었습니다');
    } else {
      const headers = ['videoId', 'channelId', 'title', 'views', 'likes', 'comments', 'publishedAt', 'isShort'];
      const rows = summary.videos.map(v => [
        v.videoId,
        v.channelId,
        `"${v.title.replace(/"/g, '""')}"`,
        v.stats.views || 0,
        v.stats.likes || 0,
        v.stats.comments || 0,
        v.publishedAt,
        v.isShort ? 'Yes' : 'No',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keyword_${summary.query}_videos.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV 파일이 다운로드되었습니다');
    }
  };

  if (!hasValidKey) {
    return (
      <Alert>
        <AlertDescription>
          API 키를 먼저 설정해주세요. 상단 "설정" 탭에서 API 키를 등록할 수 있습니다.
        </AlertDescription>
      </Alert>
    );
  }

  const avgViews = summary ? summary.videos.reduce((sum, v) => sum + (v.stats.views || 0), 0) / summary.videos.length : 0;
  const medianViews = summary ? (() => {
    const sorted = [...summary.videos].sort((a, b) => (a.stats.views || 0) - (b.stats.views || 0));
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? ((sorted[mid - 1].stats.views || 0) + (sorted[mid].stats.views || 0)) / 2
      : (sorted[mid].stats.views || 0);
  })() : 0;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef4444]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <CardTitle>키워드 분석</CardTitle>
              <CardDescription>
                키워드로 시장 트렌드를 파악하고 전략을 수립하세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="키워드 입력... (예: minecraft tutorial, cooking recipes)"
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

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardHeader>
                  <Skeleton className="h-4 w-24 bg-accent" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 bg-accent" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full bg-accent" />
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="space-y-6">
          {/* Export Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl">분석 결과</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="border-border">
                <Download className="w-4 h-4 mr-2" />
                CSV 내보내기
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="border-border">
                <Download className="w-4 h-4 mr-2" />
                JSON 내보내기
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">수집 영상 수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">{summary.videos.length}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">평균 조회수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">{avgViews.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">중앙값 조회수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">{medianViews.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Shorts 비중</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">{(summary.formatMix.shortsPct * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Channels */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>이 키워드를 다루는 상위 채널</CardTitle>
              <CardDescription>
                점유율 기준 상위 채널 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.topChannels.slice(0, 5).map((ch, idx) => (
                  <div
                    key={ch.channelId}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 hover:border-[#ef4444]/30 transition-all cursor-pointer group"
                    onClick={() => {
                      console.log('📌 Channel clicked:', ch.channelId);
                      console.log('🔗 Navigating to:', `/channel/detail?channelId=${ch.channelId}`);
                      setLocation(`/channel/detail?channelId=${ch.channelId}`);
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded bg-[#ef4444]/10 flex items-center justify-center">
                        <span className="text-sm text-[#ef4444]">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm flex items-center gap-2">
                          채널 ID: {ch.channelId.substring(0, 20)}...
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ch.videoCount}개 영상
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#ef4444]">{(ch.estShare * 100).toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">점유율</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video List */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>상위 영상 목록</CardTitle>
              <CardDescription>
                조회수 기준 상위 영상들
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {summary.videos
                  .sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0))
                  .slice(0, 20)
                  .map((video, index) => (
                    <div
                      key={video.videoId}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 hover:border-[#ef4444]/30 transition-all cursor-pointer group"
                      onClick={() => setLocation(`/video?id=${video.videoId}`)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-[#ef4444]">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate">{video.title}</p>
                            {video.isShort && (
                              <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">Shorts</Badge>
                            )}
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>👁️ {video.stats.views?.toLocaleString() || 0}</span>
                            <span>👍 {video.stats.likes?.toLocaleString() || 0}</span>
                            <span>💬 {video.stats.comments?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/video?id=${video.videoId}`);
                          }}
                        >
                          상세보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank');
                          }}
                        >
                          YouTube
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Strategy */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>AI 키워드 전략</CardTitle>
              <CardDescription>
                데이터 기반 키워드 공략 전략
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiStrategy ? (
                <>
                  <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border max-h-96 overflow-y-auto">
                    {aiStrategy}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border"
                    onClick={() => {
                      navigator.clipboard.writeText(aiStrategy);
                      toast.success('키워드 전략이 클립보드에 복사되었습니다');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    전략 복사
                  </Button>
                </>
              ) : (
                <Skeleton className="h-64 w-full bg-accent" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !summary && !error && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-[#ef4444]/10 rounded-2xl flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h3 className="text-lg mb-2">키워드 분석 시작하기</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              관심 있는 키워드를 입력하면 시장 트렌드, 경쟁 상황, 전략을 확인할 수 있습니다
            </p>
            <div className="flex gap-2 mt-6">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-accent border-border" 
                onClick={() => {
                  setQuery('AI tutorial');
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                AI tutorial
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-accent border-border" 
                onClick={() => {
                  setQuery('cooking recipes');
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                cooking recipes
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-accent border-border" 
                onClick={() => {
                  setQuery('travel vlog');
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                travel vlog
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
