import { useState, useEffect } from 'react';
import {
  getHistory,
  saveCheckpoint,
  restoreCheckpoint,
  deleteCheckpoint,
  clearHistory,
  type HistoryEntry,
} from '../lib/history';

export function useHistory(type?: HistoryEntry['type']) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const loadHistory = () => {
    const all = getHistory();
    setHistory(type ? all.filter(e => e.type === type) : all);
  };

  useEffect(() => {
    loadHistory();
  }, [type]);

  const save = (
    entryType: HistoryEntry['type'],
    label: string,
    data: any,
    preview: string
  ) => {
    saveCheckpoint(entryType, label, data, preview);
    loadHistory();
  };

  const restore = (id: string): HistoryEntry | null => {
    return restoreCheckpoint(id);
  };

  const remove = (id: string) => {
    deleteCheckpoint(id);
    loadHistory();
  };

  const clear = () => {
    clearHistory();
    loadHistory();
  };

  return {
    history,
    save,
    restore,
    remove,
    clear,
    refresh: loadHistory,
  };
}
