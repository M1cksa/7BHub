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
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Only admin can test email sending
    if (user.role !== 'admin') {
      return Response.json({ error: 'Nur für Admins' }, { status: 403 });
    }

    const { to, subject, message } = await req.json();

    if (!to) {
      return Response.json({ error: 'Empfänger-E-Mail erforderlich' }, { status: 400 });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Create email content
    const emailContent = `From: 7B Hub Team <me>
To: ${to}
Subject: =?utf-8?B?${btoa(subject || 'Test E-Mail von 7B Hub')}?=
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      margin: 0; 
      padding: 40px 20px; 
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
    }
    .header { 
      background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      color: #ffffff; 
      margin: 0; 
      font-size: 32px; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .footer { 
      background: #f1f5f9; 
      padding: 20px; 
      text-align: center; 
      color: #64748b; 
      font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Test E-Mail</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px;">
        ${message || 'Dies ist eine Test-E-Mail von 7B Hub. Wenn du diese Nachricht siehst, funktioniert der E-Mail-Versand!'}
      </p>
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #0c4a6e; font-weight: bold;">
          ✅ E-Mail-System funktioniert korrekt!
        </p>
      </div>
      <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
        Gesendet: ${new Date().toLocaleString('de-DE')}
      </p>
    </div>
    <div class="footer">
      <p>7B Hub – Deine Video-Streaming-Plattform</p>
    </div>
  </div>
</body>
</html>`;

    const encodedEmail = encodeEmail(emailContent);

    // Send via Gmail API
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

    const responseData = await response.json();

    if (!response.ok) {
      return Response.json({ 
        error: 'Gmail API Fehler', 
        details: responseData,
        status: response.status 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Test-E-Mail erfolgreich gesendet!',
      to: to,
      messageId: responseData.id 
    });

  } catch (error) {
    console.error('Test email error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});