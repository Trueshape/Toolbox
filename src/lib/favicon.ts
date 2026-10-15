// favicon.ts — scarica la favicon di un sito e la restituisce come data URI. Solo lato server.
// Se il sito non ne ha una, o non è un'immagine, restituisce null.

const MAX_BYTES = 200 * 1024;

export async function fetchFavicon(siteUrl: string): Promise<string | null> {
  try {
    const origin = new URL(siteUrl).origin;
    const page = await fetch(origin, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 Toolbox" },
    });
    const html = (await page.text()).slice(0, 200_000);
    const link = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i);
    const href = link?.[0].match(/href=["']([^"']+)["']/i)?.[1] ?? "/favicon.ico";
    const res = await fetch(new URL(href, origin), {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 Toolbox" },
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) return null;
    return "data:" + type + ";base64," + bytes.toString("base64");
  } catch {
    return null;
  }
}
