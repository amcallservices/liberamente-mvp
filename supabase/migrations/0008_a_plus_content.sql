-- Moduli A+ con da una a quattro immagini. I file restano privati finché non sono approvati.
do $$ begin create type public.a_plus_status as enum ('draft','pending_review','approved','rejected'); exception when duplicate_object then null; end $$;

create table if not exists public.book_a_plus_blocks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  heading text not null check (char_length(trim(heading)) between 2 and 140),
  body text not null check (char_length(trim(body)) between 40 and 2400),
  image_paths text[] not null check (cardinality(image_paths) between 1 and 4),
  image_alt text not null check (char_length(trim(image_alt)) between 5 and 180),
  sort_order integer not null default 0,
  status public.a_plus_status not null default 'pending_review',
  moderation_note text check (char_length(moderation_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.book_a_plus_blocks enable row level security;
create or replace function public.touch_a_plus_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists a_plus_updated_at on public.book_a_plus_blocks;
create trigger a_plus_updated_at before update on public.book_a_plus_blocks for each row execute procedure public.touch_a_plus_updated_at();
drop policy if exists "public read approved a plus" on public.book_a_plus_blocks;
create policy "public read approved a plus" on public.book_a_plus_blocks for select using (status='approved' or author_id=auth.uid() or public.is_admin());
drop policy if exists "authors create a plus for own books" on public.book_a_plus_blocks;
create policy "authors create a plus for own books" on public.book_a_plus_blocks for insert with check (author_id=auth.uid() and exists(select 1 from public.books where books.id=book_id and books.author_id=auth.uid()));
drop policy if exists "authors revise own a plus" on public.book_a_plus_blocks;
create policy "authors revise own a plus" on public.book_a_plus_blocks for update using (author_id=auth.uid()) with check (author_id=auth.uid() and status in ('draft','pending_review'));
drop policy if exists "authors remove own a plus" on public.book_a_plus_blocks;
create policy "authors remove own a plus" on public.book_a_plus_blocks for delete using (author_id=auth.uid());
drop policy if exists "admins manage a plus" on public.book_a_plus_blocks;
create policy "admins manage a plus" on public.book_a_plus_blocks for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets(id,name,public) values ('a-plus','a-plus',false) on conflict do nothing;
update storage.buckets set public=false where id='a-plus';
drop policy if exists "authors access own a plus files" on storage.objects;
create policy "authors access own a plus files" on storage.objects for all using (bucket_id='a-plus' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='a-plus' and (storage.foldername(name))[1]=auth.uid()::text);
