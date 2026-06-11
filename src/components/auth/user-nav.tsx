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

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-text-muted transition-colors hover:text-text"
      >
        Sign out
      </button>
    </form>
  );
}
