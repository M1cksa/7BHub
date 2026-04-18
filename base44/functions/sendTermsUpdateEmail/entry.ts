import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function toBase64Url(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { subject, message } = await req.json();

        const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 1000);
        const recipients = allUsers.filter(u =>
            u.approved &&
            u.email &&
            typeof u.email === 'string' &&
            u.email.includes('@') &&
            u.email.includes('.')
        );
        
        let sentCount = 0;

        const conn = await base44.asServiceRole.connectors.getConnection('gmail');
        const accessToken = conn.accessToken;

        for (const recipient of recipients) {
            try {
                const rawEmail =
                    `From: 7B Hub <noreply@7bhub.com>\r\n` +
                    `To: ${recipient.email}\r\n` +
                    `Subject: ${subject}\r\n` +
                    `MIME-Version: 1.0\r\n` +
                    `Content-Type: text/plain; charset=utf-8\r\n` +
                    `\r\n` +
                    message;

                const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ raw: toBase64Url(rawEmail) })
                });

                if (response.ok) {
                    sentCount++;
                } else {
                    const err = await response.text();
                    console.error(`Failed for ${recipient.email}: ${response.status} - ${err}`);
                }

                await new Promise(r => setTimeout(r, 120));
            } catch (err) {
                console.error(`Error for ${recipient.email}:`, err.message);
            }
        }

        return Response.json({ success: true, message: `E-Mail an ${sentCount} Nutzer gesendet.` });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});