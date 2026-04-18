import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, type, title, message, link, metadata } = await req.json();

    if (!userId || !type || !title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      type, // 'new_video', 'new_comment', 'new_like', 'new_follower', 'new_reply', 'live_start'
      title,
      message: message || '',
      link: link || '',
      read: false,
      metadata: metadata || {}
    });

    return Response.json({ success: true, notification });
  } catch (error) {
    console.error('Notification creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});