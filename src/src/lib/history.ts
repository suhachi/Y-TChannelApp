/**
 * History/Version management for analysis sessions
 * Builder-style checkpoint and restore
 */

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'channel' | 'keyword' | 'opportunity';
  label: string;
  data: any;
  preview: string;
}

const MAX_HISTORY = 10;
const STORAGE_KEY = 'yt_consultant_history';

/**
 * Save a checkpoint
 */
export function saveCheckpoint(
  type: HistoryEntry['type'],
  label: string,
  data: any,
  preview: string
): void {
  const history = getHistory();
  
  const entry: HistoryEntry = {
    id: `${type}_${Date.now()}`,
    timestamp: Date.now(),
    type,
    label,
    data,
    preview,
  };

  // Add to beginning, limit to MAX_HISTORY
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save checkpoint:', error);
  }
}

/**
 * Get all history entries
 */
export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Restore a specific checkpoint
 */
export function restoreCheckpoint(id: string): HistoryEntry | null {
  const history = getHistory();
  return history.find(entry => entry.id === id) || null;
}

/**
 * Delete a checkpoint
 */
export function deleteCheckpoint(id: string): void {
  const history = getHistory();
  const updated = history.filter(entry => entry.id !== id);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete checkpoint:', error);
  }
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get history by type
 */
export function getHistoryByType(type: HistoryEntry['type']): HistoryEntry[] {
  return getHistory().filter(entry => entry.type === type);
}
