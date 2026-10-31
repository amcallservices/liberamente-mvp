-- Letture Plus qualificate: una riga per ogni pagina confermata dal lettore.
-- I dati servono ai report autori e al calcolo mensile del fondo Plus.
create table if not exists public.plus_page_reads (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  subscription_id uuid references public.plus_subscriptions(id) on delete set null,
  page_number integer not null check (page_number > 0),
  period_start date not null default date_trunc('month', now())::date,
  confirmed_at timestamptz not null default now()
);

-- Compatibilità con l'eventuale prima versione della tabella già applicata.
alter table public.plus_page_reads
  add column if not exists period_start date not null default date_trunc('month', now())::date;

drop index if exists public.plus_page_reads_reader_book_page_unique;

create unique index if not exists plus_page_reads_reader_book_page_period_unique
  on public.plus_page_reads(reader_id, book_id, page_number, period_start);
create index if not exists plus_page_reads_book_period_idx
  on public.plus_page_reads(book_id, confirmed_at desc);
create index if not exists plus_page_reads_reader_period_idx
  on public.plus_page_reads(reader_id, confirmed_at desc);

alter table public.plus_page_reads enable row level security;

drop policy if exists "read own plus page reads" on public.plus_page_reads;
create policy "read own plus page reads" on public.plus_page_reads
  for select using (reader_id = auth.uid() or public.is_admin());

comment on table public.plus_page_reads is
  'Pagine Plus confermate esplicitamente dal lettore; fonte per i report di lettura.';
