// SiteTile.tsx — una card del catalogo. pinned → tile grande 2x2, altrimenti 1x1.
// Se il sito ha una thumbnail, l'immagine sostituisce lo sfondo grigio (DESIGN.md).
// Inoltra ref e props, così il menu tasto destro di shadcn (ContextMenuTrigger asChild) può agganciarsi.

import * as React from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { textClasses, type Placement } from "@/lib/settings";
import { BASE_PATH } from "@/lib/mode";
import type { CategoryInfo, Site } from "@/types";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  site: Site;
  categories: CategoryInfo[];
  placement?: Placement; // posizione di titolo e descrizione nella card
};

export const SiteTile = React.forwardRef<HTMLAnchorElement, Props>(function SiteTile(
  { site, categories, placement = "default", className, style, ...rest },
  ref,
) {
  const classes = ["tile", site.pinned && "pinned", site.thumbnail && "has-thumb", textClasses(placement), className]
    .filter(Boolean)
    .join(" ");

  const background: React.CSSProperties | undefined = site.thumbnail
    ? { backgroundImage: 'url("' + (site.thumbnail.startsWith("/") ? BASE_PATH + site.thumbnail : site.thumbnail) + '")', ...style }
    : style;

  const [noIcon, setNoIcon] = React.useState(false);

  // etichetta con icona per ogni categoria del sito
  const labels = categories.filter((c) => site.categorie.includes(c.name));

  return (
    <a
      ref={ref}
      {...rest}
      className={classes}
      style={background}
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="tile-label">
        {labels.map((c) => (
          <span key={c.name} className="mr-3 inline-flex items-center">
            <CategoryIcon name={c.icon} color={c.color} size={13} />
            {c.name}
          </span>
        ))}
      </span>
      <div className="tile-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!noIcon && site.favicon && (
            <img src={site.favicon} alt="" width={16} height={16}
              style={{ flex: "none", borderRadius: 4 }} onError={() => setNoIcon(true)} />
          )}
          <h3>{site.nome}</h3>
        </div>
        <p>{site.descrizione}</p>
      </div>
    </a>
  );
});
