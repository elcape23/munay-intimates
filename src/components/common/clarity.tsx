"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  CLARITY_CONSENT_EVENT,
  callClarity,
  hasClarityConsent,
  loadClarity,
  setClarityTag,
} from "@/lib/clarity";

const VISITED_KEY = "clarity-visited";
const SOURCE_STORAGE_KEY = "clarity-source";

type UserType = "guest" | "registered" | "returning";
type FunnelStage = "browsing" | "cart" | "checkout" | "purchase";
type BehaviorTag = "high_scroll" | "no_interaction" | "quick_exit";

interface ExtendedSessionUser {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function determineSource(): string {
  if (typeof window === "undefined") return "direct";
  try {
    const stored = sessionStorage.getItem(SOURCE_STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // ignore storage errors
  }
  let source = "direct";
  try {
    const url = new URL(window.location.href);
    const utmSource = url.searchParams.get("utm_source");
    if (utmSource) {
      source = utmSource.toLowerCase();
    } else if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      const host = referrerUrl.hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname.replace(/^www\./, "")) {
        source = host.toLowerCase();
      }
    }
  } catch {
    // ignore parsing errors
  }
  try {
    sessionStorage.setItem(SOURCE_STORAGE_KEY, source);
  } catch {
    // ignore storage errors
  }
  return source;
}

function determineDevice(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const userAgent = navigator.userAgent || "";
  const width = window.innerWidth;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)
  ) {
    return "mobile";
  }
  if (width <= 768) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function determineFunnelStage(pathname: string): FunnelStage {
  if (pathname.startsWith("/cart")) return "cart";
  if (pathname.startsWith("/checkout")) {
    if (/\/checkout\/(cash|transfer|success)/.test(pathname)) {
      return "purchase";
    }
    return "checkout";
  }
  return "browsing";
}

export function Clarity() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [consent, setConsent] = useState<boolean>(() => hasClarityConsent());
  const sourceSetRef = useRef(false);
  const deviceSetRef = useRef(false);
  const userTypeRef = useRef<UserType | null>(null);
  const stageRef = useRef<FunnelStage | null>(null);

  useEffect(() => {
    const updateConsent = () => setConsent(hasClarityConsent());
    window.addEventListener(CLARITY_CONSENT_EVENT, updateConsent);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "cookie-consent") {
        updateConsent();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CLARITY_CONSENT_EVENT, updateConsent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!consent) return;
    loadClarity();
  }, [consent]);

  useEffect(() => {
    if (!consent) return;
    if (!sourceSetRef.current) {
      const source = determineSource();
      setClarityTag("source", source);
      sourceSetRef.current = true;
    }
    if (!deviceSetRef.current) {
      const device = determineDevice();
      setClarityTag("device", device);
      deviceSetRef.current = true;
    }
  }, [consent]);

  useEffect(() => {
    if (!consent) return;
    const user = session?.user as ExtendedSessionUser | undefined;
    let visitedBefore = false;
    try {
      visitedBefore = localStorage.getItem(VISITED_KEY) === "true";
    } catch {
      visitedBefore = false;
    }

    const userType: UserType = user
      ? "registered"
      : visitedBefore
      ? "returning"
      : "guest";

    if (userTypeRef.current !== userType) {
      setClarityTag("user_type", userType);
      userTypeRef.current = userType;
    }

    if (!visitedBefore) {
      try {
        localStorage.setItem(VISITED_KEY, "true");
      } catch {
        // ignore storage errors
      }
    }

    if (user) {
      const identifier = user.id || user.email || user.name;
      if (identifier) {
        callClarity("identify", identifier);
        setClarityTag("user_id", identifier);
      }
      if (user.email) setClarityTag("user_email", user.email);
      if (user.name) setClarityTag("user_name", user.name);
      if (user.firstName) setClarityTag("user_first_name", user.firstName);
      if (user.lastName) setClarityTag("user_last_name", user.lastName);
    }
  }, [consent, session?.user]);

  useEffect(() => {
    if (!consent) return;
    const stage = determineFunnelStage(pathname);
    if (stageRef.current !== stage) {
      setClarityTag("funnel_stage", stage);
      stageRef.current = stage;
    }
  }, [consent, pathname]);

  useEffect(() => {
    if (!consent) return;
    let currentBehavior: BehaviorTag = "no_interaction";
    let interacted = false;
    let highScroll = false;
    const startTime = Date.now();

    const updateBehavior = (behavior: BehaviorTag) => {
      if (currentBehavior === behavior) return;
      currentBehavior = behavior;
      setClarityTag("behavior", behavior);
    };

    updateBehavior("no_interaction");

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      if (scrollHeight <= clientHeight) return;
      const scrolled = (scrollTop + clientHeight) / scrollHeight;
      if (scrolled >= 0.75) {
        highScroll = true;
        updateBehavior("high_scroll");
        window.removeEventListener("scroll", handleScroll);
      }
      if (scrolled > 0) {
        interacted = true;
      }
    };

    const markInteraction = () => {
      interacted = true;
    };

    const handleQuickExit = () => {
      const elapsed = Date.now() - startTime;
      if (!highScroll && !interacted && elapsed < 10000) {
        updateBehavior("quick_exit");
      }
    };

    const noInteractionTimeout = window.setTimeout(() => {
      if (!interacted && !highScroll) {
        updateBehavior("no_interaction");
      }
    }, 15000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", markInteraction);
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("pagehide", handleQuickExit);
    window.addEventListener("beforeunload", handleQuickExit);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("pagehide", handleQuickExit);
      window.removeEventListener("beforeunload", handleQuickExit);
      window.clearTimeout(noInteractionTimeout);
    };
  }, [consent, pathname]);

  return null;
}
