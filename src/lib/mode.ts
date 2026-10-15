// mode.ts — modalità del sito. READ_ONLY = versione pubblica (GitHub Pages): solo consultazione.
// Impostate al momento della build con VITE_READ_ONLY=1 (vedi package.json, script build:pages).

export const READ_ONLY = import.meta.env.VITE_READ_ONLY === "1";
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, ""); // es. "/Toolbox-Vite" su Pages, "" in locale
