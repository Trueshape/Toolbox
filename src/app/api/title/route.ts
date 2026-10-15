// GET /api/title?url=...: legge il <title> di una pagina per suggerire il nome del sito

import { NextResponse } from "next/server";
import { parseUrl } from "../../../lib/catalog";

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">" };

export async function GET(req: Request) {
  const url = parseUrl(new URL(req.url).searchParams.get("url"));
  if (!url) return NextResponse.json({ error: "indirizzo non valido" }, { status: 400 });

  try {
    const page = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0 Toolbox" },
    });
    const html = (await page.text()).slice(0, 200_000);
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = match
      ? match[1].replace(/\s+/g, " ").replace(/&(amp|quot|#39|lt|gt);/g, (e) => ENTITIES[e]).trim()
      : "";
    return NextResponse.json({ title });
  } catch {
    return NextResponse.json({ title: "" });
  }
}
