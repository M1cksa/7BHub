import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'npm:bcrypt@5.1.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Fetch user by username
    const users = await base44.asServiceRole.entities.AppUser.filter({ username });
    
    if (users.length === 0) {
      return Response.json({ valid: false, message: 'User not found' });
    }

    const user = users[0];

    // Compare password with bcrypt
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      return Response.json({ 
        valid: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tokens: user.tokens,
          approved: user.approved,
          avatar_url: user.avatar_url,
          bio: user.bio,
          is_donor: user.is_donor,
          frame_style: user.frame_style,
          active_theme: user.active_theme,
          active_background_animation: user.active_background_animation,
          newsletter_subscribed: user.newsletter_subscribed,
          agreed_to_terms: user.agreed_to_terms,
          agreed_to_video_policy: user.agreed_to_video_policy
        }
      });
    } else {
      return Response.json({ valid: false, message: 'Invalid password' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});