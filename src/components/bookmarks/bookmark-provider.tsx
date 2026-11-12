"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BookmarkMap, BookmarkStatus } from "@/lib/bookmarks/types";

type BookmarkContextValue = {
  map: BookmarkMap;
  isLoggedIn: boolean;
  /** Local update of the bookmark map (applied optimistically, rolled back on failure). */
  patch: (anilistId: number, status: BookmarkStatus | null) => void;
  /** Show a short, dismissible notice (e.g. a bookmark failed to save). */
  notify: (message: string) => void;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

const NOTICE_MS = 5000;

export function BookmarkProvider({
  children,
  initialMap,
  isLoggedIn,
}: {
  children: ReactNode;
  initialMap: BookmarkMap;
  isLoggedIn: boolean;
}) {
  const [map, setMap] = useState(initialMap);
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const patch = useCallback((anilistId: number, status: BookmarkStatus | null) => {
    setMap((prev) => {
      if (status === null) {
        const next = { ...prev };
        delete next[anilistId];
        return next;
      }
      return { ...prev, [anilistId]: status };
    });
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    setNotice(null);
  }, []);

  const notify = useCallback(
    (message: string) => {
      clearTimeout(timerRef.current);
      setNotice({ id: Date.now(), message });
      timerRef.current = setTimeout(dismiss, NOTICE_MS);
    },
    [dismiss],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const value = useMemo(
    () => ({ map, isLoggedIn, patch, notify }),
    [map, isLoggedIn, patch, notify],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
      >
        {notice && (
          <div
            key={notice.id}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-md border border-brand/60 bg-surface px-4 py-2.5 text-sm text-text shadow-lg shadow-black/40"
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 text-xs text-text-muted transition-colors hover:text-text"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    return {
      map: {} as BookmarkMap,
      isLoggedIn: false,
      patch: () => {},
      notify: () => {},
    };
  }
  return ctx;
}
