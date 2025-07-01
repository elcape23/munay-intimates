"use client";

import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
