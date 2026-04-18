import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { tokenAmount } = body;

    if (!tokenAmount || tokenAmount <= 0) {
      return Response.json({ error: 'Invalid token amount' }, { status: 400 });
    }

    // Fetch all approved users
    const allUsers = await base44.asServiceRole.entities.AppUser.filter(
      { approved: true }, 
      '-created_date', 
      10000
    );
    
    if (allUsers.length === 0) {
      return Response.json({ success: true, count: 0, message: 'Keine genehmigten Nutzer zum aktualisieren' });
    }

    // Update all approved users with new token amount
    const updates = allUsers.map(appUser => 
      base44.asServiceRole.entities.AppUser.update(appUser.id, { 
        tokens: (appUser.tokens || 0) + tokenAmount
      })
    );

    const results = await Promise.allSettled(updates);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    return Response.json({ 
      success: true, 
      count: successful,
      message: `${successful}/${allUsers.length} genehmigten Nutzer erhielten je ${tokenAmount} Tokens`,
      totalTokensGranted: successful * tokenAmount
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});