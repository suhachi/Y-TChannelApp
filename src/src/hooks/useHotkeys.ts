import { useEffect } from 'react';

type HotkeyHandler = (e: KeyboardEvent) => void;

interface Hotkey {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: HotkeyHandler;
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        const ctrlMatch = hotkey.ctrl === undefined || hotkey.ctrl === (e.ctrlKey || e.metaKey);
        const shiftMatch = hotkey.shift === undefined || hotkey.shift === e.shiftKey;
        const altMatch = hotkey.alt === undefined || hotkey.alt === e.altKey;
        const keyMatch = e.key.toLowerCase() === hotkey.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          hotkey.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys]);
}

// Common hotkey presets
export const commonHotkeys = {
  escape: (handler: HotkeyHandler) => ({ key: 'Escape', handler }),
  search: (handler: HotkeyHandler) => ({ key: '/', handler }),
  export: (handler: HotkeyHandler) => ({ key: 'e', ctrl: true, handler }),
  save: (handler: HotkeyHandler) => ({ key: 's', ctrl: true, handler }),
};
