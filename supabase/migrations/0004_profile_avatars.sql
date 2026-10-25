alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets(id,name,public) values ('avatars','avatars',true) on conflict do nothing;

drop policy if exists "users manage own avatars" on storage.objects;
create policy "users manage own avatars" on storage.objects for all
using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
