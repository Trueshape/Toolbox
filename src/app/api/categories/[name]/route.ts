// PATCH /api/categories/[name]: modifica nome, icona o colore di una categoria.
// DELETE /api/categories/[name]: elimina una categoria e la toglie dai siti (solo se nessun sito resterebbe senza categoria).

import { NextResponse } from "next/server";
import { readCatalog, writeCatalog, writesEnabled } from "../../../../lib/catalog";
import { ICON_NAMES } from "../../../../lib/categoryIcons";

export async function PATCH(req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const { name: oldName } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const catalog = await readCatalog();
  const category = catalog.categories.find((c) => c.name === oldName);
  if (!category) return NextResponse.json({ error: "categoria non trovata" }, { status: 404 });

  const newName = typeof body.name === "string" ? body.name.trim() : oldName;
  if (!newName || newName.length > 30) return NextResponse.json({ error: "nome categoria non valido" }, { status: 400 });
  if (newName !== oldName && catalog.categories.some((c) => c.name === newName)) {
    return NextResponse.json({ error: "categoria già esistente" }, { status: 400 });
  }
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(body.color)) {
      return NextResponse.json({ error: "colore non valido" }, { status: 400 });
    }
    category.color = body.color;
  }
  if (body.icon !== undefined) {
    if (typeof body.icon !== "string" || !(ICON_NAMES as readonly string[]).includes(body.icon)) {
      return NextResponse.json({ error: "icona non valida" }, { status: 400 });
    }
    category.icon = body.icon;
  }

  if (newName !== oldName) {
    category.name = newName;
    for (const site of catalog.sites) {
      site.categorie = site.categorie.map((c) => (c === oldName ? newName : c));
    }
  }

  await writeCatalog(catalog);
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!writesEnabled()) return NextResponse.json({ error: "sola lettura in produzione" }, { status: 405 });

  const { name } = await params;
  const catalog = await readCatalog();
  if (!catalog.categories.some((c) => c.name === name)) {
    return NextResponse.json({ error: "categoria non trovata" }, { status: 404 });
  }

  // nessun sito deve restare senza categorie
  const orphans = catalog.sites.filter((s) => s.categorie.length === 1 && s.categorie[0] === name);
  if (orphans.length > 0) {
    return NextResponse.json(
      { error: "Questi siti resterebbero senza categoria: " + orphans.map((s) => s.nome).join(", ") + ". Spostali prima in un'altra categoria." },
      { status: 409 },
    );
  }

  catalog.categories = catalog.categories.filter((c) => c.name !== name);
  for (const site of catalog.sites) {
    site.categorie = site.categorie.filter((c) => c !== name);
  }
  await writeCatalog(catalog);
  return NextResponse.json({ ok: true });
}
