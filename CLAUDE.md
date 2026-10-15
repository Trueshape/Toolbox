# CLAUDE.md — regole per l'AI in questo progetto

Progetto: catalogo di siti. Stack: Vite + React + TypeScript + Tailwind v4 + shadcn (componenti in `src/components/ui`).

Documenti collegati: [overview.md](overview.md) (file del progetto), [decisions.md](decisions.md) (scelte importanti).

## Regole

- Il catalogo è `data/catalog.json`. Non riscriverlo a mano se non lo chiede l'utente: le modifiche passano dalle API in `server/api.ts`.
- Ogni scrittura del catalogo fa backup in `data/backups/` e commit + push automatico. Non cambiare questo comportamento senza conferma.
- Versione pubblica: `VITE_READ_ONLY=1`. Nella build pubblica non devono comparire pulsanti di modifica, aggiunta o eliminazione. Controlla con `npm run build:pages` dopo ogni modifica alla UI.
- Le API (`server/api.ts`) esistono solo in `npm run dev`.
- Dopo ogni modifica al codice: commit e push, salvo modifiche molto grandi (in quel caso chiedere prima).
- Il repo è pubblico: non inserire chiavi, token o dati personali nel codice.
