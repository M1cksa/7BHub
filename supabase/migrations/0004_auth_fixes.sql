-- 7B Hub – Auth Fixes
-- Erlaubt dem frisch registrierten User, seine eigene Zeile zu inserten
-- (Fallback, falls der Trigger nicht greift) sowie upsert.

drop policy if exists "app_users_insert_self" on public.app_users;
create policy "app_users_insert_self" on public.app_users
  for insert
  with check (auth.uid() = id);
