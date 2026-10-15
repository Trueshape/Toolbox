// mode.ts — modalità del sito. READ_ONLY = versione pubblica (GitHub Pages): solo consultazione.
// Impostate al momento della build con NEXT_PUBLIC_READ_ONLY=1 e NEXT_PUBLIC_BASE_PATH.

export const READ_ONLY = process.env.NEXT_PUBLIC_READ_ONLY === "1";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
