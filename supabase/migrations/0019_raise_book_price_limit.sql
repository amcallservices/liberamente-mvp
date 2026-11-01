-- Consente prezzi di vendita fino a 9.999,99 €.
-- La procedura individua e sostituisce solo il vincolo relativo al prezzo.
do $$
declare
  price_constraint text;
begin
  select conname into price_constraint
  from pg_constraint
  where conrelid = 'public.books'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%price_cents%'
  limit 1;

  if price_constraint is not null then
    execute format('alter table public.books drop constraint %I', price_constraint);
  end if;
end $$;

alter table public.books
  add constraint books_price_cents_check
  check (price_cents between 99 and 999999);
