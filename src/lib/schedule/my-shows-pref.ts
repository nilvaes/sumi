/**
 * Remembers whether the Schedule page shows only the user's "Watching" anime.
 * Per-device (localStorage), shared across tabs via the storage event.
 */
const STORAGE_KEY = "sumi:schedule-my-shows";

const listeners = new Set<() => void>();
let sessionValue: boolean | null = null;

export function subscribeMyShows(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      sessionValue = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getMyShows(): boolean {
  if (sessionValue !== null) return sessionValue;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function getMyShowsServer(): boolean {
  return false;
}

export function setMyShows(value: boolean) {
  sessionValue = value;
  try {
    if (value) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing: remembered for this session only.
  }
  listeners.forEach((l) => l());
}
