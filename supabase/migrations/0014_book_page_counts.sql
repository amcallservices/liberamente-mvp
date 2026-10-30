-- Numero di pagine rilevato automaticamente dal PDF al momento del caricamento.
alter table public.books add column if not exists page_count integer;

alter table public.books drop constraint if exists books_page_count_check;
alter table public.books add constraint books_page_count_check
  check (page_count is null or page_count > 0);

comment on column public.books.page_count is
  'Numero di pagine rilevato automaticamente dal PDF caricato dall’autore.';
