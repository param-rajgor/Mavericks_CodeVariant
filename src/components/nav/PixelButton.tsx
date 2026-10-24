import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variant = 'gold' | 'lavender' | 'dark-outline';
type Size = 'md' | 'sm';

/* The spec calls the primary gold button's shadow "hard orange-brown" without giving a
 * hex; the Stalled-pill border (#D9806A) is the closest match in the palette. */
const VARIANT_STYLES: Record<Variant, { fill: string; text: string; border: string; shadow: string }> = {
  gold: {
    fill: 'var(--color-button-gold)',
    text: 'var(--color-text-dark)',
    border: 'var(--color-stone-outline)',
    shadow: 'var(--status-stalled-border)',
  },
  lavender: {
    fill: 'var(--color-lavender)',
    text: 'var(--color-text-dark)',
    border: 'var(--color-stone-outline)',
    shadow: 'var(--color-stone-outline)',
  },
  'dark-outline': {
    fill: 'var(--color-panel-indigo)',
    text: 'var(--color-text-primary)',
    border: 'var(--color-lavender)',
    shadow: 'var(--color-stone-outline)',
  },
};

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  cornerIcon?: ReactNode;
}

export function PixelButton({ variant = 'lavender', size = 'md', cornerIcon, children, style, ...rest }: PixelButtonProps) {
  const v = VARIANT_STYLES[variant];
  return (
    <button
      className="notched hard-shadow"
      style={
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: size === 'sm' ? 13 : 16,
          padding: size === 'sm' ? '8px 14px' : '14px 26px',
          background: v.fill,
          color: v.text,
          border: `2px solid ${v.border}`,
          '--shadow-color': v.shadow,
          cursor: 'pointer',
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      {children}
      {cornerIcon && <span style={{ position: 'absolute', top: -8, right: -8 }}>{cornerIcon}</span>}
    </button>
  );
}
