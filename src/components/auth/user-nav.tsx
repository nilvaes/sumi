import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { createClient } from "@/lib/supabase/server";

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

  return <UserMenu />;
}
