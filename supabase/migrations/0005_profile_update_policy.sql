-- Permette a ogni utente di aggiornare il proprio profilo senza poter modificare il ruolo.
alter table public.profiles add column if not exists avatar_path text;

create or replace function public.profile_role_is_unchanged(target_id uuid, requested_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select target_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = target_id and role = requested_role
    );
$$;

drop policy if exists "profile own update" on public.profiles;
create policy "profile own update" on public.profiles
  for update
  using (id = auth.uid())
  with check (public.profile_role_is_unchanged(id, role));
