"use client";

import { useEffect } from "react";

export function loadClarity() {
  if (typeof window === "undefined" || (window as any).clarity) return;
  (function (c: any, l: any, a: any, r: any, i?: any, t?: any, y?: any) {
    c[a] =
      c[a] ||
      function (...args: any[]) {
        (c[a].q = c[a].q || []).push(args);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/tb3zbk3n7q";
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script");
}

export function Clarity() {
  useEffect(() => {
    if (localStorage.getItem("cookie-consent") === "accepted") {
      loadClarity();
    }
  }, []);

  return null;
}
