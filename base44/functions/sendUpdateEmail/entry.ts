import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function toBase64Url(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { updateId } = await req.json();
    if (!updateId) {
      return Response.json({ error: 'updateId required' }, { status: 400 });
    }

    const updates = await base44.asServiceRole.entities.UpdateNotification.list();
    const update = updates.find(u => u.id === updateId);
    if (!update) {
      return Response.json({ error: 'Update not found' }, { status: 404 });
    }

    const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 2000);
    const recipients = allUsers.filter(u =>
      u.approved &&
      u.email &&
      typeof u.email === 'string' &&
      u.email.includes('@') &&
      u.email.includes('.')
    );

    console.log(`Sending update notification "${update.title}" to ${recipients.length} users...`);

    const conn = await base44.asServiceRole.connectors.getConnection('gmail');
    const accessToken = conn.accessToken;

    const priorityColor = update.priority === 'high' ? '#ef4444' : update.priority === 'medium' ? '#f59e0b' : '#06b6d4';
    const priorityLabel = update.priority === 'high' ? '🔴 Wichtig' : update.priority === 'medium' ? '🟡 Update' : '🔵 Info';
    const version = update.version ? `v${update.version}` : '';

    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${update.title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,#7c3aed 0%,#d946ef 100%);padding:40px 32px;text-align:center;">
      <div style="font-size:52px;margin-bottom:12px;">&#128640;</div>
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Neues Update</h1>
      ${version ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">${version}</p>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding:40px 32px;">
      <p style="margin:0 0 20px;font-size:16px;color:#374151;">Hey <strong>${recipient.username}</strong>,</p>
      <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">wir haben die Plattform aktualisiert. Hier sind die Neuigkeiten:</p>

      <div style="background:#faf5ff;border-left:4px solid #7c3aed;border-radius:0 12px 12px 0;padding:24px 28px;margin:0 0 28px;">
        <div style="display:inline-block;background:${priorityColor}18;color:${priorityColor};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;margin-bottom:12px;">${priorityLabel}</div>
        <h2 style="margin:0 0 14px;font-size:20px;font-weight:800;color:#111827;line-height:1.3;">${update.title}</h2>
        <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.8;">${update.description.replace(/\n/g, '<br>')}</p>
      </div>

      ${update.features && update.features.length > 0 ? `
      <div style="margin:0 0 28px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.5px;">Was ist neu:</p>
        <ul style="margin:0;padding:0;list-style:none;">
          ${update.features.map(f => `<li style="padding:8px 0 8px 20px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;position:relative;">&#10003; ${f}</li>`).join('')}
        </ul>
      </div>` : ''}

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center">
          <a href="https://7bhub.com" style="display:inline-block;background:linear-gradient(135deg,#7c3aed 0%,#d946ef 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-weight:700;font-size:16px;letter-spacing:0.3px;">7B Hub besuchen &#8594;</a>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">Du erhältst diese E-Mail als Mitglied von 7B Hub.<br>Einstellungen: 7bhub.com/Settings &nbsp;|&nbsp; &#169; 2026 7B Hub</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

        const rawEmail =
          `From: 7B Hub <noreply@7bhub.com>\r\n` +
          `To: ${recipient.email}\r\n` +
          `Subject: ${priorityLabel} - ${update.title}${version ? ` (${version})` : ''}\r\n` +
          `MIME-Version: 1.0\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n` +
          `\r\n` +
          html;

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: toBase64Url(rawEmail) })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          const err = await response.text();
          console.error(`Failed for ${recipient.email}: ${response.status} - ${err}`);
        }

        await new Promise(r => setTimeout(r, 120));

      } catch (err) {
        failCount++;
        console.error(`Error for ${recipient.email}:`, err.message);
      }
    }

    console.log(`Done: ${successCount} sent, ${failCount} failed`);
    return Response.json({ success: true, sent: successCount, failed: failCount, total: recipients.length });

  } catch (error) {
    console.error('sendUpdateEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});