import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Nur Admins können Tokens vergeben.' }, { status: 403 });
    }

    const { targetUserId, amount, reason } = await req.json();

    if (!targetUserId || !amount || amount <= 0) {
      return Response.json({ error: 'Gültige User-ID und positive Token-Anzahl erforderlich.' }, { status: 400 });
    }

    // Get target user
    const targetUser = await base44.asServiceRole.entities.AppUser.get(targetUserId);
    if (!targetUser) {
      return Response.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });
    }

    const newTokenCount = (targetUser.tokens || 0) + amount;

    // Update user with new token count
    await base44.asServiceRole.entities.AppUser.update(targetUserId, {
      tokens: newTokenCount
    });

    return Response.json({
      success: true,
      message: `${amount} Tokens an ${targetUser.username} vergeben.`,
      newTokenCount: newTokenCount,
      targetUser: targetUser.username
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});