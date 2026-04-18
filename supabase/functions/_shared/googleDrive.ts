/**
 * Google-Drive-Service-Account-Helper.
 *
 * Erwartet als Secret `GOOGLE_SERVICE_ACCOUNT_KEY` das komplette JSON-Key-File
 * (von Google Cloud Console heruntergeladen) als einzeiligen String.
 *
 * Scope: https://www.googleapis.com/auth/drive
 *
 * Der Service-Account muss Zugriff auf `GOOGLE_DRIVE_FOLDER_ID` haben.
 * (Entweder den Ordner mit dem Service-Account-Mail teilen oder Domain-Wide-
 * Delegation verwenden.)
 */

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPES = 'https://www.googleapis.com/auth/drive';

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

type CachedToken = { accessToken: string; expiresAt: number };
let tokenCache: CachedToken | null = null;

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

async function signJwt(key: ServiceAccountKey): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: SCOPES,
    aud: key.token_uri ?? TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${base64UrlEncodeString(JSON.stringify(header))}.${base64UrlEncodeString(JSON.stringify(claim))}`;
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(key.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY fehlt (Supabase-Secret)');
  const key: ServiceAccountKey = JSON.parse(raw);

  const jwt = await signJwt(key);
  const res = await fetch(key.token_uri ?? TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google-Token-Fehler: ${res.status} ${text}`);
  }
  const payload = await res.json();
  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

export function driveFolderId(): string | undefined {
  return Deno.env.get('GOOGLE_DRIVE_FOLDER_ID') || undefined;
}
