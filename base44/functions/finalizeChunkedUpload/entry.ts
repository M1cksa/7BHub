import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { uploadId, totalChunks, fileName, mimeType } = body;

    if (!uploadId || !totalChunks) {
      return Response.json({ 
        success: false, 
        error: 'Missing uploadId or totalChunks' 
      }, { status: 400 });
    }

    console.log(`🔄 [${uploadId}] Finalizing ${totalChunks} chunks`);

    // Fetch chunk metadata (contains URLs)
    const chunks = await base44.asServiceRole.entities.VideoChunk.filter({
      upload_id: uploadId
    }, 'chunk_index', 10000);

    if (!chunks || chunks.length !== totalChunks) {
      throw new Error(`Expected ${totalChunks} chunks, found ${chunks?.length || 0}`);
    }

    chunks.sort((a, b) => a.chunk_index - b.chunk_index);
    console.log(`✅ [${uploadId}] All ${chunks.length} chunks retrieved`);

    // Get chunk URLs
    const chunkUrls = chunks.map(c => c.chunk_data);

    // Download and merge chunks using /tmp file
    const tmpPath = `/tmp/${uploadId}_merged.mp4`;
    const file = await Deno.open(tmpPath, { create: true, write: true });
    let totalSize = 0;

    try {
      for (let i = 0; i < chunkUrls.length; i++) {
        console.log(`📥 [${uploadId}] Downloading chunk ${i + 1}/${chunkUrls.length}...`);

        const resp = await fetch(chunkUrls[i]);
        if (!resp.ok) {
          throw new Error(`Failed to fetch chunk ${i + 1}: HTTP ${resp.status}`);
        }

        const arrayBuf = await resp.arrayBuffer();
        const chunk = new Uint8Array(arrayBuf);
        await file.write(chunk);
        totalSize += chunk.length;

        if ((i + 1) % 5 === 0 || i === chunkUrls.length - 1) {
          console.log(`✅ [${uploadId}] Merged ${i + 1}/${chunkUrls.length} chunks (${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      }

      file.close();
      console.log(`📤 [${uploadId}] Uploading merged file (${(totalSize / 1024 / 1024).toFixed(2)}MB)...`);

      // Read the merged file
      const mergedData = await Deno.readFile(tmpPath);
      const blob = new Blob([mergedData], { type: mimeType || 'video/mp4' });
      const uploadFile = new File([blob], fileName || 'video.mp4', { type: mimeType || 'video/mp4' });

    const result = await base44.asServiceRole.integrations.Core.UploadFile({ file: uploadFile });

    if (!result?.file_url) {
      throw new Error('Final upload failed - no URL returned');
    }

    console.log(`✅ [${uploadId}] Complete: ${result.file_url}`);

    // Cleanup temp file
    await Deno.remove(tmpPath).catch(() => {});

    return result;
    } catch (error) {
    file.close();
    await Deno.remove(tmpPath).catch(() => {});
    throw error;
    }

    // Update history
    try {
      const history = await base44.asServiceRole.entities.UploadHistory.filter({ 
        upload_id: uploadId 
      });
      
      if (history?.[0]) {
        await base44.asServiceRole.entities.UploadHistory.update(history[0].id, {
          status: 'completed',
          progress: 100,
          video_url: result.file_url,
          completed_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('History update failed:', e.message);
    }

    // Cleanup chunks
    Promise.all(
      chunks.map(c => base44.asServiceRole.entities.VideoChunk.delete(c.id).catch(() => {}))
    ).catch(() => {});

    return Response.json({ 
      success: true,
      file_url: result.file_url,
      size: totalSize
    });

  } catch (error) {
    console.error('❌ Finalize error:', error.message);
    return Response.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
});