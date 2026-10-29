begin;

alter table public.profiles
  add column if not exists payout_iban text,
  add column if not exists payout_account_holder text,
  add column if not exists payout_bank_name text,
  add column if not exists payout_whatsapp text;

alter table public.profiles drop constraint if exists profiles_payout_preference_check;
alter table public.profiles
  add constraint profiles_payout_preference_check
  check (payout_preference in ('stripe', 'paypal', 'bank_transfer'));

create or replace function public.is_valid_iban(value text)
returns boolean
language plpgsql
immutable
strict
set search_path = public
as $$
declare
  normalized text := upper(regexp_replace(value, '\s+', '', 'g'));
  rearranged text;
  character text;
  digits text;
  character_position integer;
  digit_position integer;
  remainder integer := 0;
begin
  if normalized !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' then return false; end if;
  rearranged := substr(normalized, 5) || left(normalized, 4);
  for character_position in 1..char_length(rearranged) loop
    character := substr(rearranged, character_position, 1);
    digits := case when character between 'A' and 'Z' then (ascii(character) - 55)::text else character end;
    for digit_position in 1..char_length(digits) loop
      remainder := (remainder * 10 + substr(digits, digit_position, 1)::integer) % 97;
    end loop;
  end loop;
  return remainder = 1;
end;
$$;

alter table public.profiles drop constraint if exists profiles_bank_transfer_details_check;
alter table public.profiles
  add constraint profiles_bank_transfer_details_check check (
    payout_preference <> 'bank_transfer' or (
      payout_iban is not null and public.is_valid_iban(payout_iban)
      and payout_account_holder is not null and char_length(trim(payout_account_holder)) between 3 and 160
      and payout_bank_name is not null and char_length(trim(payout_bank_name)) between 2 and 160
      and payout_whatsapp is not null and payout_whatsapp ~ '^[+0-9][0-9 ()-]{6,24}$'
    )
  );

create table if not exists public.book_ai_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null unique references public.books(id) on delete cascade,
  overall_score numeric(3,1) not null check (overall_score between 0 and 10),
  completeness_score smallint not null check (completeness_score between 0 and 10),
  coherence_score smallint not null check (coherence_score between 0 and 10),
  logical_flow_score smallint not null check (logical_flow_score between 0 and 10),
  summary text not null,
  strengths jsonb not null default '[]'::jsonb,
  issues jsonb not null default '[]'::jsonb,
  missing_elements jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  extraction_characters integer not null default 0,
  model text,
  evaluated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.book_ai_reviews enable row level security;
drop policy if exists "admins manage ai reviews" on public.book_ai_reviews;
create policy "admins manage ai reviews" on public.book_ai_reviews for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_book_ai_review_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists book_ai_reviews_updated_at on public.book_ai_reviews;
create trigger book_ai_reviews_updated_at before update on public.book_ai_reviews for each row execute procedure public.touch_book_ai_review_updated_at();

commit;
