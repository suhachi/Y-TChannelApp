/**
 * Export utilities for CSV and JSON
 * UTF-8 encoding with standard headers
 */

import type { VideoCore } from '../types';

/**
 * Export videos to CSV format
 */
export function exportToCSV(videos: VideoCore[], filename: string = 'youtube-analysis'): void {
  if (videos.length === 0) return;

  // Define headers
  const headers = [
    'videoId',
    'channelId',
    'title',
    'description',
    'publishedAt',
    'views',
    'likes',
    'comments',
    'durationSec',
    'isShort',
    'tags',
    'hashtags',
  ];

  // Helper to extract hashtags from title/description
  const extractHashtags = (text: string): string => {
    const hashtagRegex = /#[\w가-힣]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.join(' ') : '';
  };

  // Helper to escape CSV field
  const escapeCSV = (field: any): string => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build rows
  const rows = videos.map(video => [
    video.videoId,
    video.channelId,
    video.title,
    video.description,
    video.publishedAt,
    video.stats.views,
    video.stats.likes,
    video.stats.comments,
    video.durationSec,
    video.isShort ? 'true' : 'false',
    (video.tags || []).join('; '),
    extractHashtags(`${video.title} ${video.description}`),
  ]);

  // Combine headers and rows
  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  // Create and download file
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string = 'youtube-analysis'): void {
  if (!data) return;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Copy data to clipboard as formatted text
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
