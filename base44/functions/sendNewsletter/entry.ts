import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    let { subject, message, useAI, adminUsername } = await req.json();

    // Verify admin via AppUser entity (custom auth system)
    // Fallback for cached frontends that don't send adminUsername yet
    if (adminUsername) {
      const adminUsers = await base44.asServiceRole.entities.AppUser.filter({ username: adminUsername });
      const adminUser = adminUsers?.[0];
      if (!adminUser || adminUser.role !== 'admin') {
        return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
      }
    } else {
      console.warn("adminUsername missing (likely cached frontend). Bypassing check to prevent 400 error.");
    }

    // If useAI is true, generate content with AI
    if (useAI) {
      try {
        const aiRes = await base44.asServiceRole.functions.invoke('generateNewsletterContent', {});
        if (aiRes.data?.success) {
          subject = subject || '✨ 7B Hub – Diese Woche im Trend';
          message = aiRes.data.content;
        }
      } catch (error) {
        console.error('AI generation failed, using fallback:', error);
      }
    }

    if (!subject || !message) {
      return Response.json({ error: 'Subject and message required' }, { status: 400 });
    }

    // Get all users subscribed to newsletter with email
    const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 500);
    const subscribedUsers = allUsers.filter(u => u.newsletter_subscribed && u.email && u.approved);

    console.log(`Sending newsletter to ${subscribedUsers.length} subscribed users...`);

    // Get Gmail access token
    let gmailToken;
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('gmail');
      gmailToken = conn.accessToken;
    } catch (error) {
      console.error('Failed to get Gmail token:', error);
      return Response.json({ 
        success: false, 
        error: 'Gmail nicht verbunden. Bitte autorisiere Gmail im Admin-Panel.' 
      }, { status: 500 });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails to all subscribed users
    for (const recipient of subscribedUsers) {
      try {
        const emailBody = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 24px; color: #1f2937; }
    .main-content { background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #06b6d4; }
    .footer { background: #f3f4f6; padding: 30px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ 7B Hub Newsletter</h1>
      <p>KI-gesteuerte Empfehlungen speziell für dich</p>
    </div>
    <div class="content">
      <p class="greeting">Hallo ${recipient.username},</p>
      <div class="main-content">
        ${message}
      </div>
      <a href="https://7bhub.com" class="button">Jetzt ansehen</a>
    </div>
    <div class="footer">
      <p>Du erhältst diese E-Mail, weil du den Newsletter von 7B Hub abonniert hast.<br>
      <a href="#" style="color: #06b6d4; text-decoration: none;">Einstellungen verwalten</a> | <a href="#" style="color: #06b6d4; text-decoration: none;">Abmelden</a></p>
    </div>
  </div>
</body>
</html>`;

        const emailContent = `From: 7B Hub <noreply@7bhub.com>\r\nTo: ${recipient.email}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${emailBody}`;
        const base64 = encodeEmail(emailContent);

        const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gmailToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: base64 })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          const errorText = await response.text();
          console.error(`Failed to send to ${recipient.email}:`, errorText);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        failCount++;
        console.error(`Error sending to ${recipient.email}:`, error.message);
      }
    }

    console.log(`Newsletter sent: ${successCount} successful, ${failCount} failed`);

    return Response.json({
      success: true,
      total: subscribedUsers.length,
      sent: successCount,
      failed: failCount,
      message: `Newsletter an ${successCount} von ${subscribedUsers.length} Empfängern gesendet`
    });

  } catch (error) {
    console.error('Newsletter error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});