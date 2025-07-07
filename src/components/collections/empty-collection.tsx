"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export function EmptyCollection() {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-grow"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{
        opacity: imageLoaded ? 1 : 0,
        filter: imageLoaded ? "blur(0px)" : "blur(8px)",
      }}
      transition={{ duration: 0.5 }}
    >
      <Image
        src="/illustrations/collections-empty.svg"
        alt="Colección vacía"
        width={240}
        height={240}
        className="mb-4"
        onLoad={() => setImageLoaded(true)}
      />
      <h1 className="heading-06-regular text-text-primary-default mb-6 text-center">
        Pronto habrá productos de esta categoría
      </h1>
      <Link
        href="/"
        className="body-01-medium underline text-text-primary-default hover:underline text-text-secondary-default body-01-semibold"
      >
        Seguir comprando
      </Link>
    </motion.div>
  );
}
