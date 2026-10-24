import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  /** Id prefix; panels should use `${idBase}-panel-${id}`. */
  idBase: string;
  className?: string;
}

/** WAI-ARIA tabs with roving tabindex and arrow/Home/End keys. */
export function Tabs<T extends string>({ tabs, value, onChange, label, idBase, className = '' }: TabsProps<T>) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={`scrollbar-thin flex gap-1 overflow-x-auto border-b-2 border-line ${className}`}>
      {tabs.map((t) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`${idBase}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            type="button"
            onClick={() => onChange(t.id)}
            className={`-mb-0.5 inline-flex min-h-11 shrink-0 items-center gap-2 border-b-4 px-3.5 text-sm font-extrabold transition-colors ${
              selected ? 'border-twilight text-night' : 'border-transparent text-muted hover:text-night'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count != null && <span className={`rounded-full px-2 py-0.5 font-mono text-xs ${selected ? 'bg-night text-soft' : 'bg-[#ece7fb] text-night'}`}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
