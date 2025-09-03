import { useEffect, useRef, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  modifiers?: Array<'ctrl' | 'shift' | 'alt' | 'meta'>;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  const activeElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    for (const shortcut of shortcuts) {
      const modifiersMatch = !shortcut.modifiers || shortcut.modifiers.every(modifier => {
        switch (modifier) {
          case 'ctrl':
            return event.ctrlKey;
          case 'shift':
            return event.shiftKey;
          case 'alt':
            return event.altKey;
          case 'meta':
            return event.metaKey;
          default:
            return false;
        }
      });

      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                      event.code.toLowerCase() === shortcut.key.toLowerCase();

      if (modifiersMatch && keyMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    setActiveElement: (element: HTMLElement | null) => {
      activeElement.current = element;
    }
  };
}

export function usePipelineKeyboardShortcuts(
  onAddOpportunity: () => void,
  onRefresh: () => void,
  onToggleView: () => void,
  onFocusSearch?: () => void
) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      modifiers: ['ctrl'],
      action: onAddOpportunity,
      description: 'Add new opportunity'
    },
    {
      key: 'r',
      modifiers: ['ctrl'],
      action: onRefresh,
      description: 'Refresh pipeline data'
    },
    {
      key: 'v',
      modifiers: ['ctrl'],
      action: onToggleView,
      description: 'Toggle between Kanban and Tabs view'
    },
    {
      key: 'ArrowLeft',
      action: () => {
        const focusedCard = document.querySelector('[data-opportunity-card]:focus') as HTMLElement;
        if (focusedCard) {
          const moveButton = focusedCard.querySelector('[data-move="previous"]') as HTMLElement;
          moveButton?.click();
        }
      },
      description: 'Move focused opportunity to previous stage'
    },
    {
      key: 'ArrowRight',
      action: () => {
        const focusedCard = document.querySelector('[data-opportunity-card]:focus') as HTMLElement;
        if (focusedCard) {
          const moveButton = focusedCard.querySelector('[data-move="next"]') as HTMLElement;
          moveButton?.click();
        }
      },
      description: 'Move focused opportunity to next stage'
    },
    {
      key: 'ArrowUp',
      action: () => {
        const focusedCard = document.querySelector('[data-opportunity-card]:focus') as HTMLElement;
        if (focusedCard) {
          const previousCard = focusedCard.previousElementSibling as HTMLElement;
          previousCard?.focus();
        }
      },
      description: 'Focus previous opportunity'
    },
    {
      key: 'ArrowDown',
      action: () => {
        const focusedCard = document.querySelector('[data-opportunity-card]:focus') as HTMLElement;
        if (focusedCard) {
          const nextCard = focusedCard.nextElementSibling as HTMLElement;
          nextCard?.focus();
        }
      },
      description: 'Focus next opportunity'
    },
    {
      key: 'Enter',
      action: () => {
        const focusedCard = document.querySelector('[data-opportunity-card]:focus') as HTMLElement;
        if (focusedCard) {
          focusedCard.click();
        }
      },
      description: 'Open focused opportunity'
    },
    {
      key: 'Escape',
      action: () => {
        const focusedElement = document.activeElement as HTMLElement;
        focusedElement?.blur();
      },
      description: 'Clear focus'
    }
  ];

  if (onFocusSearch) {
    shortcuts.push({
      key: 'f',
      modifiers: ['ctrl'],
      action: onFocusSearch,
      description: 'Focus search'
    });
  }

  return useKeyboardShortcuts(shortcuts);
}