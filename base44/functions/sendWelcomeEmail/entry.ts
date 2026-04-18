import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function encodeEmail(rawString) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(rawString);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId } = await req.json();

    if (!userId) return Response.json({ error: 'userId erforderlich' }, { status: 400 });

    const users = await base44.asServiceRole.entities.AppUser.filter({ id: userId }, 1);
    if (!users || users.length === 0) return Response.json({ error: 'User nicht gefunden' }, { status: 404 });
    const user = users[0];

    if (!user.email) return Response.json({ error: 'Keine E-Mail-Adresse' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Willkommen bei 7B Hub!</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#06b6d4 0%,#6d28d9 100%);padding:48px 32px;text-align:center;">
            <div style="font-size:56px;margin-bottom:16px;">🎉</div>
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">Willkommen bei 7B Hub!</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Dein Account wurde erfolgreich erstellt</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 24px;font-size:17px;color:#374151;">Hey <strong>${user.username}</strong> 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.8;">Schön dass du dabei bist! Dein Account wartet auf die Freischaltung durch unser Admin-Team. Du erhältst eine weitere E-Mail, sobald du freigeschaltet wurdest.</p>
            
            <div style="background:#f8fafc;border-radius:12px;padding:28px;margin:0 0 28px;">
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#111827;">Was dich erwartet:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:22px;margin-right:12px;">📺</span>
                  <span style="font-size:14px;color:#374151;"><strong>Videos & Live-Streams</strong> — Entdecke tausende Inhalte</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:22px;margin-right:12px;">🛍️</span>
                  <span style="font-size:14px;color:#374151;"><strong>Shop & Customization</strong> — Frames, Themes, Animationen</span>
                </td></tr>
                <tr><td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                  <span style="font-size:22px;margin-right:12px;">🏆</span>
                  <span style="font-size:14px;color:#374151;"><strong>Battle Pass & Quests</strong> — Sammle XP und Belohnungen</span>
                </td></tr>
                <tr><td style="padding:10px 0;">
                  <span style="font-size:22px;margin-right:12px;">💬</span>
                  <span style="font-size:14px;color:#374151;"><strong>Community</strong> — Forum, Chats & Clans</span>
                </td></tr>
              </table>
            </div>

            <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:12px;padding:20px 24px;text-align:center;margin:0 0 28px;">
              <p style="margin:0;font-size:14px;color:#065f46;">🎁 Du erhältst <strong>100 Start-Tokens</strong> sobald dein Account freigeschaltet wird!</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="https://7bhub.com" style="display:inline-block;background:linear-gradient(135deg,#06b6d4 0%,#14b8a6 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">Zur Plattform</a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">© 2026 7B Hub. Alle Rechte vorbehalten.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${user.email}\r\nSubject: Willkommen bei 7B Hub, ${user.username}!\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encodeEmail(raw) })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gmail error:', err);
      throw new Error('Gmail API error: ' + err);
    }

    return Response.json({ success: true, message: 'Willkommens-E-Mail gesendet' });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});