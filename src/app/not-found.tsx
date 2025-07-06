"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/common/footer";

export default function NotFound() {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background-primary-default px-6">
      <motion.div
        className="flex flex-col items-center justify-center flex-grow space-y-4 text-center"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        animate={{
          opacity: imageLoaded ? 1 : 0,
          filter: imageLoaded ? "blur(0px)" : "blur(8px)",
        }}
        transition={{ duration: 0.5 }}
      >
        {" "}
        <Image
          src="/illustrations/404-image.svg"
          alt="404"
          width={240}
          height={240}
          className="mb-4"
          onLoad={() => setImageLoaded(true)}
        />
        <h1 className="heading-06-medium text-text-primary-default">
          Página no encontrada
        </h1>
        <p className="body-02-regular text-text-secondary-default">
          Lo sentimos, no pudimos encontrar lo que buscas.
        </p>
        <Link
          href="/"
          className="body-02-semibold text-primary-default underline hover:no-underline"
        >
          Volver al inicio
        </Link>
      </motion.div>{" "}
      <Footer />
    </div>
  );
}
