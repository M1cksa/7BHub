import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const videoId = body.videoId || body.event?.entity_id;

    if (!videoId) {
      return Response.json({ error: 'videoId required' }, { status: 400 });
    }

    // Get video details
    const videos = await base44.asServiceRole.entities.Video.list();
    const video = videos.find(v => v.id === videoId);

    if (!video) {
      return Response.json({ error: 'Video not found' }, { status: 404 });
    }

    // Get all newsletter subscribers
    const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 500);
    const subscribers = allUsers.filter(u => u.newsletter_subscribed && u.email && u.approved);

    console.log(`Sending video notification to ${subscribers.length} subscribers...`);

    // Get Gmail access token
    const gmailToken = await base44.asServiceRole.connectors.getAccessToken('gmail');

    let successCount = 0;
    let failCount = 0;

    for (const recipient of subscribers) {
      try {
        // Create in-app notification
        try {
          await base44.functions.invoke('createNotification', {
            userId: recipient.id,
            type: 'new_video',
            title: `Neues Video: ${video.title}`,
            message: `${video.creator_name} hat ein neues Video hochgeladen`,
            link: `/watch?id=${videoId}`,
            metadata: { videoId, creatorName: video.creator_name }
          });
        } catch (notifErr) {
          console.warn('In-app notification failed:', notifErr.message);
        }
        const emailContent = [
          `To: ${recipient.email}`,
          `Subject: 🎬 Neues Video auf 7B Hub: ${video.title}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          '',
          `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎬 Neues Video!</h1>
                </div>
                
                ${video.thumbnail_url ? `
                <div style="width: 100%; height: 300px; overflow: hidden;">
                  <img src="${video.thumbnail_url}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                ` : ''}
                
                <div style="padding: 40px 30px;">
                  <p style="font-size: 18px; margin: 0 0 10px 0; color: #1f2937;">Hallo ${recipient.username},</p>
                  <p style="font-size: 16px; color: #4b5563; margin: 0 0 25px 0;">
                    ${video.creator_name} hat ein neues Video hochgeladen!
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #06b6d4; margin-bottom: 25px;">
                    <h2 style="color: #0891b2; margin: 0 0 15px 0; font-size: 22px; font-weight: bold;">${video.title}</h2>
                    ${video.description ? `
                      <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6;">
                        ${video.description.substring(0, 200)}${video.description.length > 200 ? '...' : ''}
                      </p>
                    ` : ''}
                    <p style="color: #0891b2; margin: 15px 0 0 0; font-size: 14px; font-weight: bold;">
                      📂 ${video.category || 'Allgemein'} ${video.duration ? `• ⏱️ ${video.duration}` : ''}
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://7bhub.com" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Jetzt ansehen 🎥
                    </a>
                  </div>
                  
                  <p style="margin-top: 30px; font-size: 14px; color: #9ca3af; text-align: center;">
                    Du erhältst diese E-Mail, weil du Newsletter abonniert hast.<br>
                    Dein 7B Hub Team
                  </p>
                </div>
              </div>
            </body>
          </html>`
        ].join('\n');

        const encodedEmail = btoa(emailContent)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gmailToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedEmail })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        failCount++;
        console.error(`Error sending to ${recipient.email}:`, error);
      }
    }

    console.log(`Video notification sent: ${successCount} successful, ${failCount} failed`);

    return Response.json({
      success: true,
      total: subscribers.length,
      sent: successCount,
      failed: failCount
    });

  } catch (error) {
    console.error('Video notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});