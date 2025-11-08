/**
 * Channel identification utilities
 * Supports: channel name search, URL parsing
 */

import { YouTubeAPI } from '../services/youtube-api';

export interface ChannelIdentifyResult {
  channelId: string;
  title: string;
  thumbnailUrl?: string;
  confidence: 'exact' | 'ambiguous';
}

/**
 * Parse YouTube URL to extract channel ID or handle
 */
export function parseYouTubeUrl(url: string): { type: 'id' | 'handle' | null; value: string } | null {
  try {
    const urlObj = new URL(url);
    
    // Format: youtube.com/channel/UC...
    const channelMatch = urlObj.pathname.match(/^\/channel\/([^\/]+)/);
    if (channelMatch) {
      return { type: 'id', value: channelMatch[1] };
    }
    
    // Format: youtube.com/@handle
    const handleMatch = urlObj.pathname.match(/^\/@([^\/]+)/);
    if (handleMatch) {
      return { type: 'handle', value: handleMatch[1] };
    }
    
    // Format: youtube.com/c/customname or youtube.com/user/username
    const customMatch = urlObj.pathname.match(/^\/(c|user)\/([^\/]+)/);
    if (customMatch) {
      return { type: 'handle', value: customMatch[2] };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Identify channel by search query or URL
 */
export async function identifyChannel(
  query: string,
  api: YouTubeAPI
): Promise<ChannelIdentifyResult[]> {
  // Try to parse as URL first
  const urlParsed = parseYouTubeUrl(query);
  
  if (urlParsed?.type === 'id') {
    // Direct channel ID
    const channels = await api.getChannels([urlParsed.value]);
    if (channels.length > 0) {
      return [{
        channelId: channels[0].channelId,
        title: channels[0].title,
        thumbnailUrl: channels[0].thumbnails?.default?.url,
        confidence: 'exact',
      }];
    }
  }
  
  // Search by name or handle
  const searchQuery = urlParsed?.type === 'handle' ? urlParsed.value : query;
  const channels = await api.searchChannels(searchQuery);
  
  if (channels.length === 0) {
    return [];
  }
  
  // If only one result, it's likely exact
  if (channels.length === 1) {
    return [{
      channelId: channels[0].channelId,
      title: channels[0].title,
      thumbnailUrl: channels[0].thumbnails?.default?.url,
      confidence: 'exact',
    }];
  }
  
  // Multiple results - ambiguous
  return channels.slice(0, 5).map(channel => ({
    channelId: channel.channelId,
    title: channel.title,
    thumbnailUrl: channel.thumbnails?.default?.url,
    confidence: 'ambiguous' as const,
  }));
}
