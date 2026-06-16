const STORAGE_KEY = "sumi:dismissed-bookmark-ribbon-tip";

const listeners = new Set<() => void>();
const sessionDismissed = new Set<string>();

export function subscribeRibbonTip(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function isRibbonTipDismissed(): boolean {
  if (sessionDismissed.has(STORAGE_KEY)) return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissRibbonTip() {
  sessionDismissed.add(STORAGE_KEY);
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private browsing — session-only.
  }
  listeners.forEach((l) => l());
}

export function ribbonTipServerDismissed(): boolean {
  return true;
}
