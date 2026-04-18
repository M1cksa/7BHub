/**
 * base44Client.js — Supabase-Compat-Shim.
 *
 * Dieses Modul exportiert ein `base44`-Objekt, dessen Oberfläche mit dem
 * ursprünglichen @base44/sdk identisch ist (entities / auth / functions /
 * integrations / asServiceRole), intern aber ausschließlich über Supabase
 * läuft. Dadurch bleiben die ~680 Aufrufstellen im Frontend unverändert.
 *
 * Implementiert:
 *   base44.entities.<Name>.list(orderBy?, limit?)
 *   base44.entities.<Name>.filter(filterObj, limit?, orderBy?)
 *   base44.entities.<Name>.get(id)
 *   base44.entities.<Name>.create(data)
 *   base44.entities.<Name>.update(id, data)
 *   base44.entities.<Name>.delete(id)
 *   base44.entities.<Name>.subscribe(filter, callback) -> unsubscribe fn
 *   base44.entities.Query (Passthrough)
 *
 *   base44.auth.me()
 *   base44.auth.isAuthenticated()
 *   base44.auth.updateMe(patch)
 *   base44.auth.logout(redirectUrl?)
 *   base44.auth.redirectToLogin(returnUrl?)
 *
 *   base44.functions.invoke(name, payload)
 *   base44.functions.<Name>(payload)   (Proxy für Direktaufrufe)
 *
 *   base44.integrations.Core.SendEmail(...)
 *   base44.integrations.Core.UploadFile(...)
 *   base44.integrations.Core.InvokeLLM(...)
 *   base44.integrations.Core.GenerateImage(...)
 *   base44.integrations.Core.ExtractDataFromUploadedFile(...)
 *   base44.integrations.Core.SendSMS(...)     (Stub – Phase 2)
 *
 *   base44.asServiceRole — Proxy der (frontend-seitig) dieselbe Oberfläche
 *   anbietet; echte Service-Role-Operationen laufen ausschließlich in
 *   Supabase-Edge-Functions. Frontend-Aufrufe landen hier auf normalen
 *   Supabase-Clients und respektieren RLS.
 */

import { supabase, functionsBaseUrl } from './supabaseClient';

// =============================================================
// Mapping: Base44-Entity-Name (PascalCase) -> Supabase-Tabelle (snake_case)
// =============================================================
// Pluralisiert und snake_case. Tabellen, die es in Phase 1 noch nicht gibt,
// werden trotzdem hier gelistet, damit der Shim keine 404s produziert, wenn
// sie später angelegt werden. Fehlende Tabellen geben in .list/.filter
// ein leeres Array zurück (siehe handleTableError).
const ENTITY_TABLE_MAP = {
  AppUser: 'app_users',
  AdminBroadcast: 'admin_broadcasts',
  UserPopupNotification: 'user_popup_notifications',
  // --- Phase 2: werden angelegt, sobald die entsprechenden Migrationen laufen
  Achievement: 'achievements',
  AdClick: 'ad_clicks',
  AdImpression: 'ad_impressions',
  Advertisement: 'advertisements',
  ChatMessage: 'chat_messages',
  Clan: 'clans',
  ClanMember: 'clan_members',
  ClanMessage: 'clan_messages',
  Comment: 'comments',
  CommunityPost: 'community_posts',
  CreatorInfo: 'creator_info',
  CreatorNotification: 'creator_notifications',
  CreatorStory: 'creator_stories',
  CreatorStoryComment: 'creator_story_comments',
  CreatorStoryVote: 'creator_story_votes',
  DirectMessage: 'direct_messages',
  Donation: 'donations',
  EventAnnouncement: 'event_announcements',
  FeatureVote: 'feature_votes',
  Feedback: 'feedback',
  Follow: 'follows',
  ForumCategory: 'forum_categories',
  ForumPost: 'forum_posts',
  ForumThread: 'forum_threads',
  Friend: 'friends',
  FriendInvite: 'friend_invites',
  GameContest: 'game_contests',
  GameScore: 'game_scores',
  GroupChat: 'group_chats',
  GroupChatMember: 'group_chat_members',
  GroupChatMessage: 'group_chat_messages',
  InventoryItem: 'inventory_items',
  Like: 'likes',
  MembershipTier: 'membership_tiers',
  MerchOrder: 'merch_orders',
  Merchandise: 'merchandise',
  NeonDashMatch: 'neon_dash_matches',
  Notification: 'notifications',
  PageMaintenance: 'page_maintenance',
  PlatformLock: 'platform_locks',
  Playlist: 'playlists',
  PlaylistItem: 'playlist_items',
  PokemonEvent: 'pokemon_events',
  Poll: 'polls',
  PollVote: 'poll_votes',
  PostComment: 'post_comments',
  PostLike: 'post_likes',
  Purchase: 'purchases',
  QAQuestion: 'qa_questions',
  QAUpvote: 'qa_upvotes',
  Question: 'questions',
  Report: 'reports',
  SeenUpdate: 'seen_updates',
  ServerStatus: 'server_status',
  ShopItem: 'shop_items',
  Short: 'shorts',
  ShortComment: 'short_comments',
  ShortLike: 'short_likes',
  Snap: 'snaps',
  StreamChunk: 'stream_chunks',
  StreamInteraction: 'stream_interactions',
  StreamSegment: 'stream_segments',
  TermsConfig: 'terms_config',
  Ticket: 'tickets',
  TokenTransaction: 'token_transactions',
  TranscodingJob: 'transcoding_jobs',
  UpdateNotification: 'update_notifications',
  UploadHistory: 'upload_history',
  UserAchievement: 'user_achievements',
  UserMembership: 'user_memberships',
  UserPreference: 'user_preferences',
  UserPremium: 'user_premium',
  Video: 'videos',
  VideoBoost: 'video_boosts',
  VideoCall: 'video_calls',
  VideoCallSignal: 'video_call_signals',
  VideoHighlight: 'video_highlights',
  VideoMoment: 'video_moments',
  VideoMomentResponse: 'video_moment_responses',
  Warning: 'warnings',
  WatchHistory: 'watch_history',
  WatchParty: 'watch_parties',
  WatchPartyMessage: 'watch_party_messages',
  WebRTCSignal: 'webrtc_signals',
};

// Base44 verwendete `created_date`/`updated_date`; Supabase-Schema nutzt
// `created_at`/`updated_at`. Der Shim übersetzt in beide Richtungen.
const FIELD_ALIAS_READ = { created_at: 'created_date', updated_at: 'updated_date' };
const FIELD_ALIAS_WRITE = { created_date: 'created_at', updated_date: 'updated_at' };

function tableFor(entityName) {
  const t = ENTITY_TABLE_MAP[entityName];
  if (!t) {
    console.warn(`[base44 shim] Unbekannte Entity "${entityName}" — kein Table-Mapping.`);
  }
  return t;
}

function translateOrderBy(orderBy) {
  // Base44: "-created_date" = DESC, "created_date" = ASC
  if (!orderBy) return null;
  const desc = orderBy.startsWith('-');
  const raw = desc ? orderBy.slice(1) : orderBy;
  const column = FIELD_ALIAS_WRITE[raw] || raw;
  return { column, ascending: !desc };
}

function translateIncomingRecord(rec) {
  if (!rec || typeof rec !== 'object') return rec;
  const out = { ...rec };
  for (const [from, to] of Object.entries(FIELD_ALIAS_WRITE)) {
    if (from in out) {
      out[to] = out[from];
      delete out[from];
    }
  }
  return out;
}

function translateOutgoingRecord(rec) {
  if (!rec || typeof rec !== 'object') return rec;
  const out = { ...rec };
  for (const [from, to] of Object.entries(FIELD_ALIAS_READ)) {
    if (from in out && !(to in out)) {
      out[to] = out[from];
    }
  }
  return out;
}

function translateOutgoingList(rows) {
  return Array.isArray(rows) ? rows.map(translateOutgoingRecord) : rows;
}

function handleTableError(err, entityName, op) {
  const msg = String(err?.message || err?.details || '');
  const code = String(err?.code || '');
  const isMissing =
    code === '42P01' ||
    code === 'PGRST204' ||
    msg.includes('does not exist') ||
    msg.includes('relation') ||
    msg.includes('undefined');
  if (isMissing) {
    // Tabelle fehlt noch — kein Alarm, leere Antwort reicht.
    return null;
  }
  // Echte Fehler nur als warn ausgeben (kein throw bei read-ops)
  console.warn(`[base44 shim] ${entityName}.${op}:`, err?.message || err);
  return null;
}

// =============================================================
// Entity-Fabrik
// =============================================================
function makeEntity(entityName) {
  const table = tableFor(entityName);

  const applyFilter = (query, filterObj) => {
    for (const [key, val] of Object.entries(filterObj || {})) {
      const col = FIELD_ALIAS_WRITE[key] || key;
      if (Array.isArray(val)) {
        query = query.in(col, val);
      } else if (val === null) {
        query = query.is(col, null);
      } else {
        query = query.eq(col, val);
      }
    }
    return query;
  };

  return {
    async list(orderBy = '-created_date', limit = 100) {
      if (!table) return [];
      let q = supabase.from(table).select('*');
      const ord = translateOrderBy(orderBy);
      if (ord) q = q.order(ord.column, { ascending: ord.ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) return handleTableError(error, entityName, 'list') || [];
      return translateOutgoingList(data);
    },

    async filter(filterObj = {}, limit, orderBy) {
      if (!table) return [];
      let q = supabase.from(table).select('*');
      q = applyFilter(q, filterObj);
      const ord = translateOrderBy(orderBy);
      if (ord) q = q.order(ord.column, { ascending: ord.ascending });
      if (typeof limit === 'number' && limit > 0) q = q.limit(limit);
      const { data, error } = await q;
      if (error) return handleTableError(error, entityName, 'filter') || [];
      return translateOutgoingList(data);
    },

    async get(id) {
      if (!table) return null;
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (error) return handleTableError(error, entityName, 'get') ?? null;
      return data ? translateOutgoingRecord(data) : null;
    },

    async create(payload) {
      if (!table) throw new Error(`Entity ${entityName} hat noch keine Tabelle.`);
      const { data, error } = await supabase
        .from(table)
        .insert(translateIncomingRecord(payload))
        .select()
        .single();
      if (error) throw error;
      return translateOutgoingRecord(data);
    },

    async update(id, patch) {
      if (!table) throw new Error(`Entity ${entityName} hat noch keine Tabelle.`);
      const { data, error } = await supabase
        .from(table)
        .update(translateIncomingRecord(patch))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return translateOutgoingRecord(data);
    },

    async delete(id) {
      if (!table) throw new Error(`Entity ${entityName} hat noch keine Tabelle.`);
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },

    subscribe(filter, callback) {
      if (!table) return () => {};
      const channel = supabase.channel(`${table}:${Math.random().toString(36).slice(2, 8)}`);
      let sub = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          try {
            callback(translateOutgoingRecord(payload.new ?? payload.old));
          } catch (err) {
            console.error('[base44 shim] subscribe callback error:', err);
          }
        }
      );
      sub.subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

// Faule Proxy-Konstruktion: base44.entities.Foo ruft erst beim Zugriff
// makeEntity(Foo) auf. Dadurch bleibt der Shim klein, auch wenn eine Entity
// in Phase 1 noch keine Tabelle hat.
const entitiesProxy = new Proxy(
  {},
  {
    get(target, prop) {
      if (prop === 'Query') {
        // Base44-Query-Builder war passthrough; hier nicht implementiert.
        return null;
      }
      if (typeof prop !== 'string') return undefined;
      if (!target[prop]) target[prop] = makeEntity(prop);
      return target[prop];
    },
  }
);

// =============================================================
// Auth
// =============================================================
async function fetchAppUserProfile(userId) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') {
    console.error('[base44 shim] fetchAppUserProfile:', error);
  }
  return data ? translateOutgoingRecord(data) : null;
}

const authApi = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const profile = await fetchAppUserProfile(user.id);
    // Base44's me() lieferte die Profile-Felder direkt flach zurück.
    return profile ?? { id: user.id, email: user.email };
  },

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data?.session;
  },

  async updateMe(patch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nicht authentifiziert');
    const { data, error } = await supabase
      .from('app_users')
      .update(translateIncomingRecord(patch))
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return translateOutgoingRecord(data);
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined' && redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(returnUrl) {
    if (typeof window === 'undefined') return;
    const target = '/SignIn';
    const params = returnUrl ? `?return_to=${encodeURIComponent(returnUrl)}` : '';
    window.location.href = `${target}${params}`;
  },
};

// =============================================================
// Functions (Supabase Edge Functions)
// =============================================================
async function invokeFunction(name, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  // supabase.functions.invoke() liefert automatisch Auth-Header — wir
  // nutzen sie hier, um denselben Rückgabestil wie früher (data-Rohobjekt) zu
  // bekommen.
  const { data, error } = await supabase.functions.invoke(name, {
    body: payload,
    headers,
  });

  if (error) {
    // Base44-Rückgabe enthielt oft `.data` mit Fehlerdetails — hier gleichartig.
    const detailed = new Error(error.message || `Function ${name} failed`);
    detailed.data = data;
    throw detailed;
  }
  return { data, status: 200 };
}

const functionsApi = new Proxy(
  {
    invoke: (name, payload) => invokeFunction(name, payload),
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop !== 'string') return undefined;
      // Direkter Proxy: base44.functions.sendWelcomeEmail(payload)
      return (payload) => invokeFunction(prop, payload);
    },
  }
);

// =============================================================
// Integrations.Core
// =============================================================
const integrationsCore = {
  /**
   * SendEmail({ to, subject, html, text, from? })
   * Wird an die Edge-Function `sendEmail` (Resend) delegiert.
   */
  async SendEmail(args) {
    return invokeFunction('sendEmail', args);
  },

  /**
   * UploadFile({ file, folder? })
   * Lädt in den Supabase-Storage-Bucket 'uploads'. Für Video-/Drive-Uploads
   * gibt es weiterhin die dedizierten Edge-Functions (initGDriveUpload etc.).
   */
  async UploadFile({ file, folder = 'misc' }) {
    if (!file) throw new Error('UploadFile: `file` fehlt');
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(data.path);
    return { file_url: publicUrl.publicUrl, path: data.path };
  },

  async InvokeLLM(payload) {
    return invokeFunction('invokeLLM', payload);
  },

  async GenerateImage(payload) {
    return invokeFunction('generateImage', payload);
  },

  async ExtractDataFromUploadedFile(payload) {
    return invokeFunction('extractDataFromUploadedFile', payload);
  },

  async SendSMS(payload) {
    // Phase 2 – aktuell kein Provider konfiguriert
    console.warn('[base44 shim] SendSMS ist in Phase 1 nicht angebunden.');
    return { data: null };
  },
};

// =============================================================
// asServiceRole (Frontend-Stub)
// =============================================================
// Der Frontend-Code ruft `asServiceRole` an einigen Stellen versehentlich auf.
// Echte Service-Role-Operationen laufen ausschließlich in Edge-Functions mit
// SUPABASE_SERVICE_ROLE_KEY. Wir stellen die gleiche Oberfläche bereit, sie
// benutzt aber denselben (anonymen) Client + RLS.
const asServiceRole = {
  entities: entitiesProxy,
  connectors: {
    async getConnection(/* name */) {
      // Connector-Konzept gibt es in Supabase nicht mehr. Edge-Functions
      // greifen direkt via ENV-Secrets auf Google Drive / Resend zu.
      return { accessToken: null };
    },
  },
};

// =============================================================
// Exports
// =============================================================
export const base44 = {
  entities: entitiesProxy,
  auth: authApi,
  functions: functionsApi,
  integrations: { Core: integrationsCore },
  asServiceRole,
  // Analytics-Stub, um alten Code nicht brechen zu lassen
  analytics: { track: () => Promise.resolve() },
};

export { supabase, functionsBaseUrl };
