const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "tb3zbk3n7q";

export const CLARITY_CONSENT_EVENT = "clarity-consent-granted";
const CONSENT_STORAGE_KEY = "cookie-consent";

type ClarityFunction = (command: string, ...args: any[]) => void;
type ClarityStub = ClarityFunction & { q?: any[] };

interface ClarityWindow extends Window {
  clarity?: ClarityStub;
}

const isBrowser = () => typeof window !== "undefined";

export function hasClarityConsent(): boolean {
  if (!isBrowser()) return false;
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function loadClarity(): void {
  if (!isBrowser()) return;
  const clarityWindow = window as ClarityWindow;
  if (clarityWindow.clarity) return;

  const stub: ClarityStub = function (...args: any[]) {
    (stub.q = stub.q || []).push(args);
  };

  clarityWindow.clarity = stub;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;

  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

export function callClarity(command: string, ...args: any[]): void {
  if (!isBrowser() || !hasClarityConsent()) return;
  loadClarity();
  const clarityFn = (window as ClarityWindow).clarity;
  if (typeof clarityFn === "function") {
    clarityFn(command, ...args);
  }
}

export function setClarityTag(
  key: string,
  value: string | number | boolean
): void {
  const sanitized =
    typeof value === "boolean" ? (value ? "true" : "false") : value;
  callClarity("set", key, sanitized);
}

function sanitizePayload(
  payload?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const entries = Object.entries(payload).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

export function trackClarityEvent(
  name: string,
  data?: Record<string, unknown>
): void {
  const payload = sanitizePayload(data);
  if (payload) {
    callClarity("event", name, payload);
  } else {
    callClarity("event", name);
  }
}

export function notifyClarityConsentGranted(): void {
  callClarity("consent");
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CLARITY_CONSENT_EVENT));
}
