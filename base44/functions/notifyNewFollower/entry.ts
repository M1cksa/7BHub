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

    // Triggered by Follow entity creation
    const followerUsername = body.data?.follower_username;
    const followingUsername = body.data?.following_username;

    if (!followerUsername || !followingUsername) {
      return Response.json({ error: 'Missing follower/following usernames' }, { status: 400 });
    }

    // Find the followed user
    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const followedUser = users.find(u => u.username === followingUsername);
    const followerUser = users.find(u => u.username === followerUsername);

    if (!followedUser || !followedUser.email || !followedUser.email.includes('@')) {
      return Response.json({ message: 'Followed user has no valid email, skipping' });
    }

    // Check if they have follower notifications enabled
    if (followedUser.notify_new_follower === false) {
      return Response.json({ message: 'User has disabled follower notifications' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const followerAvatar = followerUser?.avatar_url || '';

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neuer Follower!</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed 0%,#ec4899 100%);padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">👥</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Jemand folgt dir!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hey <strong>${followedUser.username}</strong>,</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">Du hast einen neuen Follower!</p>
            
            ${followerAvatar ? `<img src="${followerAvatar}" alt="${followerUsername}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;margin-bottom:12px;border:3px solid #7c3aed;" />` : `<div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#ec4899);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:28px;color:#fff;">👤</div>`}
            
            <div style="background:#faf5ff;border:2px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin:0 0 28px;display:inline-block;min-width:200px;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#6d28d9;">${followerUsername}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#8b5cf6;">folgt dir jetzt</p>
            </div>
            
            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="https://7bhub.com/CreatorProfile?username=${followerUsername}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed 0%,#ec4899 100%);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:15px;">Profil ansehen</a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">Du erhältst diese E-Mail für neue Follower. Einstellungen: 7bhub.com/Settings<br>© 2026 7B Hub</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${followedUser.email}\r\nSubject: ${followerUsername} folgt dir jetzt auf 7B Hub!\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
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
    console.error('notifyNewFollower error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});