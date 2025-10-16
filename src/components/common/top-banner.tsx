"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function TopBanner() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-0 inset-x-0 z-50 bg-background-fill-danger-default text-text-primary-invert body-02-bold text-center py-2"
    >
      10% OFF EXTRA por el Día de la Madre
    </motion.div>
  );
}
