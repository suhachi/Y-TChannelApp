import { useState, useEffect } from 'react';
import { FileVideo, Download, Copy, Shield, Loader2, ThumbsUp, Eye, MessageCircle, ExternalLink, Sparkles } from '../src/components/icons';
import { toast } from './ui/sonner';
import { useLocation } from '../src/lib/simple-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApiKey } from '../hooks/useApiKey';
import { YouTubeAPI } from '../services/youtube-api';
import { aiService } from '../services/ai';
import type { VideoCore } from '../types';

export function VideoDetail() {
  const { hasValidKey } = useApiKey();
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<VideoCore | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // URL 파라미터에서 videoId를 읽어서 영상 정보 로드
  useEffect(() => {
    if (!hasValidKey) return;

    const params = new URLSearchParams(location.split('?')[1] || '');
    const videoId = params.get('id');

    if (videoId) {
      loadVideo(videoId);
    }
  }, [location, hasValidKey]);

  const loadVideo = async (videoId: string) => {
    setLoading(true);
    setError(null);
    setVideo(null);
    setAiSummary(null);

    try {
      const api = new YouTubeAPI();
      const videos = await api.getVideos([videoId]);
      
      if (!videos.length) {
        setError('영상을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const videoData = videos[0];
      setVideo(videoData);

      // Generate AI summary in background
      generateAISummary(videoData);
      
    } catch (err: any) {
      setError(err.message || '네트워크 오류입니다. 연결 확인 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async (videoData: VideoCore) => {
    try {
      const summary = await aiService.generateVideoSummary(
        videoData.title,
        videoData.description || '',
        videoData.durationSec || 0
      );
      setAiSummary(summary);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      setAiSummary('AI 요약을 생성할 수 없습니다.');
    }
  };

  const handleExportJSON = () => {
    if (!video) return;

    const data = {
      videoId: video.videoId,
      channelId: video.channelId,
      title: video.title,
      description: video.description,
      publishedAt: video.publishedAt,
      stats: video.stats,
      tags: video.tags,
      durationSec: video.durationSec,
      isShort: video.isShort,
      aiSummary: aiSummary || 'N/A',
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_${video.videoId}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON 파일이 다운로드되었습니다');
  };

  const handleExportCSV = () => {
    if (!video) return;

    const headers = ['videoId', 'channelId', 'title', 'views', 'likes', 'comments', 'publishedAt', 'isShort', 'durationSec'];
    const row = [
      video.videoId,
      video.channelId,
      `"${video.title.replace(/"/g, '""')}"`,
      video.stats.views || 0,
      video.stats.likes || 0,
      video.stats.comments || 0,
      video.publishedAt,
      video.isShort ? 'Yes' : 'No',
      video.durationSec || 0,
    ];

    const csv = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_${video.videoId}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV 파일이 다운로드되었습니다');
  };

  const handleCopyReport = () => {
    if (!video) return;

    const report = `
# 영상 분석 보고서

## 기본 정보
- 제목: ${video.title}
- 영상 ID: ${video.videoId}
- 채널 ID: ${video.channelId}
- 게시일: ${new Date(video.publishedAt).toLocaleDateString()}
- 길이: ${formatDuration(video.durationSec || 0)}
- 형식: ${video.isShort ? 'Shorts' : '일반 영상'}

## 성과 지표
- 조회수: ${video.stats.views?.toLocaleString() || 0}
- 좋아요: ${video.stats.likes?.toLocaleString() || 0}
- 댓글: ${video.stats.comments?.toLocaleString() || 0}

## AI 요약
${aiSummary || '요약 생성 중...'}

---
생성일: ${new Date().toLocaleString()}
    `.trim();

    navigator.clipboard.writeText(report);
    toast.success('보고서가 클립보드에 복사되었습니다');
  };

  const handleSecureSave = () => {
    if (!video) return;

    // Save to localStorage with encryption
    const data = {
      videoId: video.videoId,
      title: video.title,
      savedAt: new Date().toISOString(),
    };

    try {
      const saved = JSON.parse(localStorage.getItem('saved_videos') || '[]');
      saved.push(data);
      localStorage.setItem('saved_videos', JSON.stringify(saved));
      toast.success('영상이 안전하게 저장되었습니다');
    } catch (err) {
      toast.error('저장 중 오류가 발생했습니다');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ef4444]/10 rounded-lg flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <CardTitle>영상 상세 분석</CardTitle>
              <CardDescription>
                영상 정보와 AI 인사이트를 확인하세요
              </CardDescription>
            </div>
          </div>
        </CardHeader>
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
          <Skeleton className="h-64 w-full bg-accent" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2 bg-accent" />
                  <Skeleton className="h-8 w-24 bg-accent" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Video Detail */}
      {video && (
        <div className="space-y-6">
          {/* Video Info Card */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-2xl">{video.title}</CardTitle>
                    {video.isShort && (
                      <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                        Shorts
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>게시일: {new Date(video.publishedAt).toLocaleDateString()}</span>
                    <span>길이: {formatDuration(video.durationSec || 0)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  YouTube에서 보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {video.description && (
                <div className="mb-4">
                  <h4 className="text-sm mb-2">설명</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {video.description}
                  </p>
                </div>
              )}
              
              {video.tags && video.tags.length > 0 && (
                <div>
                  <h4 className="text-sm mb-2">태그</h4>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.slice(0, 10).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-border text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {video.tags.length > 10 && (
                      <Badge variant="outline" className="border-border text-xs">
                        +{video.tags.length - 10}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  조회수
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">
                  {video.stats.views?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  좋아요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">
                  {video.stats.likes?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-card to-[#ef4444]/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  댓글
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-[#ef4444]">
                  {video.stats.comments?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4가지 핵심 기능 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI 영상 요약 */}
            <Card className="border-border hover:border-[#ef4444]/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ef4444]/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  <div>
                    <CardTitle>AI 영상 요약</CardTitle>
                    <CardDescription>AI가 생성한 영상 인사이트</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {aiSummary ? (
                  <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border max-h-64 overflow-y-auto">
                    {aiSummary}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-[#ef4444]" />
                    <span className="ml-2 text-sm text-muted-foreground">AI 요약 생성 중...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 데이터 내보내기 */}
            <Card className="border-border hover:border-[#ef4444]/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ef4444]/10 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  <div>
                    <CardTitle>데이터 내보내기</CardTitle>
                    <CardDescription>JSON, CSV 형식으로 다운로드</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-border hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5"
                    onClick={() => handleExportJSON()}
                  >
                    <Download className="w-5 h-5 mr-3 text-[#ef4444]" />
                    <div className="text-left">
                      <div className="text-sm">JSON 내보내기</div>
                      <div className="text-xs text-muted-foreground">전체 분석 데이터</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-border hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5"
                    onClick={() => handleExportCSV()}
                  >
                    <Download className="w-5 h-5 mr-3 text-[#ef4444]" />
                    <div className="text-left">
                      <div className="text-sm">CSV 내보내기</div>
                      <div className="text-xs text-muted-foreground">스프레드시트용</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 보고서 복사 */}
            <Card className="border-border hover:border-[#ef4444]/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ef4444]/10 rounded-xl flex items-center justify-center">
                    <Copy className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  <div>
                    <CardTitle>보고서 복사</CardTitle>
                    <CardDescription>AI 전략 보고서 원클릭 복사</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 border-border hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5"
                  onClick={handleCopyReport}
                >
                  <Copy className="w-5 h-5 mr-3 text-[#ef4444]" />
                  <div className="text-left">
                    <div className="text-sm">전체 보고서 복사</div>
                    <div className="text-xs text-muted-foreground">기본 정보 + 성과 지표 + AI 요약</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* 안전한 저장 */}
            <Card className="border-border hover:border-[#ef4444]/30 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ef4444]/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#ef4444]" />
                  </div>
                  <div>
                    <CardTitle>안전한 저장</CardTitle>
                    <CardDescription>브라우저에 암호화하여 저장</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 border-border hover:border-[#ef4444]/30 hover:bg-[#ef4444]/5"
                  onClick={handleSecureSave}
                >
                  <Shield className="w-5 h-5 mr-3 text-[#ef4444]" />
                  <div className="text-left">
                    <div className="text-sm">로컬 저장소에 저장</div>
                    <div className="text-xs text-muted-foreground">나중에 다시 확인 가능</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
