import Image from "next/image";
import Link from "next/link";

export function RelationCard({
  id,
  label,
  title,
  cover,
  isAnime,
}: {
  id: number;
  label: string | null;
  title: string;
  cover?: string | null;
  isAnime: boolean;
}) {
  const inner = (
    <div className="flex gap-3">
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded border border-border bg-surface">
        {cover ? (
          <Image src={cover} alt={title} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-jp text-text-muted">
            墨
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-1 py-1">
        {label && (
          <p className="text-xs uppercase tracking-wide text-brand">{label}</p>
        )}
        <p className="line-clamp-2 text-sm leading-snug text-text">{title}</p>
      </div>
    </div>
  );

  const className =
    "rounded-md border border-border bg-surface p-2 transition-colors hover:bg-surface-hover";

  return isAnime ? (
    <Link href={`/anime/${id}`} prefetch className={`block ${className}`}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
