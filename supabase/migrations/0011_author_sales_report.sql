-- Report vendite sicuro: ciascun autore vede soltanto le royalty dei propri ebook,
-- con titolo e slug del libro collegato all'acquisto.
create or replace function public.author_sales_report()
returns table(
  id uuid,
  gross_cents integer,
  author_amount_cents integer,
  created_at timestamptz,
  paid_out_at timestamptz,
  reversed_at timestamptz,
  purchase_status public.purchase_status,
  book_title text,
  book_slug text
)
language sql
stable
security definer
set search_path=public
as $$
  select
    ledger.id,
    ledger.gross_cents,
    ledger.author_amount_cents,
    ledger.created_at,
    ledger.paid_out_at,
    ledger.reversed_at,
    purchase.status,
    book.title,
    book.slug
  from public.royalty_ledger ledger
  join public.purchases purchase on purchase.id=ledger.purchase_id
  join public.books book on book.id=purchase.book_id
  where ledger.author_id=auth.uid()
  order by ledger.created_at desc;
$$;

grant execute on function public.author_sales_report() to authenticated;
