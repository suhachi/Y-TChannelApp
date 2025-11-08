/**
 * Aggregation engine for video analytics
 * Pure functions for computing KPIs, distributions, heatmaps
 */

import type { VideoCore } from '../types';

export interface KPIs {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgEngagementRate: number;
  videosLast28Days: number;
  shortsCount: number;
  longFormCount: number;
  shortsRatio: number;
}

export interface ParetoData {
  topN: VideoCore[];
  topNViews: number;
  totalViews: number;
  topNPercentage: number;
}

export interface HeatmapCell {
  dayOfWeek: number; // 0 = Sunday
  hour: number; // 0-23
  count: number;
}

export interface MetaStats {
  avgDuration: number;
  avgTitleLength: number;
  emojiUsageRate: number;
  hashtagUsageRate: number;
  tagsAvgCount: number;
}

/**
 * Compute basic KPIs
 */
export function computeKPIs(videos: VideoCore[]): KPIs {
  if (videos.length === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgEngagementRate: 0,
      videosLast28Days: 0,
      shortsCount: 0,
      longFormCount: 0,
      shortsRatio: 0,
    };
  }

  const now = Date.now();
  const last28Days = now - 28 * 24 * 60 * 60 * 1000;

  const shorts = videos.filter(v => v.isShort);
  const longForm = videos.filter(v => !v.isShort);
  const recent = videos.filter(v => new Date(v.publishedAt).getTime() >= last28Days);

  const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.stats.likes, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.stats.comments, 0);

  const avgEngagement = videos.reduce((sum, v) => {
    const engagement = v.stats.views > 0 
      ? ((v.stats.likes + v.stats.comments) / v.stats.views) * 100 
      : 0;
    return sum + engagement;
  }, 0) / videos.length;

  return {
    totalVideos: videos.length,
    totalViews,
    totalLikes,
    totalComments,
    avgViews: Math.round(totalViews / videos.length),
    avgLikes: Math.round(totalLikes / videos.length),
    avgComments: Math.round(totalComments / videos.length),
    avgEngagementRate: avgEngagement,
    videosLast28Days: recent.length,
    shortsCount: shorts.length,
    longFormCount: longForm.length,
    shortsRatio: (shorts.length / videos.length) * 100,
  };
}

/**
 * Compute Pareto distribution (top N%)
 */
export function computePareto(videos: VideoCore[], topN: number = 20): ParetoData {
  if (videos.length === 0) {
    return { topN: [], topNViews: 0, totalViews: 0, topNPercentage: 0 };
  }

  const sorted = [...videos].sort((a, b) => b.stats.views - a.stats.views);
  const count = Math.ceil(videos.length * (topN / 100));
  const top = sorted.slice(0, count);

  const topNViews = top.reduce((sum, v) => sum + v.stats.views, 0);
  const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0);

  return {
    topN: top,
    topNViews,
    totalViews,
    topNPercentage: totalViews > 0 ? (topNViews / totalViews) * 100 : 0,
  };
}

/**
 * Compute upload time heatmap (day of week × hour)
 */
export function computeUploadHeatmap(videos: VideoCore[], timezone: string = 'UTC'): HeatmapCell[] {
  const cells: Map<string, number> = new Map();

  for (const video of videos) {
    const date = new Date(video.publishedAt);
    // Note: In production, use a timezone library for accurate conversion
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;
    cells.set(key, (cells.get(key) || 0) + 1);
  }

  const result: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      result.push({
        dayOfWeek: day,
        hour,
        count: cells.get(key) || 0,
      });
    }
  }

  return result;
}

/**
 * Compute metadata statistics
 */
export function computeMetaStats(videos: VideoCore[]): MetaStats {
  if (videos.length === 0) {
    return {
      avgDuration: 0,
      avgTitleLength: 0,
      emojiUsageRate: 0,
      hashtagUsageRate: 0,
      tagsAvgCount: 0,
    };
  }

  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const hashtagRegex = /#[\w가-힣]+/g;

  const totalDuration = videos.reduce((sum, v) => sum + v.durationSec, 0);
  const totalTitleLength = videos.reduce((sum, v) => sum + v.title.length, 0);
  const emojiCount = videos.filter(v => emojiRegex.test(v.title)).length;
  const hashtagCount = videos.filter(v => hashtagRegex.test(v.title) || hashtagRegex.test(v.description)).length;
  const totalTags = videos.reduce((sum, v) => sum + (v.tags?.length || 0), 0);

  return {
    avgDuration: totalDuration / videos.length,
    avgTitleLength: totalTitleLength / videos.length,
    emojiUsageRate: (emojiCount / videos.length) * 100,
    hashtagUsageRate: (hashtagCount / videos.length) * 100,
    tagsAvgCount: totalTags / videos.length,
  };
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
