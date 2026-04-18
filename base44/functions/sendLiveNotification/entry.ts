import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { streamId } = await req.json();

    if (!streamId) {
      return Response.json({ error: 'Stream ID erforderlich' }, { status: 400 });
    }

    const streams = await base44.asServiceRole.entities.LiveStream.filter({ id: streamId }, 1);
    if (!streams || streams.length === 0) {
      return Response.json({ error: 'Stream nicht gefunden' }, { status: 404 });
    }
    const stream = streams[0];

    // Get all newsletter subscribers
    const subscribers = await base44.asServiceRole.entities.AppUser.filter({ 
      newsletter_subscribed: true,
      approved: true 
    });

    if (!subscribers || subscribers.length === 0) {
      return Response.json({ message: 'Keine Newsletter-Abonnenten' }, { status: 200 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    let successCount = 0;
    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      const emailContent = `From: 7B Hub <noreply@7bhub.com>
To: ${subscriber.email}
Subject: =?utf-8?B?${btoa('🔴 LIVE: ' + stream.title)}?=
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .live-badge { display: inline-block; background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 10px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .content { padding: 40px 30px; }
    .stream-card { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #dc2626; }
    .stream-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 15px; }
    .stream-meta { color: #64748b; font-size: 14px; margin-bottom: 15px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔴 Jemand ist LIVE!</h1>
      <div class="live-badge">● LIVE JETZT</div>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #475569;">Hallo ${subscriber.username}!</p>
      <p style="font-size: 16px; color: #475569;"><strong>${stream.creator_username}</strong> ist gerade live gegangen:</p>
      
      <div class="stream-card">
        <div class="stream-title">${stream.title}</div>
        <div class="stream-meta">
          👤 ${stream.creator_username} • 📁 ${stream.category}
          ${stream.viewer_count ? `• 👥 ${stream.viewer_count} Zuschauer` : ''}
        </div>
        ${stream.description ? `<p style="color: #475569; line-height: 1.6;">${stream.description}</p>` : ''}
        <div style="text-align: center; margin-top: 20px;">
          <a href="${Deno.env.get('BASE_URL') || 'https://your-app-url.com'}/Watch?id=${stream.id}" class="btn">
            ▶️ Jetzt zusehen
          </a>
        </div>
      </div>
      
      <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
        Verpasse keine Live-Streams mehr!<br>
        Dein 7B Hub Team
      </p>
    </div>
    <div class="footer">
      <p>Du erhältst diese E-Mail, weil du unseren Newsletter abonniert hast.</p>
      <p><a href="${Deno.env.get('BASE_URL') || 'https://your-app-url.com'}/Profile">Einstellungen ändern</a></p>
    </div>
  </div>
</body>
</html>`;

      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      try {
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedEmail
          })
        });

        if (response.ok) {
          successCount++;
        }
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err);
      }
    }

    return Response.json({ 
      success: true, 
      message: `${successCount} von ${subscribers.length} E-Mails erfolgreich gesendet` 
    });

  } catch (error) {
    console.error('Send live notifications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});