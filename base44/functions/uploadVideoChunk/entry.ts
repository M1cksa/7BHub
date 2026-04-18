import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await req.json();
    const { chunkData, chunkIndex, uploadId, totalChunks } = body;

    if (!chunkData || chunkIndex === undefined || !uploadId || !totalChunks) {
      return Response.json({ 
        error: 'Missing required fields', 
        success: false 
      }, { status: 400 });
    }

    // Store chunk in database
    const chunk = await base44.asServiceRole.entities.VideoChunk.create({
      upload_id: uploadId,
      chunk_index: chunkIndex,
      chunk_url: chunkData,
      user_id: user.id,
      total_chunks: totalChunks
    });

    return Response.json({ 
      success: true, 
      chunkIndex,
      chunkId: chunk.id
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});