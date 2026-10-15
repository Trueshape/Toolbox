# decisions.md — scelte importanti

- 2026-10-14 — Progetto avviato con Next.js e shadcn — stack del piano iniziale (PROJECT.md).
- 2026-10-14 — Catalogo in `data/catalog.json` invece di un database — tutto locale, nessun account da gestire.
- 2026-10-14 — Miniature e favicon salvate dentro il catalogo come data URI — così la versione pubblica le mostra senza server.
- 2026-10-15 — Versione pubblica di sola lettura su GitHub Pages — gli amici consultano, solo il proprietario modifica.
- 2026-10-15 — Ogni modifica al catalogo fa commit e push automatico — il repo è la copia di sicurezza e la fonte per le altre sessioni.
- 2026-10-15 — Backup locali del catalogo, ultimi 50 — protezione da modifiche sbagliate senza usare git.
- 2026-10-15 — Passaggio da Next.js a Vite — avvio locale molto più rapido (circa 1 secondo contro circa 6).
- 2026-10-15 — Repo `Toolbox` pubblico — necessario per GitHub Pages su account gratuito. Contrasta con REQUIREMENTS.md (repo privato): scelta dell'utente.
- 2026-10-15 — Server locale si chiude da solo quando la pagina viene chiusa — evita finestre nere rimaste aperte.
