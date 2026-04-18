import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { video_id } = await req.json();

    if (!video_id) {
      return Response.json({ error: 'Missing video_id' }, { status: 400 });
    }

    const frames = await base44.asServiceRole.entities.LiveFrame.filter(
      { video_id },
      '-frame_index',
      5
    );

    if (!frames || frames.length === 0) {
      return Response.json({ frames: [] });
    }

    return Response.json({ 
      frames: frames.reverse()
    });
  } catch (error) {
    console.error('Get stream error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});