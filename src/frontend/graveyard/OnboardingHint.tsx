import { useState, useEffect, memo } from 'react';
import { useActiveDrag } from '@/frontend/dnd/DragLayer';

const STORAGE_KEY = 'relaunch_onboarding_hint_seen';

export const OnboardingHint = memo(function OnboardingHint() {
  const [show, setShow] = useState(false);
  const active = useActiveDrag();

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setShow(true);
    } catch {
      // ignore
    }
  }, []);

  // Dismiss if user begins any drag
  useEffect(() => {
    if (active && show) {
      dismiss();
    }
  }, [active, show]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  if (!show) return null;

  return (
    <div
      role="tooltip"
      aria-label="Drag a stone to decide its fate"
      onClick={dismiss}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1b1742] border-2 border-gold shadow-[0_4px_0_#14122e] animate-bounce">
        <span className="text-xl">👆</span>
        <div>
          <span className="font-display text-base text-gold block leading-tight">
            DRAG A STONE TO DECIDE ITS FATE
          </span>
          <span className="text-[11px] text-cream block">
            Pick up any gravestone and drop it on the action dock below
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-dim hover:text-soft ml-2 text-xs font-bold leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
});
