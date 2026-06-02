import Link from "next/link";

export function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-text">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-text-muted transition-colors hover:text-brand"
          >
            View all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
