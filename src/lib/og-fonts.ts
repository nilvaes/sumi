/** Load a minimal Noto Sans JP slice for OG icons (single kanji or short text). */
export async function loadNotoSansJP(text: string, weight = 500) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; Sumi/1.0)" } },
  ).then((r) => r.text());

  const url = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error("Noto Sans JP fetch failed");

  return fetch(url).then((r) => r.arrayBuffer());
}
