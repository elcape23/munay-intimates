"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PropsWithChildren } from "react";

interface SlideUpSectionProps {
  className?: string;
}

export default function SlideUpSection({
  children,
  className = "",
}: PropsWithChildren<SlideUpSectionProps>) {
  return (
    <motion.section
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      exit={{ y: "100vh" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
