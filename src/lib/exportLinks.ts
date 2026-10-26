// exportLinks.ts — esporta tutti i link in un file Markdown: categorie in ordine alfabetico, siti in ordine alfabetico dentro ogni categoria.
import type { CategoryInfo, Site } from "@/types";

export function exportLinks(categories: CategoryInfo[], sites: Site[]) {
  const byName = (a: string, b: string) => a.localeCompare(b, "it", { sensitivity: "base" });
  const lines: string[] = ["# Link salvati", ""];
  for (const cat of [...categories].sort((a, b) => byName(a.name, b.name))) {
    const list = sites.filter((s) => s.categorie.includes(cat.name)).sort((a, b) => byName(a.nome, b.nome));
    if (list.length === 0) continue;
    lines.push("## " + cat.name, "");
    for (const s of list) lines.push("- [" + s.nome + "](" + s.url + ")");
    lines.push("");
  }
  const url = URL.createObjectURL(new Blob([lines.join(String.fromCharCode(10))], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "link-salvati.md";
  link.click();
  URL.revokeObjectURL(url);
}
