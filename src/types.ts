// types.ts — tipi condivisi di Toolbox (Site, Category, Catalog)

export type Category = string; // le categorie si creano dall'app

export interface Site {
  id: string;
  nome: string;
  url: string;
  categorie: Category[]; // un sito può stare in più categorie
  thumbnail?: string; // percorso in public/thumbnails/, es. "/thumbnails/snapdrop.png"
  favicon?: string; // favicon del sito come data URI, salvata nel catalogo
  descrizione: string;
  pinned: boolean; // true = tile grande in homepage
}

export interface CategoryInfo {
  name: Category;
  color: string; // colore esadecimale del simbolo accanto al nome
  icon: string; // nome dell icona Lucide, es. "Telescope"
}

// contenuto di data/catalog.json
export interface Catalog {
  categories: CategoryInfo[];
  sites: Site[];
  settings?: import("./lib/settings").SiteSettings;
}
