import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    const body = await req.json();

    const creatorUsername = body.data?.creator_name;
    const contentTitle = body.data?.title || 'Neues Video';
    const videoId = body.data?.id || body.event?.entity_id;
    const thumbnail = body.data?.thumbnail_url || '';
    const description = body.data?.description || '';
    const category = body.data?.category || '';

    if (!creatorUsername) {
      return Response.json({ error: 'No creator username' }, { status: 400 });
    }

    // Send to ALL approved users with a valid email
    const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 2000);
    const recipients = allUsers.filter(u =>
      u.approved &&
      u.email &&
      typeof u.email === 'string' &&
      u.email.includes('@') &&
      u.email.includes('.')
    );

    if (recipients.length === 0) {
      return Response.json({ message: 'No recipients found', count: 0 });
    }

    console.log(`Sending video notification to ${recipients.length} users for video: "${contentTitle}" by ${creatorUsername}`);

    const conn = await base44.asServiceRole.connectors.getConnection('gmail');
    const accessToken = conn.accessToken;
    const ctaUrl = `https://7bhub.com/Watch?id=${videoId}`;

    let successCount = 0;
    let failCount = 0;

    for (const user of recipients) {
      try {
        const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Neues Video von ${creatorUsername}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,#06b6d4 0%,#14b8a6 100%);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:10px;">&#127909;</div>
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Neues Video!</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${creatorUsername} hat etwas Neues hochgeladen</p>
    </td>
  </tr>
  <tr>
    <td style="padding:40px 32px;">
      <p style="margin:0 0 20px;font-size:16px;color:#374151;">Hey <strong>${user.username}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7;"><strong style="color:#111827;">${creatorUsername}</strong> hat gerade ein neues Video veroeffentlicht:</p>
      ${thumbnail ? `<div style="margin:0 0 20px;border-radius:12px;overflow:hidden;"><img src="${thumbnail}" alt="Thumbnail" style="width:100%;display:block;" /></div>` : ''}
      <div style="background:#f0fdfa;border-left:4px solid #06b6d4;border-radius:0 8px 8px 0;padding:20px 24px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-size:19px;font-weight:700;color:#111827;">${contentTitle}</p>
        ${category ? `<span style="display:inline-block;background:#e0f2fe;color:#0284c7;font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;">&#128193; ${category}</span>` : ''}
        ${description ? `<p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">${description.substring(0, 180)}${description.length > 180 ? '...' : ''}</p>` : ''}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center">
          <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4 0%,#14b8a6 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">Jetzt ansehen &#8594;</a>
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
          `To: ${user.email}\r\n` +
          `Subject: Neues Video von ${creatorUsername}: ${contentTitle}\r\n` +
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
          console.log(`Sent to ${user.email}`);
        } else {
          failCount++;
          const errText = await response.text();
          console.error(`Failed for ${user.email}: ${response.status} - ${errText}`);
        }

        // Rate limit: ~10 emails/sec max
        await new Promise(r => setTimeout(r, 120));

      } catch (err) {
        failCount++;
        console.error(`Error for ${user.email}:`, err.message);
      }
    }

    console.log(`Done: ${successCount} sent, ${failCount} failed`);
    return Response.json({ success: true, sent: successCount, failed: failCount, total: recipients.length });

  } catch (error) {
    console.error('notifyVideoSubscribers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});