import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const uploadId = formData.get('uploadId');
    const chunkIndex = formData.get('chunkIndex');
    const totalChunks = formData.get('totalChunks');
    const chunkFile = formData.get('chunk');

    if (!uploadId || chunkIndex === null || !totalChunks || !chunkFile) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const idx = parseInt(chunkIndex, 10);
    const total = parseInt(totalChunks, 10);
    
    if (isNaN(idx) || isNaN(total) || idx < 0 || idx >= total) {
      return Response.json({ 
        success: false, 
        error: 'Invalid chunk index' 
      }, { status: 400 });
    }

    console.log(`📦 [${uploadId}] Uploading chunk ${idx + 1}/${total} (${(chunkFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // Upload chunk file directly to storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: chunkFile });
    
    if (!uploadResult?.file_url) {
      throw new Error('Chunk upload failed - no URL returned');
    }

    console.log(`✅ [${uploadId}] Chunk ${idx + 1}/${total} uploaded: ${uploadResult.file_url}`);

    // Store chunk metadata (URL only, not data)
    await base44.asServiceRole.entities.VideoChunk.create({
      upload_id: uploadId,
      chunk_index: idx,
      chunk_data: uploadResult.file_url,
      user_id: user.email || user.id
    });

    // Update progress
    try {
      const history = await base44.asServiceRole.entities.UploadHistory.filter({ 
        upload_id: uploadId 
      });
      
      if (history?.[0]) {
        await base44.asServiceRole.entities.UploadHistory.update(history[0].id, {
          chunks_uploaded: idx + 1,
          progress: Math.round(((idx + 1) / total) * 100)
        });
      }
    } catch (e) {
      console.warn('History update failed:', e.message);
    }

    return Response.json({ 
      success: true, 
      chunkIndex: idx,
      chunkUrl: uploadResult.file_url
    });

  } catch (error) {
    console.error('❌ Chunk upload error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});