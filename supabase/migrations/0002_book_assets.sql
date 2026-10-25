-- Run this migration in the Supabase SQL Editor after 0001_marketplace.sql.
drop policy if exists "authors access own cover files" on storage.objects;
drop policy if exists "authors delete unpublished books" on public.books;
drop policy if exists "admins moderate books" on public.books;
drop policy if exists "admins delete books" on public.books;

alter table public.profiles
  add column if not exists paypal_email text,
  add column if not exists payout_preference text not null default 'stripe' check (payout_preference in ('stripe','paypal'));

alter type public.book_status add value if not exists 'blocked';

alter table public.books
  add column if not exists subtitle text check (char_length(subtitle) <= 220),
  add column if not exists category text check (char_length(category) between 2 and 80),
  add column if not exists language_code text not null default 'it' check (language_code in ('it','en')),
  add column if not exists file_name text,
  add column if not exists file_mime_type text,
  add column if not exists file_size_bytes bigint check (file_size_bytes is null or file_size_bytes > 0),
  add column if not exists cover_alt_text text check (char_length(cover_alt_text) <= 180),
  add column if not exists rights_confirmed boolean not null default false,
  add column if not exists moderation_note text check (char_length(moderation_note) <= 1000),
  add column if not exists updated_at timestamptz not null default now();

alter table public.purchases add column if not exists stripe_payment_intent_id text unique;
alter table public.royalty_ledger add column if not exists reversed_at timestamptz;

create or replace function public.touch_book_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists books_updated_at on public.books;
create trigger books_updated_at before update on public.books for each row execute procedure public.touch_book_updated_at();

insert into storage.buckets(id,name,public) values ('covers','covers',true) on conflict do nothing;
create policy "authors access own cover files" on storage.objects for all
  using (bucket_id='covers' and (storage.foldername(name))[1]=auth.uid()::text)
  with check (bucket_id='covers' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "authors delete unpublished books" on public.books for delete
  using (author_id=auth.uid() and status in ('draft','rejected','pending_review'));
create policy "admins moderate books" on public.books for update
  using (public.is_admin()) with check (public.is_admin());
create policy "admins delete books" on public.books for delete using (public.is_admin());
