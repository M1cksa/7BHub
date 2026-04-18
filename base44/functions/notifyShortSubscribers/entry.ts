import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const creatorUsername = body.data?.creator_username;
    const contentTitle = body.data?.title || 'Neuer Short';
    
    if (!creatorUsername) {
      return Response.json({ error: 'No creator username' }, { status: 400 });
    }

    const subscribers = await base44.asServiceRole.entities.CreatorNotification.filter({
      creator_username: creatorUsername,
      notify_shorts: true
    });

    if (!subscribers || subscribers.length === 0) {
      return Response.json({ message: 'No subscribers', count: 0 });
    }

    const usernames = subscribers.map(s => s.user_username);
    const users = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
    const usersWithEmail = users.filter(u => 
      usernames.includes(u.username) && 
      u.email && 
      typeof u.email === 'string' &&
      u.email.trim().length > 0 && 
      u.email.includes('@') && 
      u.email.includes('.')
    );
    
    if (usersWithEmail.length === 0) {
      console.error('No valid emails found for short notifications');
      return Response.json({ message: 'No users with valid emails found', subscribers: subscribers.length });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    let successCount = 0;
    for (const user of usersWithEmail) {
      try {
        const emailContent = {
          raw: btoa(
            `From: 7B Hub <noreply@7bhub.com>\r\n` +
            `To: ${user.email}\r\n` +
            `Subject: 📱 Neuer Short von ${creatorUsername}!\r\n` +
            `Content-Type: text/html; charset=utf-8\r\n\r\n` +
            `<!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0b; color: #ffffff;">
              <div style="background: linear-gradient(135deg, #06b6d4, #14b8a6); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px;">📱 Neuer Short!</h1>
              </div>
              <div style="background-color: #1a1a1c; padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="font-size: 16px;">Hallo <strong>${user.username}</strong>,</p>
                <p style="font-size: 16px;"><strong>${creatorUsername}</strong> hat einen neuen Short hochgeladen:</p>
                <div style="background-color: rgba(6, 182, 212, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
                  <p style="font-size: 18px; font-weight: bold; margin: 0; color: #06b6d4;">"${contentTitle}"</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://7bhub.com" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #14b8a6); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                    Jetzt ansehen →
                  </a>
                </div>
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

        if (response.ok) successCount++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
      }
    }

    return Response.json({ success: true, notified: successCount, total: subscribers.length });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});