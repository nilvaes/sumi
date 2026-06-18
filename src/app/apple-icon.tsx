import { ImageResponse } from "next/og";
import { loadNotoSansJP } from "@/lib/og-fonts";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const font = await loadNotoSansJP("墨");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0e0d",
          color: "#e8e4df",
          fontSize: 112,
          fontFamily: "Noto Sans JP",
          fontWeight: 500,
        }}
      >
        墨
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: font, style: "normal", weight: 500 }],
    },
  );
}
