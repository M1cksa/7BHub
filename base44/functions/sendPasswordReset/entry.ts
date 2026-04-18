import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { email } = await req.json();

  if (!email) {
    return Response.json({ error: 'E-Mail fehlt.' }, { status: 400 });
  }

  // Find user by email
  const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 500);
  const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Don't reveal if user exists
    return Response.json({ success: true });
  }

  // Generate token
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  await base44.asServiceRole.entities.AppUser.update(user.id, {
    reset_token: token,
    reset_token_expires: expires,
  });

  const origin = req.headers.get('origin') || 'https://7bhub.com';
  const resetLink = `${origin}/ResetPassword?token=${token}`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@7bhub.com',
      to: email,
      subject: '🔑 Passwort zurücksetzen – 7B Hub',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#0a0014;color:#fff;padding:40px;border-radius:16px;">
          <h1 style="color:#22d3ee;margin-bottom:8px;">Passwort zurücksetzen</h1>
          <p style="color:#aaa;margin-bottom:24px;">Hey <strong style="color:#fff">${user.username}</strong>, du hast einen Passwort-Reset angefragt.</p>
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(90deg,#0891b2,#0d9488);color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:bold;font-size:16px;">Passwort zurücksetzen</a>
          <p style="color:#666;margin-top:24px;font-size:13px;">Dieser Link ist 1 Stunde gültig. Falls du keinen Reset angefragt hast, ignoriere diese E-Mail.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
    return Response.json({ error: 'E-Mail konnte nicht gesendet werden. Bitte prüfe ob die Domain in Resend verifiziert ist.' }, { status: 400 });
  }

  return Response.json({ success: true });
});