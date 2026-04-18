import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return Response.json({ error: 'Token und Passwort erforderlich.' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' }, { status: 400 });
  }

  const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 500);
  const user = allUsers.find(u => u.reset_token === token);

  if (!user) {
    return Response.json({ error: 'Ungültiger oder abgelaufener Link.' }, { status: 400 });
  }

  if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
    return Response.json({ error: 'Dieser Link ist abgelaufen. Bitte fordere einen neuen an.' }, { status: 400 });
  }

  // Hash new password
  const encoder = new TextEncoder();
  const data = encoder.encode(newPassword);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  await base44.asServiceRole.entities.AppUser.update(user.id, {
    password: hashedPassword,
    reset_token: null,
    reset_token_expires: null,
  });

  return Response.json({ success: true });
});