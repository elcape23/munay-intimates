"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage("auth:success", window.location.origin);
      window.close();
    } else {
      router.replace("/");
    }
  }, [router]);

  return <p className="text-center p-4">Iniciando sesión...</p>;
}
