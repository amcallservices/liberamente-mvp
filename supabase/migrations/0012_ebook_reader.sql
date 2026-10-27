-- Lettura nel sito: il testo è estratto automaticamente dal PDF/DOCX originale.
-- L'anteprima è opzionale e usa solo l'estratto iniziale, mai il testo completo.
create table if not exists public.book_reading_content (
  book_id uuid primary key references public.books(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  full_text text not null check (char_length(full_text) >= 80),
  preview_text text not null check (char_length(preview_text) >= 80),
  preview_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.book_reading_content enable row level security;

create or replace function public.touch_book_reading_content_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists book_reading_content_updated_at on public.book_reading_content;
create trigger book_reading_content_updated_at before update on public.book_reading_content for each row execute procedure public.touch_book_reading_content_updated_at();

drop policy if exists "authors manage own reading content" on public.book_reading_content;
create policy "authors manage own reading content" on public.book_reading_content for all using (author_id=auth.uid()) with check (author_id=auth.uid());
drop policy if exists "buyers read purchased reading content" on public.book_reading_content;
create policy "buyers read purchased reading content" on public.book_reading_content for select using (exists(select 1 from public.purchases where purchases.book_id=book_reading_content.book_id and purchases.buyer_id=auth.uid() and purchases.status='paid'));
drop policy if exists "admins manage reading content" on public.book_reading_content;
create policy "admins manage reading content" on public.book_reading_content for all using (public.is_admin()) with check (public.is_admin());
