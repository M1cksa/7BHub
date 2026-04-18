#!/usr/bin/env bash
# 7B Hub — Supabase Deployment Script
set -uo pipefail

PROJECT_REF="xywrcsxptvglbzrivqqt"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SB="npx --yes supabase"

cd "$ROOT_DIR"

echo "→ 7B Hub Deploy (Projekt: $PROJECT_REF)"
echo

# --- 1. CLI-Check -----------------------------------------------
echo "→ CLI-Version: $($SB --version)"

# --- 2. Linking + Migrationen ---
echo "→ Projekt linken…"
$SB link --project-ref "$PROJECT_REF" || true

echo "→ Migrationen pushen…"
$SB db push --linked

# --- 3. Edge-Functions deployen ---------------------------------
echo "→ Edge-Functions deployen…"
FUNCTIONS=(
  initGDriveUpload
  finalizeGDriveUpload
  getGoogleDriveVideoUrl
  streamGoogleDriveVideo
  sendEmail
  sendWelcomeEmail
  sendPasswordReset
)

for fn in "${FUNCTIONS[@]}"; do
  echo "   • $fn"
  $SB functions deploy "$fn" --project-ref "$PROJECT_REF"
done

echo
echo "✓ Deploy fertig."
echo "  Secrets setzen: npx supabase secrets set --env-file .env.functions --project-ref $PROJECT_REF"
