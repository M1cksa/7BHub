import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { serviceClient } from '../_shared/auth.ts';

const FROM = Deno.env.get('RESEND_FROM_EMAIL') || '7B Hub <noreply@7bhub.com>';

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return jsonResponse({ error: 'RESEND_API_KEY fehlt' }, 500);

    const { userId } = await req.json();
    if (!userId) return jsonResponse({ error: 'userId erforderlich' }, 400);

    const supabase = serviceClient();
    const { data: user, error } = await supabase
      .from('app_users')
      .select('username, email')
      .eq('id', userId)
      .maybeSingle();
    if (error) return jsonResponse({ error: error.message }, 500);
    if (!user?.email) return jsonResponse({ error: 'Keine E-Mail-Adresse' }, 400);

    const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#06b6d4,#6d28d9);padding:48px 32px;text-align:center;">
          <div style="font-size:56px;">🎉</div>
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">Willkommen bei 7B Hub!</h1>
          <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);">Dein Account wurde erfolgreich erstellt</p>
        </td></tr>
        <tr><td style="padding:40px 32px;color:#374151;">
          <p>Hey <strong>${user.username}</strong> 👋</p>
          <p>Schön, dass du dabei bist! Dein Account wartet auf die Freischaltung durch unser Admin-Team. Du erhältst eine weitere E-Mail, sobald du freigeschaltet wurdest.</p>
          <p style="margin-top:24px;">🎁 Du erhältst <strong>100 Start-Tokens</strong>, sobald dein Account freigeschaltet wird.</p>
          <p style="margin-top:24px;"><a href="https://7bhub.com" style="display:inline-block;background:linear-gradient(135deg,#06b6d4,#14b8a6);color:#fff;padding:14px 36px;border-radius:50px;font-weight:700;text-decoration:none;">Zur Plattform</a></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:24px 32px;text-align:center;font-size:12px;color:#9ca3af;">© 2026 7B Hub</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [user.email],
        subject: `Willkommen bei 7B Hub, ${user.username}!`,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return jsonResponse({ error: 'Resend-Fehler', detail }, res.status);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
