-- 7B Hub – Initial Schema (Phase 1)
-- Baut die drei explizit definierten Base44-Entities nach:
--   AppUser, AdminBroadcast, UserPopupNotification
-- Weitere Entities (Video, Short, Snap, Chat, Clan, ...) folgen in Phase 2.

-- =============================================================
-- Extensions
-- =============================================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =============================================================
-- Shared helpers
-- =============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- app_users
-- Entspricht Base44-Entity "AppUser".
-- id wird mit auth.users(id) verknüpft (1:1), damit Supabase-Auth
-- direkt als Login-Layer dient. Passwort-Hash liegt in auth.users.
-- =============================================================
create table if not exists public.app_users (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          text unique not null,
  email             text unique,
  avatar_url        text,
  bio               text,
  role              text not null default 'user' check (role in ('user','admin','gamer')),
  audience_group    text check (audience_group in ('girl','boy','mixed')),
  requested_role    text check (requested_role in ('girl','boy','mixed')),
  is_donor          boolean not null default false,
  tokens            integer not null default 100,

  has_seen_tutorial      boolean not null default false,
  clan_tutorial_seen     boolean not null default false,
  propass_tutorial_seen  boolean not null default false,
  last_seen              timestamptz,

  -- Cosmetics
  frame_style                 text not null default 'none',
  owned_frames                jsonb not null default '[]'::jsonb,
  active_badge                text,
  owned_badges                jsonb not null default '[]'::jsonb,
  active_animation            text not null default 'none',
  owned_animations            jsonb not null default '[]'::jsonb,
  owned_video_frames          jsonb not null default '[]'::jsonb,
  owned_themes                jsonb not null default '["default"]'::jsonb,
  active_theme                text not null default 'default',
  custom_themes               jsonb not null default '[]'::jsonb,
  active_banner               text not null default 'none',
  owned_banners               jsonb not null default '[]'::jsonb,
  active_background_animation text not null default 'default',
  owned_background_animations jsonb not null default '["default"]'::jsonb,
  owned_bundles               jsonb not null default '[]'::jsonb,
  owned_game_upgrades         jsonb not null default '[]'::jsonb,
  owned_emotes                jsonb not null default '[]'::jsonb,

  -- Pokemon partner
  pokemon_partner_id     integer,
  pokemon_partner_sprite text,
  pokemon_partner_name   text,

  -- Newsletter / compliance
  newsletter_subscribed  boolean not null default false,
  newsletter_asked       boolean not null default false,
  approved               boolean not null default false,
  agreed_to_terms        boolean not null default false,
  agreed_terms_version   text,
  agreed_to_video_policy boolean not null default false,
  terms_agreed_at        timestamptz,

  -- Privacy
  privacy_profile_visible  boolean not null default true,
  privacy_show_email       boolean not null default false,
  privacy_allow_messages   boolean not null default true,

  -- Notifications
  notify_new_follower boolean not null default true,
  notify_new_comment  boolean not null default true,
  notify_new_like     boolean not null default true,

  -- Moderation
  banned     boolean not null default false,
  ban_reason text,

  -- Quests
  trial_completed           boolean not null default false,
  daily_login_streak        integer not null default 0,
  daily_login_last_claim    timestamptz,
  daily_login_cycle_start   timestamptz,
  daily_login_claimed_days  jsonb not null default '[]'::jsonb,
  welcome_reward_claimed    boolean not null default false,
  v2_quest_claimed          boolean not null default false,
  v2_quest_dismissed        boolean not null default false,
  v2_quest_progress         jsonb not null default '[]'::jsonb,

  -- Battle Pass
  bp_level            integer not null default 1,
  bp_xp               integer not null default 0,
  bp_premium          boolean not null default false,
  bp_claimed_free     jsonb not null default '[]'::jsonb,
  bp_claimed_premium  jsonb not null default '[]'::jsonb,
  bp_claimed_bonus    jsonb not null default '[]'::jsonb,
  bp_shard_claimed    jsonb not null default '[]'::jsonb,

  -- Shards / crafting
  shard_inventory jsonb not null default '{"spark":0,"void":0,"nova":0,"omega":0}'::jsonb,
  shard_crafted   jsonb not null default '[]'::jsonb,

  -- Titles / chat / effects
  owned_titles           jsonb not null default '[]'::jsonb,
  active_title           text,
  owned_chat_colors      jsonb not null default '[]'::jsonb,
  active_chat_color      text,
  owned_profile_effects  jsonb not null default '[]'::jsonb,
  active_profile_effect  text,
  owned_cursor_trails    jsonb not null default '[]'::jsonb,
  active_cursor_trail    text not null default 'none',
  owned_profile_sounds   jsonb not null default '[]'::jsonb,
  active_profile_sound   text not null default 'none',

  -- Temp rewards
  test_season_2          boolean not null default false,
  temp_frame_id          text,
  temp_frame_expires     timestamptz,
  temp_animation_id      text,
  temp_animation_expires timestamptz,

  -- Mini-games state
  neon_dash_upgrades     jsonb not null default '{}'::jsonb,
  neon_dash_stats        jsonb not null default '{}'::jsonb,
  neon_racer_data        jsonb not null default '{}'::jsonb,
  pro_pass               jsonb not null default '{}'::jsonb,
  pokemon_story_progress jsonb not null default '{}'::jsonb,

  -- Daily XP cap
  daily_game_xp_used integer not null default 0,
  daily_game_xp_date text,

  -- Misc popups
  whatsapp_channel_seen boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_username on public.app_users (username);
create index if not exists idx_app_users_role on public.app_users (role);
create index if not exists idx_app_users_last_seen on public.app_users (last_seen desc);

drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at before update on public.app_users
for each row execute function public.set_updated_at();

-- Automatisch app_users-Zeile anlegen, wenn ein auth.users-Eintrag entsteht.
-- username/email kommen aus raw_user_meta_data bzw. email.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.app_users (id, username, email)
  values (new.id, v_username, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- =============================================================
-- admin_broadcasts
-- =============================================================
create table if not exists public.admin_broadcasts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  message    text not null,
  emoji      text not null default '📢',
  color      text not null default '#06b6d4',
  is_active  boolean not null default true,
  priority   text not null default 'info' check (priority in ('info','warning','success','critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admin_broadcasts_updated_at on public.admin_broadcasts;
create trigger trg_admin_broadcasts_updated_at before update on public.admin_broadcasts
for each row execute function public.set_updated_at();

-- =============================================================
-- user_popup_notifications
-- =============================================================
create table if not exists public.user_popup_notifications (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  message         text not null,
  target_user_ids jsonb not null default '[]'::jsonb,
  seen_by         jsonb not null default '[]'::jsonb,
  is_active       boolean not null default true,
  sent_by         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_upn_updated_at on public.user_popup_notifications;
create trigger trg_upn_updated_at before update on public.user_popup_notifications
for each row execute function public.set_updated_at();

-- =============================================================
-- Row-Level-Security
-- =============================================================
alter table public.app_users                enable row level security;
alter table public.admin_broadcasts         enable row level security;
alter table public.user_popup_notifications enable row level security;

-- Helper: ist aktueller User Admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.app_users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- app_users: jeder authentifizierte User darf Profile lesen (für Social-Feeds),
-- aber nur sein eigenes ändern. Admins dürfen alles.
drop policy if exists "app_users_select" on public.app_users;
create policy "app_users_select" on public.app_users
  for select using (auth.role() = 'authenticated');

drop policy if exists "app_users_update_self" on public.app_users;
create policy "app_users_update_self" on public.app_users
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "app_users_admin_all" on public.app_users;
create policy "app_users_admin_all" on public.app_users
  for all using (public.is_admin()) with check (public.is_admin());

-- admin_broadcasts: lesen alle authentifizierten, schreiben nur Admins.
drop policy if exists "admin_broadcasts_read" on public.admin_broadcasts;
create policy "admin_broadcasts_read" on public.admin_broadcasts
  for select using (auth.role() = 'authenticated');

drop policy if exists "admin_broadcasts_admin_write" on public.admin_broadcasts;
create policy "admin_broadcasts_admin_write" on public.admin_broadcasts
  for all using (public.is_admin()) with check (public.is_admin());

-- user_popup_notifications: User darf eigene Popups sehen + seen_by updaten.
drop policy if exists "upn_read_targeted" on public.user_popup_notifications;
create policy "upn_read_targeted" on public.user_popup_notifications
  for select using (
    auth.role() = 'authenticated' and (
      target_user_ids ? (auth.uid()::text)
      or jsonb_array_length(target_user_ids) = 0
    )
  );

drop policy if exists "upn_update_seen_by" on public.user_popup_notifications;
create policy "upn_update_seen_by" on public.user_popup_notifications
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "upn_admin_write" on public.user_popup_notifications;
create policy "upn_admin_write" on public.user_popup_notifications
  for all using (public.is_admin()) with check (public.is_admin());
