// PATCH /api/sites/[id]: modifica un sito in data/catalog.json

import { NextResponse } from "next/server";
import { fetchFavicon } from "../../../../lib/favicon";
import { parseUrl, readCatalog, validCategories, validThumb, writeCatalog, writesEnabled } from "../../../../lib/catalog";

// DELETE /api/sites/[id]: rimuove un sito da data/catalog.json
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const { id } = await params;
  const catalog = await readCatalog();
  const before = catalog.sites.length;
  catalog.sites = catalog.sites.filter((s) => s.id !== id);
  if (catalog.sites.length === before) return NextResponse.json({ error: "sito non trovato" }, { status: 404 });

  await writeCatalog(catalog);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const catalog = await readCatalog();

  if (body.categorie !== undefined && !validCategories(body.categorie, catalog)) {
    return NextResponse.json({ error: "categorie non valide" }, { status: 400 });
  }
  if (body.pinned !== undefined && typeof body.pinned !== "boolean") {
    return NextResponse.json({ error: "pinned deve essere booleano" }, { status: 400 });
  }
  if (body.thumbnail !== undefined && body.thumbnail !== null && !validThumb(body.thumbnail)) {
    return NextResponse.json({ error: "miniatura non valida" }, { status: 400 });
  }
  if (body.nome !== undefined && (typeof body.nome !== "string" || !body.nome.trim() || body.nome.trim().length > 120)) {
    return NextResponse.json({ error: "nome non valido" }, { status: 400 });
  }
  if (body.descrizione !== undefined && (typeof body.descrizione !== "string" || body.descrizione.trim().length > 300)) {
    return NextResponse.json({ error: "descrizione troppo lunga" }, { status: 400 });
  }
  let url: string | null = null;
  if (body.url !== undefined) {
    url = parseUrl(body.url);
    if (!url) return NextResponse.json({ error: "indirizzo non valido" }, { status: 400 });
  }

  const site = catalog.sites.find((s) => s.id === id);
  if (!site) return NextResponse.json({ error: "sito non trovato" }, { status: 404 });

  if (body.categorie !== undefined) site.categorie = body.categorie as string[];
  if (body.pinned !== undefined) site.pinned = body.pinned as boolean;
  if (typeof body.nome === "string") site.nome = body.nome.trim();
  if (typeof body.descrizione === "string") site.descrizione = body.descrizione.trim();
  if (url && url !== site.url) {
    site.url = url;
    const icon = await fetchFavicon(url);
    if (icon) site.favicon = icon;
    else delete site.favicon;
  }
  if (body.thumbnail === null) delete site.thumbnail;
  else if (typeof body.thumbnail === "string") site.thumbnail = body.thumbnail;

  await writeCatalog(catalog);
  return NextResponse.json(site);
}
