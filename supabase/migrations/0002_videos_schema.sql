-- 7B Hub – Video-/Upload-/Watch-Schema (Phase 2)
-- Ergänzt die Tabellen, die für Video-Upload (Google Drive) und den
-- Video-Player benötigt werden.
-- Live-Stream-spezifische Tabellen werden bewusst NICHT angelegt
-- (Live Streams werden aus dem Frontend entfernt).

-- =============================================================
-- videos
-- =============================================================
create table if not exists public.videos (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  -- Google-Drive spezifisch
  video_url         text,                         -- webContentLink
  video_source      text not null default 'google_drive',
  drive_file_id     text,                         -- Google Drive File-ID
  thumbnail_url     text,
  -- Metadaten
  category          text not null default 'entertainment',
  audience          text not null default 'all' check (audience in ('all','girl','boy','mixed')),
  status            text not null default 'ready' check (status in ('processing','ready','scheduled','failed')),
  duration          text,                         -- "MM:SS"
  is_members_only   boolean not null default false,
  video_frame       text not null default 'none',
  -- Creator
  creator_id        uuid references auth.users(id) on delete cascade,
  creator_name      text,
  creator_username  text,
  creator_avatar    text,
  -- Statistiken
  views             integer not null default 0,
  likes_count       integer not null default 0,
  comments_count    integer not null default 0,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists videos_creator_id_idx   on public.videos(creator_id);
create index if not exists videos_category_idx     on public.videos(category);
create index if not exists videos_created_at_idx   on public.videos(created_at desc);
create index if not exists videos_status_idx       on public.videos(status);

drop trigger if exists trg_videos_updated_at on public.videos;
create trigger trg_videos_updated_at before update on public.videos
  for each row execute function public.set_updated_at();

alter table public.videos enable row level security;

drop policy if exists "videos read public"    on public.videos;
drop policy if exists "videos insert owner"   on public.videos;
drop policy if exists "videos update owner"   on public.videos;
drop policy if exists "videos delete owner"   on public.videos;

create policy "videos read public" on public.videos for select using (true);
create policy "videos insert owner" on public.videos for insert
  with check (auth.uid() is not null and (creator_id is null or creator_id = auth.uid()));
create policy "videos update owner" on public.videos for update
  using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
create policy "videos delete owner" on public.videos for delete
  using (creator_id = auth.uid() or public.is_admin());

-- =============================================================
-- shorts  (gleiches Modell wie videos, dedizierte Tabelle)
-- =============================================================
create table if not exists public.shorts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  tags              text,
  video_url         text,
  video_source      text not null default 'google_drive',
  drive_file_id     text,
  thumbnail_url     text,
  audience          text not null default 'all' check (audience in ('all','girl','boy','mixed')),
  creator_id        uuid references auth.users(id) on delete cascade,
  creator_name      text,
  creator_username  text,
  creator_avatar    text,
  views             integer not null default 0,
  likes_count       integer not null default 0,
  comments_count    integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists shorts_creator_id_idx on public.shorts(creator_id);
create index if not exists shorts_created_at_idx on public.shorts(created_at desc);

drop trigger if exists trg_shorts_updated_at on public.shorts;
create trigger trg_shorts_updated_at before update on public.shorts
  for each row execute function public.set_updated_at();

alter table public.shorts enable row level security;

drop policy if exists "shorts read public"  on public.shorts;
drop policy if exists "shorts insert owner" on public.shorts;
drop policy if exists "shorts update owner" on public.shorts;
drop policy if exists "shorts delete owner" on public.shorts;

create policy "shorts read public"  on public.shorts for select using (true);
create policy "shorts insert owner" on public.shorts for insert
  with check (auth.uid() is not null and (creator_id is null or creator_id = auth.uid()));
create policy "shorts update owner" on public.shorts for update
  using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
create policy "shorts delete owner" on public.shorts for delete
  using (creator_id = auth.uid() or public.is_admin());

-- =============================================================
-- likes (Video-Likes)
-- =============================================================
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid references public.videos(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);

create index if not exists likes_video_id_idx on public.likes(video_id);
create index if not exists likes_user_id_idx  on public.likes(user_id);

alter table public.likes enable row level security;

drop policy if exists "likes read public"  on public.likes;
drop policy if exists "likes insert owner" on public.likes;
drop policy if exists "likes delete owner" on public.likes;

create policy "likes read public"  on public.likes for select using (true);
create policy "likes insert owner" on public.likes for insert with check (user_id = auth.uid());
create policy "likes delete owner" on public.likes for delete using (user_id = auth.uid());

-- =============================================================
-- watch_history
-- =============================================================
create table if not exists public.watch_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  video_id     uuid references public.videos(id) on delete set null,
  video_title  text,
  category     text,
  created_at   timestamptz not null default now()
);

create index if not exists watch_history_user_id_idx on public.watch_history(user_id);
create index if not exists watch_history_created_at_idx on public.watch_history(created_at desc);

alter table public.watch_history enable row level security;

drop policy if exists "watch_history read owner"   on public.watch_history;
drop policy if exists "watch_history insert owner" on public.watch_history;
drop policy if exists "watch_history delete owner" on public.watch_history;

create policy "watch_history read owner"   on public.watch_history for select using (user_id = auth.uid() or public.is_admin());
create policy "watch_history insert owner" on public.watch_history for insert with check (user_id = auth.uid());
create policy "watch_history delete owner" on public.watch_history for delete using (user_id = auth.uid() or public.is_admin());

-- =============================================================
-- follows
-- =============================================================
create table if not exists public.follows (
  id                 uuid primary key default gen_random_uuid(),
  follower_username  text not null,
  following_username text not null,
  created_at         timestamptz not null default now(),
  unique (follower_username, following_username)
);

create index if not exists follows_follower_idx  on public.follows(follower_username);
create index if not exists follows_following_idx on public.follows(following_username);

alter table public.follows enable row level security;

drop policy if exists "follows read public"   on public.follows;
drop policy if exists "follows insert self"   on public.follows;
drop policy if exists "follows delete self"   on public.follows;

create policy "follows read public" on public.follows for select using (true);
create policy "follows insert self" on public.follows for insert
  with check (exists (select 1 from public.app_users u where u.id = auth.uid() and u.username = follower_username));
create policy "follows delete self" on public.follows for delete
  using (exists (select 1 from public.app_users u where u.id = auth.uid() and u.username = follower_username) or public.is_admin());

-- =============================================================
-- comments
-- =============================================================
create table if not exists public.comments (
  id               uuid primary key default gen_random_uuid(),
  video_id         uuid references public.videos(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete cascade,
  username         text,
  user_avatar      text,
  content          text not null,
  parent_id        uuid references public.comments(id) on delete cascade,
  likes_count      integer not null default 0,
  timestamp_seconds integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists comments_video_id_idx  on public.comments(video_id);
create index if not exists comments_parent_id_idx on public.comments(parent_id);

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

drop policy if exists "comments read public"  on public.comments;
drop policy if exists "comments insert owner" on public.comments;
drop policy if exists "comments update owner" on public.comments;
drop policy if exists "comments delete owner" on public.comments;

create policy "comments read public"  on public.comments for select using (true);
create policy "comments insert owner" on public.comments for insert with check (user_id = auth.uid());
create policy "comments update owner" on public.comments for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "comments delete owner" on public.comments for delete using (user_id = auth.uid() or public.is_admin());

-- =============================================================
-- video_moments (Interactive Moments)
-- =============================================================
create table if not exists public.video_moments (
  id               uuid primary key default gen_random_uuid(),
  video_id         uuid references public.videos(id) on delete cascade,
  creator_username text,
  timestamp_seconds integer not null,
  moment_type      text,
  question         text,
  options          jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists video_moments_video_id_idx on public.video_moments(video_id);

alter table public.video_moments enable row level security;

drop policy if exists "video_moments read public"     on public.video_moments;
drop policy if exists "video_moments insert creator"  on public.video_moments;
drop policy if exists "video_moments update creator"  on public.video_moments;
drop policy if exists "video_moments delete creator"  on public.video_moments;

create policy "video_moments read public" on public.video_moments for select using (true);
create policy "video_moments insert creator" on public.video_moments for insert
  with check (exists (select 1 from public.app_users u where u.id = auth.uid() and u.username = creator_username) or public.is_admin());
create policy "video_moments update creator" on public.video_moments for update
  using (exists (select 1 from public.app_users u where u.id = auth.uid() and u.username = creator_username) or public.is_admin());
create policy "video_moments delete creator" on public.video_moments for delete
  using (exists (select 1 from public.app_users u where u.id = auth.uid() and u.username = creator_username) or public.is_admin());

-- =============================================================
-- video_moment_responses
-- =============================================================
create table if not exists public.video_moment_responses (
  id         uuid primary key default gen_random_uuid(),
  moment_id  uuid references public.video_moments(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade,
  answer     text,
  created_at timestamptz not null default now()
);

create index if not exists vmr_moment_id_idx on public.video_moment_responses(moment_id);

alter table public.video_moment_responses enable row level security;

drop policy if exists "vmr read public" on public.video_moment_responses;
drop policy if exists "vmr insert self" on public.video_moment_responses;

create policy "vmr read public" on public.video_moment_responses for select using (true);
create policy "vmr insert self" on public.video_moment_responses for insert with check (user_id = auth.uid());
