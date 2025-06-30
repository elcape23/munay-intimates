// components/SplashScreen.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete?: () => void;
}

/**
 * SplashScreen: primero el logo, luego un spinner que aparece y desaparece con difuminado, y finalmente llama a onComplete
 * Flujo:
 * 1. logoEnter (entrada + estancia de 3s)
 * 2. logoExit (0.8s)
 * 3. spinner (2s), fade-in/fade-out y rotación continua
 * 4. loaded (fade-out completo) + onComplete()
 */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState<
    "logoEnter" | "logoExit" | "spinner" | "loaded"
  >("logoEnter");

  // Desencadena salida del logo tras 3s
  useEffect(() => {
    if (step !== "logoEnter") return;
    const timer = setTimeout(() => setStep("logoExit"), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  // Tras logoExit, iniciamos spinner tras 0.8s
  useEffect(() => {
    if (step !== "logoExit") return;
    const timer = setTimeout(() => setStep("spinner"), 800);
    return () => clearTimeout(timer);
  }, [step]);

  // Tras spinner, completamos carga tras 2s
  useEffect(() => {
    if (step !== "spinner") return;
    const timer = setTimeout(() => setStep("loaded"), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  // Cuando termina, notificamos al layout
  useEffect(() => {
    if (step === "loaded" && onComplete) {
      onComplete();
    }
  }, [step, onComplete]);

  return (
    <AnimatePresence>
      {step !== "loaded" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-background-primary-default z-[9999] flex items-center justify-center"
        >
          {(step === "logoEnter" || step === "logoExit") && (
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
          )}

          {step === "spinner" && (
            <motion.div
              className="w-12 h-12 border-4 border-t-4 border-border-primary-default border-t-transparent rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 2, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 1.2, ease: "linear" },
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
