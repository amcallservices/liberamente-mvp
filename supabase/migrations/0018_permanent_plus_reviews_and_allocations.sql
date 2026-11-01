-- Recensioni moderate: solo le approvate sono pubbliche e incidono sulle statistiche.
alter table public.book_reviews add column if not exists moderation_status text not null default 'approved';
alter table public.book_reviews add column if not exists moderation_note text;
alter table public.book_reviews add column if not exists moderated_at timestamptz;
alter table public.book_reviews add column if not exists moderated_by uuid references public.profiles(id) on delete set null;
alter table public.book_reviews drop constraint if exists book_reviews_moderation_status_check;
alter table public.book_reviews add constraint book_reviews_moderation_status_check check (moderation_status in ('pending_review','approved','hidden'));
update public.book_reviews set moderation_status = 'approved' where moderation_status is null;

drop policy if exists "public read reviews for published books" on public.book_reviews;
create policy "public read approved reviews for published books" on public.book_reviews
  for select using (
    buyer_id = auth.uid()
    or public.is_admin()
    or (moderation_status = 'approved' and exists (
      select 1 from public.books where books.id = book_reviews.book_id and books.status = 'published'
    ))
  );
drop policy if exists "buyers write verified reviews" on public.book_reviews;
create policy "buyers write verified reviews" on public.book_reviews
  for insert with check (
    buyer_id = auth.uid()
    and moderation_status = 'pending_review'
    and moderation_note is null
    and moderated_at is null
    and moderated_by is null
    and exists (
      select 1 from public.purchases
      where purchases.id = purchase_id and purchases.book_id = book_id
      and purchases.buyer_id = auth.uid() and purchases.status = 'paid'
    )
  );
drop policy if exists "buyers update own verified reviews" on public.book_reviews;
create policy "buyers update own verified reviews" on public.book_reviews
  for update using (buyer_id = auth.uid())
  with check (
    buyer_id = auth.uid()
    and moderation_status = 'pending_review'
    and moderation_note is null
    and moderated_at is null
    and moderated_by is null
  );

create or replace view public.book_discovery_stats as
select b.id as book_id,
  (select count(*)::integer from public.purchases p where p.book_id=b.id and p.status='paid') as sales_count,
  (select count(*)::integer from public.book_reviews r where r.book_id=b.id and r.moderation_status='approved') as review_count,
  coalesce((select round(avg(r.rating)::numeric,1) from public.book_reviews r where r.book_id=b.id and r.moderation_status='approved'),0)::numeric(2,1) as average_rating
from public.books b;
grant select on public.book_discovery_stats to anon, authenticated;

-- Una pagina Plus viene qualificata una sola volta per lettore e titolo.
create table if not exists public.plus_page_qualifications (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  subscription_id uuid references public.plus_subscriptions(id) on delete set null,
  page_number integer not null check (page_number > 0),
  qualified_month date not null,
  confirmed_at timestamptz not null default now(),
  unique (reader_id, book_id, page_number)
);
create index if not exists plus_page_qualifications_month_idx on public.plus_page_qualifications(qualified_month);
create index if not exists plus_page_qualifications_book_idx on public.plus_page_qualifications(book_id);
alter table public.plus_page_qualifications enable row level security;
drop policy if exists "read own plus qualifications" on public.plus_page_qualifications;
create policy "read own plus qualifications" on public.plus_page_qualifications for select using (reader_id = auth.uid() or public.is_admin());
drop policy if exists "write own plus qualifications" on public.plus_page_qualifications;
create policy "write own plus qualifications" on public.plus_page_qualifications for insert with check (reader_id = auth.uid());

insert into public.plus_page_qualifications(reader_id, book_id, subscription_id, page_number, qualified_month, confirmed_at)
select distinct on (reader_id, book_id, page_number)
  reader_id, book_id, subscription_id, page_number, period_start, coalesce(confirmed_at, now())
from public.plus_page_reads
order by reader_id, book_id, page_number, period_start asc, confirmed_at asc
on conflict (reader_id, book_id, page_number) do nothing;

create table if not exists public.plus_book_allocations (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  book_id uuid not null references public.books(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  qualified_pages integer not null default 0,
  author_share_cents integer not null default 0,
  paid_out_at timestamptz,
  created_at timestamptz not null default now(),
  unique(period_start, book_id)
);
create index if not exists plus_book_allocations_author_idx on public.plus_book_allocations(author_id, period_start desc);
alter table public.plus_book_allocations enable row level security;
drop policy if exists "authors read own plus book allocations" on public.plus_book_allocations;
create policy "authors read own plus book allocations" on public.plus_book_allocations for select using (author_id = auth.uid() or public.is_admin());

create or replace function public.calculate_plus_monthly_allocation(
  p_period_start date,
  p_gross_cents integer,
  p_fees_cents integer default 0,
  p_tax_cents integer default 0,
  p_refunds_cents integer default 0
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_distributable integer;
  v_total_pages integer;
  v_author_pool integer;
  v_platform integer;
  v_allocated integer;
begin
  if p_period_start <> date_trunc('month', p_period_start)::date then
    raise exception 'Il mese deve iniziare il primo giorno.';
  end if;
  if exists (select 1 from plus_author_allocations where period_start = p_period_start and paid_out_at is not null)
     or exists (select 1 from plus_book_allocations where period_start = p_period_start and paid_out_at is not null) then
    raise exception 'Esistono compensi già pagati per questo mese.';
  end if;

  v_distributable := greatest(coalesce(p_gross_cents,0) - coalesce(p_fees_cents,0) - coalesce(p_tax_cents,0) - coalesce(p_refunds_cents,0), 0);
  select count(*) into v_total_pages
  from plus_page_qualifications q join books b on b.id = q.book_id
  where q.qualified_month = p_period_start and b.status = 'published' and b.plus_enabled = true;
  v_author_pool := case when v_total_pages > 0 then floor(v_distributable * 0.60)::integer else 0 end;
  v_platform := v_distributable - v_author_pool;

  insert into plus_monthly_pools(period_start, gross_cents, fees_cents, tax_cents, refunds_cents, distributable_cents, author_pool_cents, platform_cents, status)
  values (p_period_start, coalesce(p_gross_cents,0), coalesce(p_fees_cents,0), coalesce(p_tax_cents,0), coalesce(p_refunds_cents,0), v_distributable, v_author_pool, v_platform, 'calculated')
  on conflict (period_start) do update set gross_cents=excluded.gross_cents, fees_cents=excluded.fees_cents, tax_cents=excluded.tax_cents, refunds_cents=excluded.refunds_cents, distributable_cents=excluded.distributable_cents, author_pool_cents=excluded.author_pool_cents, platform_cents=excluded.platform_cents, status='calculated';

  delete from plus_book_allocations where period_start = p_period_start;
  delete from plus_author_allocations where period_start = p_period_start;
  if v_total_pages > 0 then
    with qualified as (
      select q.book_id, b.author_id, count(*)::integer as pages
      from plus_page_qualifications q join books b on b.id=q.book_id
      where q.qualified_month=p_period_start and b.status='published' and b.plus_enabled=true
      group by q.book_id,b.author_id
    ), raw as (
      select *, floor((v_author_pool::numeric * pages) / v_total_pages)::integer as cents,
        ((v_author_pool::numeric * pages) / v_total_pages) - floor((v_author_pool::numeric * pages) / v_total_pages) as fraction
      from qualified
    ), ranked as (
      select *, row_number() over (order by fraction desc, book_id) as position from raw
    ), totals as (select coalesce(sum(cents),0)::integer as cents from raw)
    insert into plus_book_allocations(period_start,book_id,author_id,qualified_pages,author_share_cents)
    select p_period_start,book_id,author_id,pages,cents + case when position <= v_author_pool-(select cents from totals) then 1 else 0 end
    from ranked;
  end if;
  insert into plus_author_allocations(period_start,author_id,qualified_reading_credits,author_share_cents)
  select period_start, author_id, sum(qualified_pages), sum(author_share_cents)
  from plus_book_allocations where period_start=p_period_start
  group by period_start, author_id;
end $$;
grant execute on function public.calculate_plus_monthly_allocation(date,integer,integer,integer,integer) to service_role;
