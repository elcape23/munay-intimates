"use client";

import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage("google-auth-success", window.location.origin);
      window.close();
    }
  }, []);

  return <p>Autenticando...</p>;
}
