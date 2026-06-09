import Link from "next/link";
import { BOOKMARK_STATUS_META, RIBBON_STATUSES } from "@/lib/bookmarks/config";
import { createClient } from "@/lib/supabase/server";

function BookmarkLegendTip() {
  return (
    <p className="rounded-md border border-brand/15 bg-brand/5 px-4 py-3 text-center text-xs leading-relaxed text-text-muted sm:text-sm">
      Hover the bookmark on any poster to save anime.{" "}
      <span className="mt-1.5 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {RIBBON_STATUSES.map((status) => {
          const { Icon, label } = BOOKMARK_STATUS_META[status];
          return (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 text-text"
            >
              <Icon className="size-3.5 shrink-0 text-brand" aria-hidden />
              {label}
            </span>
          );
        })}
      </span>
    </p>
  );
}

function BookmarkSignInTip() {
  return (
    <p className="rounded-md border border-border bg-surface px-4 py-3 text-center text-xs leading-relaxed text-text-muted sm:text-sm">
      <Link
        href="/login"
        className="font-medium text-text transition-colors hover:text-brand"
      >
        Sign in
      </Link>{" "}
      to save bookmarks — your Watching, Planning, and Completed lists stay on
      your account.
    </p>
  );
}

/** Icon legend + sign-in prompt (when logged out), shown under the home hero. */
export async function BookmarkTips() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-3">
      <BookmarkLegendTip />
      {!user && <BookmarkSignInTip />}
    </div>
  );
}
