"use client";

import { motion } from "framer-motion";

export function LoadingSpinner() {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-t-transparent border-border-primary-default rounded-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.3, ease: "easeInOut" },
        rotate: { repeat: Infinity, duration: 1.2, ease: "linear" },
      }}
    />
  );
}

export default LoadingSpinner;
