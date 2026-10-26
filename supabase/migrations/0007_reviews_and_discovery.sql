-- Recensioni verificate e statistiche aggregate, senza esporre i dati degli acquisti.
create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 20 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, buyer_id), unique (purchase_id)
);
alter table public.book_reviews enable row level security;
drop policy if exists "public read reviews for published books" on public.book_reviews;
create policy "public read reviews for published books" on public.book_reviews for select using (buyer_id = auth.uid() or exists (select 1 from public.books where books.id = book_reviews.book_id and books.status = 'published') or public.is_admin());
drop policy if exists "buyers write verified reviews" on public.book_reviews;
create policy "buyers write verified reviews" on public.book_reviews for insert with check (buyer_id = auth.uid() and exists (select 1 from public.purchases where purchases.id = purchase_id and purchases.book_id = book_id and purchases.buyer_id = auth.uid() and purchases.status = 'paid'));
drop policy if exists "buyers update own verified reviews" on public.book_reviews;
create policy "buyers update own verified reviews" on public.book_reviews for update using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());
drop policy if exists "buyers delete own reviews" on public.book_reviews;
create policy "buyers delete own reviews" on public.book_reviews for delete using (buyer_id = auth.uid());
create or replace function public.touch_book_review_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists book_reviews_updated_at on public.book_reviews;
create trigger book_reviews_updated_at before update on public.book_reviews for each row execute procedure public.touch_book_review_updated_at();
create or replace view public.book_discovery_stats as
select b.id as book_id,
  (select count(*)::integer from public.purchases p where p.book_id=b.id and p.status='paid') as sales_count,
  (select count(*)::integer from public.book_reviews r where r.book_id=b.id) as review_count,
  coalesce((select round(avg(r.rating)::numeric,1) from public.book_reviews r where r.book_id=b.id),0)::numeric(2,1) as average_rating
from public.books b;
grant select on public.book_discovery_stats to anon, authenticated;
