"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import type { HeroFieldsFragment } from "@/lib/anilist/gql/graphql";
import { cn } from "@/lib/utils";
import { formatCountdown, stripHtml } from "@/lib/utils/format";

const ROTATE_MS = 7000;
const SLIDE_MS = 420;
const SWIPE_INTENT_PX = 16;

function HeroSlide({
  slide,
  priority,
}: {
  slide: HeroFieldsFragment;
  priority: boolean;
}) {
  const title = slide.title?.english ?? slide.title?.romaji ?? "Untitled";
  const romaji =
    slide.title?.romaji && slide.title.romaji !== title
      ? slide.title.romaji
      : null;
  const synopsis = stripHtml(slide.description).slice(0, 240);
  const genres = (slide.genres ?? []).filter(Boolean).slice(0, 3);
  const banner = slide.bannerImage;
  const tint = slide.coverImage?.color;

  return (
    <div className="relative h-full w-full shrink-0 basis-full overflow-hidden bg-surface">
      {banner ? (
        <Image
          src={banner}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: tint ?? undefined }}
        />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/70 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-bg/80 to-transparent" />

      <div className="relative z-1 flex h-full w-full max-w-full flex-col justify-end gap-3 overflow-hidden p-6 pb-14 sm:max-w-2xl sm:p-10 sm:pb-14">
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
          className="block space-y-1 text-text transition-colors active:text-brand sm:hidden"
        >
          <h2 className="line-clamp-2 font-serif text-3xl leading-tight">
            {title}
          </h2>
          {romaji && <p className="line-clamp-1 text-sm text-text-muted">{romaji}</p>}
        </Link>

        <div className="hidden space-y-1 sm:block">
          <h2 className="line-clamp-2 font-serif text-3xl leading-tight text-text sm:text-4xl">
            {title}
          </h2>
          {romaji && <p className="line-clamp-1 text-sm text-text-muted">{romaji}</p>}
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
          <p className="line-clamp-2 max-w-prose text-sm leading-relaxed text-text/90 sm:line-clamp-3">
            {synopsis}…
          </p>
        )}

        <div className="hidden pt-1 sm:block">
          <Link
            href={`/anime/${slide.id}`}
            prefetch
            className="inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            View details
          </Link>
        </div>
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
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startTouch = useRef<{ x: number; y: number; locked: boolean } | null>(
    null,
  );
  const sectionRef = useRef<HTMLElement>(null);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
      setDragPx(0);
    },
    [count],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused || dragging) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [count, dragging, paused]);

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

  const onTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    if (!touch) return;

    startTouch.current = {
      x: touch.clientX,
      y: touch.clientY,
      locked: false,
    };
    setDragging(true);
    setPaused(true);
    setDragPx(0);
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      const start = startTouch.current;
      const touch = e.touches[0];
      if (!start || !touch || count <= 1) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (!start.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          startTouch.current = null;
          setDragging(false);
          setPaused(false);
          setDragPx(0);
          return;
        }
        start.locked = true;
      }

      let nextDrag = dx;
      if (index === 0 && nextDrag > 0) nextDrag *= 0.35;
      if (index === count - 1 && nextDrag < 0) nextDrag *= 0.35;
      setDragPx(nextDrag);
    },
    [count, index],
  );

  const onTouchEnd = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      const start = startTouch.current;
      startTouch.current = null;
      setDragging(false);
      setPaused(false);

      if (!start?.locked || count <= 1) {
        setDragPx(0);
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - start.x : dragPx;

      if (dx <= -SWIPE_INTENT_PX) goNext();
      else if (dx >= SWIPE_INTENT_PX) goPrev();
      else setDragPx(0);
    },
    [count, dragPx, goNext, goPrev],
  );

  const onTouchCancel = useCallback(() => {
    startTouch.current = null;
    setDragging(false);
    setPaused(false);
    setDragPx(0);
  }, []);

  if (slides.length === 0) return null;

  const trackTransform = `translateX(calc(-${index * 100}% + ${dragPx}px))`;

  return (
    <section
      ref={sectionRef}
      className="group/hero relative h-[380px] touch-pan-y overflow-hidden rounded-lg border border-border sm:h-[420px]"
      aria-roledescription="carousel"
      aria-label="Featured airing anime"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div
        className={cn(
          "flex h-full will-change-transform ease-out motion-reduce:transition-none",
          !dragging && "transition-transform",
        )}
        style={{
          transform: trackTransform,
          transitionDuration: dragging ? "0ms" : `${SLIDE_MS}ms`,
        }}
      >
        {slides.map((slide, i) => (
          <HeroSlide key={slide.id} slide={slide} priority={i === 0} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous featured anime"
            className="absolute top-1/2 left-3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/70 text-text opacity-0 backdrop-blur-sm transition-opacity group-hover/hero:opacity-100 hover:bg-surface-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:left-4 sm:flex"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured anime"
            className="absolute top-1/2 right-3 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg/70 text-text opacity-0 backdrop-blur-sm transition-opacity group-hover/hero:opacity-100 hover:bg-surface-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:right-4 sm:flex"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </>
      )}

      {count > 1 && (
        <nav
          aria-label="Featured slide controls"
          className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 border-t border-border/50 bg-bg/60 px-4 py-3 backdrop-blur-sm sm:justify-end sm:px-10"
        >
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
                onClick={() => goTo(i)}
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
        </nav>
      )}
    </section>
  );
}
