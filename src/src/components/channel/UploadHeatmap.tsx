import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { VideoCore } from '../../types';

interface UploadHeatmapProps {
  videos: VideoCore[];
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function UploadHeatmap({ videos }: UploadHeatmapProps) {
  const heatmapData = useMemo(() => {
    const counts: Map<string, number> = new Map();
    let max = 0;

    videos.forEach(video => {
      const date = new Date(video.publishedAt);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      max = Math.max(max, count);
    });

    return { counts, max };
  }, [videos]);

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-card';
    const intensity = Math.min(count / heatmapData.max, 1);
    
    if (intensity < 0.25) return 'bg-[#ef4444]/20';
    if (intensity < 0.5) return 'bg-[#ef4444]/40';
    if (intensity < 0.75) return 'bg-[#ef4444]/60';
    return 'bg-[#ef4444]/80';
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>업로드 패턴 히트맵</CardTitle>
        <CardDescription>
          요일별 × 시간대별 업로드 빈도
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-8" /> {/* Day label space */}
              {HOURS.map(hour => (
                <div 
                  key={hour}
                  className="flex-1 min-w-[20px] text-[10px] text-muted-foreground text-center"
                >
                  {hour % 3 === 0 ? hour : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {DAYS.map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center mb-1">
                <div className="w-8 text-xs text-muted-foreground text-right pr-2">
                  {dayName}
                </div>
                {HOURS.map(hour => {
                  const key = `${dayIndex}-${hour}`;
                  const count = heatmapData.counts.get(key) || 0;
                  return (
                    <div
                      key={hour}
                      className={`flex-1 min-w-[20px] h-5 ${getColor(count)} border border-background rounded-sm transition-all hover:scale-110 cursor-pointer group relative`}
                      title={`${dayName} ${hour}시: ${count}개`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-xs whitespace-nowrap z-10">
                        {dayName} {hour}시: {count}개
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>적음</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-card border border-border rounded-sm" />
                <div className="w-4 h-4 bg-[#ef4444]/20 rounded-sm" />
                <div className="w-4 h-4 bg-[#ef4444]/40 rounded-sm" />
                <div className="w-4 h-4 bg-[#ef4444]/60 rounded-sm" />
                <div className="w-4 h-4 bg-[#ef4444]/80 rounded-sm" />
              </div>
              <span>많음</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
