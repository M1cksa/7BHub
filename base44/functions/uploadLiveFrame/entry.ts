import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id, frame_data, frame_index } = await req.json();

    if (!video_id || !frame_data) {
      return Response.json({ error: 'Missing video_id or frame_data' }, { status: 400 });
    }

    await base44.asServiceRole.entities.LiveFrame.create({
      video_id,
      frame_data,
      frame_index: frame_index || 0
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Upload frame error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});