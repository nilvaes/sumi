import { ImageResponse } from "next/og";
import { loadNotoSansJP } from "@/lib/og-fonts";

export const alt = "Sumi — Track & Explore New Anime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const font = await loadNotoSansJP("墨Sumi");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f0e0d",
          color: "#e8e4df",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              fontSize: "36px",
              fontFamily: "Noto Sans JP",
              fontWeight: 500,
              color: "#e8e4df",
            }}
          >
            墨
          </div>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              background: "#c45c3e",
            }}
          />
          <div
            style={{
              fontSize: "30px",
              letterSpacing: "8px",
              textTransform: "uppercase",
              color: "#8a8279",
            }}
          >
            Sumi
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "108px",
              lineHeight: 1.05,
              fontWeight: 600,
            }}
          >
            <span>Track &amp; Explore</span>
            <span>New Anime</span>
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#8a8279",
              fontFamily: "Helvetica, Arial, sans-serif",
              maxWidth: "880px",
            }}
          >
            Browse what&apos;s airing, search the full catalog, and check the
            week&apos;s schedule — a calm, dark editorial discovery app.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "26px",
            color: "#8a8279",
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <span>Browse</span>
          <span style={{ color: "#c45c3e" }}>·</span>
          <span>Search</span>
          <span style={{ color: "#c45c3e" }}>·</span>
          <span>Schedule</span>
          <span style={{ color: "#c45c3e" }}>·</span>
          <span>Detail</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: font, style: "normal", weight: 500 }],
    },
  );
}
