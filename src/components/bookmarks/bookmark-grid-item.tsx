"use client";

import { Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  removeBookmark,
  setBookmarkStatus,
} from "@/app/bookmarks/actions";
import { AnimeCard, type CardMedia } from "@/components/anime-card";
import { useBookmarks } from "@/components/bookmarks/bookmark-provider";
import type { BookmarkStatus } from "@/lib/bookmarks/types";
import { cn } from "@/lib/utils";

export function BookmarkGridItem({
  media,
  tab,
}: {
  media: CardMedia;
  tab: BookmarkStatus;
}) {
  const router = useRouter();
  const { patch } = useBookmarks();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        await action();
        onSuccess?.();
        router.refresh();
      } catch {
        // ignore
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimeCard media={media} />
      <div className="flex flex-wrap gap-2">
        {tab !== "completed" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () => setBookmarkStatus(media.id, "completed"),
                () => patch(media.id, "completed"),
              )
            }
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-brand hover:text-text disabled:opacity-50",
            )}
          >
            <Check className="size-3" aria-hidden />
            Completed
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(
              () => removeBookmark(media.id),
              () => patch(media.id, null),
            )
          }
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-brand hover:text-text disabled:opacity-50"
        >
          <Trash2 className="size-3" aria-hidden />
          Remove
        </button>
      </div>
    </div>
  );
}
