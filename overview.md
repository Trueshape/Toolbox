# overview.md — file del progetto

## Radice
- `Avvia Toolbox.bat`: avvia il server in locale e apre il browser.
- `README.md`: istruzioni per l'uso.
- `CLAUDE.md`: regole per l'AI.
- `overview.md`: questo file.
- `decisions.md`: scelte importanti, una riga ciascuna.
- `DESIGN.md`: indicazioni visive (colori, spaziature, tile).
- `PROJECT.md`: scheda di progetto compilata all'inizio (stack ora superato: vedi decisions.md).
- `plan.md`: piano di lavoro della versione 1.
- `index.html`: pagina base caricata da Vite.
- `package.json`, `package-lock.json`: dipendenze e script.
- `vite.config.ts`: configurazione Vite (percorso pubblico `/Toolbox/`, API locali).
- `tsconfig.json`: configurazione TypeScript.
- `components.json`: configurazione shadcn.
- `.gitignore`: file esclusi da git (dipendenze, `dist/`, `data/backups/`).

## Dati
- `data/catalog.json`: siti, categorie e impostazioni. È il database.
- `data/backups/`: copie di sicurezza del catalogo (non in git).

## Server (solo in sviluppo)
- `server/api.ts`: API locali (siti, categorie, impostazioni, titolo, immagini, favicon, segnale di chiusura).

## Codice
- `src/main.tsx`: punto d'ingresso.
- `src/App.tsx`: sceglie homepage o impostazioni e carica il catalogo.
- `src/app/globals.css`: stili e colori.
- `src/components/HomeView.tsx`: homepage (colonna categorie, barra, griglia, menu tasto destro).
- `src/components/SiteTile.tsx`: singola card del sito.
- `src/components/SiteForm.tsx`: finestra per aggiungere o modificare un sito.
- `src/components/CategoryForm.tsx`: finestra per creare una categoria.
- `src/components/CategoryEditForm.tsx`: finestra per modificare una categoria.
- `src/components/CategoryIcon.tsx`: icona di una categoria.
- `src/components/SettingsForm.tsx`: pagina impostazioni.
- `src/components/ui/`: componenti shadcn (pulsanti, finestre, campi, menu).
- `src/lib/catalog.ts`: lettura e scrittura del catalogo, backup, commit e push.
- `src/lib/favicon.ts`, `src/lib/thumbnail.ts`, `src/lib/image.ts`: favicon, screenshot e ridimensionamento immagini.
- `src/lib/mode.ts`: modalità sola lettura e percorso pubblico.
- `src/lib/settings.ts`: posizioni del testo nelle card.
- `src/lib/categoryIcons.ts`: icone disponibili per le categorie.
- `src/lib/utils.ts`: funzione `cn` per le classi CSS.
- `src/types.ts`: tipi di sito, categoria e catalogo.

## Pubblicazione
- `.github/workflows/pages.yml`: pubblica la versione di sola lettura su GitHub Pages a ogni push su `main`.
