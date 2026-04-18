import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Resets daily game XP counters for all users.
// Called by a scheduled automation every day at midnight.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both admin calls and scheduled automation (no user context)
    let isAuthorized = false;
    try {
      const user = await base44.auth.me();
      if (user?.role === 'admin') isAuthorized = true;
    } catch {
      // No user = called from automation/scheduler — allow via service role
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Find all users that have a daily_game_xp_date from yesterday or earlier
    const allUsers = await base44.asServiceRole.entities.AppUser.list('-created_date', 2000);
    const toReset = allUsers.filter(u => 
      u.daily_game_xp_date && u.daily_game_xp_date <= yesterdayStr
    );

    let resetCount = 0;
    for (const u of toReset) {
      await base44.asServiceRole.entities.AppUser.update(u.id, {
        daily_game_xp_used: 0,
        daily_game_xp_date: null,
      });
      resetCount++;
    }

    console.log(`Daily game XP reset: ${resetCount} users reset`);
    return Response.json({ success: true, reset: resetCount, total: allUsers.length });
  } catch (error) {
    console.error('Reset error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});