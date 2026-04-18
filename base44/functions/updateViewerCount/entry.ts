import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { videoId, viewerId, action } = await req.json();

    if (action === 'join') {
      // Record viewer joined
      await base44.asServiceRole.entities.ChatMessage.create({
        video_id: videoId,
        content: `[VIEWER_JOIN:${viewerId}]`,
        sender_name: 'system'
      });
    } else if (action === 'leave') {
      // Record viewer left
      await base44.asServiceRole.entities.ChatMessage.create({
        video_id: videoId,
        content: `[VIEWER_LEAVE:${viewerId}]`,
        sender_name: 'system'
      });
    }

    // Count active viewers (messages from last 30 seconds)
    const recentMessages = await base44.asServiceRole.entities.ChatMessage.filter({
      video_id: videoId
    }, '-created_date', 1000);

    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const viewerIds = new Set();
    
    recentMessages.forEach(msg => {
      if (new Date(msg.created_date) > thirtySecondsAgo) {
        if (msg.content?.includes('[VIEWER_JOIN:')) {
          const id = msg.content.match(/\[VIEWER_JOIN:(.*?)\]/)?.[1];
          if (id) viewerIds.add(id);
        } else if (msg.content?.includes('[VIEWER_LEAVE:')) {
          const id = msg.content.match(/\[VIEWER_LEAVE:(.*?)\]/)?.[1];
          if (id) viewerIds.delete(id);
        }
      }
    });

    return Response.json({ 
      viewerCount: viewerIds.size
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});