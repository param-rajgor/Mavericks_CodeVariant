import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Handcrafted pixel-art sleeping cat on a rock.
 * Breathes gently with floating "z z z" particles and purrs on click/hover.
 */
export function SleepingCat({ className = "" }: { className?: string }) {
  const [purring, setPurring] = useState(false);

  const triggerPurr = () => {
    setPurring(true);
    setTimeout(() => setPurring(false), 1800);
  };

  return (
    <div
      className={`relative inline-block select-none cursor-pointer group ${className}`}
      onClick={triggerPurr}
      title="A sleepy graveyard guardian cat. Click to pet!"
    >
      {/* Floating z z z animation */}
      <div className="pointer-events-none absolute -top-8 left-6 flex flex-col items-center">
        <span
          className="font-pixel text-[10px] text-cream opacity-0 animate-[rise-step_3s_steps(5)_infinite]"
          style={{ animationDelay: "0s" }}
        >
          z
        </span>
        <span
          className="font-pixel text-[11px] text-lavender opacity-0 animate-[rise-step_3s_steps(5)_infinite] ml-3 -mt-2"
          style={{ animationDelay: "1s" }}
        >
          z
        </span>
        <span
          className="font-pixel text-[13px] text-gold opacity-0 animate-[rise-step_3s_steps(5)_infinite] ml-6 -mt-2"
          style={{ animationDelay: "2s" }}
        >
          Z
        </span>
      </div>

      {/* Heart / Purr indicator on interaction */}
      <AnimatePresence>
        {purring && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: -16, scale: 1.1 }}
            exit={{ opacity: 0, y: -24, scale: 0.8 }}
            className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-navy/90 border border-gold px-2 py-0.5"
          >
            <span className="font-pixel text-[8px] text-[#FF9DB5]">♥</span>
            <span className="font-pixel text-[8px] text-gold">purr...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rock underneath */}
      <div className="relative">
        <svg
          width="110"
          height="52"
          viewBox="0 0 55 26"
          shapeRendering="crispEdges"
          className="overflow-visible"
        >
          {/* Rock base */}
          <rect x="6" y="15" width="44" height="9" fill="#2A2B52" />
          <rect x="2" y="18" width="50" height="6" fill="#202142" />
          <rect x="10" y="13" width="34" height="4" fill="#3D3E6E" />
          <rect x="14" y="11" width="22" height="3" fill="#4E4F85" />
          <rect x="18" y="12" width="10" height="2" fill="#6567A5" />

          {/* Grass bits around rock */}
          <rect x="4" y="21" width="2" height="4" fill="#7DBD65" />
          <rect x="48" y="22" width="2" height="4" fill="#7DBD65" />
          <rect x="52" y="20" width="2" height="5" fill="#4F8741" />
        </svg>

        {/* Breathing Cat positioned on top of the rock */}
        <div
          className="absolute -top-3 left-4 origin-bottom transition-transform duration-1000 ease-in-out group-hover:scale-105"
          style={{ animation: "cat-breathe 3.2s ease-in-out infinite" }}
        >
          <svg
            width="72"
            height="38"
            viewBox="0 0 36 19"
            shapeRendering="crispEdges"
            className="drop-shadow-[0_2px_4px_rgba(13,14,43,0.5)]"
          >
            {/* Dark Outline */}
            <rect x="6" y="5" width="23" height="11" fill="#17183E" />
            <rect x="8" y="3" width="18" height="14" fill="#17183E" />
            <rect x="25" y="6" width="7" height="9" fill="#17183E" />
            <rect x="2" y="9" width="6" height="7" fill="#17183E" />

            {/* Cat Body (White Base) */}
            <rect x="7" y="6" width="21" height="9" fill="#FFF9F2" />
            <rect x="9" y="4" width="16" height="12" fill="#FFF9F2" />

            {/* Orange / Ginger Calico Patches */}
            <rect x="11" y="4" width="8" height="4" fill="#FFAB83" />
            <rect x="13" y="8" width="6" height="3" fill="#FFAB83" />
            <rect x="23" y="7" width="4" height="5" fill="#FFAB83" />

            {/* Cat Head */}
            <rect x="25" y="7" width="6" height="7" fill="#FFF9F2" />
            {/* Ginger patch on ear */}
            <rect x="25" y="5" width="2" height="3" fill="#FFAB83" />
            <rect x="29" y="5" width="2" height="3" fill="#FFF9F2" />
            {/* Inner ear pink */}
            <rect x="26" y="6" width="1" height="1" fill="#FF9DB5" />
            <rect x="29" y="6" width="1" height="1" fill="#FF9DB5" />

            {/* Sleeping closed eyes (crescent lines) */}
            <rect x="26" y="9" width="2" height="1" fill="#17183E" />
            <rect x="29" y="9" width="2" height="1" fill="#17183E" />

            {/* Nose & whiskers */}
            <rect x="28" y="11" width="1" height="1" fill="#FF9DB5" />
            <rect x="31" y="10" width="2" height="1" fill="#DDD5F8" />

            {/* Curled Tail on the left */}
            <rect x="3" y="10" width="4" height="5" fill="#FFF9F2" />
            <rect x="4" y="9" width="3" height="2" fill="#FFAB83" />
            <rect x="2" y="12" width="2" height="3" fill="#FFF9F2" />

            {/* Front paws tucked in */}
            <rect x="22" y="13" width="3" height="2" fill="#FFF9F2" />
            <rect x="18" y="13" width="3" height="2" fill="#FFF9F2" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes cat-breathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.03, 1.07) translateY(-1px); }
        }
      `}</style>
    </div>
  );
}
