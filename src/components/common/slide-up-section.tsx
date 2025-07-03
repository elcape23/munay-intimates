"use client";

import { motion } from "framer-motion";
import { PropsWithChildren, useEffect } from "react";

interface SlideUpSectionProps {
  className?: string;
}

export default function SlideUpSection({
  children,
  className = "",
}: PropsWithChildren<SlideUpSectionProps>) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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
