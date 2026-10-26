-- Un titolo visibile per ciascuna immagine del modulo A+.
alter table public.book_a_plus_blocks
  add column if not exists image_titles text[] not null default '{}';

-- I moduli già creati restano validi; per i nuovi moduli l'applicazione richiede
-- un titolo per ogni immagine e l'API ne verifica il numero.
