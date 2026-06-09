import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export async function UserNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm text-text-muted transition-colors hover:text-text"
      >
        Sign in
      </Link>
    );
  }

  const label =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "Account";

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[8rem] truncate text-sm text-text-muted sm:inline">
        {label}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm text-text-muted transition-colors hover:text-text"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
