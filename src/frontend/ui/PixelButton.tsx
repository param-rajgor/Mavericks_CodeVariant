import type { ButtonHTMLAttributes, CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { hrefFor } from '@/frontend/routing/router';

type Variant = 'gold' | 'lavender' | 'dark-outline' | 'mint' | 'rose';
type Size = 'lg' | 'md' | 'sm';

const VARIANT_CLASS: Record<Variant, string> = {
  gold: 'rl-btn-gold',
  lavender: 'rl-btn-purple',
  'dark-outline': 'rl-btn-ghost',
  mint: 'rl-btn-mint',
  rose: 'rl-btn-rose',
};
const SIZE_CLASS: Record<Size, string> = { lg: 'rl-btn-lg', md: '', sm: 'rl-btn-sm' };

interface PixelButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: Variant;
  size?: Size;
  /** A small icon that sits on the button's top-right corner. */
  cornerIcon?: ReactNode;
  /** Render as a link to an app route instead of a button. */
  to?: string;
  style?: CSSProperties;
}

/** The one button of the design system: notched corners, a hard shadow, lifts on hover, presses on click. */
export function PixelButton({ variant = 'lavender', size = 'md', cornerIcon, to, children, className = '', style, ...rest }: PixelButtonProps) {
  const cls = `rl-btn ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim();
  const corner = cornerIcon && (
    <span aria-hidden="true" style={{ position: 'absolute', top: -12, right: -10 }}>
      {cornerIcon}
    </span>
  );
  if (to) {
    return (
      <a href={hrefFor(to)} className={cls} style={style} onClick={rest.onClick as unknown as MouseEventHandler<HTMLAnchorElement>}>
        {children}
        {corner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} style={style} {...rest}>
      {children}
      {corner}
    </button>
  );
}
