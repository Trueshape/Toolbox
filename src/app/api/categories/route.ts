// POST /api/categories: crea una categoria in data/catalog.json

import { NextResponse } from "next/server";
import { readCatalog, writeCatalog, writesEnabled } from "../../../lib/catalog";
import { ICON_NAMES } from "../../../lib/categoryIcons";

export async function POST(req: Request) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const body = (await req.json()) as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const color = typeof body.color === "string" && /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : "#60a5fa";
  const catalog = await readCatalog();

  if (!name || name.length > 30) return NextResponse.json({ error: "nome categoria non valido" }, { status: 400 });
  if (catalog.categories.some((c) => c.name === name)) {
    return NextResponse.json({ error: "categoria già esistente" }, { status: 400 });
  }

  const icon = typeof body.icon === "string" && (ICON_NAMES as readonly string[]).includes(body.icon) ? body.icon : ICON_NAMES[catalog.categories.length % ICON_NAMES.length];

  const category = { name, color, icon };
  catalog.categories.push(category);
  await writeCatalog(catalog);
  return NextResponse.json(category, { status: 201 });
}
