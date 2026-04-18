-- 7B Hub – Chats & Clans (Phase 2)
-- Ergänzt: Login-Helper (username->email), Direct Messages, Group Chats,
-- Clans (+ Mitglieder + Messages), Chat Messages (für Live wurde entfernt,
-- bleibt aber als allgemeiner Chat-Kanal verfügbar).

-- =============================================================
-- Login-Helper: username -> email (für anonymen Lookup in SignIn)
-- =============================================================
-- SECURITY DEFINER, damit RLS nicht greift. Gibt nur die E-Mail zurück.
create or replace function public.get_email_for_username(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.app_users where username = p_username limit 1;
$$;

grant execute on function public.get_email_for_username(text) to anon, authenticated;

-- =============================================================
-- direct_messages
-- =============================================================
create table if not exists public.direct_messages (
  id              uuid primary key default gen_random_uuid(),
  sender_id       uuid references auth.users(id) on delete cascade,
  sender_name     text,
  recipient_id    uuid references auth.users(id) on delete cascade,
  recipient_name  text,
  content         text not null,
  read            boolean not null default false,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

create index if not exists dm_sender_idx    on public.direct_messages(sender_id);
create index if not exists dm_recipient_idx on public.direct_messages(recipient_id);
create index if not exists dm_created_at_idx on public.direct_messages(created_at desc);

alter table public.direct_messages enable row level security;

drop policy if exists "dm read participant"   on public.direct_messages;
drop policy if exists "dm insert sender"      on public.direct_messages;
drop policy if exists "dm update recipient"   on public.direct_messages;
drop policy if exists "dm delete participant" on public.direct_messages;

create policy "dm read participant" on public.direct_messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin());
create policy "dm insert sender" on public.direct_messages for insert
  with check (auth.uid() = sender_id);
create policy "dm update recipient" on public.direct_messages for update
  using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
create policy "dm delete participant" on public.direct_messages for delete
  using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin());

-- =============================================================
-- group_chats
-- =============================================================
create table if not exists public.group_chats (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  avatar_url   text,
  created_by   uuid references auth.users(id) on delete set null,
  creator_name text,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_group_chats_updated_at on public.group_chats;
create trigger trg_group_chats_updated_at before update on public.group_chats
  for each row execute function public.set_updated_at();

alter table public.group_chats enable row level security;

drop policy if exists "gc read public"    on public.group_chats;
drop policy if exists "gc insert auth"    on public.group_chats;
drop policy if exists "gc update creator" on public.group_chats;
drop policy if exists "gc delete creator" on public.group_chats;

create policy "gc read public" on public.group_chats for select using (true);
create policy "gc insert auth" on public.group_chats for insert
  with check (auth.uid() = created_by);
create policy "gc update creator" on public.group_chats for update
  using (auth.uid() = created_by or public.is_admin())
  with check (auth.uid() = created_by or public.is_admin());
create policy "gc delete creator" on public.group_chats for delete
  using (auth.uid() = created_by or public.is_admin());

-- =============================================================
-- group_chat_members
-- =============================================================
create table if not exists public.group_chat_members (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid references public.group_chats(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  username      text,
  role          text not null default 'member' check (role in ('member','mod','admin')),
  joined_at     timestamptz not null default now(),
  unique (group_id, user_id)
);

create index if not exists gcm_group_id_idx on public.group_chat_members(group_id);
create index if not exists gcm_user_id_idx  on public.group_chat_members(user_id);

alter table public.group_chat_members enable row level security;

drop policy if exists "gcm read member"   on public.group_chat_members;
drop policy if exists "gcm join self"     on public.group_chat_members;
drop policy if exists "gcm leave self"    on public.group_chat_members;

create policy "gcm read member" on public.group_chat_members for select using (true);
create policy "gcm join self"   on public.group_chat_members for insert
  with check (auth.uid() = user_id);
create policy "gcm leave self"  on public.group_chat_members for delete
  using (auth.uid() = user_id or public.is_admin());

-- =============================================================
-- group_chat_messages
-- =============================================================
create table if not exists public.group_chat_messages (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid references public.group_chats(id) on delete cascade,
  sender_id      uuid references auth.users(id) on delete cascade,
  sender_name    text,
  sender_avatar  text,
  content        text not null,
  attachment_url text,
  created_at     timestamptz not null default now()
);

create index if not exists gcmsg_group_idx      on public.group_chat_messages(group_id);
create index if not exists gcmsg_created_at_idx on public.group_chat_messages(created_at desc);

alter table public.group_chat_messages enable row level security;

drop policy if exists "gcmsg read member"   on public.group_chat_messages;
drop policy if exists "gcmsg insert member" on public.group_chat_messages;
drop policy if exists "gcmsg delete sender" on public.group_chat_messages;

create policy "gcmsg read member" on public.group_chat_messages for select
  using (
    exists (
      select 1 from public.group_chat_members m
      where m.group_id = group_chat_messages.group_id and m.user_id = auth.uid()
    )
    or public.is_admin()
  );
create policy "gcmsg insert member" on public.group_chat_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.group_chat_members m
      where m.group_id = group_chat_messages.group_id and m.user_id = auth.uid()
    )
  );
create policy "gcmsg delete sender" on public.group_chat_messages for delete
  using (auth.uid() = sender_id or public.is_admin());

-- =============================================================
-- chat_messages (allgemeiner Chat-Kanal, z.B. Global-Chat)
-- =============================================================
create table if not exists public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  channel       text not null default 'global',
  sender_id     uuid references auth.users(id) on delete cascade,
  sender_name   text,
  sender_avatar text,
  content       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists cm_channel_idx    on public.chat_messages(channel);
create index if not exists cm_created_at_idx on public.chat_messages(created_at desc);

alter table public.chat_messages enable row level security;

drop policy if exists "cm read all"       on public.chat_messages;
drop policy if exists "cm insert auth"    on public.chat_messages;
drop policy if exists "cm delete sender"  on public.chat_messages;

create policy "cm read all" on public.chat_messages for select using (true);
create policy "cm insert auth" on public.chat_messages for insert
  with check (auth.uid() = sender_id);
create policy "cm delete sender" on public.chat_messages for delete
  using (auth.uid() = sender_id or public.is_admin());

-- =============================================================
-- clans
-- =============================================================
create table if not exists public.clans (
  id              uuid primary key default gen_random_uuid(),
  name            text unique not null,
  tag             text,
  description     text,
  avatar_url      text,
  banner_url      text,
  color           text,
  leader_id       uuid references auth.users(id) on delete set null,
  leader_username text,
  members_count   integer not null default 1,
  level           integer not null default 1,
  xp              integer not null default 0,
  is_public       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_clans_updated_at on public.clans;
create trigger trg_clans_updated_at before update on public.clans
  for each row execute function public.set_updated_at();

alter table public.clans enable row level security;

drop policy if exists "clans read public"    on public.clans;
drop policy if exists "clans insert leader"  on public.clans;
drop policy if exists "clans update leader"  on public.clans;
drop policy if exists "clans delete leader"  on public.clans;

create policy "clans read public" on public.clans for select using (true);
create policy "clans insert leader" on public.clans for insert
  with check (auth.uid() = leader_id);
create policy "clans update leader" on public.clans for update
  using (auth.uid() = leader_id or public.is_admin())
  with check (auth.uid() = leader_id or public.is_admin());
create policy "clans delete leader" on public.clans for delete
  using (auth.uid() = leader_id or public.is_admin());

-- =============================================================
-- clan_members
-- =============================================================
create table if not exists public.clan_members (
  id          uuid primary key default gen_random_uuid(),
  clan_id     uuid references public.clans(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  username    text,
  role        text not null default 'member' check (role in ('leader','officer','member')),
  joined_at   timestamptz not null default now(),
  unique (clan_id, user_id)
);

create index if not exists clan_members_clan_idx on public.clan_members(clan_id);
create index if not exists clan_members_user_idx on public.clan_members(user_id);

alter table public.clan_members enable row level security;

drop policy if exists "clan_members read public" on public.clan_members;
drop policy if exists "clan_members join self"   on public.clan_members;
drop policy if exists "clan_members leave self"  on public.clan_members;

create policy "clan_members read public" on public.clan_members for select using (true);
create policy "clan_members join self"   on public.clan_members for insert
  with check (auth.uid() = user_id);
create policy "clan_members leave self"  on public.clan_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.clans c
      where c.id = clan_members.clan_id and c.leader_id = auth.uid()
    )
    or public.is_admin()
  );

-- =============================================================
-- clan_messages
-- =============================================================
create table if not exists public.clan_messages (
  id            uuid primary key default gen_random_uuid(),
  clan_id       uuid references public.clans(id) on delete cascade,
  sender_id     uuid references auth.users(id) on delete cascade,
  sender_name   text,
  sender_avatar text,
  content       text not null,
  created_at    timestamptz not null default now()
);

create index if not exists clan_messages_clan_idx    on public.clan_messages(clan_id);
create index if not exists clan_messages_created_idx on public.clan_messages(created_at desc);

alter table public.clan_messages enable row level security;

drop policy if exists "clan_messages read member"   on public.clan_messages;
drop policy if exists "clan_messages insert member" on public.clan_messages;
drop policy if exists "clan_messages delete sender" on public.clan_messages;

create policy "clan_messages read member" on public.clan_messages for select
  using (
    exists (
      select 1 from public.clan_members m
      where m.clan_id = clan_messages.clan_id and m.user_id = auth.uid()
    )
    or public.is_admin()
  );
create policy "clan_messages insert member" on public.clan_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.clan_members m
      where m.clan_id = clan_messages.clan_id and m.user_id = auth.uid()
    )
  );
create policy "clan_messages delete sender" on public.clan_messages for delete
  using (auth.uid() = sender_id or public.is_admin());

-- =============================================================
-- Mitgliederzahl automatisch pflegen
-- =============================================================
create or replace function public.update_clan_members_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.clans set members_count = members_count + 1 where id = new.clan_id;
  elsif tg_op = 'DELETE' then
    update public.clans set members_count = greatest(members_count - 1, 0) where id = old.clan_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_clan_members_count on public.clan_members;
create trigger trg_clan_members_count
  after insert or delete on public.clan_members
  for each row execute function public.update_clan_members_count();
