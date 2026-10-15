// POST /api/sites: aggiunge un sito a data/catalog.json

import { NextResponse } from "next/server";
import { parseUrl, readCatalog, uniqueSlug, validCategories, validThumb, writeCatalog, writesEnabled } from "../../../lib/catalog";
import type { Site } from "../../../types";
import { captureThumbnail } from "../../../lib/thumbnail";
import { fetchFavicon } from "../../../lib/favicon";

export async function POST(req: Request) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const body = (await req.json()) as Record<string, unknown>;
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const descrizione = typeof body.descrizione === "string" ? body.descrizione.trim() : "";
  const url = parseUrl(body.url);
  const catalog = await readCatalog();

  if (!nome || nome.length > 120) return NextResponse.json({ error: "nome non valido" }, { status: 400 });
  if (!url) return NextResponse.json({ error: "indirizzo non valido" }, { status: 400 });
  if (descrizione.length > 300) return NextResponse.json({ error: "descrizione troppo lunga" }, { status: 400 });
  if (!validCategories(body.categorie, catalog)) {
    return NextResponse.json({ error: "scegli almeno una categoria" }, { status: 400 });
  }
  if (body.thumbnail != null && !validThumb(body.thumbnail)) {
    return NextResponse.json({ error: "miniatura non valida" }, { status: 400 });
  }

  const site: Site = {
    id: uniqueSlug(nome, catalog),
    nome,
    url,
    categorie: body.categorie,
    descrizione,
    pinned: body.pinned === true,
  };
  // miniatura: quella caricata a mano, altrimenti screenshot automatico del sito
  if (typeof body.thumbnail === "string") site.thumbnail = body.thumbnail;
  else {
    const shot = await captureThumbnail(url);
    if (shot) site.thumbnail = shot;
  }

  const icon = await fetchFavicon(url);
  if (icon) site.favicon = icon;

  catalog.sites.push(site);
  await writeCatalog(catalog);
  return NextResponse.json(site, { status: 201 });
}
