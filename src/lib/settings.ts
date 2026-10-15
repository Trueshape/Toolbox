// settings.ts — posizione del titolo e della descrizione dentro la card di ogni sito. Condiviso tra browser e server.

export type Placement = "default" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface SiteSettings {
  placement: Placement;
}

export const PLACEMENTS: { value: Placement; label: string }[] = [
  { value: "default", label: "Predefinita" },
  { value: "top-left", label: "In alto a sinistra" },
  { value: "top-right", label: "In alto a destra" },
  { value: "bottom-left", label: "In basso a sinistra" },
  { value: "bottom-right", label: "In basso a destra" },
];

export const DEFAULT_SETTINGS: SiteSettings = { placement: "default" };

// classi CSS da applicare alla card per la posizione del testo ("" = predefinita)
export function textClasses(placement: Placement): string {
  if (placement === "default") return "";
  const [vertical, side] = placement.split("-");
  return "txt-" + vertical + " txt-" + side;
}
