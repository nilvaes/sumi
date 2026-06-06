import { ImageResponse } from "next/og";

export const alt = "Sumi — Track & Explore New Anime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Warm-dark editorial OG card. Latin-only so it renders without bundling a CJK font.
export default function OpengraphImage() {
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
              width: "18px",
              height: "18px",
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
          <div style={{ fontSize: "108px", lineHeight: 1.05, fontWeight: 600 }}>
            Track &amp; Explore
            <br />
            New Anime
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
    { ...size },
  );
}
