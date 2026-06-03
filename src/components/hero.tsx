"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { HeroFieldsFragment } from "@/lib/anilist/gql/graphql";
import { cn } from "@/lib/utils";
import { formatCountdown, stripHtml } from "@/lib/utils/format";

const ROTATE_MS = 7000;
const FADE_MS = 600;

function HeroSlidePanel({
  slide,
  visible,
}: {
  slide: HeroFieldsFragment;
  visible: boolean;
}) {
  const title = slide.title?.english ?? slide.title?.romaji ?? "Untitled";
  const romaji =
    slide.title?.romaji && slide.title.romaji !== title
      ? slide.title.romaji
      : null;
  const synopsis = stripHtml(slide.description).slice(0, 240);
  const genres = (slide.genres ?? []).filter(Boolean).slice(0, 3);

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-end gap-3 p-6 transition-[opacity,transform] ease-in-out motion-reduce:transition-none sm:max-w-2xl sm:p-10",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={!visible}
    >
      {slide.nextAiringEpisode && (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          Episode {slide.nextAiringEpisode.episode} in{" "}
          {formatCountdown(slide.nextAiringEpisode.timeUntilAiring)}
        </p>
      )}

      {/* Mobile: tap title (and romaji) to open detail — no separate button */}
      <Link
        href={`/anime/${slide.id}`}
        prefetch
        tabIndex={visible ? 0 : -1}
        className="block space-y-1 text-text transition-colors active:text-brand sm:hidden"
      >
        <h2 className="font-serif text-3xl leading-tight">{title}</h2>
        {romaji && <p className="text-sm text-text-muted">{romaji}</p>}
      </Link>

      <div className="hidden space-y-1 sm:block">
        <h2 className="font-serif text-3xl leading-tight text-text sm:text-4xl">
          {title}
        </h2>
        {romaji && <p className="text-sm text-text-muted">{romaji}</p>}
      </div>

      {genres.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-xs text-text-muted">
          {genres.map((g) => (
            <li
              key={g}
              className="rounded-full border border-border px-2.5 py-0.5"
            >
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

      <div className="hidden pt-1 sm:block">
        <Link
          href={`/anime/${slide.id}`}
          prefetch
          tabIndex={visible ? 0 : -1}
          className="inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

export function Hero({
  items,
}: {
  items: readonly (HeroFieldsFragment | null)[];
}) {
  // Prefer slides with a banner so we never stretch a portrait cover across the hero.
  const slides = items
    .filter((m): m is HeroFieldsFragment => Boolean(m))
    .sort((a, b) => Number(!!b.bannerImage) - Number(!!a.bannerImage));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, goNext, goPrev]);

  if (slides.length === 0) return null;

  return (
    <section
      className="group/hero relative h-[380px] overflow-hidden rounded-lg border border-border sm:h-[420px]"
      aria-roledescription="carousel"
      aria-label="Featured airing anime"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      {/* Background layers — crossfade */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const banner = slide.bannerImage;
          const tint = slide.coverImage?.color;
          if (!banner && !tint) return null;
          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none",
                i === index ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={i !== index}
            >
              {banner ? (
                <Image
                  src={banner}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={90}
                  className="object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-surface"
                  style={{ backgroundColor: tint ?? undefined }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-bg/80 to-transparent" />

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous featured anime"
            className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/70 text-text opacity-0 backdrop-blur-sm transition-opacity group-hover/hero:opacity-100 hover:bg-surface-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:left-4"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured anime"
            className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/70 text-text opacity-0 backdrop-blur-sm transition-opacity group-hover/hero:opacity-100 hover:bg-surface-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:right-4"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}

      {/* Text + nav: nav sits in its own row so copy never sits under controls */}
      <div className="relative z-1 flex h-full flex-col">
        <div className="relative min-h-0 flex-1">
          {slides.map((slide, i) => (
            <HeroSlidePanel key={slide.id} slide={slide} visible={i === index} />
          ))}
        </div>

        {count > 1 && (
          <nav
            aria-label="Featured slide controls"
            className="flex shrink-0 items-center justify-center gap-2 border-t border-border/50 bg-bg/60 px-4 py-3 backdrop-blur-sm sm:justify-end sm:px-10"
          >
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous featured anime"
              className="rounded-md border border-border bg-surface/80 px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text sm:hidden"
            >
              Prev
            </button>
            <div
              className="flex gap-2"
              role="tablist"
              aria-label="Featured slides"
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  onClick={() => setIndex(i)}
                  aria-label={`Show featured anime ${i + 1}`}
                  aria-selected={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 ease-out",
                    i === index
                      ? "w-6 bg-brand"
                      : "w-1.5 bg-text-muted/50 hover:bg-text-muted",
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next featured anime"
              className="rounded-md border border-border bg-surface/80 px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text sm:hidden"
            >
              Next
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
