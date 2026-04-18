import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const finished = await base44.asServiceRole.entities.NeonDashMatch.filter(
      { status: 'finished' }, '-created_date', 200
    );

    const old = (finished || []).filter(m => m.created_date < cutoff);
    let deleted = 0;
    for (const m of old) {
      await base44.asServiceRole.entities.NeonDashMatch.delete(m.id);
      deleted++;
    }

    return Response.json({ deleted, checked: finished.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});