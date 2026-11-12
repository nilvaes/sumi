import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { getCurrentUser } from "@/lib/supabase/user";

export async function UserNav() {
  const user = await getCurrentUser();

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
