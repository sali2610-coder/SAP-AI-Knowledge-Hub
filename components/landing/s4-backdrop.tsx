"use client";

import { motion } from "framer-motion";

// Fixed-position visual heart of the landing route. Uses an image layer, a
// Belize-blue tint, and a blur shell so any Hebrew/English foreground text
// stays comfortably readable on top of the SAP S/4HANA artwork.
export function S4Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cover bg-center bg-fixed bg-no-repeat"
        style={{ backgroundImage: "url(/images/S4.png)" }}
      />

      {/* Belize-blue tint at 40% opacity. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.1 }}
        className="absolute inset-0 backdrop-blur-xl"
        style={{ backgroundColor: "rgba(0, 112, 242, 0.40)" }}
      />

      {/* Soft fade to background near top/bottom for legibility. */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
