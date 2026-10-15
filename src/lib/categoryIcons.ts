// categoryIcons.ts — nomi delle icone Lucide disponibili per le categorie. Solo dati, usabile ovunque.

export const ICON_NAMES = ["Telescope", "Palette", "Wrench", "Compass", "Gem", "Rocket", "Map", "Lightbulb", "Camera", "Music"] as const;
export type IconName = (typeof ICON_NAMES)[number];
