import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await req.json();
    const targetUsername = username || user.username;

    // Fetch all achievements
    const allAchievements = await base44.entities.Achievement.list('-created_date', 1000);
    
    // Fetch user's current achievements
    const userAchievements = await base44.entities.UserAchievement.filter({ username: targetUsername });
    const unlockedIds = userAchievements.map(ua => ua.achievement_id);

    // Fetch user data for checking requirements
    const [appUser] = await base44.entities.AppUser.filter({ username: targetUsername });
    if (!appUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Count various stats
    const watchHistory = await base44.entities.WatchHistory.filter({ user_id: appUser.id });
    const comments = await base44.entities.Comment.filter({ author_name: targetUsername });
    const likes = await base44.entities.Like.filter({ user_id: appUser.id });
    const videos = await base44.entities.Video.filter({ creator_name: targetUsername });
    const streams = await base44.entities.LiveStream.filter({ creator_username: targetUsername });
    const followers = await base44.entities.Follow.filter({ following_username: targetUsername });
    const friends = await base44.entities.Friend.filter({ 
      requester_username: targetUsername,
      status: 'accepted'
    });
    const quizzes = await base44.entities.QuizResponse.filter({ user_id: appUser.id, is_correct: true });
    const purchases = await base44.entities.InventoryItem.filter({ owner_username: targetUsername });

    const stats = {
      videos_watched: watchHistory.length,
      comments_made: comments.length,
      likes_given: likes.length,
      followers: followers.length,
      videos_uploaded: videos.length,
      streams_hosted: streams.length,
      tokens_earned: appUser.tokens || 0,
      friends_added: friends.length,
      shop_purchases: purchases.length,
      quiz_correct: quizzes.length,
      login_streak: 0 // TODO: implement streak tracking
    };

    const newlyUnlocked = [];

    // Check each achievement
    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievement.id)) continue;

      const userStat = stats[achievement.requirement_type] || 0;
      
      if (userStat >= achievement.requirement_count) {
        // Unlock achievement
        const unlocked = await base44.asServiceRole.entities.UserAchievement.create({
          user_id: appUser.id,
          username: targetUsername,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        });

        // Award tokens
        await base44.asServiceRole.entities.AppUser.update(appUser.id, {
          tokens: (appUser.tokens || 0) + achievement.token_reward
        });

        newlyUnlocked.push({
          ...achievement,
          unlocked: unlocked
        });
      }
    }

    return Response.json({
      newlyUnlocked,
      stats,
      message: newlyUnlocked.length > 0 
        ? `${newlyUnlocked.length} neue Achievement(s) freigeschaltet!` 
        : 'Keine neuen Achievements'
    });

  } catch (error) {
    console.error('Achievement check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});