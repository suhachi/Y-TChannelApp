import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { formatNumber } from '../../lib/aggregate';
import type { VideoCore } from '../../../types';

interface ParetoChartProps {
  videos: VideoCore[];
  topN?: number;
}

export function ParetoChart({ videos, topN = 20 }: ParetoChartProps) {
  const chartData = useMemo(() => {
    if (videos.length === 0) return [];

    const sorted = [...videos].sort((a, b) => b.stats.views - a.stats.views);
    const count = Math.ceil(videos.length * (topN / 100));
    const top = sorted.slice(0, count);
    
    const totalViews = videos.reduce((s, v) => s + v.stats.views, 0);
    let cumulative = 0;

    return top.map((video, index) => {
      cumulative += video.stats.views;
      return {
        name: `#${index + 1}`,
        title: video.title.substring(0, 30) + '...',
        views: video.stats.views,
        cumulative: (cumulative / totalViews) * 100,
        percentage: (video.stats.views / totalViews) * 100,
      };
    }).slice(0, 10); // Show top 10 for readability
  }, [videos, topN]);

  if (chartData.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>파레토 분석</CardTitle>
          <CardDescription>상위 영상의 조회수 분포</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">데이터가 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  const maxViews = Math.max(...chartData.map(d => d.views));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>파레토 분석 (상위 {topN}%)</CardTitle>
        <CardDescription>
          상위 {topN}% 영상이 전체 조회수의 {chartData[chartData.length - 1]?.cumulative.toFixed(1)}%를 차지
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#ef4444] rounded"></div>
              <span className="text-muted-foreground">조회수</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#f59e0b] rounded"></div>
              <span className="text-muted-foreground">누적 비율</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-muted-foreground shrink-0">{item.name}</span>
                    <span className="truncate text-foreground/80" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[#ef4444]">
                      {formatNumber(item.views)}
                    </span>
                    <span className="text-[#f59e0b] w-16 text-right">
                      {item.cumulative.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative h-6 bg-slate-800 rounded-md overflow-hidden">
                  {/* Views bar */}
                  <div 
                    className="absolute left-0 top-0 h-full bg-[#ef4444]/80 transition-all"
                    style={{ width: `${(item.views / maxViews) * 100}%` }}
                  />
                  {/* Cumulative line indicator */}
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-[#f59e0b]"
                    style={{ left: `${item.cumulative}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#f59e0b] rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.percentage.toFixed(1)}% of total</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">총 영상 수</p>
                <p className="text-lg">{videos.length}개</p>
              </div>
              <div>
                <p className="text-muted-foreground">분석 대상</p>
                <p className="text-lg">상위 {chartData.length}개</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
