// SiteForm.tsx — finestra per creare un sito o modificarne uno: nome, link, descrizione, categorie, pin, miniatura.

"use client";

import { useEffect, useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resizeImage } from "@/lib/image";
import type { CategoryInfo, Site } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryInfo[];
  site: Site | null; // null = nuovo sito
  initialUrl?: string; // precompila il link (dalla barra in alto)
  onSaved: (site: Site, isNew: boolean) => void;
  onCategoryCreated?: (category: CategoryInfo) => void; // categoria creata dal modulo stesso
};

export function SiteForm({ open, onOpenChange, categories, site, initialUrl, onSaved, onCategoryCreated }: Props) {
  const [newCategory, setNewCategory] = useState("");
  const [nome, setNome] = useState(site?.nome ?? "");
  const [url, setUrl] = useState(site?.url ?? initialUrl ?? "");
  const [descrizione, setDescrizione] = useState(site?.descrizione ?? "");
  const [chosen, setChosen] = useState<string[]>(site?.categorie ?? []);
  const [pinned, setPinned] = useState(site?.pinned ?? false);
  // undefined = miniatura invariata, null = rimuovi, stringa = nuova immagine
  const [thumb, setThumb] = useState<string | null | undefined>(undefined);
  const [preview, setPreview] = useState<string | null>(site?.thumbnail ?? null);
  const [imageLink, setImageLink] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // se il nome è vuoto, lo prende dal titolo della pagina
  async function suggestName() {
    if (nome.trim() || !url) return;
    try {
      const res = await fetch("/api/title?url=" + encodeURIComponent(url));
      const data = (await res.json()) as { title?: string };
      if (data.title) setNome(data.title.slice(0, 120));
    } catch {
      // titolo non disponibile: il nome si scrive a mano
    }
  }

  // se il link arriva dalla barra in alto, prende subito il nome dalla pagina
  useEffect(() => {
    if (!site && initialUrl) suggestName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ridimensiona un'immagine e la imposta come miniatura (usato da file, incolla e link)
  async function setImage(source: Blob) {
    const data = await resizeImage(source);
    setThumb(data);
    setPreview(data);
    setError("");
  }

  // Ctrl+V con un'immagine copiata, mentre la finestra è aperta
  useEffect(() => {
    if (!open) return;
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        setImage(file).catch(() => setError("Immagine incollata non leggibile."));
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // scarica un'immagine da un link tramite il server e la imposta come miniatura
  async function loadFromLink() {
    if (!imageLink.trim()) return;
    setError("");
    try {
      const res = await fetch("/api/image?url=" + encodeURIComponent(imageLink.trim()));
      const data = (await res.json()) as { dataUrl?: string; error?: string };
      if (!res.ok || !data.dataUrl) throw new Error(data.error || "immagine non scaricata");
      const blob = await (await fetch(data.dataUrl)).blob();
      await setImage(blob);
      setImageLink("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "errore sconosciuto");
    }
  }

  // crea una categoria dal modulo e la seleziona subito per il sito
  async function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as CategoryInfo & { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      onCategoryCreated?.(data);
      setChosen((list) => [...list, data.name]);
      setNewCategory("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "errore sconosciuto");
    }
  }

  function toggleCategory(name: string, on: boolean) {
    setChosen((list) => (on ? [...list, name] : list.filter((c) => c !== name)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (chosen.length === 0) {
      setError("Scegli almeno una categoria.");
      return;
    }
    setSaving(true);
    setError("");
    const body: Record<string, unknown> = { nome, url, descrizione, categorie: chosen, pinned };
    if (thumb !== undefined) body.thumbnail = thumb;
    try {
      const res = await fetch(site ? "/api/sites/" + encodeURIComponent(site.id) : "/api/sites", {
        method: site ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as Site & { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      onSaved(data, !site);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "errore sconosciuto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none" style={{ width: "min(28rem, 92vw)", maxWidth: "none", display: "flex", flexDirection: "column" }}>
        <DialogHeader>
          <DialogTitle>{site ? "Modifica sito" : "Nuovo sito"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="site-url">Indirizzo (URL)</Label>
            <Input id="site-url" type="url" required placeholder="https://..." value={url}
              onChange={(e) => setUrl(e.target.value)} onBlur={suggestName} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="site-name">Nome</Label>
            <Input id="site-name" type="text" required maxLength={120} value={nome}
              onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="site-desc">Descrizione</Label>
            <Textarea id="site-desc" rows={2} maxLength={300} value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categorie</Label>
            <div className="flex flex-wrap gap-4">
              {categories.map((c) => (
                <label key={c.name} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={chosen.includes(c.name)}
                    onCheckedChange={(v) => toggleCategory(c.name, v === true)} />
                  <CategoryIcon name={c.icon} color={c.color} size={14} />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nuova categoria" maxLength={30} value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }} />
            <Button type="button" variant="outline" onClick={addCategory}>Aggiungi</Button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={pinned} onCheckedChange={(v) => setPinned(v === true)} />
            Pinnato
          </label>
          <div className="flex flex-col gap-2">
            <Label>Miniatura</Label>
            {preview && (
              <div className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="w-full rounded-md border" />
                <Button type="button" variant="outline" size="sm" className="self-start"
                  onClick={() => { setThumb(null); setPreview(null); }}>
                  Rimuovi miniatura
                </Button>
              </div>
            )}
            <label htmlFor="site-thumb"
              className="flex h-8 w-full cursor-pointer items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm text-muted-foreground dark:bg-input/30">
              Seleziona file o incolla immagine
            </label>
            <input id="site-thumb" type="file" accept="image/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setImage(f); }} />
            <Input type="url" placeholder="Link di un'immagine (https://...), poi Invio" value={imageLink}
              onChange={(e) => setImageLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); loadFromLink(); } }} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={saving}>{site ? "Salva modifiche" : "Salva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
