-- LIBERAMENTE: una sola piattaforma e un solo account, con due vetrine distinte.
-- Esegui questo file una sola volta nel SQL Editor di Supabase prima del deploy.
alter table public.books
  add column if not exists marketplace_locale text not null default 'it';

alter table public.books
  drop constraint if exists books_marketplace_locale_check;

alter table public.books
  add constraint books_marketplace_locale_check
  check (marketplace_locale in ('it', 'en'));

update public.books
set marketplace_locale = 'it'
where marketplace_locale is null
   or marketplace_locale not in ('it', 'en');

create index if not exists books_marketplace_locale_status_published_idx
  on public.books (marketplace_locale, status, published_at desc);
