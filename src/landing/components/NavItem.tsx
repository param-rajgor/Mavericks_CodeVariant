import type { MouseEventHandler, ReactNode } from "react";

interface NavItemProps {
  href: string;
  children: ReactNode;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** larger tap target for the mobile sheet */
  large?: boolean;
}

export function NavItem({ href, children, active, onClick, large }: NavItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "location" : undefined}
      className={`group relative inline-flex min-h-[44px] items-center gap-2 font-sans font-semibold text-cream transition-colors hover:text-gold ${
        large ? "text-xl" : "text-[15px]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 bg-gold transition-opacity [transition-timing-function:steps(2)] ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      {children}
    </a>
  );
}
