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
    const body = await req.json();

    // Triggered by entity automation on AppUser update
    const userId = body.data?.id || body.event?.entity_id;
    const wasApproved = body.data?.approved;
    const wasNotApproved = body.old_data?.approved;

    // Only send if transitioning from not-approved to approved
    if (!wasApproved || wasNotApproved === true) {
      return Response.json({ message: 'Not an approval transition, skipping' });
    }

    let user = body.data;
    if (!user || !user.email) {
      // Fetch from DB if data incomplete
      const users = await base44.asServiceRole.entities.AppUser.filter({ id: userId }, 1);
      if (!users || users.length === 0) return Response.json({ error: 'User not found' }, { status: 404 });
      user = users[0];
    }

    if (!user.email || !user.email.includes('@')) {
      return Response.json({ message: 'No valid email, skipping' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Account freigeschaltet!</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#06b6d4 100%);padding:48px 32px;text-align:center;">
            <div style="font-size:60px;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">Dein Account ist freigeschaltet!</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Ab sofort hast du vollen Zugriff auf 7B Hub</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 20px;font-size:17px;color:#374151;">Hey <strong>${user.username}</strong> 🎉</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.8;">Gute Neuigkeiten! Dein Account wurde von unserem Team freigegeben. Du kannst jetzt alle Funktionen von 7B Hub nutzen.</p>
            
            <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border-radius:12px;padding:24px;margin:0 0 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:28px;font-weight:800;color:#065f46;">🎁 100 Start-Tokens</p>
              <p style="margin:0;font-size:14px;color:#047857;">wurden deinem Account gutgeschrieben!</p>
            </div>

            <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:0 0 28px;">
              <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#111827;">Jetzt kannst du:</p>
              <p style="margin:0 0 8px;font-size:14px;color:#374151;">🎬 Videos anschauen und kommentieren</p>
              <p style="margin:0 0 8px;font-size:14px;color:#374151;">📡 Live-Streams verfolgen</p>
              <p style="margin:0 0 8px;font-size:14px;color:#374151;">🛍️ Im Shop einkaufen</p>
              <p style="margin:0;font-size:14px;color:#374151;">🏆 Battle Pass & Quests abschließen</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="https://7bhub.com/Home" style="display:inline-block;background:linear-gradient(135deg,#059669 0%,#06b6d4 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">Jetzt loslegen →</a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 7B Hub. Alle Rechte vorbehalten.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${user.email}\r\nSubject: Dein Account wurde freigeschaltet, ${user.username}!\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encodeEmail(raw) })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gmail error:', errText);
      throw new Error('Gmail API error');
    }

    console.log(`Account approval email sent to ${user.email}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyAccountApproved error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});