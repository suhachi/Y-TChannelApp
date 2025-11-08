/**
 * Rising Star Score Calculation
 * Identifies rapidly growing channels based on normalized metrics
 */

import type { ChannelCore } from '../types';

export interface RisingStarMetrics {
  channel: ChannelCore;
  rsScore: number;
  growthRate: number;
  efficiency: number;
  recentActivity: number;
  breakdown: {
    growth: number;
    efficiency: number;
    activity: number;
  };
}

/**
 * Calculate Rising Star (RS) score
 * Weighted combination of:
 * - Growth rate (40%): Recent upload velocity
 * - Efficiency (35%): Views per subscriber
 * - Activity (25%): Upload recency
 */
export function calculateRisingScore(
  channel: ChannelCore,
  recentVideoCount?: number,
  daysSinceLastUpload?: number
): RisingStarMetrics {
  // Normalize metrics to 0-100 scale
  const normalizeLog = (value: number, max: number = 1000000) => {
    return Math.min(100, (Math.log10(value + 1) / Math.log10(max)) * 100);
  };

  // Growth Rate: Based on video count and recency
  const growthRate = recentVideoCount 
    ? normalizeLog(recentVideoCount * 10) 
    : normalizeLog(channel.stats.videoCount);

  // Efficiency: Views per subscriber ratio
  const efficiency = channel.stats.subscribers > 0
    ? normalizeLog(channel.stats.views / channel.stats.subscribers * 100)
    : 0;

  // Activity: Inverse of days since last upload (fresher = higher score)
  const activity = daysSinceLastUpload !== undefined
    ? Math.max(0, 100 - (daysSinceLastUpload * 2))
    : 50; // Default if not provided

  // Weighted RS Score
  const rsScore = (
    growthRate * 0.40 +
    efficiency * 0.35 +
    activity * 0.25
  );

  return {
    channel,
    rsScore: Math.round(rsScore * 100) / 100,
    growthRate: Math.round(growthRate * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    recentActivity: Math.round(activity * 100) / 100,
    breakdown: {
      growth: growthRate,
      efficiency,
      activity,
    },
  };
}

/**
 * Sort channels by RS score
 */
export function sortByRisingScore(
  metrics: RisingStarMetrics[],
  sortBy: 'score' | 'growth' | 'efficiency' | 'activity' = 'score'
): RisingStarMetrics[] {
  return [...metrics].sort((a, b) => {
    switch (sortBy) {
      case 'growth':
        return b.growthRate - a.growthRate;
      case 'efficiency':
        return b.efficiency - a.efficiency;
      case 'activity':
        return b.recentActivity - a.recentActivity;
      default:
        return b.rsScore - a.rsScore;
    }
  });
}

/**
 * Filter channels by minimum RS score threshold
 */
export function filterByThreshold(
  metrics: RisingStarMetrics[],
  minScore: number = 50
): RisingStarMetrics[] {
  return metrics.filter(m => m.rsScore >= minScore);
}
