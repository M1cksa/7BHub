import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Support both direct calls and automation calls
    let payload;
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }
    
    // For automation calls, data comes from the payload directly
    const creator_username = payload.creator_username || payload.data?.creator_name || payload.data?.creator_username;
    const content_type = payload.content_type;
    const content_title = payload.content_title || payload.data?.title || 'Neuer Content';
    const content_id = payload.content_id || payload.data?.id;

    if (!creator_username || !content_type || !content_title) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch all subscribers with bell enabled for this creator
    const notificationField = {
      'video': 'notify_videos',
      'short': 'notify_shorts',
      'story': 'notify_stories',
      'live': 'notify_live'
    }[content_type];

    if (!notificationField) {
      return Response.json({ error: 'Invalid content_type' }, { status: 400 });
    }

    const subscribers = await base44.asServiceRole.entities.CreatorNotification.filter({
      creator_username,
      [notificationField]: true
    });

    if (!subscribers || subscribers.length === 0) {
      return Response.json({ message: 'No subscribers to notify', count: 0 });
    }

    // Get user emails
    const usernames = subscribers.map(s => s.user_username);
    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const usersWithEmail = users.filter(u => 
      usernames.includes(u.username) && u.email && u.email.trim()
    );

    // Gmail access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    const contentTypes = {
      'video': '🎥 Neues Video',
      'short': '📱 Neuer Short',
      'story': '✨ Neue Story',
      'live': '🔴 Live Stream'
    };

    const emailPromises = usersWithEmail.map(async (user) => {
      const emailContent = {
        raw: btoa(
          `From: 7B Hub <noreply@7bhub.com>\r\n` +
          `To: ${user.email}\r\n` +
          `Subject: ${contentTypes[content_type]} von ${creator_username}!\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n\r\n` +
          `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0b; color: #ffffff;">
            <div style="background: linear-gradient(135deg, #06b6d4, #14b8a6); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px;">🔔 ${contentTypes[content_type]}!</h1>
            </div>
            
            <div style="background-color: #1a1a1c; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Hallo <strong>${user.username}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                <strong>${creator_username}</strong> hat gerade neuen Content hochgeladen:
              </p>
              
              <div style="background-color: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                <p style="font-size: 18px; font-weight: bold; margin: 0; color: #06b6d4;">
                  "${content_title}"
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://7bhub.com" 
                   style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #14b8a6); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  Jetzt ansehen →
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0;">
              
              <p style="font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6;">
                Du erhältst diese E-Mail, weil du die Glocke für ${creator_username} aktiviert hast.<br>
                Du kannst deine Benachrichtigungseinstellungen jederzeit in deinem Profil ändern.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 20px;">
              <p style="font-size: 12px; color: rgba(255,255,255,0.4);">
                © 2026 7B Hub. Alle Rechte vorbehalten.
              </p>
            </div>
          </body>
          </html>`
        ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      };

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) {
        console.error(`Failed to send to ${user.email}:`, await response.text());
        return false;
      }
      return true;
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;

    return Response.json({ 
      success: true, 
      notified: successCount,
      total: subscribers.length 
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});