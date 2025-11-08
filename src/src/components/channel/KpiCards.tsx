import { Eye, ThumbsUp, MessageSquare, Video, TrendingUp } from '../icons';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import type { KPIs } from '../../lib/aggregate';
import { formatNumber } from '../../lib/aggregate';

interface KpiCardsProps {
  kpis: KPIs | null;
  loading?: boolean;
}

export function KpiCards({ kpis, loading }: KpiCardsProps) {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: Video,
      label: '총 영상',
      value: formatNumber(kpis.totalVideos),
      subtext: `최근 28일: ${kpis.videosLast28Days}개`,
      color: 'text-blue-400',
    },
    {
      icon: Eye,
      label: '평균 조회수',
      value: formatNumber(kpis.avgViews),
      subtext: `총 ${formatNumber(kpis.totalViews)}`,
      color: 'text-[#ef4444]',
    },
    {
      icon: ThumbsUp,
      label: '평균 좋아요',
      value: formatNumber(kpis.avgLikes),
      subtext: `총 ${formatNumber(kpis.totalLikes)}`,
      color: 'text-emerald-400',
    },
    {
      icon: MessageSquare,
      label: '평균 댓글',
      value: formatNumber(kpis.avgComments),
      subtext: `총 ${formatNumber(kpis.totalComments)}`,
      color: 'text-purple-400',
    },
    {
      icon: TrendingUp,
      label: '참여율',
      value: kpis.avgEngagementRate.toFixed(2) + '%',
      subtext: `Shorts: ${kpis.shortsRatio.toFixed(0)}%`,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-border hover:border-border/60 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <div className="text-2xl mb-1">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.subtext}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
