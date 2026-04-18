# Base44 → Supabase Migration

Dieses Dokument beschreibt, wie die App von Base44 auf Supabase umgezogen wird,
was bereits fertig ist, was noch aussteht und wie du die Umgebung lokal
einrichtest.

## 1. Architekturüberblick

| Layer               | Vorher (Base44)                          | Jetzt (Supabase)                                  |
| ------------------- | ---------------------------------------- | ------------------------------------------------- |
| Datenbank           | Base44-Entities                          | Postgres-Tabellen in Supabase (RLS aktiv)         |
| Auth                | Base44-Token + Custom-Password-Compare   | `supabase.auth` (E-Mail/Passwort, bcrypt in auth) |
| Backend-Functions   | Base44-Deno-Functions (`base44/*/entry.ts`) | Supabase Edge Functions (`supabase/functions/*`) |
| Storage (Bilder)    | Base44 `UploadFile`                      | Supabase Storage Bucket `uploads`                 |
| Video-Storage       | Google Drive (User-Connector)            | Google Drive via **Service Account**              |
| E-Mail              | Gmail-Connector                          | **Resend**                                        |
| LLM/Image/Extract   | Base44-Integrations                      | Edge-Function-Stubs (Phase 2)                     |

Zentrales Stück ist der **Compat-Shim** [`src/api/base44Client.js`](src/api/base44Client.js):
Er exportiert weiter ein `base44`-Objekt mit der gewohnten Oberfläche
(`base44.entities.*`, `base44.auth.*`, `base44.functions.*`,
`base44.integrations.Core.*`), bedient sich intern aber ausschließlich aus
Supabase. Dadurch mussten die ~680 Aufrufstellen im Frontend nicht
umgeschrieben werden.

## 2. Was ist in Phase 1 fertig?

- ✅ `@supabase/supabase-js` statt `@base44/sdk` in `package.json`
- ✅ `vite.config.js` ohne Base44-Plugin, mit `@`-Alias
- ✅ `src/api/supabaseClient.js` + `.env.example`
- ✅ `src/api/base44Client.js` als vollständiger Compat-Shim
- ✅ `src/api/entities.js` & `integrations.js` auf neuen Shim umgestellt
- ✅ `src/lib/AuthContext.jsx` nutzt Supabase-Session
- ✅ `src/pages/SignIn.jsx` und `Register.jsx` auf echte Supabase-Auth umgestellt
- ✅ SQL-Migration `supabase/migrations/0001_init_schema.sql`
  - Tabellen: `app_users`, `admin_broadcasts`, `user_popup_notifications`
  - Trigger: `handle_new_auth_user` legt automatisch `app_users`-Zeile an
  - RLS-Policies für alle drei Tabellen
- ✅ Edge Functions (unter `supabase/functions/`):
  - `sendEmail` – generischer Resend-Versand
  - `sendWelcomeEmail` – für Register-Flow
  - `sendPasswordReset` – nutzt `auth.admin.generateLink` + Resend
  - `initGDriveUpload` – startet Drive-Resumable-Session
  - `finalizeGDriveUpload` – setzt Public-Read + liest Metadaten
  - `getGoogleDriveVideoUrl` – Metadaten-Abruf
  - `streamGoogleDriveVideo` – Range-fähiger Drive-Proxy für `<video>`-Elemente
- ✅ Shared Helper `_shared/cors.ts`, `_shared/auth.ts`, `_shared/googleDrive.ts`
  (Letzteres implementiert JWT-Flow für Service-Accounts)

## 3. Setup (einmalig)

### 3.1 Supabase-Projekt anlegen

1. Supabase-Projekt erstellen (Region EU-West empfohlen).
2. `SUPABASE_URL` und `SUPABASE_ANON_KEY` aus *Settings → API* übernehmen.

### 3.2 `.env` anlegen

```bash
cp .env.example .env
# dann VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY eintragen
```

### 3.3 Schema anwenden

Supabase CLI installieren (`brew install supabase/tap/supabase`), dann:

```bash
supabase login
supabase link --project-ref <deine-project-ref>
supabase db push                           # führt supabase/migrations/*.sql aus
```

### 3.4 Storage-Bucket

Im Supabase-Dashboard *Storage → New Bucket* → Name `uploads`, Public. Wird
von `integrations.Core.UploadFile` benutzt.

### 3.5 Secrets für Edge Functions

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM_EMAIL="7B Hub <noreply@7bhub.com>" \
  SITE_URL="https://7bhub.com" \
  GOOGLE_SERVICE_ACCOUNT_KEY="$(cat service-account.json | jq -c .)" \
  GOOGLE_DRIVE_FOLDER_ID="<ordner-id>"
```

> Wichtig: Den Drive-Ordner mit dem Service-Account-Mail teilen
> (`client_email` aus dem JSON) und ihm Editor-Rechte geben.

`SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` sind in
Edge Functions automatisch verfügbar – du musst sie nicht separat setzen.

### 3.6 Edge Functions deployen

```bash
supabase functions deploy sendEmail
supabase functions deploy sendWelcomeEmail
supabase functions deploy sendPasswordReset
supabase functions deploy initGDriveUpload
supabase functions deploy finalizeGDriveUpload
supabase functions deploy getGoogleDriveVideoUrl
supabase functions deploy streamGoogleDriveVideo
```

Oder alles auf einmal: `supabase functions deploy`.

### 3.7 Dev-Server starten

```bash
npm install
npm run dev
```

## 4. Phase 2 – offene Baustellen

Diese Dinge fehlen noch für echten Produktionsbetrieb. Sie sind **nicht**
notwendig, damit die App "läuft", aber sobald ein Feature (z. B. Shorts oder
Live-Streams) real benutzt wird, müssen die zugehörigen Sachen angelegt
werden.

### 4.1 Noch fehlende Tabellen

Der Compat-Shim hat das Mapping aller 29 Entities (siehe
`ENTITY_TABLE_MAP` in `src/api/base44Client.js`), aber nur drei Tabellen sind
per Migration angelegt. Noch fehlen:

- `achievements`, `ad_clicks`, `ad_impressions`, `advertisements`
- `chat_messages`, `clans`, `clan_members`, `clan_messages`
- `comments`, `community_posts`, `creator_info`, `creator_notifications`
- `creator_stories`, `creator_story_comments`, `creator_story_votes`
- `direct_messages`, `donations`, `event_announcements`, `feature_votes`
- `feedback`, `follows`, `forum_*`, `friends`, `friend_invites`
- `game_contests`, `game_scores`, `group_chat*`, `inventory_items`
- `likes`, `live_streams`, `membership_tiers`, `merch_orders`, `merchandise`
- `neon_dash_matches`, `notifications`, `page_maintenance`, `platform_locks`
- `playlists`, `playlist_items`, `pokemon_events`, `polls`, `poll_votes`
- `post_comments`, `post_likes`, `purchases`, `qa_*`, `questions`
- `reports`, `seen_updates`, `server_status`, `shop_items`
- `shorts`, `short_comments`, `short_likes`, `snaps`
- `stream_chunks`, `stream_interactions`, `stream_segments`, `super_chats`
- `terms_config`, `tickets`, `token_transactions`, `transcoding_jobs`
- `update_notifications`, `upload_history`, `user_achievements`
- `user_memberships`, `user_preferences`, `user_premium`
- `videos`, `video_boosts`, `video_calls`, `video_call_signals`
- `video_highlights`, `video_moments`, `video_moment_responses`
- `warnings`, `watch_history`, `watch_parties`, `watch_party_messages`
- `webrtc_signals`

Für jede davon wird Folgendes benötigt:

1. Tabelle mit `id uuid pk default gen_random_uuid()`, `created_at`,
   `updated_at`.
2. Je nach Use-Case RLS-Policies (Lesbar für alle Auth-User, Schreibbar nur
   für Owner oder Admin).
3. Ggf. Realtime-Publication aktivieren
   (`alter publication supabase_realtime add table public.xyz;`) — besonders
   für `chat_messages`, `stream_chunks`, `webrtc_signals`, `video_call_signals`,
   `neon_dash_matches`, die `.subscribe(...)` verwenden.

Die Feldnamen der bestehenden Base44-Records (`created_date`,
`updated_date`) übersetzt der Shim automatisch nach `created_at` /
`updated_at`. Frontend muss nicht angepasst werden.

### 4.2 Noch nicht portierte Edge Functions

Aus `base44/functions/` (Referenz-Code) müssen bei Bedarf weitere Functions
auf Supabase portiert werden. Die **Prioritätsliste** (wichtig → nice-to-have):

- **Upload/Video-Kette:**
  `uploadChunk`, `uploadVideoChunk`, `finalizeChunkedUpload`,
  `finalizeVideoUpload`, `mergeVideoChunks`, `uploadVideoSimple`,
  `uploadShort`, `uploadToGoogleDrive` (direkter One-Shot)
- **Transcoding:**
  `createTranscodingJob`, `processVideo`, `transcodeVideo`, `generateHighlights`,
  `generateVideoHighlights`, `createVideoFromScenes`, `analyzeVideoContent`
- **Live-Streaming:**
  `startLiveStream`, `endLiveStream`, `getLiveStream`, `uploadStreamChunk`,
  `uploadStreamSegment`, `getStreamChunks`, `getStreamSegments`,
  `updateViewerCount`, `uploadLiveFrame`
- **Notifications:**
  `notifyNewFollower`, `notifyNewComment`, `notifyVideoSubscribers`,
  `notifyStorySubscribers`, `notifyShortSubscribers`, `notifyLiveSubscribers`,
  `notifyCreatorSubscribers`, `notifyDonationReceived`,
  `notifyAccountApproved`, `sendLiveNotification`
- **E-Mails (Resend statt Gmail):**
  `sendNewsletter`, `sendTermsUpdateEmail`, `sendUpdateEmail`,
  `sendVideoNotifications`
- **Gamification:**
  `checkAchievements`, `grantTokensToUser`, `grantTokensToAllUsers`,
  `resetDailyGameXp`
- **Cleanup:**
  `cleanupUpload`, `cleanupSnaps`, `cleanupFinishedMatches`
- **Legacy/Konfig (entfallen oder neu bauen):**
  `hashPassword`, `verifyPassword`, `resetPassword` → **entfallen**
  (erledigt Supabase-Auth).
  `getCloudinaryConfig`, `uploadToGumlet` → nur wenn du Cloudinary/Gumlet
  weiter nutzt.

Für jede Funktion:

1. `supabase/functions/<name>/index.ts` anlegen
2. Den alten Code aus `base44/functions/<name>/entry.ts` lesen
3. `base44.auth.me()` → `requireUser(req)` (Shared-Helper)
4. `base44.asServiceRole.entities.X.*` → `serviceClient().from('x').*`
5. `base44.asServiceRole.connectors.getConnection('googledrive')` → `getAccessToken()` (Shared-Helper)
6. Gmail → Resend (siehe `sendWelcomeEmail`-Vorlage)
7. `supabase functions deploy <name>`

### 4.3 Restliche Seiten, die `localStorage.app_user` lesen

Beim Login speichern wir weiterhin `localStorage.app_user`. Das ist eine
Kompatibilitätsmaßnahme, damit alter Code funktioniert. Ideal wäre, die
Komponenten schrittweise auf `useAuth()` / `base44.auth.me()` umzustellen.

### 4.4 Realtime-Subscriptions

Der Shim implementiert `entity.subscribe(filter, callback)` via Supabase
Realtime. Die Tabellen müssen dafür in die Publication `supabase_realtime`
aufgenommen werden (siehe 4.1). Filter werden aktuell **nicht** serverseitig
angewandt — der Callback feuert für alle Row-Changes; das Frontend kann
selbst filtern oder wir erweitern den Shim später.

### 4.5 LLM / SMS / ImageGen

`base44.integrations.Core.InvokeLLM`, `GenerateImage`,
`ExtractDataFromUploadedFile` und `SendSMS` rufen derzeit Edge Functions auf,
die **noch nicht existieren** (`invokeLLM`, `generateImage`,
`extractDataFromUploadedFile`). Sobald du die entsprechenden Provider
(Anthropic, OpenAI, Replicate, Twilio etc.) angebunden hast, lege die
Functions analog zu `sendEmail` an.

## 5. Debugging-Tipps

- **Fehlende Tabelle** → der Shim loggt `[base44 shim] Tabelle für "X" fehlt`
  und gibt ein leeres Array/`null` zurück, statt zu crashen.
- **RLS blockiert** → Im Supabase-Studio unter *Authentication → Policies*
  checken. Temporär `auth.role() = 'authenticated'` als Catch-All setzen, um
  das Problem einzugrenzen.
- **Drive-Upload scheitert mit 403** → Service-Account-Mail hat keinen Zugriff
  auf `GOOGLE_DRIVE_FOLDER_ID`. Ordner im Google-Drive-UI teilen.
- **`Invalid JWT`** in Edge Functions → Authorization-Header nicht
  durchgereicht (Shim tut das automatisch, aber manuelle `fetch`-Aufrufe
  müssen `Bearer ${session.access_token}` setzen).

## 6. Relevante Dateien im Überblick

```
.env.example
vite.config.js
src/api/
  ├─ supabaseClient.js          (Supabase-Client, Functions-URL)
  ├─ base44Client.js            (Compat-Shim – HIER läuft der Übersetzer)
  ├─ entities.js                (Re-Export von Query + User)
  └─ integrations.js            (Re-Export von Core)
src/lib/AuthContext.jsx
src/pages/SignIn.jsx / Register.jsx
supabase/
  ├─ migrations/0001_init_schema.sql
  └─ functions/
      ├─ _shared/{cors,auth,googleDrive}.ts
      ├─ sendEmail/
      ├─ sendWelcomeEmail/
      ├─ sendPasswordReset/
      ├─ initGDriveUpload/
      ├─ finalizeGDriveUpload/
      ├─ getGoogleDriveVideoUrl/
      └─ streamGoogleDriveVideo/
```
