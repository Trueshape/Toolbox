# plan.md — Trulbox, versione 1

Un passo alla volta. Finito un passo: spunta la casella, azzera il contesto, passa al successivo.
Riferimenti: [PROJECT.md](PROJECT.md), [DESIGN.md](DESIGN.md).

## Passo 0 — Dati e struttura base
- [x] Creare `src/data/sites.ts`: array tipizzato di siti (id, nome, url, categoria, thumbnail, descrizione)
- [x] Creare `src/data/categories.ts`: elenco categorie
- [x] Inserire 6-8 siti reali di esempio (quelli già nei mockup + altri a scelta)
- [x] Tipi TypeScript condivisi in `src/types.ts` (Site, Category)

## Passo 1 — Supabase (solo like e feedback)
- [ ] Creare progetto su supabase.com
- [ ] Tabella `likes` (site_id, count) e `feedback` (id, site_id, testo, creato_il)
- [ ] Row Level Security: consentire insert pubblico su feedback e update pubblico solo sul contatore likes, nessun altro accesso
- [ ] Variabili in `.env.local` (mai nel repo): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` in `.gitignore`
- [ ] Client Supabase in `src/lib/supabase.ts`

## Passo 2 — Homepage a griglia modulare (impianto da DESIGN.md)
- [ ] Componente `SiteTile`: dimensione variabile in base ai like (span 2x2 se tra i più votati, altrimenti 1x1)
- [ ] Griglia CSS che dispone i tile senza header/hero, come da mockup
- [ ] Filtro per categoria (etichetta cliccabile, non barra di navigazione)
- [ ] Stato di caricamento e stato vuoto ("nessun sito in questa categoria")

## Passo 3 — Scheda sito
- [ ] Pagina o pannello con thumbnail grande, descrizione, categoria
- [ ] Pulsante like collegato a Supabase (aggiorna il contatore, aggiornamento visibile subito)
- [ ] Form feedback (testo libero, invio a Supabase, conferma visiva)
- [ ] Lista feedback esistenti sotto il form

## Passo 4 — Sito a caso
- [ ] Pulsante che sceglie un sito a caso dall'elenco e apre la sua pagina esterna in una nuova scheda
- [ ] Evitare di ripetere l'ultimo sito mostrato due volte di fila

## Passo 5 — Rifinitura minima
- [ ] Responsive: griglia a 2 colonne su schermi stretti, 1 colonna su mobile
- [ ] Verifica contrasto colori (testo bianco su tile scuro, nero su tile chiaro)
- [ ] Titolo pagina, favicon, meta description

## Prima del lancio (da PROJECT.md, passo 7)
- [ ] Rate limiting sull'invio di feedback e sui like (evitare spam/abuso)
- [ ] Verificare che la row level security blocchi scritture non previste
- [ ] Nessuna chiave in `git log` (controllo con `git status` prima del primo commit)
- [ ] Pubblicare una versione vuota su Vercel appena il progetto compila

## Dopo (fuori dalla versione 1)
- Ricerca testuale
- Tag multipli
- Statistiche sui siti più votati
