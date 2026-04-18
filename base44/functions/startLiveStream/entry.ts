import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await req.json();

    // Update video to live status
    await base44.asServiceRole.entities.Video.update(videoId, {
      status: 'live'
    });

    return Response.json({ 
      success: true,
      streamUrl: `/api/functions/streamLive?videoId=${videoId}`,
      message: 'Stream gestartet'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});