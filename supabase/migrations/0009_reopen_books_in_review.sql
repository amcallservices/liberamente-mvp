-- Un autore può ritirare temporaneamente un ebook dalla revisione per correggerlo.
-- Al successivo salvataggio il libro torna automaticamente alla revisione editoriale.
drop policy if exists "authors update revision copies" on public.books;

create policy "authors update revision copies" on public.books for update
  using (author_id=auth.uid() and status in ('draft','rejected','blocked','published','pending_review'))
  with check (author_id=auth.uid() and status in ('draft','pending_review'));
