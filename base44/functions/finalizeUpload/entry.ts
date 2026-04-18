import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { uploadId, title, description, category, creator_name, creator_avatar, video_frame, thumbnail_url, duration } = await req.json();

    if (!uploadId || !title) {
      return Response.json({ success: false, error: 'Missing uploadId or title' }, { status: 400 });
    }

    console.log(`[${uploadId}] Starting finalization`);

    // Get all chunks
    const chunks = await base44.asServiceRole.entities.VideoChunk.filter({ upload_id: uploadId }, 'chunk_index', 1000);

    if (!chunks || chunks.length === 0) {
      return Response.json({ success: false, error: 'No chunks found' }, { status: 400 });
    }

    console.log(`[${uploadId}] Found ${chunks.length} chunks`);

    // Validate chunks are complete
    chunks.sort((a, b) => a.chunk_index - b.chunk_index);
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].chunk_index !== i) {
        return Response.json({ 
          success: false, 
          error: `Missing chunk at index ${i}. Have: [${chunks.map(c => c.chunk_index).join(', ')}]` 
        }, { status: 400 });
      }
    }

    console.log(`[${uploadId}] All chunks validated`);

    // Decode chunks from Base64
    const PARALLEL = 4;
    const chunkBuffers = new Array(chunks.length);
    let totalSize = 0;

    const decodeChunk = (chunk) => {
      try {
        if (!chunk.chunk_data) {
          throw new Error('No chunk data');
        }

        // Decode Base64
        const binaryString = atob(chunk.chunk_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        chunkBuffers[chunk.chunk_index] = bytes;
        totalSize += bytes.length;
        console.log(`[${uploadId}] Decoded chunk ${chunk.chunk_index} (${(bytes.length / 1024 / 1024).toFixed(2)}MB)`);
      } catch (error) {
        throw new Error(`Failed to decode chunk ${chunk.chunk_index}: ${error.message}`);
      }
    };

    // Decode in batches
    for (let i = 0; i < chunks.length; i += PARALLEL) {
      const batch = chunks.slice(i, Math.min(i + PARALLEL, chunks.length));
      batch.forEach(c => decodeChunk(c));
    }

    console.log(`[${uploadId}] Downloaded ${(totalSize / 1024 / 1024).toFixed(2)}MB total`);

    if (totalSize === 0) {
      throw new Error('Total size is 0');
    }

    // Merge chunks
    console.log(`[${uploadId}] Merging chunks...`);
    const merged = new Uint8Array(totalSize);
    let offset = 0;

    for (let i = 0; i < chunks.length; i++) {
      if (!chunkBuffers[i]) {
        throw new Error(`Chunk ${i} buffer missing`);
      }
      merged.set(chunkBuffers[i], offset);
      offset += chunkBuffers[i].length;
      chunkBuffers[i] = null; // Free memory
    }

    console.log(`[${uploadId}] Merged ${(merged.length / 1024 / 1024).toFixed(2)}MB`);

    // Upload merged video
    console.log(`[${uploadId}] Uploading final video...`);
    const videoBlob = new Blob([merged], { type: 'video/mp4' });
    const videoFile = new File([videoBlob], `${title}.mp4`, { type: 'video/mp4' });

    const uploadResult = await Promise.race([
      base44.asServiceRole.integrations.Core.UploadFile({ file: videoFile }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 120000))
    ]);

    if (!uploadResult?.file_url) {
      throw new Error('Final upload failed');
    }

    console.log(`[${uploadId}] Video uploaded: ${uploadResult.file_url}`);

    // Create Video entity
    const video = await base44.asServiceRole.entities.Video.create({
      title,
      description: description || '',
      video_url: uploadResult.file_url,
      thumbnail_url: thumbnail_url || null,
      category: category || 'entertainment',
      creator_name: creator_name || user.username || 'Unknown',
      creator_avatar: creator_avatar || user.avatar_url || null,
      status: 'ready',
      views: 0,
      likes: 0,
      duration: duration || '0:00',
      video_frame: video_frame || 'none'
    });

    console.log(`[${uploadId}] Video entity created: ${video.id}`);

    // Cleanup chunks (async, non-blocking)
    base44.asServiceRole.entities.VideoChunk.filter({ upload_id: uploadId }, '', 1000)
      .then(toDelete => {
        return Promise.all(toDelete.map(c => base44.asServiceRole.entities.VideoChunk.delete(c.id).catch(() => {})));
      })
      .catch(() => {})
      .then(() => console.log(`[${uploadId}] Cleanup done`));

    return Response.json({ 
      success: true, 
      video_url: uploadResult.file_url,
      video_id: video.id
    });

  } catch (error) {
    console.error('finalizeUpload error:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});