// PATCH /api/settings: salva la posizione del testo nelle card in data/catalog.json

import { NextResponse } from "next/server";
import { readCatalog, validSettingsPatch, writeCatalog, writesEnabled } from "../../../lib/catalog";
import { DEFAULT_SETTINGS, type Placement } from "../../../lib/settings";

export async function PATCH(req: Request) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const body = (await req.json()) as Record<string, unknown>;
  const error = validSettingsPatch(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const catalog = await readCatalog();
  const current = { ...DEFAULT_SETTINGS, ...catalog.settings };
  catalog.settings = { placement: (body.placement as Placement) ?? current.placement };
  await writeCatalog(catalog);
  return NextResponse.json(catalog.settings);
}
