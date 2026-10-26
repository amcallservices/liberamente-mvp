-- Storico delle comunicazioni editoriali fra amministrazione e autore.
create table if not exists public.book_review_notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  actor text not null check (actor in ('admin','author')),
  message text not null check (char_length(trim(message)) between 2 and 1000),
  created_at timestamptz not null default now()
);
alter table public.book_review_notes enable row level security;

drop policy if exists "authors and admins read review notes" on public.book_review_notes;
create policy "authors and admins read review notes" on public.book_review_notes
  for select using (author_id=auth.uid() or public.is_admin());
drop policy if exists "authors add own review notes" on public.book_review_notes;
create policy "authors add own review notes" on public.book_review_notes
  for insert with check (author_id=auth.uid() and actor='author');

-- Un autore può preparare di nuovo un titolo bloccato, respinto o già pubblicato,
-- ma può inviarlo solo come bozza o in revisione: non può auto-pubblicarlo.
drop policy if exists "authors update drafts" on public.books;
drop policy if exists "authors update revision copies" on public.books;
create policy "authors update revision copies" on public.books for update
  using (author_id=auth.uid() and status in ('draft','rejected','blocked','published'))
  with check (author_id=auth.uid() and status in ('draft','pending_review'));

-- Le copertine sono pubbliche perché appaiono nelle pagine del catalogo.
update storage.buckets set public=true where id='covers';
