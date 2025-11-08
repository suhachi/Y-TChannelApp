import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Eye, EyeOff, Sparkles, Copy, X } from '../icons';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from '../../../components/ui/sonner';
import { formatNumber, formatDuration } from '../../lib/aggregate';
import { exportToCSV, exportToJSON } from '../../lib/export';
import { aiService } from '../../../services/ai';
import type { VideoCore } from '../../types';

interface VideoTableProps {
  videos: VideoCore[];
}

type SortKey = 'publishedAt' | 'views' | 'likes' | 'comments' | 'durationSec';
type SortDirection = 'asc' | 'desc';

export function VideoTable({ videos }: VideoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<'all' | 'short' | 'long'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    views: true,
    likes: true,
    comments: true,
    duration: true,
    publishedAt: true,
    tags: false,
  });
  const [summaryDialog, setSummaryDialog] = useState<{ open: boolean; video: VideoCore | null; summary: string }>({
    open: false,
    video: null,
    summary: '',
  });

  const filteredAndSorted = useMemo(() => {
    let result = [...videos];

    // Filter by type
    if (filterType === 'short') {
      result = result.filter(v => v.isShort);
    } else if (filterType === 'long') {
      result = result.filter(v => !v.isShort);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortKey) {
        case 'publishedAt':
          aVal = new Date(a.publishedAt).getTime();
          bVal = new Date(b.publishedAt).getTime();
          break;
        case 'views':
          aVal = a.stats.views;
          bVal = b.stats.views;
          break;
        case 'likes':
          aVal = a.stats.likes;
          bVal = b.stats.likes;
          break;
        case 'comments':
          aVal = a.stats.comments;
          bVal = b.stats.comments;
          break;
        case 'durationSec':
          aVal = a.durationSec;
          bVal = b.durationSec;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [videos, sortKey, sortDirection, filterType, searchQuery]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-[#ef4444]" />
      : <ArrowDown className="w-3 h-3 ml-1 text-[#ef4444]" />;
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleSummarize = async (video: VideoCore) => {
    setSummaryDialog({ open: true, video, summary: '' });
    const summary = await aiService.generateVideoSummary(video.title, video.description, video.durationSec);
    setSummaryDialog(prev => ({ ...prev, summary }));
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>영상 목록 ({filteredAndSorted.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                exportToCSV(filteredAndSorted);
                toast.success('CSV 파일이 다운로드되었습니다');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                exportToJSON(filteredAndSorted);
                toast.success('JSON 파일이 다운로드되었습니다');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="제목 또는 설명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs bg-background"
          />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">전체</option>
            <option value="short">Shorts</option>
            <option value="long">롱폼</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {visibleColumns.title && (
                  <th className="text-left p-2">제목</th>
                )}
                {visibleColumns.views && (
                  <th 
                    className="text-right p-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('views')}
                  >
                    <div className="flex items-center justify-end">
                      조회수
                      <SortIcon column="views" />
                    </div>
                  </th>
                )}
                {visibleColumns.likes && (
                  <th 
                    className="text-right p-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('likes')}
                  >
                    <div className="flex items-center justify-end">
                      좋아요
                      <SortIcon column="likes" />
                    </div>
                  </th>
                )}
                {visibleColumns.comments && (
                  <th 
                    className="text-right p-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('comments')}
                  >
                    <div className="flex items-center justify-end">
                      댓글
                      <SortIcon column="comments" />
                    </div>
                  </th>
                )}
                {visibleColumns.duration && (
                  <th 
                    className="text-right p-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('durationSec')}
                  >
                    <div className="flex items-center justify-end">
                      길이
                      <SortIcon column="durationSec" />
                    </div>
                  </th>
                )}
                {visibleColumns.publishedAt && (
                  <th 
                    className="text-right p-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('publishedAt')}
                  >
                    <div className="flex items-center justify-end">
                      업로드
                      <SortIcon column="publishedAt" />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((video) => (
                <tr key={video.videoId} className="border-b border-border hover:bg-accent/50">
                  {visibleColumns.title && (
                    <td className="p-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <a
                            href={`https://youtube.com/watch?v=${video.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#ef4444] line-clamp-2 block"
                          >
                            {video.title}
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs mt-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={() => handleSummarize(video)}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI 요약
                          </Button>
                        </div>
                        {video.isShort && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            Shorts
                          </Badge>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.views && (
                    <td className="p-2 text-right">{formatNumber(video.stats.views)}</td>
                  )}
                  {visibleColumns.likes && (
                    <td className="p-2 text-right">{formatNumber(video.stats.likes)}</td>
                  )}
                  {visibleColumns.comments && (
                    <td className="p-2 text-right">{formatNumber(video.stats.comments)}</td>
                  )}
                  {visibleColumns.duration && (
                    <td className="p-2 text-right text-muted-foreground">
                      {formatDuration(video.durationSec)}
                    </td>
                  )}
                  {visibleColumns.publishedAt && (
                    <td className="p-2 text-right text-muted-foreground">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSorted.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      </CardContent>

      {/* AI Summary Modal */}
      {summaryDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSummaryDialog({ open: false, video: null, summary: '' })}>
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">AI 영상 요약</h3>
              </div>
              <button 
                onClick={() => setSummaryDialog({ open: false, video: null, summary: '' })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {summaryDialog.video && (
              <div className="space-y-4">
                {summaryDialog.summary ? (
                  <>
                    <pre className="whitespace-pre-wrap text-sm bg-accent/50 p-4 rounded-lg border border-border">
                      {summaryDialog.summary}
                    </pre>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(summaryDialog.summary);
                          toast.success('AI 요약이 클립보드에 복사되었습니다');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://youtube.com/watch?v=${summaryDialog.video?.videoId}`, '_blank')}
                      >
                        영상 보기
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center space-y-2">
                      <Sparkles className="w-8 h-8 animate-pulse text-purple-400 mx-auto" />
                      <p className="text-sm text-muted-foreground">AI가 영상을 분석하는 중...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
