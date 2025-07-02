"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function Loading() {
  return (
    <AnimatePresence>
      <motion.div
        key="loading"
        className="fixed inset-0 flex items-center justify-center bg-background-primary-default z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <LoadingSpinner />
      </motion.div>
    </AnimatePresence>
  );
}
