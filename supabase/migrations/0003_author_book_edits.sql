-- Authors may reopen a title for changes, but can never publish it directly.
-- Every saved modification moves the title back into the editorial review queue.

drop policy if exists "authors update drafts" on public.books;
drop policy if exists "authors update own books for review" on public.books;
drop policy if exists "authors delete unpublished books" on public.books;
drop policy if exists "authors delete unsold books" on public.books;

create policy "authors update own books for review" on public.books for update
using (author_id = auth.uid())
with check (author_id = auth.uid() and status in ('draft','pending_review'));

-- A sold ebook must stay in the buyer's library. Unsold titles can be deleted permanently by their author.
create policy "authors delete unsold books" on public.books for delete
using (author_id = auth.uid() and not exists (select 1 from public.purchases where purchases.book_id = books.id));
