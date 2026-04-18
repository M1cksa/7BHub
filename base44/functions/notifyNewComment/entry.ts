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

    // Triggered by Comment entity creation
    const videoId = body.data?.video_id;
    const commentContent = body.data?.content || '';
    const authorName = body.data?.author_name || 'Jemand';
    const isReply = !!body.data?.parent_comment_id;

    if (!videoId) {
      return Response.json({ message: 'No video_id, skipping' });
    }

    // Get video
    const videos = await base44.asServiceRole.entities.Video.filter({ id: videoId }, 1);
    if (!videos || videos.length === 0) {
      return Response.json({ message: 'Video not found' });
    }
    const video = videos[0];
    const creatorName = video.creator_name;

    // Don't notify if creator is commenting on their own video
    if (authorName === creatorName) {
      return Response.json({ message: 'Creator commenting on own video, skipping' });
    }

    // Find creator user
    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const creator = users.find(u => u.username === creatorName);

    if (!creator || !creator.email || !creator.email.includes('@')) {
      return Response.json({ message: 'Creator has no valid email, skipping' });
    }

    if (creator.notify_new_comment === false) {
      return Response.json({ message: 'Creator disabled comment notifications' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const ctaUrl = `https://7bhub.com/Watch?id=${videoId}`;
    const commentPreview = commentContent.substring(0, 200) + (commentContent.length > 200 ? '…' : '');

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neuer Kommentar</title></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">💬</div>
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">${isReply ? 'Neue Antwort' : 'Neuer Kommentar'}!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">auf dein Video</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 20px;font-size:16px;color:#374151;">Hey <strong>${creator.username}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.7;"><strong style="color:#111827;">${authorName}</strong> hat ${isReply ? 'auf einen Kommentar geantwortet' : 'deinen Video kommentiert'}:</p>
            
            <div style="background:#fffbeb;border-radius:12px;padding:16px 20px;margin:0 0 20px;border-left:4px solid #f59e0b;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#d97706;">Video:</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${video.title}</p>
            </div>

            <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
              <div style="display:flex;align-items:center;margin-bottom:12px;">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#f97316);display:inline-block;margin-right:10px;text-align:center;line-height:36px;font-size:16px;vertical-align:middle;">💬</div>
                <strong style="font-size:14px;color:#111827;vertical-align:middle;">${authorName}</strong>
              </div>
              <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;font-style:italic;">"${commentPreview}"</p>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
              <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:16px;">Kommentar ansehen →</a>
            </td></tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">Einstellungen unter 7bhub.com/Settings | © 2026 7B Hub</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const raw = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${creator.email}\r\nSubject: ${authorName} hat dein Video "${video.title}" kommentiert\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`;
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
    console.error('notifyNewComment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});