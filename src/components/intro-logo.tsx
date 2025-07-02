"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface IntroLogoProps {
  onComplete?: () => void;
}

export function IntroLogo({ onComplete }: IntroLogoProps) {
  const [step, setStep] = useState<"logoEnter" | "logoExit" | "loaded">(
    "logoEnter"
  );

  useEffect(() => {
    if (step !== "logoEnter") return;
    const timer = setTimeout(() => setStep("logoExit"), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step !== "logoExit") return;
    const timer = setTimeout(() => setStep("loaded"), 800);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step === "loaded" && onComplete) {
      onComplete();
    }
  }, [step, onComplete]);

  return (
    <AnimatePresence>
      {step !== "loaded" && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-background-primary-default z-[9999] flex items-center justify-center"
        >
          <div className="overflow-hidden h-16 flex items-center justify-center">
            <motion.img
              src="/munay-wordmark.svg"
              alt="Munay Wordmark"
              className="w-44 h-44"
              initial={{ y: "100%" }}
              animate={{ y: step === "logoEnter" ? "0%" : "100%" }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroLogo;
