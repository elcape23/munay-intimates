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
      className="fixed top-0 inset-x-0 z-50 bg-background-surface-primary-invert text-text-primary-invert body-02-regular text-center py-2"
    >
      25% OFF en Efectivo o Transferencia
    </motion.div>
  );
}
