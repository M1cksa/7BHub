import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    
    const creatorUsername = body.data?.creator_username;
    const contentTitle = body.data?.title || 'Live Stream';
    const streamId = body.data?.id || body.event?.entity_id;
    const category = body.data?.category || '';
    const description = body.data?.description || '';
    
    if (!creatorUsername) {
      return Response.json({ error: 'No creator username' }, { status: 400 });
    }

    const subscribers = await base44.asServiceRole.entities.CreatorNotification.filter({
      creator_username: creatorUsername,
      notify_live: true
    });

    if (!subscribers || subscribers.length === 0) {
      return Response.json({ message: 'No subscribers', count: 0 });
    }

    const usernames = subscribers.map(s => s.user_username);
    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const usersWithEmail = users.filter(u =>
      usernames.includes(u.username) && u.email && u.email.includes('@')
    );

    if (usersWithEmail.length === 0) {
      return Response.json({ message: 'No users with valid emails', subscribers: subscribers.length });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const ctaUrl = `https://7bhub.com/Watch?id=${streamId}`;

    let successCount = 0;
    for (const user of usersWithEmail) {
      try {
        const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${creatorUsername} ist LIVE</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:#f0f2f5;font-size:1px;">${creatorUsername} ist gerade live — schaue jetzt zu!</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626 0%,#ea580c 100%);padding:40px 32px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:12px;font-weight:800;letter-spacing:2px;padding:6px 16px;border-radius:20px;margin-bottom:16px;">● LIVE JETZT</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">🔴 ${creatorUsername} ist LIVE!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Klick schnell – der Stream läuft gerade!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#374151;">Hey <strong>${user.username}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7;"><strong style="color:#111827;">${creatorUsername}</strong> ist gerade live gegangen und du verpasst es gerade!</p>
            <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:20px 24px;margin:0 0 28px;">
              <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">${contentTitle}</p>
              ${category ? `<span style="display:inline-block;background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">📂 ${category}</span>` : ''}
              ${description ? `<p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">${description.substring(0, 160)}${description.length > 160 ? '…' : ''}</p>` : ''}
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td align="center">
                <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#dc2626 0%,#ea580c 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">▶ Jetzt zuschauen</a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">Du erhältst diese E-Mail, weil du die 🔔 Glocke für <strong>${creatorUsername}</strong> aktiviert hast.<br>Einstellungen: 7bhub.com/Settings | © 2026 7B Hub</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${user.email}\r\nSubject: ${creatorUsername} ist jetzt LIVE: "${contentTitle}"\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
        
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: encodeEmail(raw) })
        });

        if (response.ok) successCount++;
        else console.error(`Failed for ${user.email}:`, await response.text());

        await new Promise(r => setTimeout(r, 80));
      } catch (err) {
        console.error(`Error for ${user.email}:`, err.message);
      }
    }

    return Response.json({ success: true, notified: successCount, total: subscribers.length });
  } catch (error) {
    console.error('notifyLiveSubscribers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});