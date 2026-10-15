// CategoryForm.tsx — finestra per creare una categoria: nome, icona Lucide e colore.

"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_NAMES } from "@/lib/categoryIcons";
import type { CategoryInfo } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (category: CategoryInfo) => void;
};

export function CategoryForm({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#60a5fa");
  const [icon, setIcon] = useState<string>(ICON_NAMES[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon }),
      });
      const data = (await res.json()) as CategoryInfo & { error?: string };
      if (!res.ok) throw new Error(data.error || "HTTP " + res.status);
      onCreated(data);
      setName("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "errore sconosciuto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none" style={{ width: "min(24rem, 92vw)", maxWidth: "none", display: "flex", flexDirection: "column" }}>
        <DialogHeader>
          <DialogTitle>Nuova categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Icona</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_NAMES.map((n) => (
                <button key={n} type="button" onClick={() => setIcon(n)} aria-label={n}
                  className={"flex h-9 w-9 items-center justify-center rounded-md border " + (icon === n ? "border-foreground" : "border-border")}>
                  <CategoryIcon name={n} color={color} size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-color">Colore</Label>
            <Input id="cat-color" type="color" className="h-10 w-20 p-1" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={saving}>Crea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
