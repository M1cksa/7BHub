import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId } = await req.json();

    if (!uploadId) {
      return Response.json({ 
        success: false, 
        error: 'Missing uploadId' 
      }, { status: 400 });
    }

    console.log(`[${uploadId}] Starting cleanup...`);

    // Delete all chunks for this upload
    const chunks = await base44.asServiceRole.entities.VideoChunk.filter(
      { upload_id: uploadId },
      'chunk_index',
      1000
    );

    console.log(`[${uploadId}] Found ${chunks.length} chunks to delete`);

    await Promise.all(
      chunks.map(chunk => 
        base44.asServiceRole.entities.VideoChunk.delete(chunk.id)
          .catch(err => console.warn(`Failed to delete chunk ${chunk.id}:`, err))
      )
    );

    console.log(`[${uploadId}] Cleanup complete`);

    return Response.json({ success: true, deleted: chunks.length });

  } catch (error) {
    console.error('cleanupUpload error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});