import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const testEmail = body.email || 'milo.lokadee@gmail.com';
    
    console.log('Getting Gmail access token...');
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
    console.log('Access token obtained:', accessToken ? 'Yes' : 'No');

    const emailContent = {
      raw: btoa(
        `From: 7B Hub <noreply@7bhub.com>\r\n` +
        `To: ${testEmail}\r\n` +
        `Subject: Test E-Mail von 7B Hub\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        `<!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test E-Mail</h1>
          <p>Dies ist eine Test-E-Mail vom 7B Hub Benachrichtigungssystem.</p>
          <p>Zeitstempel: ${new Date().toISOString()}</p>
        </body>
        </html>`
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    };

    console.log('Sending email to:', testEmail);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailContent)
    });

    const responseText = await response.text();
    console.log('Gmail API Response:', response.status, responseText);

    if (response.ok) {
      return Response.json({ 
        success: true, 
        message: 'Email sent successfully',
        status: response.status,
        response: JSON.parse(responseText)
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Failed to send email',
        status: response.status,
        response: responseText
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});