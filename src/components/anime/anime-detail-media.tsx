"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { DETAIL_FADE_MS, FadeIn } from "./fade-in";

type Props = {
  bannerUrl?: string | null;
  coverUrl?: string | null;
  title: string;
  aside: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
};

/**
 * Banner and cover decode together, then fade in as one beat.
 * Text/aside fade in on mount so copy is readable while images finish.
 */
export function AnimeDetailMedia({
  bannerUrl,
  coverUrl,
  title,
  aside,
  children,
  footer,
}: Props) {
  const [bannerReady, setBannerReady] = useState(!bannerUrl);
  const [coverReady, setCoverReady] = useState(!coverUrl);
  const imagesReady = bannerReady && coverReady;

  const markBannerReady = useCallback(() => setBannerReady(true), []);
  const markCoverReady = useCallback(() => setCoverReady(true), []);

  const imageFade = cn(
    "object-cover transition-opacity ease-out motion-reduce:transition-none",
    imagesReady ? "opacity-100" : "opacity-0",
  );

  return (
    <article>
      <div className="relative h-48 w-full overflow-hidden bg-surface sm:h-64 md:h-80">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className={imageFade}
            style={{ transitionDuration: `${DETAIL_FADE_MS}ms` }}
            onLoad={markBannerReady}
            onError={markBannerReady}
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="-mt-24 grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] md:gap-10">
          <div className="space-y-4">
            <div className="relative mx-auto aspect-2/3 w-40 overflow-hidden rounded-md border border-border bg-surface shadow-lg md:mx-0 md:w-full">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  priority
                  sizes="220px"
                  className={imageFade}
                  style={{ transitionDuration: `${DETAIL_FADE_MS}ms` }}
                  onLoad={markCoverReady}
                  onError={markCoverReady}
                />
              ) : (
                <div className="flex h-full items-center justify-center font-jp text-4xl text-text-muted">
                  墨
                </div>
              )}
            </div>
            <FadeIn>{aside}</FadeIn>
          </div>

          <FadeIn className="space-y-6 md:pt-24">{children}</FadeIn>
        </div>

        <FadeIn className="mt-12">{footer}</FadeIn>
      </div>
    </article>
  );
}
