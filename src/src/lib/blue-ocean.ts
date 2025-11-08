/**
 * Blue Ocean Topic Analysis
 * Identifies low-competition, high-opportunity keywords
 */

import type { VideoCore } from '../types';

export interface BlueOceanMetrics {
  query: string;
  topN: number;
  viewMean: number;
  viewMedian: number;
  viewDistribution: number; // median/mean ratio
  concentrationRatio: number; // Top 3 channels' share
  activity: {
    avgUploadIntervalDays: number;
    latestUploadDaysAgo: number;
  };
  verdict: 'BLUE' | 'RED';
  confidence: number;
}

/**
 * Analyze keyword for blue ocean opportunity
 */
export function analyzeBlueOcean(
  query: string,
  videos: VideoCore[],
  topN: number = 50
): BlueOceanMetrics {
  if (videos.length === 0) {
    return {
      query,
      topN: 0,
      viewMean: 0,
      viewMedian: 0,
      viewDistribution: 0,
      concentrationRatio: 0,
      activity: { avgUploadIntervalDays: 0, latestUploadDaysAgo: 0 },
      verdict: 'RED',
      confidence: 0,
    };
  }

  const sample = videos.slice(0, topN);

  // 1. View Distribution Analysis
  const views = sample.map(v => v.stats.views).sort((a, b) => a - b);
  const viewMean = views.reduce((s, v) => s + v, 0) / views.length;
  const viewMedian = views[Math.floor(views.length / 2)];
  const viewDistribution = viewMedian / viewMean;

  // 2. Channel Concentration
  const channelViews = new Map<string, number>();
  sample.forEach(v => {
    channelViews.set(v.channelId, (channelViews.get(v.channelId) || 0) + v.stats.views);
  });

  const topChannels = Array.from(channelViews.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const totalViews = views.reduce((s, v) => s + v, 0);
  const topChannelsViews = topChannels.reduce((s, [, v]) => s + v, 0);
  const concentrationRatio = 1 - (topChannelsViews / totalViews); // Inverse: higher = more fragmented

  // 3. Activity Analysis
  const dates = sample.map(v => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
  const now = Date.now();
  const latestUploadDaysAgo = Math.floor((now - dates[0]) / (1000 * 60 * 60 * 24));
  
  const intervals: number[] = [];
  for (let i = 0; i < dates.length - 1; i++) {
    intervals.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
  }
  const avgUploadIntervalDays = intervals.length > 0
    ? intervals.reduce((s, i) => s + i, 0) / intervals.length
    : 0;

  // 4. Blue Ocean Verdict
  // BLUE if: distributed views + low concentration + low activity
  const distributionScore = viewDistribution > 0.7 ? 1 : 0; // Distributed
  const concentrationScore = concentrationRatio > 0.5 ? 1 : 0; // Fragmented
  const activityScore = avgUploadIntervalDays > 14 ? 1 : 0; // Infrequent

  const blueSignals = distributionScore + concentrationScore + activityScore;
  const verdict: 'BLUE' | 'RED' = blueSignals >= 2 ? 'BLUE' : 'RED';
  const confidence = (blueSignals / 3) * 100;

  return {
    query,
    topN: sample.length,
    viewMean: Math.round(viewMean),
    viewMedian: Math.round(viewMedian),
    viewDistribution,
    concentrationRatio,
    activity: {
      avgUploadIntervalDays: Math.round(avgUploadIntervalDays * 10) / 10,
      latestUploadDaysAgo,
    },
    verdict,
    confidence: Math.round(confidence),
  };
}

/**
 * Generate 10 content ideas for blue ocean opportunity
 */
export function generateBlueOceanIdeas(query: string): string[] {
  return [
    `The Ultimate ${query} Guide for 2025`,
    `${query}: 10 Things Nobody Tells You`,
    `I Tried ${query} for 30 Days - Results`,
    `${query} vs [Alternative] - Honest Comparison`,
    `Common ${query} Mistakes to Avoid`,
    `${query} Tips from a Professional`,
    `The Science Behind ${query}`,
    `${query} on a Budget - Complete Guide`,
    `Is ${query} Worth It? (2025 Review)`,
    `${query} Trends to Watch This Year`,
  ];
}
