import { motion } from "motion/react";
import type { MouseEventHandler, ReactNode } from "react";
import { PixelArrow, PixelSparkle } from "./icons";

type Variant = "gold" | "lavender" | "ghost";

interface PixelButtonProps {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children: ReactNode;
  /** trailing accent: a pixel arrow or a sparkle that nudges on hover */
  accent?: "arrow" | "sparkle" | "none";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const SIZES = {
  sm: "px-4 py-3 text-[10px]",
  md: "px-5 py-4 text-[11px]",
  lg: "px-6 py-5 text-[12px] sm:px-8 sm:text-[13px]",
};

/**
 * Blocky retro-game button. Motion handles lift/press; CSS handles the pixel shadow.
 */
export function PixelButton({
  variant = "gold",
  size = "md",
  href,
  onClick,
  children,
  accent = "none",
  type = "button",
  className = "",
  disabled,
  ...rest
}: PixelButtonProps) {
  const cls = `px-btn px-btn-${variant} ${SIZES[size]} ${className}`;
  const motionProps = {
    whileHover: { y: -3 },
    whileTap: { y: 2 },
    transition: { duration: 0.12, ease: "easeOut" as const },
    initial: "rest",
    animate: "rest",
  };
  const inner = (
    <>
      <span>{children}</span>
      {accent === "arrow" && (
        <motion.span
          className="inline-flex"
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <PixelArrow size={size === "lg" ? 18 : 14} />
        </motion.span>
      )}
      {accent === "sparkle" && (
        <motion.span
          className="inline-flex"
          variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 90, scale: 1.25 } }}
          transition={{ duration: 0.18 }}
        >
          <PixelSparkle size={14} />
        </motion.span>
      )}
    </>
  );

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} className={cls} {...motionProps} whileHover="hover" variants={{ hover: { y: -3 } }} aria-label={rest["aria-label"]}>
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cls}
      {...motionProps}
      whileHover="hover"
      variants={{ hover: { y: -3 } }}
      aria-label={rest["aria-label"]}
    >
      {inner}
    </motion.button>
  );
}
