"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

// Inlined Aceternity-style BackgroundBeams. Renders a set of curved SVG paths
// and animates each one with a moving gradient stroke for a premium dark
// hero backdrop. Pointer-events stay off so the beams never block content.
export function BackgroundBeams({ className }: { className?: string }) {
  const id = useId();
  const paths = [
    "M-200 200 C 60 -40, 320 60, 600 -120 S 980 80, 1260 -100",
    "M-200 360 C 60 120, 320 220, 600 40 S 980 240, 1260 60",
    "M-200 520 C 60 280, 320 380, 600 200 S 980 400, 1260 220",
    "M-200 680 C 60 440, 320 540, 600 360 S 980 560, 1260 380",
    "M-200 840 C 60 600, 320 700, 600 520 S 980 720, 1260 540",
    "M-200 1000 C 60 760, 320 860, 600 680 S 980 880, 1260 700",
  ];

  return (
    <div
      aria-hidden
      className={cn("beam absolute inset-0 z-0", className)}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id={`${id}-base`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
          </linearGradient>
          {paths.map((_, i) => (
            <linearGradient
              key={i}
              id={`${id}-beam-${i}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="120"
              y2="0"
            >
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {paths.map((d, i) => (
          <path
            key={`base-${i}`}
            d={d}
            stroke={`url(#${id}-base)`}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
        ))}

        {paths.map((d, i) => (
          <motion.path
            key={`anim-${i}`}
            d={d}
            stroke={`url(#${id}-beam-${i})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0.04, opacity: 0 }}
            animate={{ pathLength: [0.04, 0.18, 0.04], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 6 + i * 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.1,
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
