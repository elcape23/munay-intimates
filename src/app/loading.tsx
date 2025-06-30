"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        className="fixed inset-0 flex items-center justify-center bg-background-primary-default z-[9999]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-12 h-12 border-4 border-t-transparent border-border-primary-default rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
