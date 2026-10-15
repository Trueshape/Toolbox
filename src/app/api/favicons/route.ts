// POST /api/favicons: scarica le favicon mancanti di tutti i siti e le salva nel catalogo (una volta sola per sito).

import { NextResponse } from "next/server";
import { readCatalog, writeCatalog, writesEnabled } from "../../../lib/catalog";
import { fetchFavicon } from "../../../lib/favicon";

export async function POST() {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const catalog = await readCatalog();
  let added = 0;
  for (const site of catalog.sites) {
    if (site.favicon) continue;
    const icon = await fetchFavicon(site.url);
    if (icon) {
      site.favicon = icon;
      added++;
    }
  }
  if (added > 0) await writeCatalog(catalog);
  return NextResponse.json({ added, total: catalog.sites.length });
}
