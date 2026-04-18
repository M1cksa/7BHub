# 7B Hub – Deploy-Anleitung (Supabase)

**Projekt-Ref:** `xywrcsxptvglbzrivqqt`

## 1. CLI installieren

```bash
brew install supabase/tap/supabase
```

Alternativ (ohne Homebrew):
```bash
npm install -g supabase
```

## 2. Einloggen

```bash
supabase login
```
Öffnet den Browser und erzeugt einen Access-Token.

## 3. Edge-Function-Secrets vorbereiten

```bash
cp .env.functions.example .env.functions
# dann öffnen und ausfüllen:
#   RESEND_API_KEY
#   RESEND_FROM_EMAIL
#   GOOGLE_SERVICE_ACCOUNT_KEY   (komplettes JSON einzeilig)
#   GOOGLE_DRIVE_FOLDER_ID       (optional)
```

## 4. Alles deployen

```bash
./scripts/deploy.sh
```

Was passiert:
- Projekt wird gelinkt
- `supabase/migrations/*.sql` werden gepusht (app_users, videos, chats, clans …)
- Edge-Functions werden deployed
- Storage-Bucket `uploads` wird angelegt

## 5. Edge-Function-Secrets setzen

```bash
supabase secrets set --env-file .env.functions --project-ref xywrcsxptvglbzrivqqt
```

## 6. Auth-Einstellungen im Dashboard

Supabase → Authentication → Providers → Email:
- **Confirm email:** *AUS* (wir nutzen Username-Login ohne Bestätigung)
- **Secure password change:** nach Belieben

Supabase → Authentication → URL Configuration:
- **Site URL:** `http://localhost:5173` (später Prod-URL)

## 7. Testen

```bash
npm run dev
```

Registrierung → neuer User wird in `app_users` angelegt (Trigger).
Login → RPC `get_email_for_username` resolvt Username → E-Mail → Supabase-Auth.

---

## Rollback einer Migration

```bash
supabase db reset --project-ref xywrcsxptvglbzrivqqt   # VORSICHT: löscht alles
```

## Nur eine einzelne Function deployen

```bash
supabase functions deploy sendWelcomeEmail --project-ref xywrcsxptvglbzrivqqt
```
