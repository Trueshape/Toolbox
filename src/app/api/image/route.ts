// GET /api/image?url=...: scarica un'immagine da un link e la restituisce come data URI (per la miniatura)

import { NextResponse } from "next/server";
import { parseUrl } from "../../../lib/catalog";

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(req: Request) {
  const url = parseUrl(new URL(req.url).searchParams.get("url"));
  if (!url) return NextResponse.json({ error: "indirizzo non valido" }, { status: 400 });

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Mozilla/5.0 Toolbox" },
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      return NextResponse.json({ error: "il link non è un'immagine" }, { status: 400 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_BYTES) {
      return NextResponse.json({ error: "immagine troppo grande o vuota" }, { status: 400 });
    }
    return NextResponse.json({ dataUrl: "data:" + type + ";base64," + buf.toString("base64") });
  } catch {
    return NextResponse.json({ error: "immagine non raggiungibile" }, { status: 502 });
  }
}
