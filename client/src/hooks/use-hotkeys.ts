import { useEffect, useCallback, useRef } from 'react';

type HotkeyHandler = (e: KeyboardEvent) => void;

interface HotkeyOptions {
  modifier?: 'alt' | 'ctrl' | 'shift' | 'meta';
  scope?: 'global' | 'local';
}

/**
 * Hook to handle keyboard shortcuts
 * 
 * @param key The key to listen for (e.g., 'f', 'Escape', 'ArrowUp')
 * @param callback The function to call when the key is pressed
 * @param options Additional options for the hotkey
 */
export function useHotkeys(
  key: string,
  callback: HotkeyHandler,
  options: HotkeyOptions = {}
) {
  const { modifier, scope = 'global' } = options;
  const callbackRef = useRef<HotkeyHandler>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check if the event target is an input or textarea
      if (scope === 'local' && (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      )) {
        return;
      }

      const keyMatches = e.key.toLowerCase() === key.toLowerCase();
      
      // Check for modifiers
      const modifierMatches = 
        !modifier || 
        (modifier === 'alt' && e.altKey) ||
        (modifier === 'ctrl' && e.ctrlKey) ||
        (modifier === 'shift' && e.shiftKey) ||
        (modifier === 'meta' && e.metaKey);

      if (keyMatches && modifierMatches) {
        callbackRef.current(e);
      }
    },
    [key, modifier, scope]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook to handle multiple keyboard shortcuts
 * 
 * @param hotkeys Array of hotkey configurations
 */
export function useMultiHotkeys(
  hotkeys: Array<{ key: string; callback: HotkeyHandler; options?: HotkeyOptions }>
) {
  const hotkeysRef = useRef(hotkeys);

  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  const handler = useCallback((e: KeyboardEvent) => {
    for (const { key, callback, options = {} } of hotkeysRef.current) {
      const { modifier, scope = 'global' } = options;

      // Check if the event target is an input or textarea
      if (scope === 'local' && (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      )) {
        continue;
      }

      const keyMatches = e.key.toLowerCase() === key.toLowerCase();
      
      // Check for modifiers
      const modifierMatches = 
        !modifier || 
        (modifier === 'alt' && e.altKey) ||
        (modifier === 'ctrl' && e.ctrlKey) ||
        (modifier === 'shift' && e.shiftKey) ||
        (modifier === 'meta' && e.metaKey);

      if (keyMatches && modifierMatches) {
        callback(e);
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [handler]);
}