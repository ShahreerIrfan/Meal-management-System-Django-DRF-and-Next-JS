/**
 * useKeyboardShortcut – register global keyboard shortcuts.
 */
import { useEffect } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const sc of shortcuts) {
        const keyMatch = e.key.toLowerCase() === sc.key.toLowerCase();
        const ctrlMatch = sc.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = sc.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = sc.alt ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (sc.preventDefault !== false) {
            e.preventDefault();
          }
          sc.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
