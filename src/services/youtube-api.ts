import type { ChannelCore, VideoCore } from '../types';
import { storage } from '../lib/storage';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Exponential backoff for rate limiting
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limited - exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error?.message || 'API request failed';
        const errorCode = error.error?.code || response.status;
        
        // Handle specific error cases
        if (errorMessage.includes('unregistered callers') || errorMessage.includes('API key')) {
          throw new Error('INVALID_API_KEY');
        }
        if (errorMessage.includes('quota')) {
          throw new Error('QUOTA_EXCEEDED');
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1));
    }
  }
}

export class YouTubeAPI {
  private apiKey: string;
  private keyPromise: Promise<string>;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
    this.keyPromise = this.initializeApiKey(apiKey);
  }

  private async initializeApiKey(providedKey?: string): Promise<string> {
    if (providedKey) {
      this.apiKey = providedKey;
      return providedKey;
    }
    const storedKey = await storage.getApiKey();
    this.apiKey = storedKey || '';
    return this.apiKey;
  }

  private async ensureApiKey(): Promise<string> {
    if (!this.apiKey) {
      await this.keyPromise;
    }
    return this.apiKey;
  }

  // Test API key validity
  async testKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const apiKey = await this.ensureApiKey();
      if (!apiKey) {
        return { valid: false, error: 'NO_API_KEY' };
      }
      const url = `${BASE_URL}/channels?part=snippet&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${apiKey}`;
      await fetchWithRetry(url);
      return { valid: true };
    } catch (error: any) {
      const errorMsg = error.message || '';
      
      if (errorMsg === 'QUOTA_EXCEEDED' || errorMsg.includes('quota')) {
        return { valid: false, error: 'QUOTA_EXCEEDED' };
      }
      if (errorMsg === 'INVALID_API_KEY' || errorMsg.includes('API key') || errorMsg.includes('unregistered callers')) {
        return { valid: false, error: 'INVALID_API_KEY' };
      }
      return { valid: false, error: 'NETWORK_ERROR' };
    }
  }

  // Search for channels
  async searchChannels(query: string): Promise<ChannelCore[]> {
    const cacheKey = `search_channel_${query}`;
    const cached = storage.getCache(cacheKey) as ChannelCore[] | null;
    if (cached) return cached;

    const apiKey = await this.ensureApiKey();
    const url = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=50&key=${apiKey}`;
    const data = await fetchWithRetry(url);

    const channelIds = data.items?.map((item: any) => item.snippet.channelId || item.id.channelId).filter(Boolean);
    if (!channelIds?.length) return [];

    const channels = await this.getChannels(channelIds);
    storage.setCache(cacheKey, channels, 360); // 6 hours
    return channels;
  }

  // Get channel details
  async getChannels(channelIds: string[]): Promise<ChannelCore[]> {
    const ids = channelIds.join(',');
    const cacheKey = `channels_${ids}`;
    const cached = storage.getCache(cacheKey) as ChannelCore[] | null;
    if (cached) return cached;

    const apiKey = await this.ensureApiKey();
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${ids}&key=${apiKey}`;
    const data = await fetchWithRetry(url);

    const channels: ChannelCore[] = data.items?.map((item: any) => ({
      channelId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      publishedAt: item.snippet.publishedAt,
      country: item.snippet.country,
      stats: {
        subscribers: parseInt(item.statistics.subscriberCount || '0'),
        views: parseInt(item.statistics.viewCount || '0'),
        videoCount: parseInt(item.statistics.videoCount || '0'),
      },
    })) || [];

    storage.setCache(cacheKey, channels, 360);
    return channels;
  }

  // Get channel uploads
  async getChannelUploads(channelId: string, maxResults: number = 50): Promise<string[]> {
    const cacheKey = `uploads_${channelId}`;
    const cached = storage.getCache(cacheKey) as string[] | null;
    if (cached) return cached;

    const apiKey = await this.ensureApiKey();
    
    // First get the uploads playlist ID
    const channelUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
    const channelData = await fetchWithRetry(channelUrl);
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) return [];

    // Get all videos from uploads playlist
    const videoIds: string[] = [];
    let pageToken = '';

    do {
      const url = `${BASE_URL}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ''}&key=${apiKey}`;
      const data = await fetchWithRetry(url);

      videoIds.push(...(data.items?.map((item: any) => item.contentDetails.videoId) || []));
      pageToken = data.nextPageToken || '';

      if (videoIds.length >= maxResults) break;
    } while (pageToken);

    const result = videoIds.slice(0, maxResults);
    storage.setCache(cacheKey, result, 360);
    return result;
  }

  // Get video details in batches
  async getVideos(videoIds: string[]): Promise<VideoCore[]> {
    if (!videoIds.length) return [];

    const apiKey = await this.ensureApiKey();
    const videos: VideoCore[] = [];
    
    // Process in batches of 50
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50);
      const ids = batch.join(',');
      const cacheKey = `videos_${ids}`;
      const cached = storage.getCache(cacheKey) as VideoCore[] | null;

      if (cached) {
        videos.push(...cached);
        continue;
      }

      const url = `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${apiKey}`;
      const data = await fetchWithRetry(url);

      const batchVideos: VideoCore[] = data.items?.map((item: any) => {
        const duration = this.parseDuration(item.contentDetails.duration);
        return {
          videoId: item.id,
          channelId: item.snippet.channelId,
          title: item.snippet.title,
          description: item.snippet.description,
          tags: item.snippet.tags,
          publishedAt: item.snippet.publishedAt,
          durationSec: duration,
          isShort: duration <= 60,
          stats: {
            views: parseInt(item.statistics.viewCount || '0'),
            likes: parseInt(item.statistics.likeCount || '0'),
            comments: parseInt(item.statistics.commentCount || '0'),
          },
        };
      }) || [];

      storage.setCache(cacheKey, batchVideos, 360);
      videos.push(...batchVideos);
    }

    return videos;
  }

  // Search videos by keyword
  async searchVideos(query: string, maxResults: number = 50, filters?: {
    publishedAfter?: string;
    publishedBefore?: string;
    regionCode?: string;
    videoCategoryId?: string;
    videoType?: 'any' | 'episode' | 'movie';
  }): Promise<VideoCore[]> {
    const cacheKey = `search_video_${query}_${JSON.stringify(filters)}`;
    const cached = storage.getCache(cacheKey) as VideoCore[] | null;
    if (cached) return cached;

    const apiKey = await this.ensureApiKey();
    let url = `${BASE_URL}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${Math.min(maxResults, 50)}&key=${apiKey}`;
    
    if (filters?.publishedAfter) url += `&publishedAfter=${filters.publishedAfter}`;
    if (filters?.publishedBefore) url += `&publishedBefore=${filters.publishedBefore}`;
    if (filters?.regionCode) url += `&regionCode=${filters.regionCode}`;
    if (filters?.videoCategoryId) url += `&videoCategoryId=${filters.videoCategoryId}`;

    const data = await fetchWithRetry(url);
    const videoIds = data.items?.map((item: any) => item.id.videoId).filter(Boolean) || [];

    const videos = await this.getVideos(videoIds);
    storage.setCache(cacheKey, videos, 360);
    return videos;
  }

  // Parse ISO 8601 duration to seconds
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]?.replace('H', '') || '0');
    const minutes = parseInt(match[2]?.replace('M', '') || '0');
    const seconds = parseInt(match[3]?.replace('S', '') || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}
