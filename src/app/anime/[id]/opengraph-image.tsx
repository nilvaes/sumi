import { ImageResponse } from "next/og";
import { getAnimeDetail } from "@/lib/anilist/api";
import { loadNotoSansJP } from "@/lib/og-fonts";

export const alt = "Anime on Sumi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COVER_HOST = "s4.anilist.co";
const COVER_MAX_BYTES = 2_000_000;

type Params = { params: Promise<{ id: string }> };

/** Per-anime link preview: cover on the left, title and details on the right. */
export default async function AnimeOpengraphImage({ params }: Params) {
  const { id } = await params;
  const media = await loadMedia(id);

  const title = media
    ? (media.title?.english ?? media.title?.romaji ?? "Untitled")
    : "Track & Explore New Anime";
  const shortTitle = title.length > 70 ? `${title.slice(0, 69)}…` : title;
  const details = media
    ? [
        media.format?.replace(/_/g, " "),
        media.seasonYear ? String(media.seasonYear) : null,
        media.episodes ? `${media.episodes} eps` : null,
      ].filter((d): d is string => Boolean(d))
    : [];
  const genres = (media?.genres ?? [])
    .filter((g): g is string => Boolean(g))
    .slice(0, 3);
  const score = media?.averageScore ?? null;
  const cover = media ? await loadCover(media.coverImage?.extraLarge) : null;

  // Noto Sans JP sliced to exactly the glyphs drawn, so Japanese or symbol
  // characters in titles render instead of showing as boxes.
  let font: ArrayBuffer | null = null;
  try {
    font = await loadNotoSansJP(
      `墨SUMI${shortTitle}${details.join("")}${genres.join("")}0123456789%·`,
    );
  } catch {
    font = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f0e0d",
          color: "#e8e4df",
          fontFamily: font ? "Noto Sans JP" : "sans-serif",
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img
            src={cover}
            width={440}
            height={630}
            style={{ width: 440, height: 630, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            borderLeft: cover ? "6px solid #c45c3e" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 34 }}>墨</div>
            <div
              style={{ width: 6, height: 6, borderRadius: 9999, background: "#c45c3e" }}
            />
            <div style={{ fontSize: 26, letterSpacing: 8, color: "#8a8279" }}>SUMI</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                fontSize: shortTitle.length > 40 ? 58 : 72,
                lineHeight: 1.1,
              }}
            >
              {shortTitle}
            </div>
            {details.length > 0 && (
              <div style={{ display: "flex", gap: 14, fontSize: 28, color: "#8a8279" }}>
                {details.map((d, i) => (
                  <div key={d} style={{ display: "flex", gap: 14 }}>
                    {i > 0 && <span style={{ color: "#c45c3e" }}>·</span>}
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#8a8279",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              {genres.map((g) => (
                <span
                  key={g}
                  style={{
                    border: "1px solid #2a2622",
                    borderRadius: 6,
                    padding: "6px 14px",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
            {score !== null && (
              <div style={{ color: "#e8e4df", fontSize: 30 }}>{`${score}%`}</div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Noto Sans JP", data: font, style: "normal", weight: 500 }]
        : undefined,
    },
  );
}

async function loadMedia(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  try {
    const { Media } = await getAnimeDetail(id);
    // Same rule as the page: never preview adult titles.
    return Media && !Media.isAdult ? Media : null;
  } catch {
    return null;
  }
}

/** Inline the cover as a data URI: AniList's CDN only, JPEG/PNG only, size-capped. */
async function loadCover(url: string | null | undefined) {
  if (!url) return null;
  try {
    if (new URL(url).hostname !== COVER_HOST) return null;
    const res = await fetch(url);
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!res.ok || !/^image\/(jpeg|png)$/.test(type)) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > COVER_MAX_BYTES) return null;
    return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}
