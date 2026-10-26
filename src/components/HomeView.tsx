// HomeView.tsx — homepage: rail categorie a sinistra, griglia di tile al centro, menu tasto destro (shadcn).
// Nel sito pubblico (READ_ONLY) restano solo consultazione e "Copia link": nessuna modifica.
// Le modifiche vanno in data/catalog.json tramite le route /api.

"use client";

import { useEffect, useState } from "react";
import { CategoryEditForm } from "./CategoryEditForm";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { READ_ONLY } from "@/lib/mode";
import { exportLinks } from "@/lib/exportLinks";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import type { Catalog, CategoryInfo, Site } from "@/types";
import { CategoryForm } from "./CategoryForm";
import { SiteForm } from "./SiteForm";
import { SiteTile } from "./SiteTile";

const ALL = "Tutti";

// il testo sembra un indirizzo: https://… oppure dominio.estensione (senza spazi)
const looksLikeUrl = (t: string) => /^https?:///i.test(t) || /^[a-z0-9-]+(.[a-z0-9-]+)+(/S*)?$/i.test(t);

export function HomeView({ catalog }: { catalog: Catalog }) {
  const settings = { ...DEFAULT_SETTINGS, ...catalog.settings };
  const [categories, setCategories] = useState<CategoryInfo[]>(catalog.categories);
  const [sites, setSites] = useState<Site[]>(catalog.sites);
  const [filter, setFilter] = useState<string>(ALL);
  const [siteDialog, setSiteDialog] = useState<{ site: Site | null; url?: string } | null>(null);
  const [query, setQuery] = useState(""); // ricerca; se il testo è un indirizzo, Invio lo aggiunge
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryInfo | null>(null);

  // in locale: segnala che la pagina è aperta, così il server si chiude quando la scheda viene chiusa
  useEffect(() => {
    if (READ_ONLY) return;
    const beat = () => fetch("/api/heartbeat", { method: "POST", keepalive: true }).catch(() => {});
    beat();
    const id = setInterval(beat, 5000);
    return () => clearInterval(id);
  }, []);

  // Invio nella barra in alto: apre il modulo nuovo sito con il link già compilato
  function addFromBar() {
    const raw = query.trim();
    if (!raw) return;
    const url = raw.toLowerCase().startsWith("http://") || raw.toLowerCase().startsWith("https://") ? raw : "https://" + raw;
    setSiteDialog({ site: null, url });
    setQuery("");
  }

  // aggiorna subito la vista, poi salva; se il salvataggio fallisce torna indietro
  async function patchSite(id: string, patch: Partial<Pick<Site, "categorie" | "pinned">>) {
    const previous = sites;
    setSites((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      const res = await fetch("/api/sites/" + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    } catch (err) {
      console.error("Salvataggio fallito:", err);
      setSites(previous);
    }
  }

  // elimina il sito dal catalogo, dopo conferma
  async function deleteSite(site: Site) {
    if (!window.confirm("Eliminare \"" + site.nome + "\"? L'operazione non si annulla.")) return;
    const previous = sites;
    setSites((list) => list.filter((s) => s.id !== site.id));
    try {
      const res = await fetch("/api/sites/" + encodeURIComponent(site.id), { method: "DELETE" });
      if (!res.ok) throw new Error("HTTP " + res.status);
    } catch (err) {
      console.error("Eliminazione fallita:", err);
      setSites(previous);
    }
  }

  // elimina una categoria: il server rifiuta se un sito resterebbe senza categoria
  async function deleteCategory(cat: CategoryInfo) {
    if (!window.confirm("Eliminare la categoria \"" + cat.name + "\"?")) return;
    try {
      const res = await fetch("/api/categories/" + encodeURIComponent(cat.name), { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      setCategories((list) => list.filter((c) => c.name !== cat.name));
      setSites((list) => list.map((s) => ({ ...s, categorie: s.categorie.filter((c) => c !== cat.name) })));
      if (filter === cat.name) setFilter(ALL);
    } catch (err) {
      alert("Categoria non eliminata: " + (err instanceof Error ? err.message : "errore sconosciuto"));
    }
  }

  // dopo la modifica di una categoria: aggiorna nome, icona e colore ovunque
  function onCategorySaved(updated: CategoryInfo, oldName: string) {
    setCategories((list) => list.map((c) => (c.name === oldName ? updated : c)));
    if (updated.name !== oldName) {
      setSites((list) => list.map((s) => ({ ...s, categorie: s.categorie.map((c) => (c === oldName ? updated.name : c)) })));
      if (filter === oldName) setFilter(updated.name);
    }
  }

  function toggleCategory(site: Site, name: string, on: boolean) {
    const next = on ? [...site.categorie, name] : site.categorie.filter((c) => c !== name);
    if (next.length > 0) patchSite(site.id, { categorie: next });
  }

  function onSaved(saved: Site, isNew: boolean) {
    if (isNew) setSites((list) => [...list, saved]);
    else setSites((list) => list.map((s) => (s.id === saved.id ? saved : s)));
  }

  const trimmed = query.trim();
  const urlMode = !READ_ONLY && looksLikeUrl(trimmed);
  const q = urlMode ? "" : trimmed.toLowerCase();
  const visible = sites
    .filter((s) => filter === ALL || s.categorie.includes(filter))
    .filter((s) => !q || [s.nome, s.descrizione, s.url, ...s.categorie].join(" ").toLowerCase().includes(q))
    // pinnati prima, così le tile grandi stanno in alto
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const countFor = (name: string) =>
    name === ALL ? sites.length : sites.filter((s) => s.categorie.includes(name)).length;

  // pulsante di una categoria nella colonna sinistra
  const categoryButton = (cat: CategoryInfo) => (
    <button type="button" aria-pressed={filter === cat.name} onClick={() => setFilter(cat.name)}>
      <span className="rail-name">
        <i>
          <CategoryIcon name={cat.icon} color={cat.color} size={14} />
        </i>
        {cat.name}
      </span>
      <span>{countFor(cat.name)}</span>
    </button>
  );

  return (
    <div className="home">
      <nav className="rail" aria-label="Categorie">
        <p className="rail-title">Categorie</p>
        <button type="button" aria-pressed={filter === ALL} onClick={() => setFilter(ALL)}>
          <span className="rail-name">
            <i>◎</i>
            {ALL}
          </span>
          <span>{countFor(ALL)}</span>
        </button>
        {categories.map((cat) =>
          READ_ONLY ? (
            <div key={cat.name}>{categoryButton(cat)}</div>
          ) : (
            <ContextMenu key={cat.name}>
              <ContextMenuTrigger className="contents">{categoryButton(cat)}</ContextMenuTrigger>
              <ContextMenuContent className="min-w-[200px]">
                <ContextMenuItem onClick={() => setEditCategory(cat)}>Modifica categoria…</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => deleteCategory(cat)}>Elimina categoria</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ),
        )}
        {READ_ONLY && (
          <Button variant="outline" className="add-btn sub" onClick={() => exportLinks(categories, sites)}>
            ⤓ Esporta .md
          </Button>
        )}
        {!READ_ONLY && (
          <>
            <Button variant="outline" className="add-btn" onClick={() => setCategoryOpen(true)}>
              ＋ Categoria
            </Button>
            <Button variant="outline" className="add-btn sub" onClick={() => setSiteDialog({ site: null })}>
              ＋ Sito
            </Button>
            <a href={import.meta.env.BASE_URL + "impostazioni"} className="add-btn sub inline-flex h-8 items-center justify-center rounded-lg border border-border px-2.5 text-sm text-muted-foreground hover:text-foreground">
              ⚙ Impostazioni
            </a>
          </>
        )}
      </nav>

      <main className="min-w-0 flex-1">
        <div style={{ padding: "24px 24px 16px" }}>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && urlMode) addFromBar(); }}
            placeholder={READ_ONLY ? "Cerca tra i siti" : "Cerca un sito, oppure incolla un indirizzo"}
            className="h-11 text-base"
            aria-label="Cerca tra i siti o aggiungi un sito dal suo indirizzo"
          />
        </div>
        <div className="grid" style={{ paddingTop: 0 }}>
          {visible.map((s) => (
            <ContextMenu key={s.id}>
              <ContextMenuTrigger className="contents">
                <SiteTile site={s} categories={categories} placement={settings.placement} />
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[200px]">
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.url).catch(() => {})}>
                  Copia link
                </ContextMenuItem>
                {!READ_ONLY && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => patchSite(s.id, { pinned: !s.pinned })}>
                      {s.pinned ? "Rimuovi pin" : "Pinna"}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSiteDialog({ site: s })}>Modifica descrizione…</ContextMenuItem>
                    <ContextMenuItem onClick={() => deleteSite(s)}>Elimina sito</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuGroup>
                      <ContextMenuLabel>Categorie</ContextMenuLabel>
                      {categories.map((c) => (
                        <ContextMenuCheckboxItem
                          key={c.name}
                          checked={s.categorie.includes(c.name)}
                          onCheckedChange={(on) => toggleCategory(s, c.name, on === true)}
                        >
                          <CategoryIcon name={c.icon} color={c.color} size={14} />
                          {c.name}
                        </ContextMenuCheckboxItem>
                      ))}
                    </ContextMenuGroup>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ))}
          {visible.length === 0 && <p className="empty">Nessun sito in questa categoria.</p>}
        </div>
      </main>

      {!READ_ONLY && siteDialog && (
        <SiteForm
          open
          site={siteDialog.site}
          initialUrl={siteDialog.url}
          categories={categories}
          onOpenChange={(open) => !open && setSiteDialog(null)}
          onCategoryCreated={(cat) => setCategories((list) => [...list, cat])}
          onSaved={onSaved}
        />
      )}
      {!READ_ONLY && (
        <CategoryForm
          open={categoryOpen}
          onOpenChange={setCategoryOpen}
          onCreated={(cat) => setCategories((list) => [...list, cat])}
        />
      )}
      {!READ_ONLY && editCategory && (
        <CategoryEditForm
          open
          category={editCategory}
          onOpenChange={(open) => !open && setEditCategory(null)}
          onSaved={onCategorySaved}
        />
      )}
    </div>
  );
}
