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

    // Triggered by Donation or SuperChat creation
    const creatorUsername = body.data?.creator_username || body.data?.creator_name;
    const donorUsername = body.data?.donor_username || body.data?.sender_name || body.data?.username;
    const amount = body.data?.amount || body.data?.tokens || 0;
    const message = body.data?.message || body.data?.content || '';
    const entityType = body.event?.entity_name || 'Donation'; // 'Donation' or 'SuperChat'
    const isSuperChat = entityType === 'SuperChat';

    if (!creatorUsername) {
      return Response.json({ message: 'No creator, skipping' });
    }

    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const creator = users.find(u => u.username === creatorUsername);

    if (!creator || !creator.email || !creator.email.includes('@')) {
      return Response.json({ message: 'Creator has no valid email, skipping' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const accentFrom = isSuperChat ? '#f59e0b' : '#10b981';
    const accentTo = isSuperChat ? '#ef4444' : '#06b6d4';
    const emoji = isSuperChat ? '⚡' : '💚';
    const typeLabel = isSuperChat ? 'Super Chat' : 'Spende';
    const unit = isSuperChat ? 'Tokens' : 'Tokens';

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${typeLabel} erhalten!</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${accentFrom} 0%,${accentTo} 100%);padding:40px 32px;text-align:center;">
            <div style="font-size:56px;margin-bottom:12px;">${emoji}</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">Du hast eine ${typeLabel} erhalten!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:17px;color:#374151;text-align:left;">Hey <strong>${creator.username}</strong> 🎉</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;text-align:left;"><strong style="color:#111827;">${donorUsername || 'Jemand'}</strong> hat dir eine ${typeLabel} geschickt:</p>
            
            <div style="background:linear-gradient(135deg,${accentFrom}15,${accentTo}15);border:2px solid ${accentFrom}40;border-radius:16px;padding:28px;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:42px;font-weight:800;color:${accentFrom};">${amount}</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#374151;">${unit}</p>
              ${donorUsername ? `<p style="margin:12px 0 0;font-size:14px;color:#6b7280;">von <strong>${donorUsername}</strong></p>` : ''}
            </div>

            ${message ? `
            <div style="background:#f8fafc;border-left:4px solid ${accentFrom};border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;text-align:left;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Nachricht</p>
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;font-style:italic;">"${message}"</p>
            </div>` : ''}

            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="https://7bhub.com/CreatorDashboard" style="display:inline-block;background:linear-gradient(135deg,${accentFrom} 0%,${accentTo} 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">Creator Dashboard</a>
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

    const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${creator.email}\r\nSubject: ${donorUsername || 'Jemand'} hat dir ${amount} Tokens geschickt!\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: encodeEmail(raw) })
    });

    if (!response.ok) {
      console.error('Gmail error:', await response.text());
      throw new Error('Gmail API error');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyDonationReceived error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});