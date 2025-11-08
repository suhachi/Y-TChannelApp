// Core data models
export type ChannelCore = {
  channelId: string;
  title: string;
  description?: string;
  thumbnails: Record<'default' | 'medium' | 'high', { url: string }>;
  publishedAt: string;
  country?: string;
  stats: { subscribers?: number; views?: number; videoCount?: number };
};

export type VideoCore = {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  tags?: string[];
  publishedAt: string;
  durationSec: number;
  isShort: boolean;
  stats: { views: number; likes: number; comments: number };
};

export type ChannelDashboard = {
  core: ChannelCore;
  videos: VideoCore[];
  metrics: {
    shortsRatio: number;
    avgDuration: number;
    titleLenAvg: number;
    topParetoShare: number;
  };
};

export type KeywordSummary = {
  query: string;
  collectedAt: string;
  videos: VideoCore[];
  topChannels: { channelId: string; videoCount: number; estShare: number }[];
  formatMix: { shortsPct: number; longPct: number };
};

export type BlueOceanMetrics = {
  query: string;
  topN: number;
  viewMean: number;
  viewMedian: number;
  concentrationRatio: number;
  activity: { avgUploadIntervalDays: number; latestUploadDaysAgo: number };
  verdict: 'BLUE' | 'RED';
  aiPlan?: string;
};

export type RisingStarChannel = {
  channel: ChannelCore;
  score: number;
  subScores: {
    conversionEfficiency: number;
    viewVelocity: number;
    consistency: number;
    recency: number;
    formatBalance: number;
  };
  recentVideos: VideoCore[];
};

// API response types
export type ApiKeyStatus = 'idle' | 'testing' | 'valid' | 'invalid' | 'quota_exceeded' | 'network_error';

export type ErrorType = 'INVALID_API_KEY' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'NO_RESULTS';

// User tier
export type UserTier = 'basic' | 'pro';

// Filter types
export type VideoFilter = {
  format?: 'all' | 'shorts' | 'long';
  minViews?: number;
  dateRange?: { start: string; end: string };
  sortBy?: 'views' | 'likes' | 'comments' | 'publishedAt';
};
