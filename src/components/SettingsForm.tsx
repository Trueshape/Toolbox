// SettingsForm.tsx — impostazioni: posizione di titolo e descrizione dentro la card di ogni sito, con anteprima.

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SiteTile } from "@/components/SiteTile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PLACEMENTS, type Placement, type SiteSettings } from "@/lib/settings";
import type { CategoryInfo, Site } from "@/types";

const SAMPLE_CATEGORY: CategoryInfo = { name: "Utili", color: "#34d399", icon: "Wrench" };

const SAMPLE_SITE: Site = {
  id: "esempio",
  nome: "Nome del sito",
  url: "https://example.com",
  categorie: ["Utili"],
  descrizione: "Descrizione breve del sito, su una o due righe.",
  pinned: true,
};

export function SettingsForm({ initial, categories: initialCategories }: { initial: SiteSettings; categories: CategoryInfo[] }) {
  const [placement, setPlacement] = useState<Placement>(initial.placement);
  const [categories, setCategories] = useState<CategoryInfo[]>(initialCategories);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placement }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      setMessage("Impostazioni salvate.");
    } catch (err) {
      setMessage("Non salvato: " + (err instanceof Error ? err.message : "errore sconosciuto"));
    } finally {
      setSaving(false);
    }
  }

  // rinomina una categoria: il server aggiorna anche tutti i siti che la usano
  async function renameCategory(oldName: string) {
    const newName = (drafts[oldName] ?? oldName).trim();
    if (!newName || newName === oldName) return;
    setMessage("");
    try {
      const res = await fetch("/api/categories/" + encodeURIComponent(oldName), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = (await res.json()) as CategoryInfo & { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      setCategories((list) => list.map((c) => (c.name === oldName ? data : c)));
      setDrafts((d) => { const next = { ...d }; delete next[oldName]; return next; });
      setMessage("Categoria rinominata in \"" + data.name + "\".");
    } catch (err) {
      setMessage("Non rinominata: " + (err instanceof Error ? err.message : "errore sconosciuto"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-8 p-6">
      <form onSubmit={save} className="flex min-w-[280px] flex-1 flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Impostazioni</h1>
          <a href={import.meta.env.BASE_URL} className="text-sm text-muted-foreground hover:text-foreground">← Torna al sito</a>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Posizione di titolo e descrizione nella card</Label>
          <div className="flex flex-col gap-2">
            {PLACEMENTS.map((p) => (
              <button key={p.value} type="button" onClick={() => setPlacement(p.value)}
                aria-pressed={placement === p.value}
                className={"rounded-lg border px-3 py-2 text-left text-sm " + (placement === p.value ? "border-foreground" : "border-border text-muted-foreground")}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Categorie</Label>
          {categories.map((c) => {
            const value = drafts[c.name] ?? c.name;
            return (
              <div key={c.name} className="flex gap-2">
                <Input value={value} maxLength={30} aria-label={"Nome di " + c.name}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.name]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); renameCategory(c.name); } }} />
                <Button type="button" variant="outline" disabled={value.trim() === c.name || !value.trim()} onClick={() => renameCategory(c.name)}>Rinomina</Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? "Salvataggio…" : "Salva"}</Button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </form>

      <div className="flex min-w-[320px] flex-[1.2] flex-col gap-2">
        <Label>Anteprima</Label>
        <div className="grid gap-2 rounded-xl border bg-background p-3"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gridAutoRows: "72px" }}>
          <SiteTile site={SAMPLE_SITE} categories={[SAMPLE_CATEGORY]} placement={placement} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="tile" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">L&apos;anteprima mostra la posizione scelta. Salva per applicarla alla homepage.</p>
      </div>
    </div>
  );
}
