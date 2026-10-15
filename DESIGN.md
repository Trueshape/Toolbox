# DESIGN.md — Toolbox

Riferimento: mockup "Griglia modulare" (canva Toolbox, artboard `Griglia.dc.html`).

## Impianto (struttura della pagina)

- **Nessun header/hero.** La griglia dei siti è il primo contenuto, subito visibile.
- **Griglia modulare a tile di dimensioni diverse.** I siti pinnati (`pinned: true` in `src/data/sites.ts`) sono tile grandi (span 2x2). Gli altri sono 1x1. Il numero di like non cambia la dimensione.
- Le categorie sono nella rail verticale a sinistra (filtro), come nel mockup "Griglia" scelto. Ogni tile mostra anche la sua categoria come etichetta piccola.
- Il pulsante "sito a caso" è un'azione minima, non un banner: sta in un angolo, discreto.

## Colori

| Uso | Colore |
|---|---|
| Sfondo pagina | `#09090B` |
| Tile piccoli | `#18181B` |
| Tile grande (pinnato) | `#18181B` come gli altri, solo più grande (2x2). Niente sfondo chiaro. |
| Testo principale | `#FAFAFA` |
| Testo secondario / etichette | `#71717A` / `#A1A1AA` |
| Like / accento | testo chiaro su tile scuro, scuro su tile chiaro (nessun colore acceso: resta neutro) |

## Tipografia

- **Font:** Inter (400 testo, 500-600 titoli tile, 700 titolo pagina)
- **Dimensioni:** titolo pagina 18px, titolo tile grande 20px, titolo tile piccolo 13-15px, testo descrittivo 12-13px
- **Etichette categoria:** 10-11px, maiuscolo o colore attenuato, mai in grassetto

## Spaziature

- Padding pagina: 32px
- Gap tra tile: 10px
- Padding interno tile piccolo: 12-14px, tile grande: 18px
- Raggio angoli: 10px su tutti i tile

## Cosa fare

- Mantenere il contrasto di dimensione tra tile come unico segnale di importanza (non aggiungere bordi colorati o badge "in evidenza")
- Nessuna tile chiara: il sito scuro è una scelta esplicita dell'utente. Il pinnato si distingue solo per dimensione.
- Le thumbnail dei siti (quando ci sono) sostituiscono lo sfondo colorato del tile

## Cosa evitare

- Header con hero, nav a barra piena, bottoni [pieno] [outline] affiancati
- Colori accesi/brand su più elementi contemporaneamente
- Ombre pesanti o gradienti decorativi

## Prompt per Claude Code

> "Leggi DESIGN.md e costruisci la homepage con questo impianto: griglia modulare senza header/hero, tile grandi per i siti pinnati (campo pinned in src/data/sites.ts), colori neutri (bianco/nero/grigio), font Inter."
