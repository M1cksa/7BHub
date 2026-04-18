import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { video_id, since_index } = await req.json();
    
    if (!video_id) {
      return Response.json({ error: 'Missing video_id' }, { status: 400 });
    }

    // Fetch chunks newer than since_index
    const allChunks = await base44.asServiceRole.entities.StreamChunk.filter(
      { video_id },
      'chunk_index',
      100
    );

    const newChunks = since_index !== undefined 
      ? allChunks.filter(c => c.chunk_index > since_index)
      : allChunks;

    return Response.json({ chunks: newChunks });
  } catch (error) {
    console.error('Get chunks error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});