import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { video_id, chunk_data, chunk_index, timestamp } = await req.json();
    
    if (!video_id || !chunk_data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.asServiceRole.entities.StreamChunk.create({
      video_id,
      chunk_data,
      chunk_index,
      timestamp: timestamp || Date.now()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Upload chunk error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});