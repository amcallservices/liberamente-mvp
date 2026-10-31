alter table public.books add column if not exists plus_enabled boolean not null default false;
alter table public.books add column if not exists plus_enabled_at timestamptz;

create table if not exists public.plus_subscriptions (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (status in ('active','trialing','past_due','canceled','unpaid','incomplete','inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists plus_subscriptions_reader_unique on public.plus_subscriptions(reader_id);
create index if not exists plus_subscriptions_status_idx on public.plus_subscriptions(status);

create table if not exists public.plus_reading_events (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  subscription_id uuid references public.plus_subscriptions(id) on delete set null,
  page_or_block integer not null default 0 check (page_or_block >= 0),
  seconds_spent integer not null default 0 check (seconds_spent >= 0 and seconds_spent <= 7200),
  occurred_at timestamptz not null default now()
);
create index if not exists plus_reading_events_reader_period_idx on public.plus_reading_events(reader_id,occurred_at desc);
create index if not exists plus_reading_events_book_period_idx on public.plus_reading_events(book_id,occurred_at desc);

create table if not exists public.plus_monthly_pools (
  period_start date primary key,
  gross_cents integer not null default 0 check (gross_cents >= 0),
  fees_cents integer not null default 0 check (fees_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  refunds_cents integer not null default 0 check (refunds_cents >= 0),
  distributable_cents integer not null default 0 check (distributable_cents >= 0),
  author_pool_cents integer not null default 0 check (author_pool_cents >= 0),
  platform_cents integer not null default 0 check (platform_cents >= 0),
  status text not null default 'draft' check (status in ('draft','calculated','paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plus_author_allocations (
  id uuid primary key default gen_random_uuid(),
  period_start date not null references public.plus_monthly_pools(period_start) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  qualified_reading_credits numeric(14,2) not null default 0 check (qualified_reading_credits >= 0),
  author_share_cents integer not null default 0 check (author_share_cents >= 0),
  paid_out_at timestamptz,
  created_at timestamptz not null default now(),
  unique(period_start,author_id)
);

alter table public.plus_subscriptions enable row level security;
alter table public.plus_reading_events enable row level security;
alter table public.plus_monthly_pools enable row level security;
alter table public.plus_author_allocations enable row level security;

drop policy if exists "read own plus subscription" on public.plus_subscriptions;
create policy "read own plus subscription" on public.plus_subscriptions for select using (reader_id = auth.uid() or public.is_admin());
drop policy if exists "read own plus reading events" on public.plus_reading_events;
create policy "read own plus reading events" on public.plus_reading_events for select using (reader_id = auth.uid() or public.is_admin());
drop policy if exists "read plus pools for admins" on public.plus_monthly_pools;
create policy "read plus pools for admins" on public.plus_monthly_pools for select using (public.is_admin());
drop policy if exists "read own plus allocations" on public.plus_author_allocations;
create policy "read own plus allocations" on public.plus_author_allocations for select using (author_id = auth.uid() or public.is_admin());
