import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = await req.json();

    // Update video to vod status
    await base44.asServiceRole.entities.Video.update(videoId, {
      status: 'vod'
    });

    return Response.json({ 
      success: true,
      message: 'Stream beendet'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});