"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroFieldsFragment } from "@/lib/anilist/gql/graphql";
import { formatCountdown, stripHtml } from "@/lib/utils/format";

const ROTATE_MS = 7000;

export function Hero({
  items,
}: {
  items: readonly (HeroFieldsFragment | null)[];
}) {
  const slides = items.filter((m): m is HeroFieldsFragment => Boolean(m));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const active = slides[index];

  const title = active.title?.english ?? active.title?.romaji ?? "Untitled";
  const romaji =
    active.title?.romaji && active.title.romaji !== title
      ? active.title.romaji
      : null;
  const synopsis = stripHtml(active.description).slice(0, 240);
  const background = active.bannerImage ?? active.coverImage?.large;
  const genres = (active.genres ?? []).filter(Boolean).slice(0, 3);

  return (
    <section className="relative h-[380px] overflow-hidden rounded-lg border border-border sm:h-[420px]">
      {background && (
        <Image
          key={active.id}
          src={background}
          alt=""
          fill
          priority
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/80 to-bg/20" />
      <div className="absolute inset-0 bg-linear-to-r from-bg/90 to-transparent" />

      <div className="relative flex h-full flex-col justify-end gap-3 p-6 sm:max-w-2xl sm:p-10">
        {active.nextAiringEpisode && (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Episode {active.nextAiringEpisode.episode} in{" "}
            {formatCountdown(active.nextAiringEpisode.timeUntilAiring)}
          </p>
        )}

        <div className="space-y-1">
          <h2 className="font-serif text-3xl leading-tight text-text sm:text-4xl">
            {title}
          </h2>
          {romaji && <p className="text-sm text-text-muted">{romaji}</p>}
        </div>

        {genres.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs text-text-muted">
            {genres.map((g) => (
              <li key={g} className="rounded-full border border-border px-2.5 py-0.5">
                {g}
              </li>
            ))}
          </ul>
        )}

        {synopsis && (
          <p className="line-clamp-3 max-w-prose text-sm leading-relaxed text-text/90">
            {synopsis}…
          </p>
        )}

        <div className="flex items-center gap-4 pt-1">
          <Link
            href={`/anime/${active.id}`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            View details
          </Link>

          {slides.length > 1 && (
            <div className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show featured anime ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-brand"
                      : "w-1.5 bg-text-muted/50 hover:bg-text-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
