import { useEffect } from 'react';
import { useProjects } from '@/backend/store/ProjectsContext';
import { useToast } from '@/frontend/ui/Toast';

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

/** Ctrl/Cmd+Z undoes the last change; Shift+R puts the twelve sample projects back. Both ignore key presses in fields. */
export function UndoKeys() {
  const { actions } = useProjects();
  const toast = useToast();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        void actions.undo().then((ok) => toast.info(ok ? 'Undone' : 'Nothing to undo'));
      } else if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.key === 'R') {
        void actions.resetSamples().then(() => toast.info('Sample projects restored', 'Press Ctrl+Z to undo.'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, toast]);
  return null;
}
