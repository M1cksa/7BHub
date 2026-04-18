import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/auth.ts';

const SITE_URL = Deno.env.get('SITE_URL') || 'https://7bhub.com';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const { email } = await req.json();
    if (!email) return jsonResponse({ error: 'email erforderlich' }, 400);

    const supabase = serviceClient();

    // Supabase hat bereits einen Reset-Flow; er sendet aber über den eigenen
    // SMTP. Wir wollen Resend → daher nutzen wir `generateLink` und senden die
    // Mail selbst.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${SITE_URL}/ResetPassword`,
      },
    });
    if (error) return jsonResponse({ error: error.message }, 400);

    const link = data?.properties?.action_link;
    if (!link) return jsonResponse({ error: 'Kein Reset-Link erhalten' }, 500);

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'RESEND_API_KEY fehlt' }, 500);

    const html = `<!DOCTYPE html>
<html lang="de"><body style="font-family:-apple-system,sans-serif;background:#f0f2f5;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#06b6d4,#6d28d9);color:#fff;padding:32px;text-align:center;">
      <h1 style="margin:0;">🔐 Passwort zurücksetzen</h1>
    </div>
    <div style="padding:32px;color:#374151;">
      <p>Hey!</p>
      <p>Du hast ein neues Passwort für deinen 7B-Hub-Account angefordert. Klick auf den Button, um es zurückzusetzen (Link ist 1 Stunde gültig):</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#14b8a6);color:#fff;padding:14px 36px;border-radius:50px;font-weight:700;text-decoration:none;">Passwort zurücksetzen</a>
      </p>
      <p style="color:#6b7280;font-size:13px;">Falls du das nicht warst, kannst du diese Mail ignorieren.</p>
    </div>
  </div>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || '7B Hub <noreply@7bhub.com>',
        to: [email],
        subject: '🔐 Passwort zurücksetzen – 7B Hub',
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return jsonResponse({ error: 'Resend-Fehler', detail }, res.status);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('sendPasswordReset error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
