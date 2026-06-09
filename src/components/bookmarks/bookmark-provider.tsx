"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BookmarkMap, BookmarkStatus } from "@/lib/bookmarks/types";

type BookmarkContextValue = {
  map: BookmarkMap;
  isLoggedIn: boolean;
  /** Optimistic local update after a server action succeeds. */
  patch: (anilistId: number, status: BookmarkStatus | null) => void;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

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

  const value = useMemo(
    () => ({ map, isLoggedIn, patch }),
    [map, isLoggedIn, patch],
  );

  return (
    <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    return {
      map: {} as BookmarkMap,
      isLoggedIn: false,
      patch: () => {},
    };
  }
  return ctx;
}
